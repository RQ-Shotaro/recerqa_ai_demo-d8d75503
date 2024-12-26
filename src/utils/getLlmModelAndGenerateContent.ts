
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { OpenAI } from 'openai';

export async function getLlmModelAndGenerateContent(
  selectedAPI: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  let apiKey: string = "";
  let modelType: string;

  switch (selectedAPI) {
    case "Gemini":
      modelType = "gemini-1.5-pro-latest";

      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({
        model: modelType,
        generationConfig: { responseMimeType: "application/json" }
      });

      const geminiPrompt = systemPrompt + userPrompt;
      const result = await geminiModel.generateContent(geminiPrompt);
      const response = await result.response;
      return response.text();

    case "Claude":
      modelType = "claude-3-5-sonnet-20240620";

      const anthropic = new Anthropic({
        apiKey: apiKey,
        defaultHeaders: {
          "anthropic-beta": "prompt-caching-2024-07-31"
        }
      });

      const claudeResponse = await anthropic.messages.create({
        model: modelType,
        max_tokens: 8192,
        system: [
          { type: "text", text: systemPrompt },
        ],
        messages: [{ role: "user", content: userPrompt }]
      });
      return claudeResponse.content[0].type === 'text'
        ? claudeResponse.content[0].text
        : 'テキスト以外のコンテンツが返されました';

    case "Chatgpt":
      modelType = "gpt-4o";

      const openai = new OpenAI({ apiKey: apiKey });
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: modelType,
      });
      return completion.choices[0].message.content?.replace(/```jsons*|s*```/g, '') || '';

    default:
      throw new Error("Invalid API selected");
  }
}
