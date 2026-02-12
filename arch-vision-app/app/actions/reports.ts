'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

export async function deleteReport(reportId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: report } = await supabase
    .from('reports')
    .select('image_url')
    .eq('id', reportId)
    .single()

  if (!report) {
    throw new Error('Report not found')
  }

  await supabase.storage
    .from('diagrams')
    .remove([report.image_url])

  await supabase
    .from('reports')
    .delete()
    .eq('id', reportId)

  revalidatePath('/dashboard')
}

export async function generateShareToken(reportId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: report } = await supabase
    .from('reports')
    .select('share_token, status')
    .eq('id', reportId)
    .single()

  if (!report) {
    throw new Error('Report not found')
  }

  if (report.status !== 'completed') {
    throw new Error('Report not completed')
  }

  if (report.share_token) {
    return { shareUrl: `/shared/${report.share_token}`, token: report.share_token }
  }

  const token = randomUUID()
  await supabase
    .from('reports')
    .update({ share_token: token })
    .eq('id', reportId)

  return { shareUrl: `/shared/${token}`, token }
}
