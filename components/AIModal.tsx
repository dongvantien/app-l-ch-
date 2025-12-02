import React, { useState } from 'react';
import { X, Sparkles } from './Icons';
import { generateScheduleFromPrompt } from '../services/geminiService';
import { CalendarEvent } from '../types';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDate: Date;
  onEventsGenerated: (events: Partial<CalendarEvent>[]) => void;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, targetDate, onEventsGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const generatedEvents = await generateScheduleFromPrompt(prompt, targetDate);
      onEventsGenerated(generatedEvents);
      onClose();
      setPrompt('');
    } catch (err) {
      setError("Không thể tạo lịch trình. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2 text-ios-blue">
            <Sparkles size={20} className="animate-pulse" />
            <h2 className="font-semibold text-lg">Trợ lý AI</h2>
          </div>
          <button onClick={onClose} className="p-1 bg-gray-200 rounded-full text-gray-500 hover:bg-gray-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
            <p className="text-gray-500 text-sm mb-4">
                Nhập kế hoạch của bạn cho ngày <span className="font-semibold text-gray-800">{targetDate.toLocaleDateString('vi-VN')}</span>. 
                Ví dụ: "Lên lịch đi tham quan Hà Nội cả ngày", "Sắp xếp buổi sáng làm việc hiệu quả".
            </p>
            
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Mô tả kế hoạch của bạn..."
                className="w-full h-32 p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-ios-blue/50 resize-none text-gray-800 placeholder-gray-400 mb-4 text-base"
                autoFocus
            ></textarea>

            {error && (
                <div className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded-lg">
                    {error}
                </div>
            )}

            <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className={`w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all
                    ${isLoading || !prompt.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-ios-blue active:scale-[0.98] shadow-lg shadow-blue-200'}
                `}
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Đang suy nghĩ...</span>
                    </>
                ) : (
                    <>
                        <Sparkles size={18} />
                        <span>Tạo lịch trình</span>
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};