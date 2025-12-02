import React from 'react';
import { ChevronLeft, ChevronRight } from './Icons';
import { DayInfo } from '../types';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  events: any[]; // Used to show dots
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
  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday. Let's make Monday start of week for VN locale usually, 
    // but iOS default is often Sunday. Let's stick to Sunday start to match standard Date.getDay()
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  
  const days: DayInfo[] = [];

  // Previous month filler
  const prevMonthDays = getDaysInMonth(year, month - 1);
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      hasEvents: false
    });
  }

  // Current month
  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const isToday = d.toDateString() === today.toDateString();
    const isSelected = d.toDateString() === selectedDate.toDateString();
    
    // Check if this day has events
    const hasEvt = events.some(e => {
        const evtDate = new Date(e.startTime);
        return evtDate.toDateString() === d.toDateString();
    });

    days.push({
      date: d,
      isCurrentMonth: true,
      isToday,
      isSelected,
      hasEvents: hasEvt
    });
  }

  // Next month filler (to complete 42 cells grid - 6 rows)
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      hasEvents: false
    });
  }

  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

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
        {days.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center justify-center relative h-10">
            <button
              onClick={() => onSelectDate(day.date)}
              className={`
                w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all
                ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                ${day.isSelected ? 'bg-ios-blue text-white shadow-md' : ''}
                ${!day.isSelected && day.isToday ? 'text-ios-blue bg-blue-50 font-bold' : ''}
                ${!day.isSelected && !day.isToday && day.isCurrentMonth ? 'hover:bg-gray-100' : ''}
              `}
            >
              {day.date.getDate()}
            </button>
            {/* Event Dot */}
            {day.hasEvents && (
               <div className={`w-1 h-1 rounded-full mt-1 ${day.isSelected ? 'bg-white' : 'bg-gray-400'}`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};