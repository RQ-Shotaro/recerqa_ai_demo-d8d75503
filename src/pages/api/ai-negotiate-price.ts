import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const getLlmModelAndGenerateContent = async (apiName: string, systemPrompt: string, userPrompt: string) => {
    try {
      const response = await axios.post('https://api.example.com/llm', {
        apiName,
        systemPrompt,
        userPrompt,
      });
      return response.data.content;
    } catch (error) {
      console.error('APIリクエストエラー:', error);
        if (apiName === "Gemini") {
            return  "申し訳ありませんが、調整後の価格を提案できません。価格の調整は手動で行ってください。"
        }else if(apiName === "Claude"){
            return  "調整後の価格を計算できませんでした。手動で調整してください。"
        } else if(apiName === "ChatGPT"){
            return "価格の調整に失敗しました。元の価格を基に再検討してください。"
        }else{
            return  "価格の調整に失敗しました。手動で調整してください。"
        }
    }
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { purchase_order_id, original_price, adjusted_price } = req.body;

  if (!purchase_order_id || original_price === undefined || adjusted_price === undefined) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
        const systemPrompt = `あなたは、与えられた発注情報をもとに、仕入先との金額調整を行うAIエージェントです。調整後の金額が適切かどうか判断してください。`;
        const userPrompt = `発注ID: ${purchase_order_id}, 調整前の金額: ${original_price}, 調整後の金額: ${adjusted_price}。この調整後の金額は適切ですか？`;

        const aiResponse = await getLlmModelAndGenerateContent("Gemini", systemPrompt, userPrompt);
    
    if(typeof aiResponse === 'string'){
            // Save to database or further processing
            console.log("AIの応答", aiResponse);
        
         // AIの回答をデータベースに保存する処理
          const { data, error } = await supabase
            .from('ai_agents_log')
              .insert([
                {
                agent_type: '仕入AI',
                log_message: `金額調整リクエスト：発注ID: ${purchase_order_id}, 調整前金額: ${original_price}, 調整後金額: ${adjusted_price}。AIの応答：${aiResponse}`,
                related_purchase_order_id: purchase_order_id
                }
             ]);

          if(error){
            console.error("データベースエラー：", error);
          }    
          return res.status(200).json({response: aiResponse, status: 'success' });
    }else{
      return res.status(500).json({ message: 'AIレスポンス形式エラー' });
    }      
  } catch (error:any) {
    console.error('Error during AI negotiation:', error);
    return res.status(500).json({ message: '金額調整処理中にエラーが発生しました', error: error.message });
  }
}
