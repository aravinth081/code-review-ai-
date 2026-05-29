export const SYSTEM_PROMPT = `You are CodeGuard AI, an expert code review assistant specialized in:
- Bug detection and logic error analysis
- Security vulnerability assessment (OWASP Top 10 and beyond)
- Performance optimization recommendations
- Code quality and maintainability evaluation
- Best practices enforcement

You must always respond with valid JSON matching the exact schema provided. Be thorough, precise, and actionable.
When identifying issues, always provide specific line numbers when possible and concrete fix suggestions.`;

export function buildAnalysisPrompt(
  code: string,
  language: string
): string {
  return `Analyze the following ${language} code and return a comprehensive review as JSON.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON (no markdown, no explanation outside JSON) with this exact structure:
{
  "overallScore": <0-100 integer>,
  "qualityScore": <0-100 integer>,
  "securityScore": <0-100 integer>,
  "performanceScore": <0-100 integer>,
  "maintainabilityScore": <0-100 integer>,
  "summary": "<2-3 sentence executive summary>",
  "issues": [
    {
      "type": "<BUG|SECURITY|PERFORMANCE|QUALITY|BEST_PRACTICE>",
      "severity": "<CRITICAL|HIGH|MEDIUM|LOW|INFO>",
      "title": "<concise issue title>",
      "description": "<detailed description of the issue and why it matters>",
      "lineStart": <line number or null>,
      "lineEnd": <line number or null>,
      "suggestion": "<specific actionable fix description>",
      "fixedCode": "<corrected code snippet if applicable>"
    }
  ],
  "recommendations": [
    {
      "category": "<Security|Performance|Quality|Architecture|Testing>",
      "title": "<recommendation title>",
      "description": "<detailed recommendation>",
      "priority": <1-5 integer, 1=highest>
    }
  ],
  "optimizedCode": "<full optimized version of the code with all fixes applied>"
}

Analysis guidelines:
- Score 90-100: Excellent, production-ready code
- Score 70-89: Good code with minor improvements needed
- Score 50-69: Moderate issues requiring attention
- Score 0-49: Significant problems requiring immediate remediation

For SECURITY: Check for SQL injection, XSS, CSRF, authentication flaws, hardcoded secrets, insecure data handling
For BUGS: Check for null/undefined risks, off-by-one errors, race conditions, memory leaks, infinite loops
For PERFORMANCE: Check for O(n²) algorithms, unnecessary re-renders, inefficient queries, large payloads
For QUALITY: Check for naming, complexity, duplication, readability, documentation
For BEST_PRACTICE: Check for SOLID principles, design patterns, error handling, testing considerations`;
}
