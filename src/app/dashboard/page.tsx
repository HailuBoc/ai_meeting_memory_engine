import { getMeetings } from '@/app/actions/meetings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface DashboardPageProps {
  searchParams: { userId?: string }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const userId = searchParams.userId || 'demo-user'
  const { success, meetings, error } = await getMeetings(userId)

  if (!success || error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <p className="text-muted-foreground">Error loading meetings: {error}</p>
        </div>
      </div>
    )
  }

  const allDecisions = meetings.flatMap(meeting => 
    meeting.decisions.map(decision => ({
      ...decision,
      meetingTitle: meeting.title,
      meetingDate: meeting.date,
      meetingId: meeting.id
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const allActionItems = meetings.flatMap(meeting =>
    meeting.actionItems.map(item => ({
      ...item,
      meetingTitle: meeting.title,
      meetingDate: meeting.date,
      meetingId: meeting.id
    }))
  )

  const completedActions = allActionItems.filter(item => item.status === 'completed').length
  const pendingActions = allActionItems.filter(item => item.status === 'pending').length

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Meeting Memory Dashboard</h1>
          <p className="text-muted-foreground">Track decisions and action items across all meetings</p>
        </div>
        <Button asChild>
          <Link href="/meetings/new">New Meeting</Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allDecisions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Actions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedActions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingActions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Decisions Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Decisions</CardTitle>
          <CardDescription>
            Latest immutable decisions from all meetings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allDecisions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No decisions recorded yet. Upload a meeting audio to get started.
            </div>
          ) : (
            <div className="space-y-6">
              {allDecisions.slice(0, 10).map((decision, index) => (
                <div key={decision.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {decision.text}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {decision.category}
                      </span>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(decision.createdAt).toLocaleDateString()}
                      <span className="mx-2">•</span>
                      <Link 
                        href={`/meetings/${decision.meetingId}`}
                        className="hover:underline"
                      >
                        {decision.meetingTitle}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Meetings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Meetings</CardTitle>
          <CardDescription>
            Latest meetings with their summaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {meetings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No meetings yet. Create your first meeting to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.slice(0, 5).map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{meeting.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(meeting.date).toLocaleDateString()}
                    </p>
                    {meeting.summary && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {meeting.summary}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{meeting._count.decisions} decisions</span>
                      <span>{meeting._count.actionItems} action items</span>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/meetings/${meeting.id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
