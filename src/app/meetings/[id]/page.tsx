import { getMeetingDetail } from '@/app/actions/meetings'
import { updateActionItemStatus } from '@/app/actions/meetings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, FileText, CheckCircle, Clock, User, Tag } from 'lucide-react'
import Link from 'next/link'
import { UpdateActionItemForm } from '@/components/update-action-item-form'

interface MeetingDetailPageProps {
  params: { id: string }
}

export default async function MeetingDetailPage({ params }: MeetingDetailPageProps) {
  const { success, meeting, error } = await getMeetingDetail(params.id)

  if (!success || error || !meeting) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Meeting Not Found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{meeting.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(meeting.date).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {meeting.user.name || meeting.user.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Summary */}
      {meeting.summary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{meeting.summary}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transcript */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Full Transcript
            </CardTitle>
            <CardDescription>
              Complete meeting transcription
            </CardDescription>
          </CardHeader>
          <CardContent>
            {meeting.rawTranscript ? (
              <div className="prose prose-sm max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {meeting.rawTranscript}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No transcript available. Upload audio to generate transcript.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Decisions and Action Items */}
        <div className="space-y-6">
          {/* Decisions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Decisions ({meeting.decisions.length})
              </CardTitle>
              <CardDescription>
                Immutable decisions made during this meeting
              </CardDescription>
            </CardHeader>
            <CardContent>
              {meeting.decisions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No decisions recorded
                </div>
              ) : (
                <div className="space-y-3">
                  {meeting.decisions.map((decision) => (
                    <div key={decision.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <p className="font-medium text-gray-900">{decision.text}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Tag className="h-3 w-3 mr-1" />
                        <span className="capitalize">{decision.category}</span>
                        <span className="mx-2">•</span>
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(decision.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Action Items ({meeting.actionItems.length})
              </CardTitle>
              <CardDescription>
                Tasks that need to be completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {meeting.actionItems.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No action items recorded
                </div>
              ) : (
                <div className="space-y-3">
                  {meeting.actionItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.task}</p>
                          {item.assignee && (
                            <p className="text-sm text-gray-600 mt-1">
                              Assigned to: {item.assignee}
                            </p>
                          )}
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <UpdateActionItemForm 
                          actionItemId={item.id} 
                          currentStatus={item.status} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
