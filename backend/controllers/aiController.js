const axios = require("axios");
const Medicine = require("../models/Medicine");

const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";

// @desc    Get AI suggestions based on user medicines using Hugging Face Free Tier
// @route   GET /api/ai/suggestions
// @access  Private
exports.getSuggestions = async (req, res) => {
  try {
    const medicines = await Medicine.find({ user: req.user.id });

    if (!medicines || medicines.length === 0) {
      return res.status(200).json({
        success: true,
        data: [
          {
            type: "health",
            title: "Welcome!",
            message:
              "Add your medicines to get personalized AI insights and safety warnings powered by Hugging Face.",
          },
        ],
      });
    }

    const medList = medicines
      .map((m) => `- ${m.name}: ${m.dosage}, ${m.frequency}`)
      .join("\n");

    const prompt = `You are a medical assistant AI. Based on the following medications, provide 3 to 5 concise suggestions.
        Format accurately as a JSON array with fields: "type" (warning, diet, or health), "title", and "message".
        
        Medications:
        ${medList}

        Respond ONLY with the JSON array. Do not include any other text.`;

    const response = await axios.post(
      HF_ROUTER_URL,
      {
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    let content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\[.*\]/s);
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("Hugging Face Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message:
        "AI suggestions service is temporarily unavailable. Check your HF Token permissions.",
    });
  }
};

// @desc    Chat with AI assistant (Hugging Face)
// @route   POST /api/ai/chat
// @access  Private
exports.chatWithAI = async (req, res) => {
  try {
    const { message, messageHistory } = req.body;
    const medicines = await Medicine.find({ user: req.user.id });
    const medList = medicines.map((m) => m.name).join(", ");

    const systemPrompt = `You are Med-Mate AI, a friendly and helpful assistant.
        CONTEXT (FOR YOUR REFERENCE ONLY):
        User's Medications: ${medList || "None"}.

        STRICT RULES:
        1. Always respond to the user’s latest message clearly and naturally.
2. Do not mention medications unless the user specifically asks about them.
3. If the user asks about a medication (e.g., side effects, usage, or general information), provide general educational information.
4. Do not give personalized medical advice, diagnoses, or prescriptions.
5. For serious health concerns, recommend consulting a qualified doctor or healthcare professional.
6. Keep responses friendly, simple, and conversational like a helpful assistant.
7. If the user sends a short reply like "ok", "fine", or "thanks", acknowledge briefly.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(messageHistory || []),
      { role: "user", content: message },
    ];

    const response = await axios.post(
      HF_ROUTER_URL,
      {
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: messages,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    let aiResponse = response.data.choices[0].message.content;

    res.status(200).json({
      success: true,
      data: aiResponse,
    });
  } catch (error) {
    console.error("HF Chat Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "AI Chat is currently unavailable.",
    });
  }
};
