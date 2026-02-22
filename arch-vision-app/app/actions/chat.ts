'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getConversation(reportId: string) {
  const supabase = await createClient()

  const { data: conversation } = await supabase
    .from('chat_conversations')
    .select('id, report_id, created_at')
    .eq('report_id', reportId)
    .single()

  if (!conversation) {
    return { conversation: null, messages: [] }
  }

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true })

  return {
    conversation: {
      id: conversation.id,
      report_id: conversation.report_id,
      created_at: conversation.created_at,
    },
    messages: messages ?? [],
  }
}

export async function getSharedConversation(reportId: string) {
  const supabase = createAdminClient()

  const { data: conversation } = await supabase
    .from('chat_conversations')
    .select('id, report_id, created_at')
    .eq('report_id', reportId)
    .single()

  if (!conversation) {
    return { conversation: null, messages: [] }
  }

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true })

  return {
    conversation: {
      id: conversation.id,
      report_id: conversation.report_id,
      created_at: conversation.created_at,
    },
    messages: messages ?? [],
  }
}
