import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { MapPin, List, Bell, Star, Trash2 } from './Icons';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete: (id: string) => void;
  selectedDate: Date;
  initialEvent?: CalendarEvent | null;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  selectedDate, 
  initialEvent 
}) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  
  // reminderDays: string to handle empty input nicely
  const [reminderDays, setReminderDays] = useState<string>(''); 
  const [hasReminder, setHasReminder] = useState(false);
  
  // Major Event state
  const [isMajorEvent, setIsMajorEvent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialEvent) {
        setTitle(initialEvent.title);
        setLocation(initialEvent.location || '');
        setDescription(initialEvent.description || '');
        setStartTime(new Date(initialEvent.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit', hour12: false}));
        setEndTime(new Date(initialEvent.endTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit', hour12: false}));
        setIsMajorEvent(!!initialEvent.isMajorEvent);
        
        // Convert minutes back to days approx
        if (initialEvent.reminderMinutes !== undefined && initialEvent.reminderMinutes !== null) {
            setHasReminder(true);
            const days = Math.round(initialEvent.reminderMinutes / 1440); // 1440 mins = 1 day
            setReminderDays(days.toString());
        } else {
            setHasReminder(false);
            setReminderDays('');
        }
      } else {
        // Reset fields for new event
        setTitle('');
        setLocation('');
        setDescription('');
        setStartTime('09:00');
        setEndTime('10:00');
        setHasReminder(false);
        setReminderDays('');
        setIsMajorEvent(false);
      }
    }
  }, [isOpen, initialEvent]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;

    // Construct dates based on selectedDate and time inputs
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const start = new Date(selectedDate);
    start.setHours(startH, startM);
    
    const end = new Date(selectedDate);
    end.setHours(endH, endM);
    
    // Handle overnight events briefly
    if (end < start) end.setDate(end.getDate() + 1);

    // Calculate reminder minutes based on days input
    let minutes: number | null = null;
    if (hasReminder) {
        // Default to 0 days (same day) if empty or invalid, or let user type 0
        const days = parseInt(reminderDays);
        if (!isNaN(days) && days >= 0) {
            minutes = days * 24 * 60; // Convert days to minutes
        } else {
            // If active but empty, assume 0 days
             minutes = 0; 
        }
    }

    onSave({
      id: initialEvent?.id,
      title,
      location,
      description,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      reminderMinutes: minutes,
      isMajorEvent: isMajorEvent
    });
    onClose();
  };

  const handleRemoveReminder = (e: React.MouseEvent) => {
      e.stopPropagation();
      setHasReminder(false);
      setReminderDays('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal Content - slide up on mobile */}
      <div className="bg-gray-100 w-full max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-200">
        <div className="flex justify-between items-center p-4 bg-gray-100 border-b border-gray-200">
          <button onClick={onClose} className="text-ios-blue text-base hover:opacity-70">Hủy</button>
          <h3 className="font-semibold text-gray-900">{initialEvent ? 'Sửa sự kiện' : 'Sự kiện mới'}</h3>
          <button 
            onClick={handleSave} 
            className={`text-base font-semibold ${!title.trim() ? 'text-gray-300' : 'text-ios-blue hover:opacity-70'}`}
            disabled={!title.trim()}
          >
            {initialEvent ? 'Lưu' : 'Thêm'}
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-6">
          {/* Title Section */}
          <div className="bg-white rounded-xl overflow-hidden px-4 py-2">
            <input 
              type="text" 
              placeholder="Tiêu đề" 
              className="w-full py-2 text-lg font-semibold placeholder-gray-300 outline-none text-gray-900"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Major Event Toggle */}
          <div className="bg-white rounded-xl overflow-hidden">
             <div className="flex items-center justify-between px-4 py-3 cursor-pointer active:bg-gray-50 transition-colors" onClick={() => setIsMajorEvent(!isMajorEvent)}>
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${isMajorEvent ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Star size={18} fill={isMajorEvent ? "currentColor" : "none"} />
                    </div>
                    <span className="text-gray-900 font-medium">Sự kiện quan trọng</span>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors relative ${isMajorEvent ? 'bg-purple-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isMajorEvent ? 'translate-x-5' : ''}`}></div>
                </div>
             </div>
          </div>

          {/* Time & Reminder Section */}
          <div className="bg-white rounded-xl overflow-hidden divide-y divide-gray-100">
             <div className="flex items-center justify-between px-4 py-3">
                <span className="text-gray-900">Bắt đầu</span>
                <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-gray-100 rounded px-2 py-1 text-gray-900 outline-none focus:ring-1 focus:ring-ios-blue"
                />
             </div>
             <div className="flex items-center justify-between px-4 py-3">
                <span className="text-gray-900">Kết thúc</span>
                <input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-gray-100 rounded px-2 py-1 text-gray-900 outline-none focus:ring-1 focus:ring-ios-blue"
                />
             </div>
             
             {/* Toggle Reminder */}
             <div className="flex items-center justify-between px-4 py-3 cursor-pointer active:bg-gray-50 transition-colors" onClick={() => setHasReminder(!hasReminder)}>
                <div className="flex items-center gap-3">
                    <Bell size={20} className={hasReminder ? "text-ios-blue" : "text-gray-400"} />
                    <span className="text-gray-900">Bật nhắc nhở</span>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors relative ${hasReminder ? 'bg-ios-green' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasReminder ? 'translate-x-5' : ''}`}></div>
                </div>
             </div>

             {/* Days Input (Only show if reminder is on) */}
             {hasReminder && (
                 <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-gray-900 text-sm">Báo trước (ngày)</span>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={reminderDays}
                            onChange={(e) => setReminderDays(e.target.value)}
                            className="w-16 text-right p-1.5 rounded border border-gray-300 focus:border-ios-blue outline-none bg-white text-gray-900"
                        />
                        <button 
                            onClick={handleRemoveReminder}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Xóa lời nhắc"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                 </div>
             )}
          </div>

          {/* Details Section */}
          <div className="bg-white rounded-xl overflow-hidden divide-y divide-gray-100">
             <div className="flex items-center px-4 py-3 gap-3">
                <MapPin size={20} className="text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Địa điểm" 
                    className="flex-1 outline-none text-gray-900 placeholder-gray-400"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
             </div>
             <div className="flex items-start px-4 py-3 gap-3">
                <List size={20} className="text-gray-400 mt-0.5" />
                <textarea 
                    placeholder="Ghi chú" 
                    className="flex-1 outline-none text-gray-900 placeholder-gray-400 resize-none h-24"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
             </div>
          </div>
          
          {/* Delete Button (Only for existing events) */}
          {initialEvent && (
            <button 
                onClick={() => onDelete(initialEvent.id)}
                className="w-full py-3.5 bg-white text-red-500 font-semibold rounded-xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors flex items-center justify-center gap-2 mb-4"
            >
                <Trash2 size={20} />
                <span>Xóa sự kiện</span>
            </button>
          )}

        </div>
      </div>
    </div>
  );
};
