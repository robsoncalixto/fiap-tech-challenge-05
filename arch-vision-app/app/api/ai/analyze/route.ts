import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { callOpenRouter } from '@/lib/openrouter'
import { STRIDE_SYSTEM_PROMPT } from '@/lib/prompts/system-prompt'
import { buildUserMessage } from '@/lib/prompts/user-template'
import { parseSeverity } from '@/lib/utils/severity-parser'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { reportId } = await request.json()

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (!report) {
    return NextResponse.json({ error: 'Report not found or not in pending state' }, { status: 400 })
  }

  if (report.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (report.status !== 'pending') {
    return NextResponse.json({ error: 'Report not found or not in pending state' }, { status: 400 })
  }

  const admin = createAdminClient()

  console.log(`[analyze] Report ${reportId} — setting status to processing`)
  await admin
    .from('reports')
    .update({ status: 'processing' })
    .eq('id', reportId)

  try {
    console.log(`[analyze] Report ${reportId} — creating signed URL for ${report.image_url}`)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('diagrams')
      .createSignedUrl(report.image_url, 3600)

    if (signedError || !signedData) {
      console.error(`[analyze] Report ${reportId} — signed URL error:`, signedError?.message)
      throw new Error('Failed to create signed URL for diagram')
    }
    console.log(`[analyze] Report ${reportId} — signed URL created`)

    const userMessage = buildUserMessage({
      imageUrl: signedData.signedUrl,
      contextText: report.context_text,
    })

    console.log(`[analyze] Report ${reportId} — calling OpenRouter model=${report.ai_model}`)
    const result = await callOpenRouter(report.ai_model, [
      { role: 'system', content: STRIDE_SYSTEM_PROMPT },
      userMessage,
    ])

    const severitySummary = parseSeverity(result)
    console.log(`[analyze] Report ${reportId} — severity parsed:`, JSON.stringify(severitySummary))

    const { error: updateError } = await admin
      .from('reports')
      .update({
        result_markdown: result,
        severity_summary: severitySummary,
        completed_at: new Date().toISOString(),
        status: 'completed',
      })
      .eq('id', reportId)

    if (updateError) {
      console.error(`[analyze] Report ${reportId} — failed to save result:`, updateError.message)
      throw new Error(`Failed to save report: ${updateError.message}`)
    }

    console.log(`[analyze] Report ${reportId} — completed successfully`)
    return NextResponse.json({ status: 'completed' })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[analyze] Report ${reportId} failed:`, errorMessage)

    await admin
      .from('reports')
      .update({
        status: 'failed',
        error_message: errorMessage,
      })
      .eq('id', reportId)

    const { data: currentUser } = await admin
      .from('users')
      .select('credits')
      .eq('id', report.user_id)
      .single()
    if (currentUser) {
      await admin
        .from('users')
        .update({ credits: currentUser.credits + 1 })
        .eq('id', report.user_id)
      console.log(`[analyze] Report ${reportId} — credit refunded to user ${report.user_id}`)
    }

    return NextResponse.json({ status: 'failed', error: errorMessage }, { status: 500 })
  }
}
