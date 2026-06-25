import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-5",
      input: "hello",
    });

    return NextResponse.json({
      success: true,
      output: response.output_text,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
    });
  }
}