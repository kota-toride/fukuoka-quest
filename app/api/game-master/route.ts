import { generateQuest, isAiEnabled } from "@/lib/ai/provider";
import type { GenerateRequest } from "@/lib/types";

export async function GET() {
  return Response.json({ mode: isAiEnabled() ? "ai" : "demo" });
}

export async function POST(request: Request) {
  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body || (body.mode !== "resource" && body.mode !== "dynamic") || typeof body.input !== "object") {
    return Response.json({ error: "invalid request" }, { status: 400 });
  }
  const result = await generateQuest(body);
  return Response.json(result);
}
