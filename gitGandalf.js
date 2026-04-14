#!/usr/bin/env node

import buildReviewPrompt from "./buildReviewPrompt.js";
import callLLM from "./llmRunner.js";
import normalizeReview from "./normalizer.js";
import parseDiff from "./parseDiff.js";
import decide, { DECISIONS } from "./policy.js";
import render from "./renderer.js";


process.on("uncaughtException", (err) => {
  console.error("\nGit Gandalf internal error (uncaughtException)");
  console.error("This is a bug in Git Gandalf, not your code.");
  console.error(`Error: ${err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("\nGit Gandalf internal error (unhandledRejection)");
  console.error("This is a bug in Git Gandalf, not your code.");
  console.error(`Reason: ${reason}`);
  process.exit(1);
});

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
    console.warn(`\nGit Gandalf Review`);
    console.warn(
      `WARN: diff is ${Math.round(totalSize / 1024)}KB — too large to review. Skipping.`,
    );
    process.exit(0);
  }
  data.push(chunk);
});

process.stdin.on("end", async () => {
  const rawData = data.join("");

  // empty diff check
  if (!rawData.trim()) {
    console.log("No data entered");
    process.exit(0);
  }

  const metadata = parseDiff(rawData);
  console.log("Git Gandalf Review");

  const finalPrompt = buildReviewPrompt(metadata, rawData);

  let review;
  try {
    const rawOutput = await callLLM(finalPrompt);
    review = normalizeReview(rawOutput);
  } catch (error) {
     const isToolFailure =
       err.message.includes("not reachable") ||
       err.message.includes("timed out");

     if (isToolFailure) {
       console.warn("\nGit Gandalf Review");
       console.warn(`WARN: ${err.message}`);
       console.warn("Skipping review. Commit proceeding.\n");
       process.exit(0);
     } else {
       console.error("\nGit Gandalf Review");
       console.error(`BLOCK: ${err.message}`);
       console.error("Could not produce a valid review. Commit rejected.\n");
       process.exit(1);
     }
  }

  const decision = decide(review.risk);

  render(review, decision);

  // After render() has printed the review...
  process.exit(decision === DECISIONS.BLOCK ? 1 : 0);

  // ALLOW → 0  (commit proceeds)
  // WARN  → 0  (commit proceeds, but user saw the warning)
  // BLOCK → 1  (commit rejected by git)
});
