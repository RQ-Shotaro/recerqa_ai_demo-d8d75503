import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaHome, FaCalendarAlt, FaSignOutAlt } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const DeliverySchedule: React.FC = () => {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchSession = async () => {
          const { data: { session } } = await supabase.auth.getSession()
          setUser(session?.user ?? null);
          if(!session?.user){
            router.push('/login')
          }
        }
        fetchSession();
      }, []);

    useEffect(() => {
      const fetchData = async () => {
          setLoading(true);
          setError(null);
    
          try {
            const { data: ordersData, error: ordersError } = await supabase
              .from('orders')
              .select('order_id, order_date');
    
            if (ordersError) {
              console.error('Error fetching orders:', ordersError.message);
                setError('Failed to fetch orders data.');
              setOrders([
                  { order_id: 'sample-order-1', order_date: '2024-03-08' },
                  { order_id: 'sample-order-2', order_date: '2024-03-10' },
                ])
            } else {
                setOrders(ordersData);
            }
    
            const { data: purchaseOrdersData, error: purchaseOrdersError } = await supabase
              .from('purchase_orders')
              .select('purchase_order_id, order_date');
    
            if (purchaseOrdersError) {
              console.error('Error fetching purchase orders:', purchaseOrdersError.message);
              setError('Failed to fetch purchase orders data.');
              setPurchaseOrders([
                  { purchase_order_id: 'sample-po-1', order_date: '2024-03-09' },
                  { purchase_order_id: 'sample-po-2', order_date: '2024-03-11' },
                ])
            } else {
                setPurchaseOrders(purchaseOrdersData);
            }
    
          } catch (err:any) {
              console.error('Unexpected error:', err.message);
              setError('An unexpected error occurred.');
            setOrders([
                { order_id: 'sample-order-1', order_date: '2024-03-08' },
                { order_id: 'sample-order-2', order_date: '2024-03-10' },
              ]);
            setPurchaseOrders([
                { purchase_order_id: 'sample-po-1', order_date: '2024-03-09' },
                { purchase_order_id: 'sample-po-2', order_date: '2024-03-11' },
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

    return (
        <div className="min-h-screen h-full flex">
          <aside className="bg-gray-800 text-white w-64 py-6 px-3">
                <div className="mb-8 text-center">
                  <img src="https://placehold.co/100x100/ffffff/000000?text=Logo" alt="Logo" className="mx-auto rounded-full" />
                   <p className="mt-2 text-sm">User: {user?.email}</p>
                </div>
                <nav>
                <Link href="/"  legacyBehavior>
                    <div className="flex items-center py-2 px-4 hover:bg-gray-700 rounded transition-colors duration-200 cursor-pointer">
                        <FaHome className="mr-2" />
                        <span className="text-sm">ホーム</span>
                    </div>
                </Link>
                <Link href="/deliverySchedule"  legacyBehavior>
                  <div className="flex items-center py-2 px-4 hover:bg-gray-700 rounded transition-colors duration-200 cursor-pointer">
                        <FaCalendarAlt className="mr-2" />
                        <span className="text-sm">入出荷スケジュール</span>
                    </div>
                </Link>
                    <div onClick={handleLogout} className="flex items-center py-2 px-4 hover:bg-gray-700 rounded transition-colors duration-200 cursor-pointer">
                        <FaSignOutAlt className="mr-2" />
                        <span className="text-sm">ログアウト</span>
                    </div>
                </nav>
            </aside>

            <main className="flex-1 bg-gray-100 p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-700">入出荷スケジュール</h1>

                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3 text-gray-700">発注データ</h2>
                    <div className="overflow-x-auto shadow-md rounded">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="py-2 px-4 border-b">発注ID</th>
                                <th className="py-2 px-4 border-b">発注日</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.order_id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{order.order_id}</td>
                                    <td className="py-2 px-4 border-b">{order.order_date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3 text-gray-700">仕入データ</h2>
                    <div className="overflow-x-auto shadow-md rounded">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="py-2 px-4 border-b">仕入ID</th>
                                <th className="py-2 px-4 border-b">発注日</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseOrders.map((po) => (
                                <tr key={po.purchase_order_id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{po.purchase_order_id}</td>
                                    <td className="py-2 px-4 border-b">{po.order_date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
                </div>
            </main>
        </div>
    );
};

export default DeliverySchedule;