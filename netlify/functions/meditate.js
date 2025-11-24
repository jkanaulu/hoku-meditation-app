// netlify/functions/meditate.js
import axios from "axios";

export const handler = async (event) => {
  try {
    const { userInput, systemPrompt } = JSON.parse(event.body);

    const apiKey = process.env.OPENAI_API_KEY;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userInput }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        script: response.data.choices[0].message.content
      })
    };
  } catch (error) {
    console.error("OpenAI backend error:", error.response?.data || error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OpenAI request failed" })
    };
  }
};
