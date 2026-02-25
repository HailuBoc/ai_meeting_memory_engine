# AI Meeting Memory Engine

An intelligent system that prevents teams from forgetting important decisions by automatically transcribing meeting audio and extracting actionable insights using AI.

## Features

- **Audio Transcription**: Upload meeting audio files for automatic transcription using OpenAI Whisper
- **Decision Extraction**: AI-powered identification of immutable decisions and action items using GPT-4o
- **Vector Search**: Semantic search across all meeting content using pgvector and OpenAI embeddings
- **Timeline Dashboard**: View recent decisions and meeting summaries in a clean timeline interface
- **Meeting Details**: Full transcript view with extracted decisions and action items side-by-side
- **Global Search**: Natural language search to find historical context and decisions

## Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Shadcn/UI
- **Backend**: Node.js (Next.js Server Actions)
- **Database**: PostgreSQL with pgvector extension
- **ORM**: Prisma
- **AI**: OpenAI API (Whisper, GPT-4o, Text-Embedding-3-Small)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL with pgvector extension
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Add your OpenAI API key and database URL
   ```

4. Set up the database:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses the following main models:

- **User**: User authentication and profile
- **Meeting**: Meeting metadata, transcript, and summary
- **Decision**: Extracted decisions with categories
- **ActionItem**: Tasks with assignees and status tracking
- **MeetingChunk**: Text chunks with embeddings for vector search

## Usage

1. **Create a Meeting**: Go to "New Meeting" and enter meeting details
2. **Upload Audio**: Upload the meeting audio file (MP3, WAV, etc.)
3. **AI Processing**: The system automatically transcribes and extracts insights
4. **View Results**: Check the dashboard for decisions and meeting details
5. **Search**: Use the global search to find specific topics or decisions

## AI Pipeline

The processing pipeline works as follows:

1. **Transcription**: Audio → Whisper → Text transcript
2. **Extraction**: Transcript → GPT-4o → Decisions & Action Items
3. **Chunking**: Transcript → Text chunks (1000 words each)
4. **Embeddings**: Chunks → OpenAI embeddings → Vector storage
5. **Search**: Query → Embedding → Vector similarity search

## Development

### Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable UI components
├── lib/             # Utility functions and clients
├── services/        # Business logic and AI services
└── actions/         # Server actions for data operations
```

### Key Services

- **AIPipelineService**: Handles transcription, extraction, and embedding generation
- **VectorSearchService**: Manages semantic search operations
- **Prisma Client**: Database operations and ORM

## Environment Variables

```env
DATABASE_URL="your_postgresql_connection_string"
OPENAI_API_KEY="your_openai_api_key"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
