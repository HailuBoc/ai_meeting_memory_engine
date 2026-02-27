import { prisma } from "@/lib/prisma";
import { getOpenAIClient } from "@/lib/openai";

interface SearchResult {
  content: string;
  similarity: number;
  meetingId: string;
  meetingTitle: string;
  meetingDate: Date;
}

export class VectorSearchService {
  static async generateQueryEmbedding(query: string): Promise<number[]> {
    const openai = getOpenAIClient();
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    return response.data[0].embedding;
  }

  static async searchSimilarContent(
    query: string,
    limit: number = 10,
  ): Promise<SearchResult[]> {
    const vectorEnabled =
      (process.env.ENABLE_VECTOR_SEARCH || "").toLowerCase() === "true";
    if (!vectorEnabled) {
      const chunks = await prisma.meetingChunk.findMany({
        where: { content: { contains: query, mode: "insensitive" } },
        take: limit,
        include: { meeting: true },
      });
      return chunks.map((mc) => ({
        content: mc.content,
        similarity: 0.5,
        meetingId: mc.meetingId,
        meetingTitle: (mc as any).meeting?.title ?? "",
        meetingDate: (mc as any).meeting?.date ?? new Date(0),
      }));
    }

    const queryEmbedding = await this.generateQueryEmbedding(query);
    const queryVector = `[${queryEmbedding.join(",")}]`;

    const results = await prisma.$queryRaw<SearchResult[]>`
      SELECT 
        mc.content,
        mc.meeting_id as "meetingId",
        m.title as "meetingTitle",
        m.date as "meetingDate",
        1 - (mc.embedding <=> ${queryVector}::vector) as similarity
      FROM "MeetingChunk" mc
      JOIN "Meeting" m ON mc.meeting_id = m.id
      ORDER BY mc.embedding <=> ${queryVector}::vector
      LIMIT ${limit}
    `;

    return results;
  }

  static async searchDecisions(
    query: string,
    limit: number = 10,
  ): Promise<SearchResult[]> {
    const vectorEnabled =
      (process.env.ENABLE_VECTOR_SEARCH || "").toLowerCase() === "true";
    if (!vectorEnabled) {
      const decisions = await prisma.decision.findMany({
        where: { text: { contains: query, mode: "insensitive" } },
        take: limit,
        include: { meeting: true },
      });
      return decisions.map((d) => ({
        content: d.text,
        similarity: 0.5,
        meetingId: d.meetingId,
        meetingTitle: (d as any).meeting?.title ?? "",
        meetingDate: (d as any).meeting?.date ?? new Date(0),
      }));
    }

    const queryEmbedding = await this.generateQueryEmbedding(query);
    const queryVector = `[${queryEmbedding.join(",")}]`;

    const results = await prisma.$queryRaw<SearchResult[]>`
      SELECT 
        d.text as content,
        d.meeting_id as "meetingId",
        m.title as "meetingTitle",
        m.date as "meetingDate",
        1 - (mc.embedding <=> ${queryVector}::vector) as similarity
      FROM "Decision" d
      JOIN "Meeting" m ON d.meeting_id = m.id
      JOIN "MeetingChunk" mc ON d.meeting_id = mc.meeting_id
      ORDER BY mc.embedding <=> ${queryVector}::vector
      LIMIT ${limit}
    `;

    return results;
  }
}
