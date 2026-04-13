#!/usr/bin/env node

process.stdin.setEncoding("utf-8");

const MAX_DIFF_BYTES = 500 * 1024; // 500 KB

let data = [];
let totalSize = 0;

// Handle no input (TTY)
if (process.stdin.isTTY) {
  console.log("Git Gandalf Review");
  console.log("No staged changes detected. Skipping analysis.");
  process.exit(0);
}

process.stdin.on("data", (chunk) => {
  totalSize += Buffer.byteLength(chunk, "utf8");

  // diff size check
  if (totalSize > MAX_DIFF_BYTES) {
    console.error("Diff too large to process safely.");
    process.exit(1);
  }
  data.push(chunk);
});

process.stdin.on("end", () => {
  const rawData = data.join("");

  // empty diff check
  if (!rawData.trim()) {
    console.log("No data entered");
    process.exit(0);
  }

  // normalize line endings
  const normalizedDiff = rawData.replace(/\r\n/g, "\n").trim();

  // Observability (still allowed in this layer)
  const lineCount = normalizedDiff.split("\n").length;
  const byteSize = Buffer.byteLength(normalizedDiff, "utf8");

  console.log("Git Gandalf Review");
  console.log(`Received diff: ${lineCount} lines across ${byteSize} bytes`);

  process.exit(0);
});
