import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaHome, FaList, FaUser } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);


const OrderHist = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('order_id, customer_id, order_date, order_status');

        if (error) {
          console.error('Supabaseからデータを取得できませんでした:', error);
           // Sample data in case of error
          setOrders([
                {
                  order_id: 'sample-001',
                  customer_id: 'cust-001',
                  order_date: '2024-07-27T10:00:00Z',
                  order_status: '処理中',
                },
                {
                  order_id: 'sample-002',
                  customer_id: 'cust-002',
                  order_date: '2024-07-26T14:30:00Z',
                   order_status: '完了',
                },
              ]);
        } else {
          setOrders(data);
        }
      } catch (err: any) {
         console.error('データの取得中にエラーが発生しました:', err);
          setError('データの取得中にエラーが発生しました。');
             // Sample data in case of error
          setOrders([
                {
                  order_id: 'sample-001',
                  customer_id: 'cust-001',
                  order_date: '2024-07-27T10:00:00Z',
                  order_status: '処理中',
                },
                {
                  order_id: 'sample-002',
                  customer_id: 'cust-002',
                  order_date: '2024-07-26T14:30:00Z',
                   order_status: '完了',
                },
              ]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

    const handleRowClick = (orderId: string) => {
        router.push(`/orderDetail?id=${orderId}`);
    };

  return (
    <div className="min-h-screen h-full bg-gray-100">
        <aside className="bg-gray-800 text-white w-64 p-4 fixed h-full">
          <nav>
          <Link href="/" legacyBehavior>
              <div className="flex items-center py-2 px-4 hover:bg-gray-700 rounded cursor-pointer">
                <FaHome className="mr-2" />
                ホーム
              </div>
            </Link>
            <Link href="/orderHist" legacyBehavior>
                <div className="flex items-center py-2 px-4 hover:bg-gray-700 rounded cursor-pointer">
                    <FaList className="mr-2" />
                    発注履歴一覧
                </div>
            </Link>
             <Link href="/profile" legacyBehavior>
              <div className="flex items-center py-2 px-4 hover:bg-gray-700 rounded cursor-pointer">
                <FaUser className="mr-2" />
                プロフィール
              </div>
            </Link>
           </nav>
        </aside>
      <div className="ml-64 p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">発注履歴一覧</h1>
        {loading && <p className="text-gray-600">データを読み込み中...</p>}
        {error && <p className="text-red-500">エラー: {error}</p>}
        {!loading && !error && orders.length === 0 && <p className="text-gray-600">発注履歴はありません。</p>}

        {!loading && !error && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 border-b text-left">発注ID</th>
                  <th className="py-2 px-4 border-b text-left">顧客ID</th>
                  <th className="py-2 px-4 border-b text-left">発注日</th>
                  <th className="py-2 px-4 border-b text-left">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.order_id} className="hover:bg-gray-100 cursor-pointer" onClick={() => handleRowClick(order.order_id)}>
                    <td className="py-2 px-4 border-b">{order.order_id}</td>
                    <td className="py-2 px-4 border-b">{order.customer_id}</td>
                    <td className="py-2 px-4 border-b">{new Date(order.order_date).toLocaleString()}</td>
                    <td className="py-2 px-4 border-b">{order.order_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHist;
