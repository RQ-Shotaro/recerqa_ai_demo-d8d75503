import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaArrowLeft, FaHome, FaCalendarAlt } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const DeliveryDetail = () => {
  const router = useRouter();
  const { deliveryId } = router.query;
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any>(null);
  const [purchaseOrderItems, setPurchaseOrderItems] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (deliveryId) {
      fetchData();
    }
  }, [deliveryId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch order details
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('order_id, customer_id, order_date, order_status')
        .eq('order_id', deliveryId)
        .single();

      if (ordersError) {
        throw new Error(`注文情報の取得に失敗しました: ${ordersError.message}`);
      }
      setOrderDetails(ordersData);

       // Fetch order items
      const { data: orderItemsData, error: orderItemsError } = await supabase
          .from('order_items')
          .select('order_id, product_id, quantity, unit_price')
          .eq('order_id', deliveryId);

        if (orderItemsError) {
          throw new Error(`注文アイテムの取得に失敗しました: ${orderItemsError.message}`);
        }
        setOrderItems(orderItemsData);

      // Fetch purchase order details
      const { data: purchaseOrdersData, error: purchaseOrdersError } = await supabase
        .from('purchase_orders')
        .select('purchase_order_id, supplier_id, order_date, order_status')
        .eq('purchase_order_id', deliveryId)
        .single();

      if (purchaseOrdersError) {
          throw new Error(`仕入注文情報の取得に失敗しました: ${purchaseOrdersError.message}`);
        }
        setPurchaseOrders(purchaseOrdersData);

        // Fetch purchase order items
        const { data: purchaseOrderItemsData, error: purchaseOrderItemsError } = await supabase
          .from('purchase_order_items')
          .select('purchase_order_id, product_id, quantity, unit_price')
          .eq('purchase_order_id', deliveryId);

        if (purchaseOrderItemsError) {
          throw new Error(`仕入注文アイテムの取得に失敗しました: ${purchaseOrderItemsError.message}`);
        }
        setPurchaseOrderItems(purchaseOrderItemsData);
      
    } catch (err:any) {
      setError(err.message);
      console.error(err);
      // Set default data when error occurs
       setOrderDetails({
        order_id: 'default-order-id',
        customer_id: 'default-customer-id',
        order_date: '2024-01-01T12:00:00',
        order_status: 'default-status'
      });
      setOrderItems([
        {
          order_id: 'default-order-id',
          product_id: 'default-product-id',
          quantity: 1,
          unit_price: 100
        }
      ])
      setPurchaseOrders({
         purchase_order_id: 'default-purchase-order-id',
        supplier_id: 'default-supplier-id',
        order_date: '2024-01-01T12:00:00',
        order_status: 'default-status'
      })
       setPurchaseOrderItems([
          {
           purchase_order_id: 'default-purchase-order-id',
            product_id: 'default-product-id',
            quantity: 1,
            unit_price: 100
          }
        ])
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
  }

  if (error) {
      return (
      <div className="min-h-screen h-full flex justify-center items-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">エラーが発生しました:</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }


  return (
     <div className="min-h-screen h-full bg-gray-100">
      <Header />
        <div className="flex">
        <SideMenu />
          <main className="flex-1 p-4">
          <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-700">入出荷詳細</h2>
          
              <h3 className="text-xl font-semibold mb-4 text-gray-700">注文情報</h3>
              {orderDetails && (
                <div className="mb-6">
                  <p className="text-gray-600"><span className="font-semibold">注文ID:</span> {orderDetails.order_id}</p>
                  <p className="text-gray-600"><span className="font-semibold">顧客ID:</span> {orderDetails.customer_id}</p>
                  <p className="text-gray-600"><span className="font-semibold">注文日:</span> {orderDetails.order_date}</p>
                  <p className="text-gray-600"><span className="font-semibold">ステータス:</span> {orderDetails.order_status}</p>
                </div>
              )}
          
              <h3 className="text-xl font-semibold mb-4 text-gray-700">注文アイテム</h3>
                {orderItems.length > 0 ? (
                    <ul className="mb-6">
                        {orderItems.map((item: any) => (
                        <li key={item.product_id} className="text-gray-600">
                            <span className="font-semibold">商品ID:</span> {item.product_id}, <span className="font-semibold">数量:</span> {item.quantity}, <span className="font-semibold">単価:</span> {item.unit_price}
                         </li>
                      ))}
                    </ul>
                    ) : (
                  <p className="text-gray-600">注文アイテムがありません</p>
                 )}
          
              <h3 className="text-xl font-semibold mb-4 text-gray-700">仕入注文情報</h3>
              {purchaseOrders && (
                <div className="mb-6">
                  <p className="text-gray-600"><span className="font-semibold">仕入注文ID:</span> {purchaseOrders.purchase_order_id}</p>
                  <p className="text-gray-600"><span className="font-semibold">仕入先ID:</span> {purchaseOrders.supplier_id}</p>
                  <p className="text-gray-600"><span className="font-semibold">注文日:</span> {purchaseOrders.order_date}</p>
                  <p className="text-gray-600"><span className="font-semibold">ステータス:</span> {purchaseOrders.order_status}</p>
               </div>
            )}
          
               <h3 className="text-xl font-semibold mb-4 text-gray-700">仕入注文アイテム</h3>
              {purchaseOrderItems.length > 0 ? (
                  <ul className="mb-6">
                   {purchaseOrderItems.map((item: any) => (
                       <li key={item.product_id} className="text-gray-600">
                            <span className="font-semibold">商品ID:</span> {item.product_id}, <span className="font-semibold">数量:</span> {item.quantity}, <span className="font-semibold">単価:</span> {item.unit_price}
                       </li>
                      ))}
                  </ul>
                   ) : (
                 <p className="text-gray-600">仕入注文アイテムがありません</p>
                   )}
          </div>
        </main>
      </div>
    </div>
  );
};

const Header = () => {
  return (
    <header className="bg-blue-500 p-4 text-white flex justify-between items-center">
      <Link href="/" className="flex items-center space-x-2">
        <FaHome className="text-2xl" />
        <span className="text-xl font-bold">RECERQA</span>
      </Link>
     </header>
  );
};


const SideMenu = () => {
    return (
        <aside className="bg-gray-200 w-64 p-4">
          <nav>
            <ul className="space-y-2">
            <li>
            <Link href="/calendar" className="flex items-center space-x-2 hover:bg-gray-300 p-2 rounded">
                    <FaCalendarAlt className="text-xl" />
                    <span>カレンダー</span>
            </Link>
              </li>
            </ul>
         </nav>
    </aside>
   );
};
export default DeliveryDetail;