
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  location?: string;
  color?: string; // Hex code or tailwind class
  isAllDay?: boolean;
  reminderMinutes?: number | null; // Keep for backward compatibility if needed
  reminderTime?: string | null; // ISO String for specific reminder time
}

export enum ViewMode {
  CALENDAR = 'CALENDAR',
  DAY = 'DAY',
  AI = 'AI'
}

export interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  eventColors: string[]; // List of colors for dots
}
