export const askGemini = async (req, res) => {
  const { contents } = req.body;

  if (!contents) {
    return res.status(400).json({ error: "Missing contents" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Извините, я не поняла.";

    return res.json({ reply });
  } catch (error) {
    console.error("Gemini error:", error.message);
    return res.status(500).json({ error: "Ошибка при обращении к ИИ." });
  }
};
