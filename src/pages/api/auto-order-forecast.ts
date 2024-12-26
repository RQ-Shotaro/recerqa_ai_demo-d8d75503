import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const systemPrompt = `あなたは、与えられた発注内容に関する質問に答えるAIです。
発注に関する質問に正確に答えることを目指します。
発注に関する質問以外には回答しないでください。
回答は日本語でお願いします。`;
        const userPrompt = message;

        const response = await getLlmModelAndGenerateContent("Gemini", systemPrompt, userPrompt);

        if (response && response.trim() !== "") {
             return res.status(200).json({ response: response });
        }
        return res.status(200).json({ response: 'ご質問ありがとうございます。内容を確認中です。' });


    } catch (error: any) {
        console.error('AI API call failed:', error);
        return res.status(200).json({ response: 'ご質問ありがとうございます。AIとの通信に失敗しました。' });
    }
};

export default handler;