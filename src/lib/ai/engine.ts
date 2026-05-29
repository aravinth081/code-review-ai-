import type { AIAnalysisResult } from "@/types/review";
import { SYSTEM_PROMPT, buildAnalysisPrompt } from "./prompts";
import { parseAnalysisResult } from "./parser";

export interface AnalyzeCodeOptions {
  code: string;
  language: string;
  provider?: string;
}

export interface AnalyzeCodeResult extends AIAnalysisResult {
  provider: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
}

async function analyzeWithOpenAI(
  code: string,
  language: string
): Promise<AnalyzeCodeResult> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4o";
  const start = Date.now();

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildAnalysisPrompt(code, language) },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content || "{}";
  const result = parseAnalysisResult(content);

  return {
    ...result,
    provider: "openai",
    model,
    tokensUsed: response.usage?.total_tokens,
    processingTime: Date.now() - start,
  };
}

async function analyzeWithAnthropic(
  code: string,
  language: string
): Promise<AnalyzeCodeResult> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
  const start = Date.now();

  const response = await client.messages.create({
    model,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: buildAnalysisPrompt(code, language) },
    ],
  });

  const content =
    response.content[0].type === "text" ? response.content[0].text : "{}";
  const result = parseAnalysisResult(content);

  return {
    ...result,
    provider: "anthropic",
    model,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    processingTime: Date.now() - start,
  };
}

async function analyzeWithGemini(
  code: string,
  language: string
): Promise<AnalyzeCodeResult> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = process.env.GEMINI_MODEL || "gemini-1.5-pro";
  const start = Date.now();

  const geminiModel = genAI.getGenerativeModel({
    model,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const response = await geminiModel.generateContent(
    buildAnalysisPrompt(code, language)
  );
  const content = response.response.text();
  const result = parseAnalysisResult(content);

  return {
    ...result,
    provider: "gemini",
    model,
    processingTime: Date.now() - start,
  };
}

export async function analyzeCode(
  options: AnalyzeCodeOptions
): Promise<AnalyzeCodeResult> {
  const { code, language } = options;
  const provider = options.provider || process.env.AI_PROVIDER || "openai";

  // Validate code length
  const maxLength = parseInt(process.env.MAX_CODE_LENGTH || "50000");
  if (code.length > maxLength) {
    throw new Error(`Code exceeds maximum length of ${maxLength} characters`);
  }

  // Try primary provider, fallback chain
  const providers = [provider, "openai", "anthropic", "gemini"].filter(
    (p, i, arr) => arr.indexOf(p) === i
  );

  let lastError: Error | null = null;

  for (const p of providers) {
    try {
      switch (p) {
        case "openai":
          if (!process.env.OPENAI_API_KEY) continue;
          return await analyzeWithOpenAI(code, language);
        case "anthropic":
          if (!process.env.ANTHROPIC_API_KEY) continue;
          return await analyzeWithAnthropic(code, language);
        case "gemini":
          if (!process.env.GEMINI_API_KEY) continue;
          return await analyzeWithGemini(code, language);
      }
    } catch (err) {
      lastError = err as Error;
      console.error(`[AI Engine] Provider ${p} failed:`, err);
    }
  }

  // If no API keys configured, return a mock result for development
  if (process.env.NODE_ENV === "development") {
    console.warn("[AI Engine] No API keys configured. Using mock result.");
    return getMockResult(code, language);
  }

  throw lastError || new Error("All AI providers failed or are not configured");
}

function getMockResult(code: string, language: string): AnalyzeCodeResult {
  const start = Date.now();
  const hasSecurityIssues = code.toLowerCase().includes("select") && code.includes("+");
  const score = hasSecurityIssues ? 35 : 78;

  return {
    overallScore: score,
    qualityScore: score + 8,
    securityScore: hasSecurityIssues ? 12 : 85,
    performanceScore: score + 3,
    maintainabilityScore: score + 5,
    summary: `[Mock Analysis] ${language} code analyzed. ${hasSecurityIssues ? "Critical security vulnerabilities detected." : "Code quality is good with minor improvements possible."}`,
    issues: hasSecurityIssues
      ? [
          {
            type: "SECURITY",
            severity: "CRITICAL",
            title: "Potential SQL Injection",
            description: "String concatenation detected in what appears to be a database query. This is a critical SQL injection vulnerability.",
            lineStart: 1,
            lineEnd: 3,
            suggestion: "Use parameterized queries or a prepared statement library.",
            fixedCode: `// Use parameterized queries\nconst result = await db.query('SELECT * FROM table WHERE id = $1', [id]);`,
          },
        ]
      : [
          {
            type: "QUALITY",
            severity: "LOW",
            title: "Consider Adding Type Annotations",
            description: "Adding explicit type annotations improves code readability and IDE support.",
            suggestion: "Add TypeScript types or JSDoc annotations to function parameters and return values.",
          },
        ],
    recommendations: [
      {
        category: "Security",
        title: "Implement Input Validation",
        description: "Always validate and sanitize user inputs at the API boundary before processing.",
        priority: 1,
      },
      {
        category: "Testing",
        title: "Add Unit Tests",
        description: "Consider adding unit tests to ensure code correctness and prevent regressions.",
        priority: 3,
      },
    ],
    optimizedCode: code,
    provider: "mock",
    model: "mock-v1",
    processingTime: Date.now() - start,
  };
}
