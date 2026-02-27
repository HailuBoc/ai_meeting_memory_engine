'use client'

import { useState } from 'react'
import { searchMeetings, searchDecisions } from '@/app/actions/search'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, FileText, CheckCircle, Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<{
    meetings: any[]
    decisions: any[]
  }>({ meetings: [], decisions: [] })
  const [activeTab, setActiveTab] = useState<'all' | 'meetings' | 'decisions'>('all')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const [meetingsResult, decisionsResult] = await Promise.all([
        searchMeetings(query),
        searchDecisions(query)
      ])

      setSearchResults({
        meetings: meetingsResult.success ? meetingsResult.results : [],
        decisions: decisionsResult.success ? decisionsResult.results : []
      })
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const formatSimilarity = (similarity: number) => {
    return `${Math.round(similarity * 100)}% match`
  }

  const allResults = [
    ...searchResults.meetings.map(item => ({ ...item, type: 'meeting' })),
    ...searchResults.decisions.map(item => ({ ...item, type: 'decision' }))
  ].sort((a, b) => b.similarity - a.similarity)

  const displayResults = activeTab === 'all' ? allResults :
    activeTab === 'meetings' ? searchResults.meetings :
    searchResults.decisions

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Global Search</h1>
        <p className="mt-2 text-muted-foreground">
          Search across all meeting transcripts and decisions using AI-powered semantic search
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:gap-4">
            <div className="flex-1 min-w-0">
              <Input
                type="text"
                placeholder="Ask anything about your meetings... (e.g., 'Why did we decide to use Postgres?')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="text-base"
              />
            </div>
            <Button type="submit" disabled={isSearching || !query.trim()} className="w-full sm:w-auto shrink-0">
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {searchResults.meetings.length > 0 || searchResults.decisions.length > 0 ? (
        <>
          {/* Tabs */}
          <div className="mb-6 flex flex-wrap gap-1 rounded-lg bg-muted p-1 sm:flex-nowrap sm:space-x-1">
            <Button
              variant={activeTab === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('all')}
            >
              All Results ({allResults.length})
            </Button>
            <Button
              variant={activeTab === 'meetings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('meetings')}
            >
              Meeting Content ({searchResults.meetings.length})
            </Button>
            <Button
              variant={activeTab === 'decisions' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('decisions')}
            >
              Decisions ({searchResults.decisions.length})
            </Button>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {displayResults.map((result, index) => (
              <Card key={`${result.type}-${result.meetingId}-${index}`} className="transition-all duration-200 hover:border-primary/30">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {result.type === 'decision' ? (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-600" />
                        )}
                        <span className="text-sm font-medium text-gray-600">
                          {result.type === 'decision' ? 'Decision' : 'Meeting Content'}
                        </span>
                        <span className="text-sm text-gray-400">
                          {formatSimilarity(result.similarity)}
                        </span>
                      </div>
                      
                      <p className="text-gray-900 mb-3 leading-relaxed">
                        {result.content}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(result.meetingDate).toLocaleDateString()}
                        </div>
                        <span>•</span>
                        <span className="font-medium">{result.meetingTitle}</span>
                      </div>
                    </div>
                    
                    <Button asChild variant="outline" size="sm" className="shrink-0 w-fit">
                      <Link href={`/meetings/${result.meetingId}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : query && !isSearching ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">
              Try different keywords or check your spelling. You can search for specific topics, decisions, or meeting content.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Initial State */}
      {!query && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search your meetings</h3>
            <p className="text-gray-600 mb-4">
              Enter a question or keyword to search across all your meeting transcripts and decisions.
            </p>
            <div className="text-left max-w-md mx-auto">
              <p className="text-sm font-medium text-gray-700 mb-2">Example searches:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "Why did we decide to use Postgres?"</li>
                <li>• "What are the action items for John?"</li>
                <li>• "Budget discussion from last week"</li>
                <li>• "Technical decisions about API design"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
