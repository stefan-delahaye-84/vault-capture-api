const https = require("https");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;
const FILE_PATH = process.env.FILE_PATH;
const AUTH_SECRET = process.env.AUTH_SECRET;

async function githubRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.github.com",
      path,
      method,
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "User-Agent": "vault-capture",
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(JSON.parse(data)));
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { secret, text } = req.body;
  if (!secret || secret !== AUTH_SECRET) {
    return res.status(401).send("Unauthorized");
  }

  if (!text || text.trim() === "") {
    return res.status(400).send("No text provided");
  }

  try {
    // 1. Get current file from GitHub
    const fileData = await githubRequest(
      "GET",
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`
    );

    const currentContent = Buffer.from(fileData.content, "base64").toString("utf8");
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
    const newEntry = `\n- ${timestamp} — ${text.trim()}`;
    const newContent = currentContent + newEntry;
    const encodedContent = Buffer.from(newContent).toString("base64");

    // 2. Commit updated file
    await githubRequest(
      "PUT",
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        message: `inbox: capture from iPhone`,
        content: encodedContent,
        sha: fileData.sha,
      }
    );

    return res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error: " + err.message);
  }
};
