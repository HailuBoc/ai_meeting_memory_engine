import OpenAI from 'openai'

let openai: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error(
      'Missing OPENAI_API_KEY. Set OPENAI_API_KEY in your .env before using AI features.'
    )
  }

  if (!openai) {
    openai = new OpenAI({ apiKey })
  }

  return openai
}
