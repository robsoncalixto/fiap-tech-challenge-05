import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: report } = await supabase
    .from('reports')
    .select('status, created_at, severity_summary, completed_at, error_message, user_id')
    .eq('id', id)
    .single()

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  if (report.status === 'processing') {
    const createdAt = new Date(report.created_at)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    if (createdAt < fiveMinutesAgo) {
      const admin = createAdminClient()
      await admin
        .from('reports')
        .update({ status: 'failed', error_message: 'Analysis timed out' })
        .eq('id', id)

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
      }

      return NextResponse.json({
        status: 'failed',
        errorMessage: 'Analysis timed out',
      })
    }
  }

  return NextResponse.json({
    status: report.status,
    createdAt: report.created_at,
    ...(report.severity_summary && { severitySummary: report.severity_summary }),
    ...(report.completed_at && { completedAt: report.completed_at }),
    ...(report.error_message && { errorMessage: report.error_message }),
  })
}
