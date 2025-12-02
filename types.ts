export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  location?: string;
  color?: string; // Hex code or tailwind class
  isAllDay?: boolean;
  reminderMinutes?: number | null; // Minutes before event, null = no reminder
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
  hasEvents: boolean;
}