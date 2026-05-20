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
- Adds a `---` separator before each entry for clean formatting
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

> **Important:** After setting or updating any environment variable in Vercel, you must manually redeploy for the changes to take effect. Go to Deployments → three dots → Redeploy.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | Fine-grained GitHub Personal Access Token (Contents: read & write, scoped to target repo only) |
| `REPO_OWNER` | GitHub username or organisation (e.g. `your-username`) |
| `REPO_NAME` | Target repository name (e.g. `vault_personal`) |
| `FILE_PATH` | Exact path to the Markdown file to append to (e.g. `00_Inbox/Input.md`) |
| `AUTH_SECRET` | A strong random string — your Shortcut must send this to authenticate |

> **Note:** Variable names and file paths are case-sensitive. `Input.md` and `input.md` are different files.

Never put these values in code. Always use environment variables.

## GitHub Token Setup

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Under **Repository access** select **Only select repositories**
3. Add both your function repo and your vault repo
4. Under **Permissions** set **Contents: Read and write**
5. After any token regeneration, update `GITHUB_TOKEN` in Vercel and redeploy

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
- `404 Not Found` — file path or repo not accessible by token
- `405 Method Not Allowed` — non-POST request
- `500 Internal Server Error` — GitHub API error

## iPhone Shortcut Setup

1. Create a new Shortcut
2. Add **Dictate Text** action
3. Add **Get Contents of URL** action:
   - URL: your deployed endpoint
   - Method: POST
   - Body: JSON
   - Fields: `secret` (your AUTH_SECRET) and `text` (Dictated Text variable)
4. Optionally add a notification to confirm capture
5. Assign the Shortcut to **Back Tap** via Settings → Accessibility → Touch → Back Tap

## Security

- The `AUTH_SECRET` protects the endpoint from unauthorized access
- Your GitHub token is never exposed in code or responses
- Use a fine-grained PAT scoped to only the required repositories
- HTTPS is enforced by Vercel by default
- The function repo can safely be public — it contains no secrets

## License

MIT
