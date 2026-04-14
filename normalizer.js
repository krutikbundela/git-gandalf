const VALID_RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"];

export default function normalizeReview(rawText) {
  // Step 1: strip markdown code fences if the model added them anyway
  // some models wrap output in ```json ... ``` despite being told not to
  const stripped = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // Step 2: parse JSON — hard failure if malformed
  let parsed;
  try {
    parsed = JSON.parse(stripped);
  } catch (err) {
    throw new Error(`LLM output was not valid JSON: ${stripped.slice(0, 120)}`);
  }

  // Step 3: validate every required field exists
  if (typeof parsed.risk === "undefined") {
    throw new Error("LLM response missing required field: risk");
  }
  if (typeof parsed.issues === "undefined") {
    throw new Error("LLM response missing required field: issues");
  }
  if (typeof parsed.summary === "undefined") {
    throw new Error("LLM response missing required field: summary");
  }

  // Step 4: validate field types and values
  const risk = String(parsed.risk).toUpperCase().trim();
  if (!VALID_RISK_LEVELS.includes(risk)) {
    throw new Error(
      `Invalid risk value: "${parsed.risk}". Must be LOW, MEDIUM, or HIGH`,
    );
  }

  if (!Array.isArray(parsed.issues)) {
    throw new Error(`"issues" must be an array, got: ${typeof parsed.issues}`);
  }

  if (typeof parsed.summary !== "string" || !parsed.summary.trim()) {
    throw new Error('"summary" must be a non-empty string');
  }

  // Step 5: return clean, trusted internal representation
  return {
    risk: risk, // guaranteed: LOW | MEDIUM | HIGH
    issues: parsed.issues.map((i) => String(i).trim()), // guaranteed: array of strings
    summary: parsed.summary.trim(), // guaranteed: non-empty string
  };
}