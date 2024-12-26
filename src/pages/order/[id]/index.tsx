import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaHome, FaClipboardList, FaCog, FaUser, FaArrowLeft } from 'react-icons/fa';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);


const OrderDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState(null);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [purchaseOrderItems, setPurchaseOrderItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch order details
        const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('order_id, order_date, customer_id, order_status')
            .eq('order_id', id)
            .single();

        if (ordersError) {
          throw new Error(`Error fetching order: ${ordersError.message}`);
        }
          setOrder(ordersData);
          
          // Fetch order items
         const { data: orderItemsData, error: orderItemsError } = await supabase
            .from('order_items')
            .select('order_item_id, order_id, product_id, quantity, unit_price')
            .eq('order_id', id);
          if(orderItemsError){
            throw new Error(`Error fetching order items: ${orderItemsError.message}`);
          }
          setOrderItems(orderItemsData);

        // Fetch related purchase order details
        const { data: purchaseOrdersData, error: purchaseOrdersError } = await supabase
          .from('purchase_orders')
          .select('purchase_order_id, order_date, supplier_id, order_status')
          .eq('purchase_order_id', id)
          .single();
        if(purchaseOrdersError){
            throw new Error(`Error fetching purchase order: ${purchaseOrdersError.message}`);
        }
        setPurchaseOrder(purchaseOrdersData);

        //Fetch purchase order items
        const { data: purchaseOrderItemsData, error: purchaseOrderItemsError } = await supabase
          .from('purchase_order_items')
          .select('purchase_order_item_id, purchase_order_id, product_id, quantity, unit_price')
          .eq('purchase_order_id', id);
         if(purchaseOrderItemsError){
            throw new Error(`Error fetching purchase order items: ${purchaseOrderItemsError.message}`);
          }
          setPurchaseOrderItems(purchaseOrderItemsData);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen h-full flex justify-center items-center">読み込み中...</div>;
  }

  if (error) {
    return <div className="min-h-screen h-full flex justify-center items-center text-red-500">エラーが発生しました: {error}</div>;
  }

  if (!order && !purchaseOrder) {
      return <div className="min-h-screen h-full flex justify-center items-center">データが見つかりません。</div>;
  }
    
  const handleStatusChange = async (newStatus: string) => {
        setLoading(true);
        setError(null);
        try {
            if(order){
            const { error } = await supabase
              .from('orders')
              .update({ order_status: newStatus })
              .eq('order_id', id);
            if (error) {
                throw new Error(`Failed to update order status: ${error.message}`);
            }
            setOrder({...order, order_status: newStatus});
          }
            if(purchaseOrder){
              const {error} = await supabase
                  .from('purchase_orders')
                  .update({ order_status: newStatus })
                  .eq('purchase_order_id', id);
              if(error){
                  throw new Error(`Failed to update purchase order status: ${error.message}`);
              }
            setPurchaseOrder({...purchaseOrder, order_status: newStatus});
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
  };
    

  return (
    <div className="min-h-screen h-full bg-gray-100 flex">
     <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <div className="mb-8">
          <Link href="/" className="flex items-center mb-4 px-4 py-2 hover:bg-gray-700 rounded">
            <FaHome className="mr-2" /> ホーム
          </Link>
          <Link href="/order" className="flex items-center mb-4 px-4 py-2 hover:bg-gray-700 rounded">
             <FaClipboardList className="mr-2" /> 受発注一覧
          </Link>
          <Link href="/settings" className="flex items-center mb-4 px-4 py-2 hover:bg-gray-700 rounded">
            <FaCog className="mr-2" /> 設定
          </Link>
          <Link href="/profile" className="flex items-center mb-4 px-4 py-2 hover:bg-gray-700 rounded">
            <FaUser className="mr-2" /> プロフィール
          </Link>
          
        </div>
      </aside>

      <main className="flex-1 p-4">
      <div className="mb-4 flex items-center">
          <button onClick={() => router.back()} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center mr-2">
              <FaArrowLeft className="mr-2" /> 戻る
            </button>
          <h2 className="text-2xl font-bold text-gray-800">受発注詳細</h2>
        </div>
        <div className="bg-white shadow rounded p-4">
            {order && (
                <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">注文情報</h3>
                    <p><strong>注文ID:</strong> {order.order_id}</p>
                    <p><strong>注文日:</strong> {order.order_date}</p>
                     <p><strong>顧客ID:</strong> {order.customer_id}</p>
                    <p><strong>注文ステータス:</strong> {order.order_status}</p>
                    
                </div>
                )}
            {orderItems && orderItems.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">注文明細</h3>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 px-4 py-2">明細ID</th>
                                    <th className="border border-gray-300 px-4 py-2">商品ID</th>
                                     <th className="border border-gray-300 px-4 py-2">数量</th>
                                    <th className="border border-gray-300 px-4 py-2">単価</th>
                                 </tr>
                            </thead>
                            <tbody>
                            {orderItems.map((item) => (
                                    <tr key={item.order_item_id}>
                                        <td className="border border-gray-300 px-4 py-2">{item.order_item_id}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.product_id}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.unit_price}</td>
                                    </tr>
                            ))}
                            </tbody>
                        </table>
                </div>
            )}
            {purchaseOrder && (
                 <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">仕入情報</h3>
                    <p><strong>仕入ID:</strong> {purchaseOrder.purchase_order_id}</p>
                    <p><strong>注文日:</strong> {purchaseOrder.order_date}</p>
                     <p><strong>仕入先ID:</strong> {purchaseOrder.supplier_id}</p>
                    <p><strong>注文ステータス:</strong> {purchaseOrder.order_status}</p>
                    
                </div>
            )}
            {purchaseOrderItems && purchaseOrderItems.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">仕入明細</h3>
                    <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 px-4 py-2">明細ID</th>
                                    <th className="border border-gray-300 px-4 py-2">商品ID</th>
                                     <th className="border border-gray-300 px-4 py-2">数量</th>
                                    <th className="border border-gray-300 px-4 py-2">単価</th>
                                 </tr>
                            </thead>
                            <tbody>
                            {purchaseOrderItems.map((item) => (
                                    <tr key={item.purchase_order_item_id}>
                                        <td className="border border-gray-300 px-4 py-2">{item.purchase_order_item_id}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.product_id}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.unit_price}</td>
                                    </tr>
                            ))}
                            </tbody>
                        </table>
                </div>
            )}
            <div className="flex justify-end">
               {order && (
                  <select
                    className="border p-2 rounded mr-2"
                    value={order.order_status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="pending">保留中</option>
                    <option value="processing">処理中</option>
                    <option value="shipped">発送済</option>
                    <option value="completed">完了</option>
                    <option value="cancelled">キャンセル</option>
                  </select>
               )}
                {purchaseOrder && (
                  <select
                    className="border p-2 rounded mr-2"
                    value={purchaseOrder.order_status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="pending">保留中</option>
                    <option value="processing">処理中</option>
                      <option value="ordered">発注済</option>
                    <option value="completed">完了</option>
                    <option value="cancelled">キャンセル</option>
                  </select>
               )}
            <Link href={`/order/edit/${id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                編集
              </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetail;
