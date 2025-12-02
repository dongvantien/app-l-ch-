import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { X, Clock, MapPin, List, Bell } from './Icons';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => void;
  selectedDate: Date;
  initialEvent?: CalendarEvent | null;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  selectedDate, 
  initialEvent 
}) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialEvent) {
        setTitle(initialEvent.title);
        setLocation(initialEvent.location || '');
        setDescription(initialEvent.description || '');
        setStartTime(new Date(initialEvent.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit', hour12: false}));
        setEndTime(new Date(initialEvent.endTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit', hour12: false}));
        setReminderMinutes(initialEvent.reminderMinutes !== undefined ? initialEvent.reminderMinutes : null);
      } else {
        // Reset fields for new event
        setTitle('');
        setLocation('');
        setDescription('');
        setStartTime('09:00');
        setEndTime('10:00');
        setReminderMinutes(null); // Default to no reminder
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
    
    // Handle overnight events briefly (simple logic)
    if (end < start) end.setDate(end.getDate() + 1);

    onSave({
      id: initialEvent?.id,
      title,
      location,
      description,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      reminderMinutes: reminderMinutes
    });
    onClose();
  };

  const reminderOptions = [
    { value: -1, label: 'Không' },
    { value: 0, label: 'Tại thời điểm sự kiện' },
    { value: 5, label: 'Trước 5 phút' },
    { value: 10, label: 'Trước 10 phút' },
    { value: 15, label: 'Trước 15 phút' },
    { value: 30, label: 'Trước 30 phút' },
    { value: 60, label: 'Trước 1 giờ' },
    { value: 120, label: 'Trước 2 giờ' },
    { value: 1440, label: 'Trước 1 ngày' },
    { value: 2880, label: 'Trước 2 ngày' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal Content - slide up on mobile */}
      <div className="bg-gray-100 w-full max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
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
              className="w-full py-2 text-lg font-semibold placeholder-gray-300 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
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
             <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <Bell size={20} className="text-gray-400" />
                    <span className="text-gray-900">Lời nhắc</span>
                </div>
                <div className="relative">
                    <select
                        value={reminderMinutes === null ? -1 : reminderMinutes}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setReminderMinutes(val === -1 ? null : val);
                        }}
                        className="bg-transparent text-ios-blue outline-none text-right appearance-none cursor-pointer pr-4 font-medium"
                        style={{textAlignLast: 'right', direction: 'rtl'}}
                    >
                        {reminderOptions.map(opt => (
                            <option key={opt.value} value={opt.value} className="text-gray-900 text-left">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
             </div>
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
        </div>
      </div>
    </div>
  );
};