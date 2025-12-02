import React from 'react';
import { CalendarEvent } from '../types';
import { MapPin, Bell } from './Icons';

interface EventItemProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
}

export const EventItem: React.FC<EventItemProps> = ({ event, onClick }) => {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const now = new Date();
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const hasReminder = event.reminderMinutes !== undefined && event.reminderMinutes !== null;

  // Calculate Logic for Color based on Deadline
  const getEventStatusColor = () => {
    // Difference in milliseconds
    const diffTime = start.getTime() - now.getTime();
    
    // If event passed (allow 1 hour buffer for "ongoing")
    if (end.getTime() < now.getTime()) {
        return '#9CA3AF'; // Gray for past events
    }

    // Convert to days (ceil to count partial days as a day)
    const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysDiff <= 3) {
        return '#FF3B30'; // Red (<= 3 days)
    } else if (daysDiff <= 6) {
        return '#FFCC00'; // Yellow/Amber (3-6 days)
    } else {
        return '#34C759'; // Green (> 6 days)
    }
  };

  const statusColor = getEventStatusColor();

  return (
    <div 
      onClick={() => onClick(event)}
      className="flex gap-4 p-4 bg-white active:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer"
    >
      <div className="flex flex-col items-end min-w-[3.5rem] pt-0.5">
        <span className="text-sm font-semibold text-gray-900">{formatTime(start)}</span>
        <span className="text-xs text-gray-500">{formatTime(end)}</span>
      </div>
      
      <div className="flex-1 relative pl-4 border-l-4 rounded-l-sm" style={{ borderColor: statusColor }}>
        {/* Color bar visual */}
        <div 
            className="absolute left-[-4px] top-0 bottom-0 w-1 rounded-l-sm" 
            style={{ backgroundColor: statusColor }} 
        ></div>
        
        <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1">{event.title}</h3>
        
        <div className="flex flex-wrap gap-2">
            {event.location && (
            <div className="flex items-center text-gray-500 text-sm">
                <MapPin size={12} className="mr-1" />
                <span className="truncate max-w-[150px]">{event.location}</span>
            </div>
            )}
            
            {hasReminder && (
                <div className="flex items-center text-ios-blue text-sm bg-blue-50 px-1.5 py-0.5 rounded">
                    <Bell size={10} className="mr-1" />
                    <span className="text-xs font-medium">
                        {event.reminderMinutes === 0 ? 'Đúng giờ' : `${event.reminderMinutes}p`}
                    </span>
                </div>
            )}
        </div>

        {event.description && (
          <p className="text-gray-400 text-xs line-clamp-2 mt-1">{event.description}</p>
        )}
      </div>
    </div>
  );
};