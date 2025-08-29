# Spec Sheet → Intents Example

This example reads a human spec sheet, converts the Requirements section into intents via an LLM (or heuristic fallback), builds a `Spec`, and outputs a markdown checklist for human approval.

## Usage

- Set `OPENAI_API_KEY` (optional). Without it, a simple heuristic is used.
- Optionally set `OPENAI_MODEL` (default `gpt-4o-mini`).
- Run:

```bash
bun run ts-node examples/spec-sheet/generate.ts
```

The checklist is written to `examples/spec-sheet/generated.md`.
