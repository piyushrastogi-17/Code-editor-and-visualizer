import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Frontend se aane wale prompt ko read karna
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { reply: "Bhai, prompt khali hai!" },
        { status: 400 }
      );
    }

    // 2. Environment variable se API Key nikalna
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("🚨 Error: GEMINI_API_KEY aapki .env.local file me nahi mili!");
      return NextResponse.json(
        { reply: "Server error: API Key missing hai. Apni .env.local file check karein." },
        { status: 500 }
      );
    }

    // 3. Gemini AI ko initialize karna aur model select karna
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash", // Bilkul sahi aur latest stable model name
    });

    // 4. Content generate karna aur response ko await karna
    const result = await model.generateContent(prompt);
    const response = await result.response.text(); 

    // 5. Frontend ko response bhejna
    return NextResponse.json({
      reply: response,
    });

  } catch (error: unknown) {
    // TypeScript safe error handling ke liye
    console.error("🚨 Terminal Error Detail:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        reply: `Kuch gadbad hui hai: ${errorMessage}`,
      },
      {
        status: 500,
      }
    );
  }
}