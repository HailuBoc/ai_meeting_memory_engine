import { getMeetings } from "@/app/actions/meetings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface DashboardPageProps {
  searchParams: Promise<{ userId?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const userId = params.userId || "demo-user";
  const { success, meetings, error } = await getMeetings(userId);

  if (!success || error) {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">MEMOFLOW Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Track decisions and action items across all meetings</p>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Unable to Load Meetings</h3>
              <p className="mt-1 text-sm text-red-700">
                {error || 'An unexpected error occurred'}
              </p>
              <p className="mt-3 text-xs text-red-600">
                This might be a temporary issue. Please check your internet connection or try again later.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-2 border-red-300 text-red-700 hover:bg-red-100">
              <Link href="/dashboard">Try Again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allDecisions = meetings
    .flatMap((meeting) =>
      meeting.decisions.map((decision) => ({
        ...decision,
        meetingTitle: meeting.title,
        meetingDate: meeting.date,
        meetingId: meeting.id,
      })),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const allActionItems = meetings.flatMap((meeting) =>
    meeting.actionItems.map((item) => ({
      ...item,
      meetingTitle: meeting.title,
      meetingDate: meeting.date,
      meetingId: meeting.id,
    })),
  );

  const completedActions = allActionItems.filter(
    (item) => item.status === "completed",
  ).length;
  const pendingActions = allActionItems.filter(
    (item) => item.status === "pending",
  ).length;

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            MEMOFLOW Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track decisions and action items across all meetings
          </p>
        </div>
        <Button asChild className="w-fit shrink-0">
          <Link href="/meetings/new">New Meeting</Link>
        </Button>
      </div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        <Card className="transition-transform duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Meetings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetings.length}</div>
          </CardContent>
        </Card>

        <Card className="transition-transform duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Decisions
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allDecisions.length}</div>
          </CardContent>
        </Card>

        <Card className="transition-transform duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Actions
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedActions}
            </div>
          </CardContent>
        </Card>

        <Card className="transition-transform duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Actions
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingActions}
            </div>
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
                <div
                  key={decision.id}
                  className="group flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50 sm:space-x-4 sm:p-0 sm:hover:bg-transparent"
                >
                  <div className="flex-shrink-0 mt-2 h-2 w-2 rounded-full bg-primary sm:mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {decision.text}
                      </p>
                      <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
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
                <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                  <div className="flex cursor-pointer flex-col gap-3 rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
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
                    <span className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground">
                      View
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
