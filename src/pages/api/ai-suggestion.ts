import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);



const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { customerId } = req.body;

  if (!customerId) {
    return res.status(400).json({ error: '顧客IDがありません' });
  }

  try {
        // 過去の取引履歴を取得
        const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('order_id, order_date')
        .eq('customer_id', customerId)
        .order('order_date', { ascending: false })
        .limit(5);
      if (orderError) {
        console.error('注文履歴の取得エラー:', orderError);
        return res.status(500).json({error:'注文履歴の取得に失敗しました'});
      }

        const orderHistory = orderData?.map(order => `${order.order_id} - ${order.order_date}`).join('
') || '過去の注文履歴はありません。';

         // 商品情報を取得
        const { data: productData, error: productError } = await supabase
        .from('products')
        .select('product_id, product_name, unit_price')
       if (productError) {
            console.error('商品情報の取得エラー:', productError);
            return res.status(500).json({ error: '商品情報の取得に失敗しました' });
        }

        const productInfo = productData?.map(product => `${product.product_name} (価格: ¥${product.unit_price})`).join('
') || '商品情報はありません';


    const systemPrompt = `あなたは、顧客の過去の取引履歴と全商品情報に基づき、おすすめ商品を提案するAIアシスタントです。
    顧客の購買履歴と全商品情報を基に、顧客が興味を持ちそうな商品を3つ提案してください。提案する際は、商品の名前と価格に加えて、簡単な説明も加えてください。
    また、提案理由も添えてください。
    
    過去の注文履歴:
    ${orderHistory}
    
    全商品情報:
    ${productInfo}
    `;
    const userPrompt = `顧客に提案する商品を3つ提案してください。`;

      const aiResponse = await getLlmModelAndGenerateContent('Gemini',systemPrompt,userPrompt);

        if (aiResponse.error) {
            console.error('AI APIエラー:', aiResponse.error);
           return res.status(500).json({
              response: "申し訳ございません。現在商品提案を行うことができません。サンプルデータをご提案します。

 おすすめ商品1: サンプル商品A (価格: ¥1000) 
  説明：定番の商品です。
  理由: 過去の購買履歴から人気の商品です。

 おすすめ商品2: サンプル商品B (価格: ¥2000)
  説明：新商品です。
  理由: 新しい商品をお試しいただきたいため。

 おすすめ商品3: サンプル商品C (価格: ¥1500) 
  説明：お買い得な商品です。
  理由: お客様の予算を考慮して、お求めやすい価格の商品です。"
        });
        }

    return res.status(200).json({ response: aiResponse.content });
  } catch (error: any) {
    console.error('Error fetching data:', error);
     return res.status(500).json({
       response: "申し訳ございません。現在商品提案を行うことができません。サンプルデータをご提案します。

 おすすめ商品1: サンプル商品A (価格: ¥1000) 
  説明：定番の商品です。
  理由: 過去の購買履歴から人気の商品です。

 おすすめ商品2: サンプル商品B (価格: ¥2000)
  説明：新商品です。
  理由: 新しい商品をお試しいただきたいため。

 おすすめ商品3: サンプル商品C (価格: ¥1500) 
  説明：お買い得な商品です。
  理由: お客様の予算を考慮して、お求めやすい価格の商品です。"
    });
  }
};

export default handler;
