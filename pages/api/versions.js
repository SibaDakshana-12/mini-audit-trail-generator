import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const file = path.join(process.cwd(), "data", "versions.json");

  try {
    if (!fs.existsSync(file)) {
      // File doesn't exist yet, return empty array
      return res.status(200).json({ versions: [] });
    }

    const raw = fs.readFileSync(file, "utf8");
    const versions = JSON.parse(raw);
    res.status(200).json({ versions });
  } catch (err) {
    console.error("Error reading versions.json:", err);
    res.status(500).json({ error: "Error reading versions file" });
  }
}
