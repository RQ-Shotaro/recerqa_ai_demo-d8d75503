import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system" as const,
          content: "あなたは親切で丁寧な日本語アシスタントです。ユーザーからの質問に対して、できるだけ分かりやすく具体的に回答してください。",
        },
        ...history,
        {
          role: "user" as const,
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || "申し訳ありません。応答を生成できませんでした。";
    res.status(200).json({ response });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'AI応答の生成中にエラーが発生しました。' });
  }
}
