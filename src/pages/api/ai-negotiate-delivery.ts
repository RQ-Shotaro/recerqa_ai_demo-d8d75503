import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const aiNegotiateDelivery = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { purchase_order_id, original_delivery_date, adjusted_delivery_date } = req.body;

    if (!purchase_order_id || !original_delivery_date || !adjusted_delivery_date) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {

         const systemPrompt = `あなたは、与えられた発注ID、元の納期、調整後の納期を基に、仕入先との納期調整を支援するAIエージェントです。調整後の納期が妥当かどうかを判断し、その理由を説明してください。`;
        const userPrompt = `発注ID: ${purchase_order_id}, 元の納期: ${original_delivery_date}, 調整後の納期: ${adjusted_delivery_date}。この調整後の納期について評価と理由を説明してください。`;
        const aiResponse = await getLlmModelAndGenerateContent("Gemini", systemPrompt, userPrompt);

      // const response = await axios.post('https://api.example.com/ai-negotiate-delivery', {
      //   purchase_order_id,
      //   original_delivery_date,
      //   adjusted_delivery_date,
      // });

        const { data, error } = await supabase
            .from('ai_agents_log')
            .insert([
                {
                    agent_type: '仕入AI',
                    log_message: `納期調整リクエスト: 発注ID ${purchase_order_id}, 元の納期 ${original_delivery_date}, 調整後の納期 ${adjusted_delivery_date}。AIによる分析結果: ${aiResponse?.response || 'AIからの回答なし'}`, 
                    related_purchase_order_id: purchase_order_id,
                },
            ])
            .select();

        if (error) {
            console.error("Supabase error saving log:", error);
            return res.status(500).json({ error: 'Failed to save log to the database.' });
        }
        if(aiResponse) {
           return res.status(200).json({ message: 'Delivery date adjusted successfully.', ai_analysis: aiResponse.response });
        }else{
           return res.status(200).json({ message: 'Delivery date adjusted successfully. AI analysis is not available.' });
        }

        // return res.status(200).json({ message: 'Delivery date adjusted successfully.', ai_analysis: "AIによる分析結果：調整後の納期は妥当です。" });
    } catch (error: any) {
        console.error('Error during delivery negotiation:', error);
         return res.status(500).json({ error: 'Error during delivery negotiation.',  ai_analysis: "AIによる分析に失敗しました。" });

        // return res.status(500).json({ error: 'Error during delivery negotiation.', ai_analysis: "調整後の納期は妥当ではありません。仕入先に再調整を依頼してください。" });
    }
};

export default aiNegotiateDelivery;
