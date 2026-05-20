const https = require("https");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;
const FILE_PATH = process.env.FILE_PATH;
const AUTH_SECRET = process.env.AUTH_SECRET;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  return res.status(200).json({
    hasToken: !!GITHUB_TOKEN,
    hasOwner: !!REPO_OWNER,
    hasRepo: !!REPO_NAME,
    hasPath: !!FILE_PATH,
    hasSecret: !!AUTH_SECRET,
    secretMatch: req.body?.secret === AUTH_SECRET
  });
};
