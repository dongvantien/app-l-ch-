import React, { useState, useEffect, useRef } from 'react';
import { CalendarGrid } from './components/CalendarGrid';
import { EventItem } from './components/EventItem';
import { CalendarEvent } from './types';
import { Plus, Sparkles, Calendar as CalendarIcon, LogOut, User } from './components/Icons';
import { AIModal } from './components/AIModal';
import { AddEventModal } from './components/AddEventModal';
import { LoginScreen } from './components/LoginScreen';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // App State
  const [currentDate, setCurrentDate] = useState(new Date()); // For Calendar Month View
  const [selectedDate, setSelectedDate] = useState(new Date()); // For Selected Day
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // New flag to prevent data overwrite
  
  // Modals
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Notification logic
  const lastCheckTimeRef = useRef<number>(Date.now());

  // Check for previous session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ischedule-current-user');
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  // Load events when currentUser changes
  useEffect(() => {
    if (!currentUser) {
        setEvents([]);
        setIsDataLoaded(false); // Reset loaded flag
        return;
    }

    const storageKey = `ischedule-events-${currentUser}`;
    const savedEvents = localStorage.getItem(storageKey);
    
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {
        console.error("Failed to parse events");
        setEvents([]);
      }
    } else {
        // Initialize with empty if brand new user
        setEvents([]);
    }
    setIsDataLoaded(true); // Mark data as loaded

    // Request notification permission on login
    if ("Notification" in window) {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    }
  }, [currentUser]);

  // Save to local storage whenever events change (and user is logged in AND data is loaded)
  useEffect(() => {
    // CRITICAL FIX: Only save if we have a user AND data has been loaded at least once.
    // This prevents overwriting existing data with empty [] initial state on reload.
    if (currentUser && isDataLoaded) {
        const storageKey = `ischedule-events-${currentUser}`;
        localStorage.setItem(storageKey, JSON.stringify(events));
    }
  }, [events, currentUser, isDataLoaded]);

  // Check for reminders AND Daily 5 AM Briefing
  useEffect(() => {
    if (!currentUser) return; // Don't run notification logic if not logged in

    const checkNotifications = () => {
        const now = Date.now();
        const dateNow = new Date();
        const lastCheck = lastCheckTimeRef.current;
        
        // --- 1. Event Reminders (Exact Time) ---
        events.forEach(event => {
            if (event.reminderMinutes !== undefined && event.reminderMinutes !== null) {
                const startTime = new Date(event.startTime).getTime();
                // reminderMinutes is actually calculated from days: days * 24 * 60
                const triggerTime = startTime - (event.reminderMinutes * 60000);
                
                // If the trigger time is within the window since last check
                if (triggerTime > lastCheck && triggerTime <= now) {
                    // Send notification
                    if ("Notification" in window && Notification.permission === "granted") {
                        const daysLeft = Math.round(event.reminderMinutes / 1440);
                        const isToday = daysLeft <= 0;
                        
                        const prefix = event.isMajorEvent ? "⭐ [QUAN TRỌNG] " : "⏰ ";
                        const timeStr = new Date(event.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                        const dateStr = new Date(event.startTime).toLocaleDateString('vi-VN', {day:'numeric', month:'numeric'});

                        const title = `${prefix}Sắp đến hạn: ${event.title}`;
                        const body = isToday 
                            ? `Sự kiện diễn ra HÔM NAY lúc ${timeStr}.` 
                            : `Sự kiện diễn ra vào ngày ${dateStr} (còn ${daysLeft} ngày).`;

                        new Notification(title, {
                            body: body,
                            icon: '/favicon.ico'
                        });
                    }
                }
            }
        });

        // --- 2. Daily Briefing at 5:00 AM ---
        // Check if it's past 5 AM today and we haven't sent the briefing yet
        const currentHour = dateNow.getHours();
        const todayString = dateNow.toDateString();
        const briefingKey = `lastDailyBriefingDate-${currentUser}`;
        const lastBriefingDate = localStorage.getItem(briefingKey);

        if (currentHour >= 5 && lastBriefingDate !== todayString) {
            // Filter future events
            const futureEvents = events.filter(e => new Date(e.startTime).getTime() > now);
            
            if (futureEvents.length > 0) {
                // Sort by urgency (earliest start time first)
                const sortedEvents = futureEvents.sort((a, b) => 
                    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                );

                const count = sortedEvents.length;
                const nextEvent = sortedEvents[0];
                const nextTime = new Date(nextEvent.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});

                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification(`📅 Chào buổi sáng, ${currentUser}!`, {
                        body: `Bạn có ${count} nhiệm vụ sắp tới. Ưu tiên nhất: "${nextEvent.title}" lúc ${nextTime}.`,
                        icon: '/favicon.ico',
                        tag: 'daily-briefing'
                    });
                }
            }

            // Mark as sent for today
            localStorage.setItem(briefingKey, todayString);
        }
        
        lastCheckTimeRef.current = now;
    };

    const intervalId = setInterval(checkNotifications, 10000); // Check every 10s for better precision
    return () => clearInterval(intervalId);
  }, [events, currentUser]);

  // Auth Handlers
  const handleLogin = (username: string) => {
      setCurrentUser(username);
      localStorage.setItem('ischedule-current-user', username);
  };

  const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem('ischedule-current-user');
      setEvents([]); // Clear current events from view
      setIsDataLoaded(false);
  };

  // Date Handlers
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (date.getMonth() !== currentDate.getMonth()) {
        setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Event CRUD Handlers
  const handleAddEvents = (newEvents: Partial<CalendarEvent>[]) => {
    const processedEvents = newEvents.map(e => ({
        ...e,
        id: e.id || crypto.randomUUID(),
        startTime: e.startTime!,
        endTime: e.endTime!,
        title: e.title!,
        color: 'bg-ios-blue',
        isMajorEvent: false // AI generated events are standard by default
    } as CalendarEvent));
    
    setEvents(prev => [...prev, ...processedEvents]);
  };

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (eventData.id) {
        setEvents(prev => prev.map(e => e.id === eventData.id ? { ...e, ...eventData } as CalendarEvent : e));
    } else {
        const newEvent: CalendarEvent = {
            id: crypto.randomUUID(),
            title: eventData.title!,
            startTime: eventData.startTime!,
            endTime: eventData.endTime!,
            location: eventData.location,
            description: eventData.description,
            color: 'bg-ios-blue',
            reminderMinutes: eventData.reminderMinutes,
            isMajorEvent: eventData.isMajorEvent
        };
        setEvents(prev => [...prev, newEvent]);
    }
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
      if(window.confirm("Bạn có chắc muốn xóa sự kiện này?")) {
        setEvents(prev => prev.filter(e => e.id !== id));
        setIsEventModalOpen(false); // Close modal after delete
      }
  };

  const handleEditClick = (event: CalendarEvent) => {
      setEditingEvent(event);
      setIsEventModalOpen(true);
  };

  // Filter events for selected date
  const selectedDateEvents = events.filter(e => {
    const eDate = new Date(e.startTime);
    return eDate.toDateString() === selectedDate.toDateString();
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Render Login Screen if no user
  if (!currentUser) {
      return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    // Use 100dvh (dynamic viewport height) to fix Safari bottom bar issue
    <div className="flex flex-col h-[100dvh] bg-gray-50 max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* Header Area with User Info */}
      <div className="bg-white pt-safe-top sticky top-0 z-20 shadow-sm flex items-center justify-between px-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-ios-blue">
                <User size={16} />
            </div>
            <span className="font-semibold text-gray-800 truncate max-w-[150px]">{currentUser}</span>
        </div>
        <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Đăng xuất"
        >
            <LogOut size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Calendar Grid (Month View) */}
        <div className="shrink-0 bg-white shadow-sm z-10 transition-all duration-300 ease-in-out">
            <CalendarGrid 
                currentDate={currentDate}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                events={events}
            />
        </div>

        {/* Selected Date Header */}
        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between border-b border-gray-200">
            <h3 className="text-gray-500 font-semibold uppercase tracking-wider text-sm">
                {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {selectedDateEvents.length} sự kiện
            </span>
        </div>

        {/* Event List (Scrollable) */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
            {selectedDateEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <CalendarIcon size={48} className="mb-2 opacity-20" />
                    <p className="text-sm">Không có sự kiện nào</p>
                    <button 
                        onClick={() => setIsAIModalOpen(true)}
                        className="mt-4 text-ios-blue text-sm font-medium hover:underline"
                    >
                        Nhờ AI gợi ý lịch trình?
                    </button>
                </div>
            ) : (
                <div className="divide-y divide-gray-100 bg-white">
                    {selectedDateEvents.map(event => (
                        <EventItem 
                            key={event.id} 
                            event={event} 
                            onClick={handleEditClick}
                        />
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Bottom Floating Action Bar / Tab Bar - Add pb-safe-bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-4 flex justify-between items-end pointer-events-none bg-gradient-to-t from-gray-50/90 to-transparent">
         
         {/* AI Button (Left) */}
         <button 
            onClick={() => setIsAIModalOpen(true)}
            className="pointer-events-auto w-12 h-12 rounded-full bg-white text-ios-blue shadow-lg flex items-center justify-center border border-blue-100 hover:scale-105 active:scale-95 transition-transform"
            title="AI Planner"
         >
            <Sparkles size={24} />
         </button>

         {/* Add Event Button (Center/Right main) */}
         <button 
            onClick={() => { setEditingEvent(null); setIsEventModalOpen(true); }}
            className="pointer-events-auto w-14 h-14 rounded-full bg-ios-blue text-white shadow-lg shadow-blue-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform mb-1"
         >
            <Plus size={32} />
         </button>
      </div>

      {/* Modals */}
      <AIModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        targetDate={selectedDate}
        onEventsGenerated={handleAddEvents}
      />

      <AddEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        selectedDate={selectedDate}
        initialEvent={editingEvent}
      />

    </div>
  );
};

export default App;
