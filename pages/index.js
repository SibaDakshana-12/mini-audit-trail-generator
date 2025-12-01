import React, { useState, useEffect } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [versions, setVersions] = useState([]);

  // Fetch all versions from API
  const loadVersions = async () => {
   try {
    const res = await fetch("/api/versions");
    const data = await res.json();
    setVersions(data.versions || []); // <- extract the array
   } catch (err) {
    console.error("Failed to load versions:", err);
    setVersions([]);
   }
 };


  useEffect(() => {
    loadVersions();
  }, []);

  // Save current text as a new version
  const saveVersion = async () => {
    if (!text.trim()) return; // prevent empty saves
    try {
      await fetch("/api/save-version", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      setText(""); // optionally clear editor
      loadVersions();
    } catch (err) {
      console.error("Failed to save version:", err);
    }
  };

  return (
    <div style={{ display: "flex", padding: 20, gap: 20 }}>
      {/* Left side: Content Editor */}
      <div style={{ width: "50%" }}>
        <h2>Content Editor</h2>
        <textarea
          rows={10}
          style={{ width: "100%", padding: 10, fontSize: 16 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your content here..."
        />
        <br />
        <button onClick={saveVersion} style={{ marginTop: 10 }}>
          Save Version
        </button>
      </div>

      {/* Right side: Version History */}
      <div style={{ width: "50%" }}>
        <h2>Version History</h2>
        {versions.length === 0 && <p>No versions yet.</p>}

        {versions.map((v) => (
          <div
            key={v.id}
            style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10 }}
          >
            <div>
              <strong>{v.timestamp}</strong>
            </div>
            <div>ID: {v.id}</div>
            <p>
              <strong>Added:</strong> {v.addedWords.length ? v.addedWords.join(", ") : "None"}
            </p>
            <p>
              <strong>Removed:</strong> {v.removedWords.length ? v.removedWords.join(", ") : "None"}
            </p>
            <p>
              <strong>Replaced:</strong>{" "}
              {v.replacedWords && v.replacedWords.length
                ? v.replacedWords.map(r => `${r.from} → ${r.to}`).join(", ")
                : "None"}
            </p>
            <p>
              <strong>Word count:</strong> {v.oldLength} → {v.newLength}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
