const LLM_URL = "http://localhost:1234/v1/chat/completions";
const TIMEOUT_MS = 120_000; // 2 minutes

export default async function callLLM(prompt) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(LLM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3-vl-4b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`LLM server returned HTTP ${response.status}`);
    }

    const json = await response.json();

    const text = json?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("LLM returned an empty response");
    }

    return text;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError") {
      throw new Error("LLM timed out — is the model loaded in LM Studio?");
    }

    if (err.name === "TypeError") {
      throw new Error(
        "LLM not reachable — is LM Studio running on localhost:1234?",
      );
    }

    throw err;
  }
}
