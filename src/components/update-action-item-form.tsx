'use client'

import { useState } from 'react'
import { updateActionItemStatus } from '@/app/actions/meetings'
import { Button } from '@/components/ui/button'

interface UpdateActionItemFormProps {
  actionItemId: string
  currentStatus: string
}

export function UpdateActionItemForm({ actionItemId, currentStatus }: UpdateActionItemFormProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return
    
    setIsUpdating(true)
    try {
      const result = await updateActionItemStatus(actionItemId, newStatus)
      if (result.success) {
        setStatus(newStatus)
      } else {
        alert('Failed to update status: ' + result.error)
      }
    } catch (error) {
      alert('Error updating status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in-progress':
        return 'In Progress'
      default:
        return 'Pending'
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {getStatusText(status)}
      </span>
      
      {status !== 'completed' && (
        <div className="flex space-x-1">
          {status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('in-progress')}
              disabled={isUpdating}
            >
              Start
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange('completed')}
            disabled={isUpdating}
          >
            Complete
          </Button>
        </div>
      )}
    </div>
  )
}
