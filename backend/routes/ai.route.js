import express from "express";
import OpenAI from "openai";

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/insights", async (req, res) => {
  try {
    const { income, expenses, budgets, upcomingPayments } = req.body;

    const prompt = `
You are a financial advisor AI.

Analyze this user data:

Income: ${income}
Expenses: ${expenses}

Budgets:
${JSON.stringify(budgets)}

Upcoming Payments:
${JSON.stringify(upcomingPayments)}

Return response in JSON format:
{
  "summary": string,
  "insights": string[],
  "warnings": string[],
  "suggestions": string[]
}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a strict financial AI that gives short, useful insights.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
    });

    const text = response.choices[0].message.content;

    res.json(JSON.parse(text));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI failed" });
  }
});

export default router;