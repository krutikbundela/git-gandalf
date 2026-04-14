# Git Gandalf

Git Gandalf is a local LLM-powered pre-commit code reviewer. It hooks into your git workflow to analyze the staged diff before you commit, identifying potential risks and issues. It runs entirely locally—without external API dependencies—ensuring privacy and security.

## Requirements

- **Node.js**: v18.0.0 or higher (required for the native `fetch` API).
- **Local LLM**: LM Studio running locally with the target model (`qwen/qwen3-vl-4b` or the `qwen3-4b-2507` equivalent) exposed at `http://localhost:1234/v1/chat/completions`.

## Installation

Git Gandalf is designed to be minimal and straightforward. It requires no heavy scaffolding or auto-installers.

1. Ensure your local LLM is loaded and running via LM Studio at port `1234`.
2. Create the `pre-commit` hook inside your git repository:

Create a file named `.git/hooks/pre-commit` with the following shell script content:

```bash
#!/bin/sh

DIFF=$(git diff --cached)

if [ -z "$DIFF" ]; then
    exit 0
fi

echo "$DIFF" | node gitGandalf.js
exit $?
```

3. **Make the hook executable** (Required on Unix-like systems such as macOS and Linux; optional but recommended inside Windows Git Bash):

```bash
chmod +x .git/hooks/pre-commit
```

## Usage

Once the hook is placed in your `.git/hooks` folder, Git Gandalf works automatically anytime you run `git commit`.

- The hook reads your staged changes and pipes them to the local LLM.
- **ALLOW** (LOW Risk): Commits with minor, low-risk changes proceed normally.
- **WARN** (MEDIUM Risk): Commits flagged as medium risk print a highlighted caution but do not disrupt git behaviour.
- **BLOCK** (HIGH Risk): Commits with high-risk changes (e.g. security issues, missing auth checks) will actively reject and block the commit.

### Bypassing Git Gandalf

To forcibly bypass the review hook, you can pass the standard `--no-verify` flag to git:

```bash
git commit -m "urgent hotfix" --no-verify
```

## Limitations

- **Performance**: Review speed is dependent entirely on your local machine and the LM Studio inference speed.
- **Diff Constraints**: Diffs larger than 500KB are securely bypassed to save context resources.
- **Graceful Failures for Network Issues**: If your LLM falls asleep or misses a 120s timeout, the process warns you and permits the commit to keep you unblocked.
- **Loud Failures for Invalid Responses**: Any ambiguity or malformed JSON from the LLM will block the commit so you aren't silently passed on corrupted responses.
