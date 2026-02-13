interface UserMessageOptions {
  imageUrl: string
  contextText?: string | null
}

export function buildUserMessage(options: UserMessageOptions) {
  const { imageUrl, contextText } = options

  const textParts: string[] = [
    'Por favor, analise o seguinte diagrama de arquitetura quanto a ameaças de segurança utilizando a metodologia STRIDE.',
  ]

  if (contextText) {
    textParts.push(`\n\nContexto adicional sobre este sistema:\n${contextText}`)
  }

  textParts.push('\n\nForneça um relatório abrangente de análise de ameaças STRIDE seguindo o formato especificado. O relatório deve ser escrito em Português do Brasil, mantendo siglas técnicas em inglês.')

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
