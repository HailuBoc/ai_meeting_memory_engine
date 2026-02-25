import openai from '@/lib/openai'
import { prisma } from '@/lib/prisma'

interface ExtractedDecision {
  text: string
  category: string
}

interface ExtractedActionItem {
  task: string
  assignee?: string
}

interface AIExtractionResult {
  decisions: ExtractedDecision[]
  actionItems: ExtractedActionItem[]
}

export class AIPipelineService {
  static async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.mp3', { type: 'audio/mpeg' }),
      model: 'whisper-1',
    })
    
    return transcription.text
  }

  static async extractDecisionsAndActions(transcript: string): Promise<AIExtractionResult> {
    const prompt = `
    Analyze the following meeting transcript and extract:
    1. Decisions made (immutable decisions that were finalized)
    2. Action items (tasks that need to be completed)

    Return a JSON object with the following structure:
    {
      "decisions": [
        {
          "text": "The exact decision text",
          "category": "technical|business|product|other"
        }
      ],
      "actionItems": [
        {
          "task": "The specific task description",
          "assignee": "Person assigned (if mentioned)"
        }
      ]
    }

    Transcript:
    ${transcript}
    `

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert meeting analyst. Extract only concrete decisions and action items, ignoring general discussion. Return valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    return result as AIExtractionResult
  }

  static async generateEmbeddings(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })

    return response.data[0].embedding
  }

  static async chunkTranscript(transcript: string, chunkSize: number = 1000): Promise<string[]> {
    const words = transcript.split(' ')
    const chunks: string[] = []
    
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ')
      chunks.push(chunk)
    }
    
    return chunks
  }

  static async processMeetingAudio(
    meetingId: string,
    audioBuffer: Buffer,
    title: string,
    date: Date
  ): Promise<void> {
    try {
      // Step 1: Transcribe audio
      const transcript = await this.transcribeAudio(audioBuffer)
      
      // Step 2: Extract decisions and action items
      const extractionResult = await this.extractDecisionsAndActions(transcript)
      
      // Step 3: Generate summary
      const summaryPrompt = `
      Summarize this meeting transcript in 2-3 sentences, focusing on key outcomes:
      ${transcript}
      `
      
      const summaryCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert meeting summarizer. Create concise, informative summaries.'
          },
          {
            role: 'user',
            content: summaryPrompt
          }
        ],
        temperature: 0.3,
      })
      
      const summary = summaryCompletion.choices[0].message.content || ''
      
      // Step 4: Update meeting with transcript and summary
      await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          rawTranscript: transcript,
          summary,
        }
      })
      
      // Step 5: Save decisions
      for (const decision of extractionResult.decisions) {
        await prisma.decision.create({
          data: {
            text: decision.text,
            category: decision.category,
            meetingId,
          }
        })
      }
      
      // Step 6: Save action items
      for (const actionItem of extractionResult.actionItems) {
        await prisma.actionItem.create({
          data: {
            task: actionItem.task,
            assignee: actionItem.assignee,
            meetingId,
          }
        })
      }
      
      // Step 7: Create chunks with embeddings
      const chunks = await this.chunkTranscript(transcript)
      
      for (const chunk of chunks) {
        const embedding = await this.generateEmbeddings(chunk)
        
        await prisma.meetingChunk.create({
          data: {
            content: chunk,
            embedding: Buffer.from(new Float32Array(embedding).buffer),
            meetingId,
          }
        })
      }
      
    } catch (error) {
      console.error('Error processing meeting audio:', error)
      throw error
    }
  }
}
