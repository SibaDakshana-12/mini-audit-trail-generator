// Initialize in-memory storage
global.versions = global.versions || [];

export default function handler(req, res) {
  try {
    res.status(200).json({ versions: global.versions });
  } catch (err) {
    console.error("Error fetching versions:", err);
    res.status(500).json({ error: "Error fetching versions" });
  }
}

