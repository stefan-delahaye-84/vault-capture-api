# vault-capture-api

A lightweight serverless function that appends text to a Markdown file in a GitHub repository and commits it immediately. Designed to be triggered from iPhone Shortcuts for instant, conflict-free voice capture into a personal knowledge vault.

## Use Case

Capture a thought, note, or task from your iPhone via dictation → it lands in your Markdown inbox file on GitHub within seconds, fully committed. No sync delays, no merge conflicts, no paid apps required.

Works with any Markdown-based knowledge system (Obsidian, Logseq, plain Markdown vaults, etc.) stored in a GitHub repository.

## How It Works

```
iPhone Shortcut (dictation)
  → POST request to this API
    → GitHub API (fetch file → append → commit)
      → your repo updated instantly
```

## Features

- Single HTTP endpoint — simple POST with text payload
- Appends timestamped entries to any file in any GitHub repo
- Commits immediately on every capture
- Secured with a shared secret — only your Shortcut can call it
- Stateless and serverless — deploy for free on Vercel
- Zero dependencies — uses only Node.js built-ins

## Deployment

### Vercel

1. Fork or clone this repo
2. Import into [Vercel](https://vercel.com) and deploy
3. Set environment variables in Vercel project settings (see below)
4. Your endpoint is live at `https://your-project.vercel.app/api/index`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | Fine-grained GitHub Personal Access Token (Contents: read & write, scoped to target repo only) |
| `REPO_OWNER` | GitHub username or organisation |
| `REPO_NAME` | Target repository name |
| `FILE_PATH` | Path to the Markdown file to append to (e.g. `00_Inbox/inbox.md`) |
| `AUTH_SECRET` | A strong random string — your Shortcut must send this to authenticate |

Never put these values in code. Always use environment variables.

## API

### POST `/api/index`

**Request body (JSON):**
```json
{
  "secret": "your-auth-secret",
  "text": "The text to append to the file"
}
```

**Responses:**
- `200 OK` — text appended and committed successfully
- `400 Bad Request` — no text provided
- `401 Unauthorized` — wrong or missing secret
- `405 Method Not Allowed` — non-POST request
- `500 Internal Server Error` — GitHub API error

## iPhone Shortcut Setup

1. Create a new Shortcut
2. Add **Dictate Text** action
3. Add **Get Contents of URL** action:
   - URL: your deployed endpoint
   - Method: POST
   - Body: JSON with `secret` and `text` fields
4. Optionally add a notification to confirm capture
5. Assign the Shortcut to **Back Tap** via Settings → Accessibility → Touch → Back Tap

## Security

- The `AUTH_SECRET` protects the endpoint from unauthorized access
- Your GitHub token is never exposed in code or responses
- Use a fine-grained PAT scoped to only the target repository
- HTTPS is enforced by Vercel by default

## License

MIT
