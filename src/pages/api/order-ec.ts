import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, userId } = req.body;

  if (!message || !userId) {
    return res.status(400).json({ error: 'Message and userId are required' });
  }

  try {
    const systemPrompt = `あなたは、ユーザーの発注に関する質問に答えるAIエージェントです。
    ユーザーの質問に基づいて、発注可能な商品や在庫状況、発注方法などを回答してください。
    発注に関する具体的な質問（例：商品Aの在庫はありますか？、商品Bを5個発注したいです）に対しては、明確かつ簡潔に答えてください。
    また、過去の注文履歴や顧客情報を参照し、パーソナライズされた回答を提供してください。`;
    const userPrompt = `ユーザーからのメッセージ：${message}
    ユーザーID: ${userId}
    `;
    

     const apiResponse = await getLlmModelAndGenerateContent("Gemini", systemPrompt, userPrompt)
     if (apiResponse && apiResponse.content) {
        const response = apiResponse.content;

      // Log the interaction
      await supabase.from('ai_agents_log').insert([{
        agent_type: '販売AI',
        log_message: `ユーザーからのメッセージ：${message}。AIからの返答：${response}`,
        related_order_id: null,   
        related_purchase_order_id: null,
         related_quote_id: null
      }]);

        return res.status(200).json({ response });
    } else {
      console.error("Failed to generate content from AI model");
       return res.status(200).json({ response: '申し訳ございません。ご質問の内容が理解できませんでした。' });
    }
    
  } catch (error: any) {
    console.error('Error processing chat message:', error);
     await supabase.from('ai_agents_log').insert([{
        agent_type: '販売AI',
        log_message: `エラーが発生しました: ${error.message}`,
           related_order_id: null,   
        related_purchase_order_id: null,
         related_quote_id: null
      }]);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;
