'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMeeting, uploadMeetingAudio } from '@/app/actions/meetings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Calendar, ArrowLeft, CheckCircle, AlertCircle, X } from 'lucide-react'
import Link from 'next/link'

type Message = {
  type: 'success' | 'error'
  text: string
} | null

export default function NewMeetingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [meetingId, setMeetingId] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle')
  const [message, setMessage] = useState<Message>(null)
  const router = useRouter()

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    if (type === 'success') {
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const dismissMessage = () => setMessage(null)

  const handleCreateMeeting = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)
    try {
      const title = formData.get('title') as string
      const date = new Date(formData.get('date') as string)
      const userId = 'demo-user' // In a real app, get from auth

      const result = await createMeeting(title, date, userId)
      
      if (result.success && result.meeting) {
        setMeetingId(result.meeting.id)
        showMessage('success', 'Meeting created successfully! Now upload the audio file.')
      } else {
        showMessage('error', 'Failed to create meeting: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      showMessage('error', 'Error creating meeting. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAudioUpload = async (formData: FormData) => {
    if (!meetingId) return

    setUploadStatus('uploading')
    setMessage(null)
    try {
      const audioFile = formData.get('audio') as File
      
      if (!audioFile || audioFile.size === 0) {
        showMessage('error', 'Please select an audio file')
        setUploadStatus('idle')
        return
      }

      setUploadStatus('processing')
      const result = await uploadMeetingAudio(meetingId, audioFile)
      
      if (result.success) {
        setUploadStatus('completed')
        showMessage('success', 'Audio processed successfully! Redirecting...')
        setTimeout(() => {
          router.push(`/meetings/${meetingId}`)
        }, 2000)
      } else {
        setUploadStatus('error')
        showMessage('error', 'Failed to process audio: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      setUploadStatus('error')
      showMessage('error', 'Error uploading audio. Please try again.')
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">New Meeting</h1>
        <p className="text-muted-foreground">Create a new meeting and upload audio for AI processing</p>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`mb-6 flex items-center justify-between gap-3 rounded-lg border p-4 transition-all animate-slide-up ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
          <button
            onClick={dismissMessage}
            className="shrink-0 rounded-md p-1 transition-colors hover:bg-black/10"
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 1: Create Meeting */}
      <Card className="mb-6 transition-shadow duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Step 1: Meeting Details
          </CardTitle>
          <CardDescription>
            Enter the basic information about your meeting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCreateMeeting} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="e.g., Q1 Planning Session"
                required
                disabled={isLoading || !!meetingId}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Meeting Date</Label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                required
                disabled={isLoading || !!meetingId}
              />
            </div>

            <Button type="submit" disabled={isLoading || !!meetingId}>
              {isLoading ? 'Creating...' : 'Create Meeting'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Step 2: Upload Audio */}
      {meetingId && (
        <Card className="animate-slide-up transition-shadow duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Step 2: Upload Audio
            </CardTitle>
            <CardDescription>
              Upload the meeting audio file for AI transcription and analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleAudioUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="audio">Audio File</Label>
                <Input
                  id="audio"
                  name="audio"
                  type="file"
                  accept="audio/*"
                  required
                  disabled={uploadStatus !== 'idle'}
                />
                <p className="text-sm text-muted-foreground">
                  Supported formats: MP3, WAV, M4A, etc. Max file size: 25MB
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={uploadStatus !== 'idle'}
                className="w-full"
              >
                {uploadStatus === 'uploading' && 'Uploading...'}
                {uploadStatus === 'processing' && 'Processing with AI...'}
                {uploadStatus === 'completed' && 'Processing Complete!'}
                {uploadStatus === 'error' && 'Try Again'}
                {uploadStatus === 'idle' && 'Upload and Process Audio'}
              </Button>

              {uploadStatus === 'processing' && (
                <div className="text-sm text-muted-foreground text-center">
                  This may take a few minutes. The AI is transcribing the audio and extracting decisions.
                </div>
              )}

              {uploadStatus === 'completed' && (
                <div className="text-sm text-green-600 text-center">
                  ✓ Processing complete! Redirecting to meeting details...
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
