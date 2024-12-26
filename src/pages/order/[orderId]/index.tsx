import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import {FaEdit, FaHistory} from 'react-icons/fa';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const OrderDetail = () => {
    const router = useRouter();
    const { orderId } = router.query;
    const [orderData, setOrderData] = useState<any>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [purchaseOrderData, setPurchaseOrderData] = useState<any>(null);
    const [purchaseOrderItems, setPurchaseOrderItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        if (orderId) {
          const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('order_id', orderId)
            .single();

          if (orderError) {
            setError(`Failed to fetch order data: ${orderError.message}`);
            setOrderData({
              order_id: 'SAMPLE-ORDER-ID', customer_id: 'SAMPLE-CUSTOMER-ID', order_date: '2024-01-01', order_status: 'Pending',
            });
             setLoading(false);
             return;
          } else {
            setOrderData(orders);
          }

          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

            if(itemsError){
                setError(`Failed to fetch order items: ${itemsError.message}`);
                setOrderItems([{
                    order_id: 'SAMPLE-ORDER-ID', product_id: 'SAMPLE-PRODUCT-ID', quantity: 1, unit_price: 100,
                }]);
                 setLoading(false);
                 return;
            } else {
                setOrderItems(items);
            }

           const { data: purchaseOrders, error: purchaseOrderError } = await supabase
                .from('purchase_orders')
                .select('*')
                 .eq('purchase_order_id', orderId)
                .single();
           if(purchaseOrderError){
                setError(`Failed to fetch purchase order: ${purchaseOrderError.message}`);
                setPurchaseOrderData({
                    purchase_order_id: 'SAMPLE-PURCHASE-ORDER-ID', supplier_id: 'SAMPLE-SUPPLIER-ID', order_date: '2024-01-01', order_status: 'Pending',
                });
                 setLoading(false);
                return;
            } else {
                setPurchaseOrderData(purchaseOrders);
            }
           const { data: purchaseItems, error: purchaseItemsError } = await supabase
                .from('purchase_order_items')
                .select('*')
                .eq('purchase_order_id', orderId);
           if(purchaseItemsError){
                setError(`Failed to fetch purchase items: ${purchaseItemsError.message}`);
                setPurchaseOrderItems([{
                    purchase_order_id: 'SAMPLE-PURCHASE-ORDER-ID', product_id: 'SAMPLE-PRODUCT-ID', quantity: 1, unit_price: 100,
                }]);
                 setLoading(false);
                return;
            }
            else {
                setPurchaseOrderItems(purchaseItems);
            }
        } else {
              setError('Order ID is missing.');
        }
      } catch (err:any) {
        setError(`An unexpected error occurred: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen h-full flex justify-center items-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Header />
      <div className="flex">
        <SideMenu />
        <main className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-4">受発注データ詳細</h1>

          {orderData && (
            <div className="bg-white shadow rounded p-4 mb-4">
              <h2 className="text-xl font-semibold mb-2">注文情報</h2>
              <div className='mb-2'>
                <strong>注文ID:</strong> {orderData.order_id}
              </div>
               <div className='mb-2'>
                 <strong>顧客ID:</strong> {orderData.customer_id}
              </div>
               <div className='mb-2'>
                <strong>注文日:</strong> {orderData.order_date}
              </div>
               <div className='mb-2'>
                <strong>注文ステータス:</strong> {orderData.order_status}
              </div>
              <h3 className="text-lg font-semibold mt-4 mb-2">注文商品</h3>
              <ul className="list-disc list-inside">
                {orderItems.map((item:any) => (
                  <li key={item.order_item_id} className='mb-1'>
                    商品ID: {item.product_id}, 数量: {item.quantity}, 単価: {item.unit_price}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {purchaseOrderData && (
            <div className="bg-white shadow rounded p-4 mb-4">
               <h2 className="text-xl font-semibold mb-2">仕入情報</h2>
              <div className='mb-2'>
                <strong>仕入ID:</strong> {purchaseOrderData.purchase_order_id}
              </div>
              <div className='mb-2'>
                <strong>サプライヤーID:</strong> {purchaseOrderData.supplier_id}
              </div>
              <div className='mb-2'>
                <strong>注文日:</strong> {purchaseOrderData.order_date}
              </div>
              <div className='mb-2'>
                <strong>注文ステータス:</strong> {purchaseOrderData.order_status}
              </div>
              <h3 className="text-lg font-semibold mt-4 mb-2">仕入商品</h3>
              <ul className="list-disc list-inside">
                {purchaseOrderItems.map((item:any) => (
                  <li key={item.purchase_order_item_id} className='mb-1'>
                    商品ID: {item.product_id}, 数量: {item.quantity}, 単価: {item.unit_price}
                  </li>
                ))}
              </ul>
            </div>
          )}
            <div className="flex justify-end mt-4">
            <Link href={`/order/edit/${orderId}`}  className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2'>
                <FaEdit className="inline mr-1" />編集
            </Link>
            <Link href={`/order/history/${orderId}`}  className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'>
                <FaHistory className="inline mr-1" />取引履歴
            </Link>
           </div>
        </main>
      </div>
    </div>
  );
};

const Header = () => (
  <header className="bg-blue-500 p-4 text-white">
    <div className="container mx-auto flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">RECERQA AI</Link>
    </div>
  </header>
);

const SideMenu = () => (
    <aside className="bg-gray-200 w-64 p-4">
        <nav>
            <ul>
                <li className="mb-2">
                    <Link href="/" className="block hover:bg-gray-300 p-2 rounded">ホーム</Link>
                </li>
                <li className="mb-2">
                    <Link href="/order" className="block hover:bg-gray-300 p-2 rounded">受発注一覧</Link>
                </li>
                <li className="mb-2">
                    <Link href="/product" className="block hover:bg-gray-300 p-2 rounded">商品一覧</Link>
                </li>
                   <li className="mb-2">
                   <Link href="/customer" className="block hover:bg-gray-300 p-2 rounded">顧客一覧</Link>
               </li>
                <li className="mb-2">
                    <Link href="/supplier" className="block hover:bg-gray-300 p-2 rounded">サプライヤー一覧</Link>
                </li>
                 <li className="mb-2">
                  <Link href="/setting" className="block hover:bg-gray-300 p-2 rounded">設定</Link>
               </li>
            </ul>
        </nav>
    </aside>
);

export default OrderDetail;
