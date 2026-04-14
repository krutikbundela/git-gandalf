export default function parseDiff(rawDiff) {
  const lines = rawDiff.split("\n");

  const files = [];
  let linesAdded = 0;
  let linesRemoved = 0;
  let currentFile = null;

  for (const line of lines) {
    // A new file section always starts with "diff --git"
    if (line.startsWith("diff --git ")) {
      // Extract filename from "diff --git a/path/to/file.js b/path/to/file.js"
      // We take the "b/" side — that's the new (current) filename
      const match = line.match(/diff --git a\/.+ b\/(.+)/);
      if (match) {
        currentFile = match[1];
        files.push(currentFile);
      }
      continue;
    }

    // Skip binary files:
    // "Binary files a/image.png and b/image.png differ"
    if (line.startsWith("Binary files")) {
      continue;
    }

    // Count added lines — start with "+" but not "+++ "
    if (line.startsWith("+") && !line.startsWith("+++")) {
      linesAdded++;
      continue;
    }

    // Count removed lines — start with "-" but not "--- "
    if (line.startsWith("-") && !line.startsWith("---")) {
      linesRemoved++;
      continue;
    }
  }

  return {
    files_changed: files.length,
    files: files,
    lines_added: linesAdded,
    lines_removed: linesRemoved,
  };
}

