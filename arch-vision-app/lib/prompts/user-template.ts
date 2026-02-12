interface UserMessageOptions {
  imageUrl: string
  contextText?: string | null
}

export function buildUserMessage(options: UserMessageOptions) {
  const { imageUrl, contextText } = options

  const textParts: string[] = [
    'Please analyze the following architecture diagram for security threats using the STRIDE methodology.',
  ]

  if (contextText) {
    textParts.push(`\n\nAdditional context about this system:\n${contextText}`)
  }

  textParts.push('\n\nProvide a comprehensive STRIDE threat analysis report following the specified format.')

  return {
    role: 'user' as const,
    content: [
      {
        type: 'text',
        text: textParts.join(''),
      },
      {
        type: 'image_url',
        image_url: {
          url: imageUrl,
        },
      },
    ],
  }
}
