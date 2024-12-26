import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

type Data = {
    response?: string;
    error?: string;
};

const systemPrompt = `あなたは、過去の取引履歴を分析して自動発注を行うシステムです。
ユーザーからの発注データに基づいて、最適な仕入先への発注を行います。
過去の取引履歴を分析して、以下のJSON形式で発注データを生成してください。
{
  "supplier_id": "仕入先ID(UUID)",
  "order_date": "発注日(YYYY-MM-DDTHH:mm:ssZ)",
  "order_status": "発注ステータス（Pending,Confirmed,Shipped,Completedなど）",
    "order_items": [
    {
    "product_id": "商品ID(UUID)",
    "quantity": "注文数量(整数)",
    "unit_price": "注文時の単価(数値)"
    }
    ]
}
発注ステータスは、必ずPendingにしてください。
`;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, userId } = req.body;
    if (!message || !userId) {
      return res.status(400).json({ error: 'Message and userId are required' });
    }

    try {
        const userResponse = await supabase
            .from('users')
            .select('customer_name')
            .eq('id', userId)
            .single();

        if (userResponse.error || !userResponse.data) {
          return res.status(500).json({error: 'Failed to get user information.'});
        }
        const customerName = userResponse.data.customer_name;

        const userPrompt = `得意先名: ${customerName} 発注内容: ${message} 。過去の取引履歴に基づいて発注データを生成してください。`;

        const aiResponse = await getLlmModelAndGenerateContent("Gemini", systemPrompt, userPrompt);

        if (!aiResponse || typeof aiResponse !== 'string') {
          return res.status(500).json({response: 'AIからの応答がありませんでした。',});
        }

        let orderData;
        try {
            orderData = JSON.parse(aiResponse);
        } catch (error) {
           console.error('JSON parse error:', error);
           return res.status(500).json({ response: "AIからの応答をJSONとして解析できませんでした。"});
        }

        if (!orderData || !orderData.supplier_id || !orderData.order_date || !orderData.order_items ) {
             return res.status(500).json({ response: "AIからの応答が発注データの形式ではありませんでした。" });
        }
        
       const { data: purchaseOrderData, error: purchaseOrderError } = await supabase
            .from('purchase_orders')
            .insert([{
                supplier_id: orderData.supplier_id,
                order_date: orderData.order_date,
                order_status: 'Pending'
            }])
            .select('purchase_order_id')
            .single();

            if (purchaseOrderError || !purchaseOrderData) {
                console.error('Error creating purchase order:', purchaseOrderError);
                return res.status(500).json({ response: '発注データの登録に失敗しました。'});
            }
        
      const orderItems = orderData.order_items.map(item => ({
        purchase_order_id: purchaseOrderData.purchase_order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
      }))
      const {error: purchaseOrderItemError} =  await supabase
      .from('purchase_order_items')
      .insert(orderItems)
        if(purchaseOrderItemError){
                console.error('Error creating purchase order items:', purchaseOrderItemError);
                return res.status(500).json({ response: '発注明細データの登録に失敗しました。'});
         }

         return res.status(200).json({ response: '発注処理が完了しました。' });

    } catch (error: any) {
        console.error('Error during order processing:', error);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
}
