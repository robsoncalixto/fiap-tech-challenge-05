export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export async function callOpenRouter(
  model: string,
  messages: OpenRouterMessage[]
): Promise<string> {
  const hasImage = messages.some(
    (m) => Array.isArray(m.content) && m.content.some((c) => c.type === 'image_url')
  )
  console.log(`[openrouter] Calling model=${model}, messages=${messages.length}, hasImage=${hasImage}`)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 240_000)
  const start = Date.now()

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
      }),
      signal: controller.signal,
    })

    const elapsed = ((Date.now() - start) / 1000).toFixed(1)

    if (!response.ok) {
      const error = await response.text()
      console.error(`[openrouter] API error ${response.status} after ${elapsed}s:`, error)
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
    }

    const data: OpenRouterResponse = await response.json()
    const contentLength = data.choices[0]?.message?.content?.length ?? 0
    console.log(`[openrouter] Success in ${elapsed}s — response length: ${contentLength} chars`)

    return data.choices[0].message.content
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.error(`[openrouter] Request aborted after ${elapsed}s (timeout 240s)`)
      throw new Error('OpenRouter request timed out after 240s')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export async function callOpenRouterStream(
  model: string,
  messages: OpenRouterMessage[]
): Promise<Response> {
  const hasImage = messages.some(
    (m) => Array.isArray(m.content) && m.content.some((c) => c.type === 'image_url')
  )
  console.log(`[openrouter] Stream calling model=${model}, messages=${messages.length}, hasImage=${hasImage}`)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 240_000)
  const start = Date.now()

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
      signal: controller.signal,
    })

    const elapsed = ((Date.now() - start) / 1000).toFixed(1)

    if (!response.ok) {
      const error = await response.text()
      console.error(`[openrouter] Stream API error ${response.status} after ${elapsed}s:`, error)
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
    }

    console.log(`[openrouter] Stream connection established in ${elapsed}s`)
    return response
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.error(`[openrouter] Stream request aborted after ${elapsed}s (timeout 240s)`)
      throw new Error('OpenRouter request timed out after 240s')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
