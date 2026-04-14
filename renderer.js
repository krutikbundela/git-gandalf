const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
};

function color(code, text) {
  return `${code}${text}${C.reset}`;
}

export default function render(review, decision) {
  const lines = [];

  // Header
  lines.push("");
  lines.push(color(C.bold, "Git Gandalf Review"));
  lines.push(color(C.dim, "─".repeat(40)));

  // Risk
  const riskColor =
    {
      LOW: C.green,
      MEDIUM: C.yellow,
      HIGH: C.red,
    }[review.risk] ?? C.reset;

  lines.push(`Risk:     ${color(riskColor, review.risk)}`);

  // Summary
  lines.push(`Summary:  ${color(C.dim, review.summary)}`);

  // Issues 
  if (review.issues.length === 0) {
    lines.push(`Issues: ${color(C.dim, "none")}`);
  } else {
    lines.push("Issues:");
    for (const issue of review.issues) {
      lines.push(`  ${color(C.yellow, "→")} ${issue}`);
    }
  }

  // Decision
  lines.push(color(C.dim, "─".repeat(40)));

  const decisionColor =
    {
      ALLOW: C.green,
      WARN: C.yellow,
      BLOCK: C.red,
    }[decision] ?? C.reset;

  const decisionLabel =
    {
      ALLOW: "ALLOW — commit proceeding",
      WARN: "WARN  — commit proceeding with caution",
      BLOCK: "BLOCK — commit rejected",
    }[decision] ?? decision;

  lines.push(`Decision: ${color(decisionColor, color(C.bold, decisionLabel))}`);
  lines.push("");

  console.log(lines.join("\n"));
}

