import { narrateRoute } from "@/lib/ai/route-narrator";
import type { NarrateInput } from "@/lib/game/route";

export async function POST(request: Request) {
  let body: NarrateInput;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body?.plan?.path?.length || !body.destTitle || !Array.isArray(body.sides)) {
    return Response.json({ error: "invalid request" }, { status: 400 });
  }
  return Response.json(await narrateRoute(body));
}
