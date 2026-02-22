import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { callOpenRouterStream, OpenRouterMessage } from '@/lib/openrouter'
import { buildConsultantSystemPrompt, CONSULTANT_INIT_TRIGGER } from '@/lib/prompts/consultant-prompt'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { reportId } = body as { reportId: string }

    const { data: report } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (!report || report.user_id !== user.id) {
      return Response.json({ error: 'Relatório não encontrado' }, { status: 404 })
    }

    if (report.status !== 'completed') {
      return Response.json({ error: 'Relatório ainda não foi concluído' }, { status: 400 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('tier')
      .eq('id', user.id)
      .single()

    if (!userData || userData.tier !== 'pro') {
      return Response.json({ error: 'Recurso disponível apenas para usuários Pro' }, { status: 403 })
    }

    const { data: existingConversation } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('report_id', reportId)
      .single()

    if (existingConversation) {
      return Response.json({ error: 'Conversa já existe para este relatório' }, { status: 409 })
    }

    const { data: conversation, error: insertError } = await supabase
      .from('chat_conversations')
      .insert({ report_id: reportId })
      .select('id')
      .single()

    if (insertError || !conversation) {
      console.error('[chat/init] Failed to create conversation:', insertError?.message)
      return Response.json({ error: 'Erro ao gerar resposta do consultor. Tente novamente.' }, { status: 500 })
    }

    const conversationId = conversation.id

    const systemPrompt = buildConsultantSystemPrompt(
      report.result_markdown,
      report.severity_summary,
    )

    const messages: OpenRouterMessage[] = [
      systemPrompt,
      { role: 'user' as const, content: CONSULTANT_INIT_TRIGGER },
    ]

    const openRouterResponse = await callOpenRouterStream('google/gemini-2.5-flash', messages)

    const reader = openRouterResponse.body!.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            controller.enqueue(new TextEncoder().encode(chunk))

            const lines = chunk.split('\n')
            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const data = JSON.parse(line.slice(6))
                  const content = data.choices?.[0]?.delta?.content
                  if (content) fullContent += content
                } catch { /* skip non-JSON lines */ }
              }
            }
          }
          controller.close()

          if (fullContent) {
            const adminSupabase = createAdminClient()
            await adminSupabase.from('chat_messages').insert({
              conversation_id: conversationId,
              role: 'assistant',
              content: fullContent,
            })
          }
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[chat/init] Unexpected error:', err)
    return Response.json({ error: 'Erro ao gerar resposta do consultor. Tente novamente.' }, { status: 500 })
  }
}
