import { GoogleGenAI, Type } from "@google/genai";
import { CalendarEvent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for the expected JSON response
const scheduleSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Tiêu đề ngắn gọn của sự kiện" },
      startTime: { type: Type.STRING, description: "Thời gian bắt đầu (HH:MM format, ví dụ '09:00')" },
      endTime: { type: Type.STRING, description: "Thời gian kết thúc (HH:MM format, ví dụ '10:30')" },
      location: { type: Type.STRING, description: "Địa điểm (nếu có)" },
      description: { type: Type.STRING, description: "Mô tả chi tiết ngắn gọn" },
    },
    required: ["title", "startTime", "endTime"],
  },
};

export const generateScheduleFromPrompt = async (
  prompt: string,
  targetDate: Date
): Promise<Partial<CalendarEvent>[]> => {
  try {
    const formattedDate = targetDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const systemInstruction = `Bạn là một trợ lý lập lịch trình cá nhân thông minh.
    Nhiệm vụ của bạn là tạo ra một danh sách các sự kiện lịch trình dựa trên yêu cầu của người dùng.
    Ngày mục tiêu cho lịch trình này là: ${formattedDate}.
    
    Hãy trả về dữ liệu dưới dạng JSON thuần túy theo schema đã định nghĩa.
    Chỉ trả về mảng JSON, không thêm markdown formatting.
    Đảm bảo thời gian hợp lý và logic.
    Ngôn ngữ phản hồi: Tiếng Việt.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: scheduleSchema,
        temperature: 0.7,
      },
    });

    const rawData = response.text;
    if (!rawData) return [];

    const parsedData = JSON.parse(rawData);
    
    // Convert HH:MM strings to full ISO dates based on targetDate
    return parsedData.map((item: any) => {
      const [startHour, startMinute] = item.startTime.split(':').map(Number);
      const [endHour, endMinute] = item.endTime.split(':').map(Number);
      
      const start = new Date(targetDate);
      start.setHours(startHour, startMinute, 0, 0);
      
      const end = new Date(targetDate);
      end.setHours(endHour, endMinute, 0, 0);

      // Handle case where end time is next day (e.g., 23:00 to 01:00) - simplified logic: just assume same day for now unless explicit
      if (end < start) {
        end.setDate(end.getDate() + 1);
      }

      return {
        id: crypto.randomUUID(),
        title: item.title,
        description: item.description || "",
        location: item.location || "",
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        color: 'bg-blue-500', // Default color
      };
    });

  } catch (error) {
    console.error("Error generating schedule:", error);
    throw error;
  }
};