'use server'

import { prisma } from '@/lib/prisma'

export async function createMeeting(title: string, date: Date, userId: string) {
  try {
    const meeting = await prisma.meeting.create({
      data: {
        title,
        date,
        userId,
      },
      include: {
        decisions: true,
        actionItems: true,
        chunks: true,
      },
    })
    
    return { success: true, meeting }
  } catch (error) {
    console.error('Create meeting error:', error)
    return { success: false, error: 'Failed to create meeting' }
  }
}

export async function uploadMeetingAudio(
  meetingId: string,
  audioFile: File
) {
  try {
    const { AIPipelineService } = await import('@/services/ai-pipeline')
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
    
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { title: true, date: true }
    })
    
    if (!meeting) {
      return { success: false, error: 'Meeting not found' }
    }
    
    await AIPipelineService.processMeetingAudio(
      meetingId,
      audioBuffer,
      meeting.title,
      meeting.date
    )
    
    return { success: true }
  } catch (error) {
    console.error('Upload audio error:', error)
    return { success: false, error: 'Failed to process audio' }
  }
}

export async function getMeetings(userId: string) {
  try {
    const meetings = await prisma.meeting.findMany({
      where: { userId },
      include: {
        decisions: true,
        actionItems: true,
        _count: {
          select: {
            decisions: true,
            actionItems: true,
            chunks: true,
          }
        }
      },
      orderBy: { date: 'desc' }
    })
    
    return { success: true, meetings }
  } catch (error) {
    console.error('Get meetings error:', error)
    return { success: false, error: 'Failed to fetch meetings' }
  }
}

export async function getMeetingDetail(meetingId: string) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        decisions: {
          orderBy: { createdAt: 'asc' }
        },
        actionItems: {
          orderBy: { createdAt: 'asc' }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    return { success: true, meeting }
  } catch (error) {
    console.error('Get meeting detail error:', error)
    return { success: false, error: 'Failed to fetch meeting details' }
  }
}

export async function updateActionItemStatus(
  actionItemId: string,
  status: string
) {
  try {
    const actionItem = await prisma.actionItem.update({
      where: { id: actionItemId },
      data: { status }
    })
    
    return { success: true, actionItem }
  } catch (error) {
    console.error('Update action item error:', error)
    return { success: false, error: 'Failed to update action item' }
  }
}
