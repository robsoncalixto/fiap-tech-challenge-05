'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const PRO_ONLY_MODELS = [
  'anthropic/claude-sonnet-4',
  'anthropic/claude-sonnet-4.5',
  'google/gemini-2.5-pro',
]

export async function uploadAndCreateReport(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const file = formData.get('file') as File | null
  const context = formData.get('context') as string | null
  const model = formData.get('model') as string

  if (!file) {
    throw new Error('No file provided')
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Accepted: PNG, JPG, SVG')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum: 10MB')
  }

  if (!model) {
    throw new Error('No model selected')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('credits, tier')
    .eq('id', user.id)
    .single()

  if (!profile || profile.credits <= 0) {
    throw new Error('No credits remaining')
  }

  if (PRO_ONLY_MODELS.includes(model) && profile.tier !== 'pro') {
    throw new Error('Model not available on your plan')
  }

  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${user.id}/${timestamp}-${sanitizedName}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('diagrams')
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  const { data: report, error: insertError } = await supabase
    .from('reports')
    .insert({
      user_id: user.id,
      image_url: storagePath,
      context_text: context || null,
      ai_model: model,
      status: 'pending',
    })
    .select('id')
    .single()

  if (insertError) {
    throw new Error(`Failed to create report: ${insertError.message}`)
  }

  await supabase
    .from('users')
    .update({ credits: profile.credits - 1 })
    .eq('id', user.id)

  revalidatePath('/dashboard')

  return { reportId: report.id }
}
