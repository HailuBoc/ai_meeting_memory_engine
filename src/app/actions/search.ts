'use server'

import { VectorSearchService } from '@/services/vector-search'

export async function searchMeetings(query: string) {
  try {
    const results = await VectorSearchService.searchSimilarContent(query)
    return { success: true, results }
  } catch (error) {
    console.error('Search error:', error)
    return { success: false, error: 'Failed to search meetings' }
  }
}

export async function searchDecisions(query: string) {
  try {
    const results = await VectorSearchService.searchDecisions(query)
    return { success: true, results }
  } catch (error) {
    console.error('Decision search error:', error)
    return { success: false, error: 'Failed to search decisions' }
  }
}
