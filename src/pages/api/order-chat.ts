import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const systemPrompt = `あなたは、発注に関する問い合わせに対応するAIです。
ユーザーの発言内容を解析し、適切な返答をしてください。
発注に関する問い合わせかどうかを判断し、発注に関する内容であれば、発注内容を解析してデータベース登録を試みてください。
発注内容が不明確な場合は、ユーザーに確認をしてください。

例:
ユーザー: 商品Aを5個発注したい。
AI: 商品Aを5個発注ですね。承知いたしました。

ユーザー: 商品Bの発注をお願い。
AI: 数量が不明です。数量を教えていただけますでしょうか？

ユーザー: 10個の商品Cを発注します。
AI: 商品Cを10個発注ですね。承知いたしました。

ユーザー: こんにちは
AI: ご用件をどうぞ

ユーザー: 発注状況を教えて
AI: 発注状況を確認いたします。

ユーザー: 昨日発注した商品の状況はどうなってますか
AI: 昨日の発注状況を確認いたします。

ユーザー: 注文状況はどうなっていますか？
AI: 注文状況を確認いたします。

ユーザー: 注文履歴が見たいです。
AI: 注文履歴を表示します。
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, userId } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
  }

    try {
        const aiResponse = await getLlmModelAndGenerateContent('Gemini', systemPrompt, message);
        console.log('AIレスポンス:', aiResponse);

        let orderDetails = null;
        const orderRegex = /(.*?)を(.*?)個発注/;    
        const orderMatch = message.match(orderRegex);
    
          if (orderMatch) {
            const productName = orderMatch[1].trim();
            const quantity = parseInt(orderMatch[2].trim(), 10);
          
            if(productName && !isNaN(quantity)){
                orderDetails = { productName, quantity };
            }
          }

        if (orderDetails) {
          console.log('発注内容:', orderDetails);
          //商品名から商品IDを取得
          const { data: products, error: productError } = await supabase
          .from('products')
          .select('product_id')
          .eq('product_name', orderDetails.productName)
          .single();
        if (productError) {
            console.error('商品検索エラー:', productError);
            return res.status(500).json({ response: '商品検索中にエラーが発生しました。' });
        }

        if(!products){
          return res.status(400).json({ response: 'ご指定の商品は見つかりませんでした。' });
        }
        const productId = products.product_id;

          // 発注データをordersテーブルに登録
            const { data:orderData, error:orderError } = await supabase
              .from('orders')
              .insert([
                {
                    customer_id: userId,
                    order_status:'Pending',
                    order_date: new Date().toISOString()
                },
              ])
              .select('order_id')
              .single();
                
            if (orderError) {
                console.error('発注データ登録エラー:', orderError);
                return res.status(500).json({ response: '発注データの登録中にエラーが発生しました。' });
            }
            const orderId = orderData.order_id;

            // 発注明細をorder_itemsテーブルに登録
            const { error: orderItemError } = await supabase
              .from('order_items')
              .insert([
                {
                  order_id: orderId,
                  product_id: productId,
                  quantity: orderDetails.quantity,
                  unit_price: 100, //仮
                },
              ]);
            if (orderItemError) {
                console.error('発注明細データ登録エラー:', orderItemError);
                return res.status(500).json({ response: '発注明細データの登録中にエラーが発生しました。' });
            }
            return res.status(200).json({response: '発注を受け付けました。'});
          }

        return res.status(200).json({ response: aiResponse });
    } catch (error:any) {
        console.error('APIリクエストエラー:', error);
        return res.status(500).json({ response: '申し訳ございません。エラーが発生しました。' });
    }
}
