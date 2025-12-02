import React, { useState } from 'react';
import { Sparkles, Calendar, ChevronRight } from './Icons';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [inputName, setInputName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      onLogin(inputName.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="z-10 w-full max-w-sm flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-ios-blue rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center mb-6 rotate-3">
          <Calendar size={40} className="text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">iSchedule AI</h1>
        <p className="text-gray-500 text-center mb-10">Quản lý lịch trình thông minh</p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-gray-700 ml-1">
              Tên lịch của bạn
            </label>
            <input
              id="username"
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Ví dụ: Công việc, Cá nhân..."
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-blue/50 focus:bg-white transition-all"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!inputName.trim()}
            className={`w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-lg
              ${!inputName.trim() 
                ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                : 'bg-ios-blue hover:bg-blue-600 active:scale-[0.98] shadow-blue-200'
              }
            `}
          >
            <span>Bắt đầu</span>
            <ChevronRight size={18} />
          </button>
        </form>
        
        <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
          <Sparkles size={12} />
          <span>Powered by Gemini AI</span>
        </div>
      </div>
    </div>
  );
};