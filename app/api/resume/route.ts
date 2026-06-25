import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import mammoth from "mammoth";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractDocxText(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function extractPdfText(buffer: Buffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    
  }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    text += content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");

    text += "\n\n";
  }

  return text;
}

function cleanJson(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No resume file uploaded." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let rawText = "";

    if (file.type === "application/pdf") {
      rawText = await extractPdfText(buffer);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      rawText = await extractDocxText(buffer);
    } else {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are supported." },
        { status: 400 }
      );
    }

    if (!rawText || rawText.trim().length < 20) {
      return NextResponse.json(
        { error: "Could not extract enough text from this resume." },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: `
Extract structured resume information from the resume text below.

Return ONLY valid JSON. No markdown. No explanation.

Use this exact shape:
{
  "name": "string",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "summary": "string",
  "skills": ["string"],
  "experience": ["string"],
  "education": ["string"]
}

Resume text:
${rawText}
      `,
    });

    const cleaned = cleanJson(response.output_text);
    const parsedResume = JSON.parse(cleaned);

    return NextResponse.json({
      resume: parsedResume,
      rawText,
    });
  } catch (error) {
    console.error("Resume parse error:", error);

    return NextResponse.json(
      { error: "Failed to parse resume." },
      { status: 500 }
    );
  }
}