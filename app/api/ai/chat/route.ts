import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, code, language, output } = await req.json();

    // Validation
    if (!prompt?.trim()) {
      return NextResponse.json(
        {
          reply: "Please enter a message.",
        },
        {
          status: 400,
        }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");

      return NextResponse.json(
        {
          reply: "Server configuration error.",
        },
        {
          status: 500,
        }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const fullPrompt = `
You are an expert coding assistant and programming mentor.

Analyze the provided code and answer the user's question.

Programming Language:
${language || "Unknown"}

Code:
${code || "No code provided"}

Console Output:
${output || "No output available"}

User Question:
${prompt}

Instructions:
- Explain clearly and professionally.
- If there is an error, identify the cause and provide a fix.
- If the user asks for code explanation, explain step-by-step.
- If optimization is possible, suggest improvements.
- Mention time complexity when relevant.
- Keep answers concise but informative.
`;

    const result = await model.generateContent(fullPrompt);

    const response = result.response.text();

    return NextResponse.json({
      reply: response,
    });
  } catch (error) {
  console.error("AI Route Error:", error);

  return NextResponse.json(
    {
      reply: error instanceof Error ? error.message : "Unknown Error",
    },
    {
      status: 500,
    }
  );
}
}