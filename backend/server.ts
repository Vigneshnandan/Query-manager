import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const VALID_DEPARTMENTS = [
  "Water",
  "Electricity",
  "Sanitation",
  "Roads",
  "Health",
  "Revenue",
  "Police",
];

interface Issue {
  department: string;
  issue_text: string;
  deadline: string | null;
  priority: string;
}

interface AnalyzeResponse {
  issues: Issue[];
}

function mapDepartmentToValid(dept: string): string {
  console.log(`[BACKEND_STEP_1] Groq returned department: "${dept}" (type: ${typeof dept}, length: ${dept?.length || 0})`);

  const normalized = dept.toLowerCase();
  for (const valid of VALID_DEPARTMENTS) {
    if (valid.toLowerCase() === normalized) {
      console.log(`[BACKEND_STEP_2] Mapped "${dept}" → "${valid}"`);
      return valid;
    }
  }

  const deptLower = normalized.toLowerCase();
  if (
    deptLower.includes("water") ||
    deptLower.includes("supply") ||
    deptLower.includes("sewage")
  ) {
    console.log(`[BACKEND_STEP_2] Mapped "${dept}" → "Water" (keyword match)`);
    return "Water";
  }
  if (deptLower.includes("electric") || deptLower.includes("power")) {
    console.log(`[BACKEND_STEP_2] Mapped "${dept}" → "Electricity" (keyword match)`);
    return "Electricity";
  }
  if (deptLower.includes("sanitation") || deptLower.includes("garbage")) {
    console.log(`[BACKEND_STEP_2] Mapped "${dept}" → "Sanitation" (keyword match)`);
    return "Sanitation";
  }
  if (deptLower.includes("road") || deptLower.includes("pothole")) {
    console.log(`[BACKEND_STEP_2] Mapped "${dept}" → "Roads" (keyword match)`);
    return "Roads";
  }
  if (deptLower.includes("health") || deptLower.includes("medical")) {
    console.log(`[BACKEND_STEP_2] Mapped "${dept}" → "Health" (keyword match)`);
    return "Health";
  }
  if (deptLower.includes("revenue") || deptLower.includes("ration")) {
    console.log(`[BACKEND_STEP_2] Mapped "${dept}" → "Revenue" (keyword match)`);
    return "Revenue";
  }
  if (deptLower.includes("police") || deptLower.includes("crime")) {
    console.log(`[BACKEND_STEP_2] Mapped "${dept}" → "Police" (keyword match)`);
    return "Police";
  }

  console.warn(`[BACKEND_STEP_2] Could not map department "${dept}" to valid list, defaulting to "Roads"`);
  return "Roads";
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/check-sla", async (req: Request, res: Response) => {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_URL) {
      return res.status(500).json({ error: "Supabase credentials not configured" });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const serviceSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const now = new Date().toISOString();

    const { data: escalatedIssues, error: fetchError } = await serviceSupabase
      .from("issues")
      .select("id")
      .lt("sla_deadline", now)
      .in("status", ["new", "assigned", "in_progress"]);

    if (fetchError) throw fetchError;

    const escalatedIds = (escalatedIssues || []).map((issue: any) => issue.id);

    if (escalatedIds.length > 0) {
      const { error: updateError } = await serviceSupabase
        .from("issues")
        .update({ status: "escalated", updated_at: now })
        .in("id", escalatedIds);

      if (updateError) throw updateError;
    }

    res.json({
      escalated_count: escalatedIds.length,
      escalated_ids: escalatedIds,
    });
  } catch (error) {
    console.error("Error in /api/check-sla:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

app.post("/api/analyze", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res
        .status(400)
        .json({ error: "Request body must contain a 'text' field" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res
        .status(500)
        .json({ error: "GROQ_API_KEY environment variable is not set" });
    }

    const analyzeIssues = async (
      complaintText: string,
      retryCount: number = 0
    ): Promise<AnalyzeResponse> => {
      try {
        const systemPrompt = `You are a government complaint routing assistant. Analyze the citizen complaint and extract all distinct issues.

The complaint or order may be written in any language (English, Tamil, Hindi, or others). Regardless of the input language, always write the issue_text value in clear English, so department staff can read it regardless of what language the citizen used. Do not change the department classification, deadline, or priority logic based on language — only the issue_text field needs to be in English.

For each issue, determine:
1. Department: Choose ONE from: Water, Electricity, Sanitation, Roads, Health, Revenue, Police
2. Issue text: Brief description of this specific issue (MUST BE IN ENGLISH)
3. Deadline: Extract any date mentioned, format as YYYY-MM-DD, or null
4. Priority: low, medium, or high based on urgency

Return a JSON response with this exact format (no markdown, pure JSON):
{
  "issues": [
    {
      "department": "Department Name",
      "issue_text": "Description in English",
      "deadline": "YYYY-MM-DD or null",
      "priority": "low|medium|high"
    }
  ]
}`;

        const response = await groq.chat.completions.create({
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: `Analyze this complaint and return ONLY valid JSON:\n\n${complaintText}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1024,
        });

        const responseText =
          response.choices[0].message.content || "";

        console.log("[BACKEND_GROQ_RAW] Raw Groq response:", responseText);

        let parsedArgs: AnalyzeResponse;
        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error("No JSON found in response");
          }
          parsedArgs = JSON.parse(jsonMatch[0]);
          console.log("[BACKEND_GROQ_PARSED] Parsed JSON from Groq:", JSON.stringify(parsedArgs, null, 2));
        } catch (parseError) {
          console.error("Failed to parse response:", responseText);
          throw new Error("Failed to parse complaint analysis response");
        }

        if (!parsedArgs.issues || !Array.isArray(parsedArgs.issues)) {
          throw new Error("Response missing 'issues' array");
        }

        const validatedIssues: Issue[] = parsedArgs.issues.map(
          (issue: any) => ({
            department: mapDepartmentToValid(issue.department || "Roads"),
            issue_text: String(issue.issue_text || ""),
            deadline: issue.deadline || null,
            priority: ["low", "medium", "high"].includes(issue.priority)
              ? issue.priority
              : "medium",
          })
        );

        console.log("[BACKEND_VALIDATED] Final issues after validation:", JSON.stringify(validatedIssues, null, 2));
        return { issues: validatedIssues };
      } catch (error) {
        if (retryCount < 1) {
          console.warn("Groq call failed, retrying once...", error);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return analyzeIssues(complaintText, retryCount + 1);
        }
        throw error;
      }
    };

    const result = await analyzeIssues(text);
    return res.json(result);
  } catch (error) {
    console.error("Error in /api/analyze:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Internal server error",
    });
  }
});

app.post("/api/mark-resolved", async (req: Request, res: Response) => {
  try {
    const { issueId, resolutionNote, photoUrl } = req.body;

    if (!issueId || typeof issueId !== "string") {
      return res.status(400).json({ error: "issueId is required" });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_URL) {
      return res.status(500).json({ error: "Supabase credentials not configured" });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const serviceSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error: updateError } = await serviceSupabase
      .from("issues")
      .update({
        status: "resolved",
        resolution_note: resolutionNote || null,
        resolution_photo_url: photoUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", issueId);

    if (updateError) throw updateError;

    res.json({ success: true, message: "Issue marked as resolved" });
  } catch (error) {
    console.error("Error in /api/mark-resolved:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

app.post("/api/submit-complaint", async (req: Request, res: Response) => {
  try {
    const { userId, rawText, photoUrl, location } = req.body;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }
    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "rawText is required" });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_URL) {
      return res.status(500).json({ error: "Supabase credentials not configured" });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const serviceSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: ticketData, error: ticketError } = await serviceSupabase
      .from("tickets")
      .insert({
        citizen_id: userId,
        raw_text: rawText,
        photo_url: photoUrl || null,
        location: location || null,
      })
      .select();

    if (ticketError) throw ticketError;
    if (!ticketData || ticketData.length === 0)
      throw new Error("Failed to create ticket");

    const ticketId = ticketData[0].id;
    res.json({ success: true, ticketId });
  } catch (error) {
    console.error("Error in /api/submit-complaint:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

app.post("/api/reverse-geocode", async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.body;

    if (typeof lat !== "number" || typeof lon !== "number") {
      return res.status(400).json({ error: "lat and lon must be numbers" });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": "GrievanceRoutingSystem-Hackathon/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data = (await response.json()) as { display_name?: string };
    const address = data.display_name || "Unable to determine address";

    res.json({ address });
  } catch (error) {
    console.error("Error in /api/reverse-geocode:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to reverse geocode location",
    });
  }
});

export default app;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
