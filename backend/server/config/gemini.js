import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";


dotenv.config();

if (!process.env.GEMINI_API_KEY) { 
    console.error("Error  : Bhai, .env file me GEMINI API KEY nahi mili");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default ai;