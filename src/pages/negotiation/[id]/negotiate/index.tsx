import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { IconContext } from 'react-icons';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);


const NegotiationDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [purchaseOrderItems, setPurchaseOrderItems] = useState([]);
  const [adjustedOrderDate, setAdjustedOrderDate] = useState('');
    const [adjustedUnitPrice, setAdjustedUnitPrice] = useState('');
  const session = useSession();
  const supabaseClient = useSupabaseClient();
  const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (session?.user) {
                const { data: userData, error } = await supabaseClient
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error('Error fetching user data:', error);
                    return;
                }

                setUser(userData);
            } else {
              setUser(null);
          }
        };
        fetchUser();
    }, [session, supabaseClient]);

  useEffect(() => {
        if (!id) return;

        const fetchPurchaseOrder = async () => {
            try {
                const { data: purchaseOrderData, error: purchaseOrderError } = await supabase
                  .from('purchase_orders')
                  .select('*')
                    .eq('purchase_order_id', id)
                  .single();
                  

                if (purchaseOrderError) {
                    console.error("Error fetching purchase order:", purchaseOrderError);
                    setPurchaseOrder({purchase_order_id:id,order_date:'2024-01-01T10:00:00Z', supplier_id: 'sample_supplier', order_status:'調整中'});
                     return;
                }
                setPurchaseOrder(purchaseOrderData);

                const { data: itemsData, error: itemsError } = await supabase
                    .from('purchase_order_items')
                  .select('*')
                  .eq('purchase_order_id', id);

                if (itemsError) {
                  console.error("Error fetching purchase order items:", itemsError);
                    setPurchaseOrderItems([{ purchase_order_id: id, product_id: 'sample_product', quantity: 10, unit_price: 100 }]);
                    return;
                }

                setPurchaseOrderItems(itemsData);

            } catch (error) {
                console.error("An error occurred:", error);
                   setPurchaseOrder({purchase_order_id:id,order_date:'2024-01-01T10:00:00Z', supplier_id: 'sample_supplier', order_status:'調整中'});
                   setPurchaseOrderItems([{ purchase_order_id: id, product_id: 'sample_product', quantity: 10, unit_price: 100 }]);
            }
        };

      fetchPurchaseOrder();
  }, [id]);

    const handleAdjust = async () => {
        if (!purchaseOrder) return;

        try {
            const updates = {};

            if (adjustedOrderDate) {
                updates.order_date = adjustedOrderDate;
            }

            if (adjustedUnitPrice) {
               const updatedItems = purchaseOrderItems.map(item => ({
                    ...item,
                    unit_price: parseFloat(adjustedUnitPrice)
                  }));
                 
                
              for(const item of updatedItems){
                const { data, error } = await supabase
                    .from('purchase_order_items')
                    .update({ unit_price:item.unit_price })    
                     .eq('purchase_order_item_id',item.purchase_order_item_id);
                     if (error) {
                         console.error("Error updating item:", error);
                        return;
                    }
                
              }
            }
              
          if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
              .from('purchase_orders')
              .update(updates)
              .eq('purchase_order_id', id);

              if (updateError) {
                  console.error("Error updating purchase order:", updateError);
                    return;
              }
          }
            router.push(`/negotiation`);
        } catch (error) {
             console.error("An error occurred while adjusting:", error);
        }
    };

  if (!purchaseOrder) {
    return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center">
            <IconContext.Provider value={{ size: '1.5em', className: 'mr-2 text-gray-500 cursor-pointer' }}>
                    <Link href="/negotiation"  className="flex items-center">
                            <FaArrowLeft/>
                         <span className='text-gray-500 hover:text-gray-700'>戻る</span>
                    </Link>
                  </IconContext.Provider>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 ml-4">調整実行画面</h1>
            </div>
             {user ? <div className="text-gray-700">ようこそ、{user.user_name}さん</div> : <div className="text-gray-700">ログインしてください</div>}
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">発注情報</h3>
              </div>
              <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">発注ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{purchaseOrder.purchase_order_id}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">発注日</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{purchaseOrder.order_date}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">サプライヤーID</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{purchaseOrder.supplier_id}</dd>
                    </div>
                   <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">発注ステータス</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{purchaseOrder.order_status}</dd>
                    </div>
                  </dl>
              </div>
            </div>
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">発注商品</h3>
              </div>
                <div className="border-t border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        {purchaseOrderItems.map((item) => (
                            <li key={item.purchase_order_item_id} className="px-4 py-4 sm:px-6">
                                <div className="flex justify-between items-center">
                                      <div className="flex-1">
                                         <p className="text-sm font-medium text-gray-700">商品ID: {item.product_id}</p>
                                        <p className="text-sm text-gray-500">数量: {item.quantity}</p>
                                         <p className="text-sm text-gray-500">単価: {item.unit_price}</p>
                                        </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

           <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">調整フォーム</h3>
              </div>
               <div className="px-4 py-5 sm:px-6">
                    <label htmlFor="adjustedOrderDate" className="block text-sm font-medium text-gray-700">調整後納期:</label>
                    <input
                        type="datetime-local"
                        id="adjustedOrderDate"
                        value={adjustedOrderDate}
                       onChange={(e) => setAdjustedOrderDate(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
               <div className="px-4 py-5 sm:px-6">
                    <label htmlFor="adjustedUnitPrice" className="block text-sm font-medium text-gray-700">調整後単価:</label>
                    <input
                        type="number"
                        id="adjustedUnitPrice"
                        value={adjustedUnitPrice}
                        onChange={(e) => setAdjustedUnitPrice(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                 <div className="px-4 py-5 sm:px-6">
                 <button onClick={handleAdjust} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">調整実行</button>
                 </div>
          </div>
          </div>
      </main>
      <footer className="bg-gray-800 text-white text-center py-4">
        <p>&copy; 2024 受発注システム. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default NegotiationDetail;