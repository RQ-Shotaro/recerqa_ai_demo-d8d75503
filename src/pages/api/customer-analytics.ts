import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaChartBar, FaUsers, FaHome, FaSignOutAlt } from 'react-icons/fa';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const CustomerAnalytics: React.FC = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
    };
    fetchSession();

     const fetchData = async () => {
      setLoading(true);
      try {
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('customer_id, customer_name');

        if (customersError) {
          console.error('Error fetching customers:', customersError);
          setError('顧客データの取得に失敗しました。');
          setCustomers([
            {
                customer_id: 'sample_id_1',
                customer_name: 'サンプル顧客1'
            },
             {
                customer_id: 'sample_id_2',
                customer_name: 'サンプル顧客2'
            },
          ])
        }else{
          setCustomers(customersData || []);
        }

        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('customer_id, order_date, order_status');

        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
          setError('注文データの取得に失敗しました。');
           setOrders([
             {
                customer_id: 'sample_id_1',
                order_date:'2024-01-01',
                order_status: '完了'
             },
              {
                customer_id: 'sample_id_2',
                order_date:'2024-01-02',
                order_status: '処理中'
            },
          ])
        } else {
          setOrders(ordersData || []);
        }

      } catch (err:any) {
        console.error('Unexpected error:', err);
        setError('予期せぬエラーが発生しました。');
         setCustomers([
            {
                customer_id: 'sample_id_1',
                customer_name: 'サンプル顧客1'
            },
             {
                customer_id: 'sample_id_2',
                customer_name: 'サンプル顧客2'
            },
          ])
         setOrders([
             {
                customer_id: 'sample_id_1',
                order_date:'2024-01-01',
                order_status: '完了'
             },
              {
                customer_id: 'sample_id_2',
                order_date:'2024-01-02',
                order_status: '処理中'
            },
          ])
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

   const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen h-full">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex justify-center items-center min-h-screen h-full">
        <p className="text-red-500">エラー: {error}</p>
      </div>
    );
  }

   if (!user) {
        return (
             <div className="flex justify-center items-center min-h-screen h-full">
             <p>ログインしてください</p>
                 <Link href='/login' className='text-blue-500'>ログインページへ</Link>
            </div>
        )
    }

  return (
    <div className="min-h-screen h-full bg-gray-100">
       <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">得意先分析</h1>
            <div className="flex items-center">
                <button onClick={handleLogout} className="flex items-center hover:text-gray-300 focus:outline-none">
                    <FaSignOutAlt className="mr-2" /> ログアウト
                </button>
            </div>
        </header>
      <div className="flex">
        <aside className="w-64 bg-gray-200 p-4">
           <nav>
                 <Link href="/" className="block py-2 px-4 hover:bg-gray-300 flex items-center">
                     <FaHome className="mr-2" /> ホーム
                 </Link>
                  <Link href="/customerAnalytics" className="block py-2 px-4 hover:bg-gray-300 flex items-center bg-gray-300">
                    <FaChartBar className="mr-2"/> 得意先分析
                  </Link>
                 <Link href='/supplierAnalytics' className="block py-2 px-4 hover:bg-gray-300 flex items-center">
                     <FaUsers className="mr-2"/> 仕入先分析
                 </Link>
             </nav>
        </aside>

        <main className="flex-1 p-4">
        <h2 className="text-2xl font-bold mb-4">得意先データ</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">顧客一覧</h3>
              <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b">顧客ID</th>
                    <th className="py-2 px-4 border-b">顧客名</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer:any) => (
                    <tr key={customer.customer_id} className='hover:bg-gray-100'>
                      <td className="py-2 px-4 border-b">{customer.customer_id}</td>
                      <td className="py-2 px-4 border-b">{customer.customer_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

          <div>
              <h3 className="text-xl font-semibold mb-2">注文データ</h3>
              <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b">顧客ID</th>
                    <th className="py-2 px-4 border-b">注文日</th>
                    <th className="py-2 px-4 border-b">注文状況</th>
                  </tr>
                </thead>
                <tbody>
                   {orders.map((order:any) => (
                    <tr key={order.customer_id + order.order_date} className='hover:bg-gray-100'>
                      <td className="py-2 px-4 border-b">{order.customer_id}</td>
                      <td className="py-2 px-4 border-b">{order.order_date}</td>
                      <td className="py-2 px-4 border-b">{order.order_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
               </div>
             </div>
           </div>
           <div className="mt-8">
              <h3 className="text-xl font-semibold mb-2">チャート</h3>
                 <img src='https://placehold.co/600x300/007bff/ffffff?text=Chart+Image' alt='Chart Placeholder'  className='w-full h-auto'/>
              </div>
         </main>
      </div>
    </div>
  );
};

export default CustomerAnalytics;
