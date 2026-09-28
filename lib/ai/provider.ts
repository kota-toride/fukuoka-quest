import type { GenerateRequest, GenerateResponse } from "@/lib/types";
import { demoFromDynamic, demoFromResource } from "./demo";
import { sanitizeForPlayers } from "./sanitize";
import { generateWithClaude } from "./anthropic";

/**
 * AI GAME MASTER のエントリポイント。
 * - ANTHROPIC_API_KEY があり、FQ_DEMO_MODE=1 でなければ Claude で生成
 * - それ以外 / 失敗時は DEMO MODE（ルールベース）で生成
 * どちらの場合もプレイヤー向けテキストは sanitize を通す。
 */
export async function generateQuest(req: GenerateRequest): Promise<GenerateResponse> {
  const demo = req.mode === "resource" ? demoFromResource(req.input) : demoFromDynamic(req.input);

  const aiEnabled = !!process.env.ANTHROPIC_API_KEY && process.env.FQ_DEMO_MODE !== "1";
  if (aiEnabled) {
    try {
      const ai = await generateWithClaude(req);
      if (ai) {
        const { quest, replaced } = sanitizeForPlayers(ai.quest, demo.quest);
        const reasoning = replaced.length
          ? [...ai.reasoning, `プレイヤー向け文面に裏事情ワードを検出 → ${replaced.join(", ")} を安全な文面に差し替え`]
          : ai.reasoning;
        return { quest, reasoning, source: "ai" };
      }
    } catch (err) {
      console.error("[game-master] AI generation failed, falling back to demo:", err);
    }
  }
  return { quest: demo.quest, reasoning: demo.reasoning, source: "demo" };
}

export const isAiEnabled = () => !!process.env.ANTHROPIC_API_KEY && process.env.FQ_DEMO_MODE !== "1";
