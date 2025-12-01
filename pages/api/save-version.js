// Helper: clean text into lowercase words without punctuation
function cleanWords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

// Helper: count occurrences of each word
function countWords(words) {
  const counter = {};
  words.forEach(word => {
    counter[word] = (counter[word] || 0) + 1;
  });
  return counter;
}

// Initialize in-memory storage
global.versions = global.versions || [];

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const newText = req.body.content || "";
  if (!newText.trim()) return res.status(400).json({ error: "Content is empty" });

  const versions = global.versions;
  const oldText = versions.length > 0 ? versions[versions.length - 1].content : "";

  const newWords = cleanWords(newText);
  const oldWords = cleanWords(oldText);

  const newCount = countWords(newWords);
  const oldCount = countWords(oldWords);

  // Detect added and removed words
  const addedWords = [];
  const removedWords = [];
  const replacedWords = [];

  const allWords = new Set([...Object.keys(oldCount), ...Object.keys(newCount)]);
  allWords.forEach(word => {
    const oldQty = oldCount[word] || 0;
    const newQty = newCount[word] || 0;

    if (newQty > oldQty) {
      for (let i = 0; i < newQty - oldQty; i++) addedWords.push(word);
    }
    if (oldQty > newQty) {
      for (let i = 0; i < oldQty - newQty; i++) removedWords.push(word);
    }
  });

  // Simple replacement detection
  const minLen = Math.min(addedWords.length, removedWords.length);
  for (let i = 0; i < minLen; i++) {
    replacedWords.push({ from: removedWords[i], to: addedWords[i] });
  }

  // Remove replaced words from added/removed lists
  replacedWords.forEach(r => {
    addedWords.splice(addedWords.indexOf(r.to), 1);
    removedWords.splice(removedWords.indexOf(r.from), 1);
  });

  // Build version object
  const versionEntry = {
    id: Math.random().toString(36).substring(2, 10),
    timestamp: new Date().toISOString(),
    addedWords,
    removedWords,
    replacedWords,
    oldLength: oldWords.length,
    newLength: newWords.length,
    content: newText
  };

  // Save in-memory
  global.versions.push(versionEntry);

  return res.status(200).json(versionEntry);
}
