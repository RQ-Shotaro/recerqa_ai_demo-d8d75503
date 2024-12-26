import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);


const autoOrderStock = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('product_id, product_name');

        if (productsError) {
            console.error('Error fetching products:', productsError);
            return res.status(500).json({ message: '商品情報の取得に失敗しました' });
        }

        const { data: inventory, error: inventoryError } = await supabase
            .from('inventory')
            .select('product_id, stock_quantity');

        if (inventoryError) {
            console.error('Error fetching inventory:', inventoryError);
            return res.status(500).json({ message: '在庫情報の取得に失敗しました' });
        }

        const lowStockProducts = products.filter((product) => {
            const inventoryItem = inventory.find((item) => item.product_id === product.product_id);
            return inventoryItem && inventoryItem.stock_quantity < 10; // 例：在庫レベルが10を下回る商品を対象とする
        });

        if (lowStockProducts.length === 0) {
            return res.status(200).json({ message: '発注が必要な商品は見つかりませんでした。' });
        }

         const systemPrompt = `あなたは卸・商社向けの受発注業務を自動化・効率化するAIエージェントです。以下の商品リストを基に、発注が必要な商品のリストと、仕入先に送信する発注メッセージを生成してください。`;
            const userPrompt = `発注が必要な商品リスト:
${lowStockProducts.map(item=>`- 商品ID: ${item.product_id} , 商品名: ${item.product_name}`).join('
')}

上記の商品リストに基づき、仕入先へ送る発注メッセージを作成してください。発注数は各商品10個とします。`;
        const aiResponse = await getLlmModelAndGenerateContent('Gemini',systemPrompt,userPrompt)
            if(!aiResponse){
                console.error("Failed to generate AI response")
                 return res.status(200).json({ message: 'AI応答の生成に失敗しました。', purchase_order_ids:[] });
            }
         const aiMessage = aiResponse.content;
        
          const purchaseOrderIds = [];

       for (const product of lowStockProducts) {
            const { data: supplier, error: supplierError } = await supabase
            .from('suppliers')
            .select('supplier_id')
            .limit(1)
            .single()

             if (supplierError) {
                 console.error('Error fetching supplier:', supplierError);
                return res.status(500).json({ message: '仕入先の取得に失敗しました', purchase_order_ids:[] });
            }

              const purchaseOrderId = uuidv4();
            const { error: purchaseOrderError } = await supabase
            .from('purchase_orders')
            .insert([
                {
                    purchase_order_id: purchaseOrderId,
                    supplier_id: supplier.supplier_id,
                    order_date: new Date().toISOString(),
                    order_status: 'pending',
                },
            ])
        if (purchaseOrderError) {
                console.error('Error creating purchase order:', purchaseOrderError);
                  return res.status(500).json({ message: '仕入発注の作成に失敗しました', purchase_order_ids:[] });
           }
            const {error: purchaseOrderItemError} = await supabase
            .from('purchase_order_items')
            .insert([
               {
                purchase_order_item_id: uuidv4(),
                purchase_order_id: purchaseOrderId,
                product_id: product.product_id,
                quantity: 10,
                unit_price: 1000,
            }
          ])
            if (purchaseOrderItemError) {
                console.error('Error creating purchase order item:', purchaseOrderItemError);
                return res.status(500).json({ message: '仕入発注明細の作成に失敗しました', purchase_order_ids:[] });
            }
          
          purchaseOrderIds.push(purchaseOrderId);
            const { error: logError } = await supabase
                .from('ai_agents_log')
                .insert([
                  {
                    log_id: uuidv4(),
                    agent_type: 'auto_order',
                    log_time: new Date().toISOString(),
                    log_message: `自動発注処理: ${aiMessage}`,
                    related_purchase_order_id: purchaseOrderId,
                  },
                ]);
            if (logError) {
                console.error('Error creating ai agents log:', logError);
                  return res.status(500).json({ message: 'AIエージェントログの作成に失敗しました', purchase_order_ids:[] });
            }
        }

        return res.status(200).json({ message: '自動発注処理が完了しました。', purchase_order_ids:purchaseOrderIds });

    } catch (error: any) {
      console.error('Error during auto order processing:', error);
        return res.status(500).json({ message: '自動発注処理中にエラーが発生しました。', purchase_order_ids:[] });
    }
};

export default autoOrderStock;