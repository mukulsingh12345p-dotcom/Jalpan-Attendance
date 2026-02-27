
import { GoogleGenAI, Type } from "@google/genai";
import { Sewadar } from "../types";
import { addDays, format } from 'date-fns';

export interface ParsedAttendance {
  rawName: string;
  matchedSewadarId?: string;
  type: 'IN' | 'OUT';
  time: string; // HH:mm format
  counter?: string;
  confidence: number;
}

export const parseChatWithAI = async (chatText: string, sewadars: Sewadar[], targetDate: string): Promise<ParsedAttendance[]> => {
  // Robust API key retrieval for both Node and Browser/Vite environments
  const apiKey = (typeof process !== 'undefined' ? (process.env.GEMINI_API_KEY || process.env.API_KEY) : undefined) || 
                 (import.meta as any).env?.VITE_GEMINI_API_KEY || 
                 (import.meta as any).env?.VITE_API_KEY || 
                 '';

  if (!apiKey) {
    console.error("Gemini API Key is missing. For Vite/Vercel deployments, ensure you set 'VITE_GEMINI_API_KEY' in your environment variables.");
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Calculate the window: We want to be inclusive. 
  // Most sewa starts early morning. Let's use 4:00 AM to 4:00 AM next day.
  const startDateObj = new Date(targetDate);
  const nextDateObj = addDays(startDateObj, 1);
  const nextDateStr = format(nextDateObj, 'yyyy-MM-dd');
  
  const windowStart = `${targetDate} 04:00 AM`;
  const windowEnd = `${nextDateStr} 04:00 AM`;

  // Provide the list of known names to help the AI map correctly
  const sewadarList = sewadars.map(s => `ID: ${s.id}, Name: ${s.name}`).join('\n');

  // Increase chunk size to 150,000 characters to cover more days in the log
  // WhatsApp logs can be large, but Gemini 3 Flash can handle this easily.
  const chatChunk = chatText.length > 150000 ? chatText.slice(-150000) : chatText;

  const prompt = `
    You are an attendance assistant for "Jalpan Sewa". 
    Analyze the following WhatsApp chat transcript and extract attendance records for the "Attendance Day" of: ${targetDate}.
    
    DEFINITION OF ATTENDANCE DAY:
    - Starts: ${windowStart}
    - Ends:   ${windowEnd}
    
    CRITICAL INSTRUCTION:
    - You MUST extract any "IN" (Entry) or "OUT" (Exit) messages that fall strictly within this time window.
    - Messages before ${windowStart} belong to the previous day -> IGNORE THEM.
    - Messages after ${windowEnd} belong to the next day -> IGNORE THEM.
    - Be flexible with date formats in the transcript (e.g., 22/02/26, 02/22/26, [22/02/26...]).
    
    VOLUNTEER LIST:
    ${sewadarList}
    
    TRANSCRIPT (LAST PART OF LOG):
    ${chatChunk}

    RULES FOR TIME EXTRACTION (CRITICAL):
    1. **ALWAYS USE THE TIMESTAMP**: You MUST extract the time from the timestamp at the beginning of the line (the "left side").
       - Example: "[12/02/24, 10:15:22 AM] Name: In" -> Use "10:15".
       - Example: "2/22/26, 9:00 AM - Name: In" -> Use "09:00".
    2. **IGNORE MESSAGE BODY TIMES**: Even if the user writes a different time in the text (e.g., "In 9:30"), you MUST ignore it and use the timestamp (left side).
    3. **Format**: Convert the timestamp time to 24-hour HH:mm format.

    RULES FOR "IN" vs "OUT":
    1. **IN Keywords**: "In", "Reached", "Aagaye", "Start", "Present", "Duty start", "Sewa start".
    2. **OUT Keywords**: "Out", "Done", "Leaving", "Sewa samapt", "Ghar", "Left", "Off", "Duty off".
    3. **Context**: If a message says "Sewa samapt" or "Ghar ja rahe hai", it is an OUT record.

    OUTPUT FORMAT:
    Return a JSON array of objects with the following structure:
    {
      "rawName": "Name as it appears in chat",
      "matchedSewadarId": "ID from VOLUNTEER LIST or null",
      "type": "IN" or "OUT",
      "time": "HH:mm",
      "counter": "Location/Counter if mentioned (e.g. Tea, Roti) or null",
      "confidence": 0.0 to 1.0
    }
    
    If NO records are found within the ${windowStart} to ${windowEnd} window, return an empty array [].
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              rawName: { type: Type.STRING },
              matchedSewadarId: { type: Type.STRING, nullable: true },
              type: { type: Type.STRING, enum: ['IN', 'OUT'] },
              time: { type: Type.STRING, description: "HH:mm format" },
              counter: { type: Type.STRING, nullable: true },
              confidence: { type: Type.NUMBER }
            },
            required: ['rawName', 'type', 'time', 'confidence']
          }
        }
      }
    });

    const text = response.text || '[]';
    // Clean up potential markdown code blocks if Gemini includes them despite responseMimeType
    const jsonStr = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(jsonStr || '[]');
  } catch (error) {
    console.error("AI Parsing Error:", error);
    throw error;
  }
};
