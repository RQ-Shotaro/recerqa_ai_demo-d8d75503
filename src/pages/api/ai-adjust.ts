import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { purchase_order_id, items } = req.body;

  if (!purchase_order_id || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const systemPrompt = `あなたは、発注内容の調整を行うAIエージェントです。
        与えられた発注IDと調整後の商品情報を基に、最適な調整案を作成してください。
        調整後の数量と単価を基に、合計金額を算出し、調整後の情報をJSON形式で返却してください。
        フォーマットは以下の通りです。
        {
          \"success\": true,
          \"purchase_order_id\": \"発注ID\",
            \"items\": [
                {
                    \"purchase_order_item_id\": \"発注明細ID\",
                    \"quantity\": 数量,
                    \"unit_price\": 単価,
                    \"total_price\": 合計金額
                }
             ],
          \"message\": \"調整が完了しました。\"
        }
        `;
    
    const userPrompt = `発注ID: ${purchase_order_id}。
      調整後の商品情報は以下です。
      ${JSON.stringify(items)}
      上記の情報を基に、最適な調整案を作成してください。`;

    const aiResponse = await getLlmModelAndGenerateContent('Gemini', systemPrompt, userPrompt);

    if (!aiResponse) {
      console.error('AIモデルからの応答がありませんでした。');
      return res.status(500).json({
        success: false,
        message: 'AIモデルからの応答がありませんでした。',
      });
    }

      try {
        const parsedResponse = JSON.parse(aiResponse);
        if (parsedResponse && parsedResponse.success === true) {
          const updatePromises = parsedResponse.items.map(async (item: any) => {
            const { purchase_order_item_id, quantity, unit_price } = item;
            
             if (!purchase_order_item_id || typeof quantity !== 'number' || typeof unit_price !== 'number') {
              console.error('無効なデータ形式です。', item);
              return Promise.resolve(null);
            }
            
            const { error } = await supabase
              .from('purchase_order_items')
              .update({ quantity, unit_price })
              .eq('purchase_order_item_id', purchase_order_item_id);
          
             if (error) {
              console.error('データベース更新エラー', error);
              return Promise.resolve(null);
            }
              return Promise.resolve(item);
          });
      
          const updateResults = await Promise.all(updatePromises);
          const updatedItems = updateResults.filter(item=> item != null);
    
          if(updatedItems.length !== parsedResponse.items.length) {
              console.error('一部のデータの更新に失敗しました。');
                return res.status(500).json({
                    success: false,
                    message: '一部のデータの更新に失敗しました。',
                });
            }

            return res.status(200).json({
                success: true,
                purchase_order_id: purchase_order_id,
                 items: updatedItems,
                 message: '調整が完了しました。'
            });
        } else {
          console.error('AIモデルからの応答形式が不正です:', aiResponse);
          return res.status(500).json({
            success: false,
            message: 'AIモデルからの応答形式が不正です。',
          });
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
          return res.status(500).json({
              success: false,
              message: 'JSON解析エラーが発生しました。',
          });
    }
  } catch (error: any) {
    console.error('AIモデルまたはデータベース操作中にエラーが発生しました:', error);
     return res.status(500).json({
       success: false,
       message: `AIモデルまたはデータベース操作中にエラーが発生しました:${error.message}`,
     });
  }
}
