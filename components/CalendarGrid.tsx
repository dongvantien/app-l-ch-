
import React from 'react';
import { ChevronLeft, ChevronRight } from './Icons';
import { DayInfo, CalendarEvent } from '../types';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  events: CalendarEvent[];
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  currentDate, 
  selectedDate, 
  onSelectDate, 
  onPrevMonth, 
  onNextMonth,
  events
}) => {
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  
  const days: DayInfo[] = [];

  // Helper to calculate color based on urgency
  const getEventColor = (event: CalendarEvent) => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    const now = new Date();

    // Past events -> Gray
    if (end.getTime() < now.getTime()) {
        return '#9CA3AF'; // gray-400
    }

    const diffTime = start.getTime() - now.getTime();
    const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysDiff <= 3) return '#FF3B30'; // Red
    if (daysDiff <= 6) return '#FFCC00'; // Yellow
    return '#34C759'; // Green
  };

  // Previous month filler
  const prevMonthDays = getDaysInMonth(year, month - 1);
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      eventColors: []
    });
  }

  // Current month
  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const isToday = d.toDateString() === today.toDateString();
    const isSelected = d.toDateString() === selectedDate.toDateString();
    
    // Find events for this day
    const dayEvents = events.filter(e => {
        const evtDate = new Date(e.startTime);
        return evtDate.toDateString() === d.toDateString();
    });

    // Sort by start time
    dayEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Map to colors (max 4 dots to fit UI)
    const dots = dayEvents.map(getEventColor);

    days.push({
      date: d,
      isCurrentMonth: true,
      isToday,
      isSelected,
      eventColors: dots
    });
  }

  // Next month filler
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      eventColors: []
    });
  }

  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  // Helper to determine the dominant background color for the cell
  const getDayStyles = (day: DayInfo) => {
    let containerClass = "w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all mb-0.5 relative ";
    let dotColor = "";
    
    // 1. Priority: Selected Date
    if (day.isSelected) {
        return {
            className: containerClass + "bg-ios-blue text-white shadow-md",
            dotColor: "bg-white"
        };
    }

    // 2. Priority: Has Events (Highlight based on urgency)
    if (day.eventColors.length > 0 && day.isCurrentMonth) {
        // Find the most urgent color in the list
        let bgColor = '#34C759'; // Default Green
        if (day.eventColors.includes('#FF3B30')) bgColor = '#FF3B30'; // Red takes priority
        else if (day.eventColors.includes('#FFCC00')) bgColor = '#FFCC00'; // Yellow takes second priority
        else if (day.eventColors.every(c => c === '#9CA3AF')) bgColor = '#E5E7EB'; // All past events -> Gray Light

        const isPast = bgColor === '#E5E7EB';
        
        return {
            className: containerClass + (isPast ? "text-gray-500" : "text-white shadow-sm"),
            style: { backgroundColor: bgColor },
            dotColor: isPast ? "bg-gray-400" : "bg-white"
        };
    }

    // 3. Priority: Today (No events)
    if (day.isToday) {
        return {
            className: containerClass + "text-ios-blue bg-blue-50 font-bold",
            dotColor: "bg-ios-blue"
        };
    }

    // 4. Default
    return {
        className: containerClass + (!day.isCurrentMonth ? "text-gray-300" : "text-gray-900 hover:bg-gray-100"),
        dotColor: "bg-gray-400"
    };
  };

  return (
    <div className="bg-white pb-4 rounded-b-3xl shadow-sm z-10 relative">
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-xl font-bold text-ios-blue capitalize">
          {currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-4">
            <button onClick={onPrevMonth} className="p-1 text-ios-blue hover:bg-blue-50 rounded-full transition-colors">
                <ChevronLeft size={24} />
            </button>
            <button onClick={onNextMonth} className="p-1 text-ios-blue hover:bg-blue-50 rounded-full transition-colors">
                <ChevronRight size={24} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2 px-2">
        {days.map((day, idx) => {
            const styles = getDayStyles(day);
            return (
                <div key={idx} className="flex flex-col items-center justify-start relative h-11">
                    <button
                        onClick={() => onSelectDate(day.date)}
                        className={styles.className}
                        style={styles.style}
                    >
                        {day.date.getDate()}
                    </button>
                    
                    {/* Event Dots - Limit to 4 to prevent overflow */}
                    <div className="flex gap-[2px] h-1.5 items-end justify-center">
                        {day.eventColors.slice(0, 4).map((_, i) => (
                            <div 
                                key={i} 
                                className={`w-1 h-1 rounded-full ${styles.dotColor}`}
                            ></div>
                        ))}
                        {day.eventColors.length > 4 && (
                             <div className={`w-1 h-1 rounded-full ${styles.dotColor} opacity-50`}></div>
                        )}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
