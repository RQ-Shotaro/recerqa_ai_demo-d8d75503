import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const systemPrompt = `あなたは、顧客からの質問に答えるAIアシスタントです。
顧客からの質問に対し、丁寧かつ正確に回答してください。
回答は簡潔に、質問内容に沿ったものにしてください。
もし質問内容が発注手続きに関するものであれば、その手順を説明してください。
もし商品に関する質問であれば、商品の情報をデータベースから検索し、回答してください。
回答は日本語で行ってください。
もしデータベースに該当する情報がない場合は、その旨を伝えてください。
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
       const aiResponse = await getLlmModelAndGenerateContent(
         "Gemini",
         systemPrompt,
          message
      );
      if (aiResponse && aiResponse.response) {
           return res.status(200).json({ response: aiResponse.response });
      } else{
        return res.status(500).json({ response: 'AIからの応答がありませんでした。' });
      }
    } catch (error:any) {
        console.error('Error processing AI request:', error);
           return res.status(500).json({
             response:
               '申し訳ございません。AIとの通信中にエラーが発生しました。時間を置いて再度お試しください。',
           });
    }
}
