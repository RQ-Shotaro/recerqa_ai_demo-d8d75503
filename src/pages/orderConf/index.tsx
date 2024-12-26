import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaHome, FaList, FaCheck, FaEdit } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const OrderConf = () => {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Sample order_id, replace with dynamic value if needed
        const orderId = 'sample-order-id';

        // Fetch orders data
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('order_id', orderId)
          .single();

        if (ordersError) {
          throw ordersError;
        }
        setOrder(ordersData);


        // Fetch order_items data
        const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

        if(itemsError){
          throw itemsError;
        }
        setOrderItems(itemsData);

      } catch (err:any) {
          console.error('Error fetching data:', err.message);
          setError('データ取得中にエラーが発生しました。');
          // Set sample data on error
            setOrder({
              order_id: 'sample-order-id',
              customer_id: 'sample-customer-id',
              order_date: '2024-03-10T12:00:00.000Z',
              order_status: 'pending',
            });
            setOrderItems([
                {
                    order_id: 'sample-order-id',
                    product_id: 'sample-product-id-1',
                    quantity: 2,
                    unit_price: 100,
                },
                {
                    order_id: 'sample-order-id',
                    product_id: 'sample-product-id-2',
                    quantity: 1,
                    unit_price: 250,
                }
            ])
      } finally {
          setLoading(false);
      }
    };

    fetchOrderData();
  }, []);

    const handleConfirm = () => {
        router.push('/orderComp');
    };

    const handleEdit = () => {
        router.push('/orderEdit');
    };

  return (
    <div className="min-h-screen h-full bg-gray-100 flex">
        <aside className="bg-gray-200 w-64 p-4 border-r">
                <nav>
                    <ul>
                    <li className="mb-2">
                        <Link href="/" className="flex items-center p-2 hover:bg-gray-300 rounded">
                        <FaHome className="mr-2" />
                        ホーム
                        </Link>
                    </li>
                    <li className="mb-2">
                        <Link href="/orderHist" className="flex items-center p-2 hover:bg-gray-300 rounded">
                        <FaList className="mr-2" />
                            発注履歴
                        </Link>
                    </li>
                    </ul>
                </nav>
        </aside>
        <main className="flex-1 p-4">

      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">発注内容確認</h1>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {order && (
          <div className="mb-8 bg-white shadow rounded p-4">
            <h2 className="text-xl font-semibold mb-2">発注情報</h2>
              <div className="grid grid-cols-2 gap-4">
                  <div className="">
                    <p><strong>発注ID:</strong> {order.order_id}</p>
                    <p><strong>顧客ID:</strong> {order.customer_id}</p>
                  </div>
                <div className="">
                  <p><strong>発注日:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
                    <p><strong>発注ステータス:</strong> {order.order_status}</p>
                </div>
              </div>
          </div>
        )}

        {orderItems && orderItems.length > 0 && (
            <div className="mb-8 bg-white shadow rounded p-4">
                <h2 className="text-xl font-semibold mb-2">発注商品</h2>
                <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                    <tr className="bg-gray-200">
                        <th className="px-4 py-2">商品ID</th>
                        <th className="px-4 py-2">数量</th>
                        <th className="px-4 py-2">単価</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orderItems.map((item) => (
                        <tr key={item.order_item_id} className="border-b">
                        <td className="px-4 py-2">{item.product_id}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">{item.unit_price}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
        )}
        <div className="flex justify-end space-x-4">
            <button onClick={handleEdit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                <FaEdit className="inline-block mr-2" />
                修正
            </button>
            <button onClick={handleConfirm} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                <FaCheck className="inline-block mr-2" />
                確認
            </button>
        </div>
      </div>
        </main>
    </div>
  );
};

export default OrderConf;
