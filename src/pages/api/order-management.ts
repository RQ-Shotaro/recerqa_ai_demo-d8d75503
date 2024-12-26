import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaBars, FaHome, FaList, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const Header = () => {
    const [user, setUser] = useState<Database['public']['Tables']['users']['Row'] | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user: fetchedUser }, error } = await supabase.auth.getUser();
            if(error){
              console.error("Error fetching user:", error);
              return;
            }
            if (fetchedUser) {
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', fetchedUser.id)
                    .single();
                if(userError){
                  console.error("Error fetching user data:", userError)
                  return;
                }
                setUser(userData);
            }
        };

        fetchUser();

        supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                const fetchUserData = async () => {
                  const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                  if(userError){
                   console.error("Error fetching user data:", userError)
                  }
                    setUser(userData);
                };
                fetchUserData()
            } else {
                setUser(null);
            }
        });
    }, []);


    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <header className="bg-gray-800 p-4 flex justify-between items-center">
            <div className="text-white font-bold text-xl">RECERQA AI</div>
            <nav>
                <ul className="flex space-x-6">
                    {user ? (
                        <>
                            <li><Link href="/" className="text-gray-300 hover:text-white flex items-center"><FaHome className="mr-1" /> ホーム</Link></li>
                            <li><Link href="/order/list" className="text-gray-300 hover:text-white flex items-center"><FaList className="mr-1"/> 受発注一覧</Link></li>
                            <li><button onClick={handleSignOut} className="text-gray-300 hover:text-white flex items-center"><FaSignOutAlt className="mr-1" /> サインアウト</button></li>
                        </>
                    ) : (
                        <li><Link href="/login" className="text-gray-300 hover:text-white flex items-center"><FaUser className="mr-1" /> ログイン</Link></li>
                    )}
                </ul>
            </nav>
        </header>
    );
};

const SideMenu = () => {
    return (
        <aside className="bg-gray-700 text-white w-64 min-h-screen p-4">
            <h2 className="font-bold text-xl mb-4">メニュー</h2>
            <ul>
                <li className="mb-2"><Link href="/" className="block hover:bg-gray-600 p-2 rounded"><FaHome className="inline mr-2" /> ホーム</Link></li>
                  <li className="mb-2"><Link href="/order/list" className="block hover:bg-gray-600 p-2 rounded"><FaList className="inline mr-2" /> 受発注一覧</Link></li>
                 <li className="mb-2"><Link href="/setting" className="block hover:bg-gray-600 p-2 rounded"><FaCog className="inline mr-2"/> 設定</Link></li>
            </ul>
        </aside>
    );
};

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white text-center p-4">
            <p>&copy; 2024 RECERQA AI. All rights reserved.</p>
        </footer>
    );
};

const OrderList = () => {
    const [orders, setOrders] = useState<Database['public']['Tables']['orders']['Row'][]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<Database['public']['Tables']['purchase_orders']['Row'][]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);

                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select('order_id, order_date, customer_id, order_status');

                if (ordersError) {
                    console.error("Error fetching orders:", ordersError);
                    setError("注文データの取得に失敗しました。");
                    setOrders([
                      {
                          order_id: 'sample-order-001' as any,
                          order_date: '2024-07-27T10:00:00' as any,
                          customer_id: 'sample-customer-001' as any,
                          order_status: 'Pending'
                        },
                        {
                            order_id: 'sample-order-002' as any,
                            order_date: '2024-07-26T14:30:00' as any,
                            customer_id: 'sample-customer-002' as any,
                            order_status: 'Processing'
                        }
                     ]);
                    return;
                }else{
                 setOrders(ordersData || []);
                }


                const { data: purchaseOrdersData, error: purchaseOrdersError } = await supabase
                    .from('purchase_orders')
                    .select('purchase_order_id, order_date, supplier_id, order_status');

                if (purchaseOrdersError) {
                   console.error("Error fetching purchase orders:", purchaseOrdersError);
                    setError("発注データの取得に失敗しました。");
                      setPurchaseOrders([
                          {
                             purchase_order_id: 'sample-purchase-001' as any,
                             order_date: '2024-07-25T11:00:00' as any,
                             supplier_id: 'sample-supplier-001' as any,
                             order_status: 'Pending'
                         },
                         {
                             purchase_order_id: 'sample-purchase-002' as any,
                             order_date: '2024-07-24T16:00:00' as any,
                              supplier_id: 'sample-supplier-002' as any,
                             order_status: 'Shipped'
                           }
                       ]);
                    return;
                }else{
                 setPurchaseOrders(purchaseOrdersData || []);
                }

            } catch (err) {
                console.error("Unexpected error:", err);
                setError("予期せぬエラーが発生しました。");
                  setOrders([
                      {
                          order_id: 'sample-order-001' as any,
                          order_date: '2024-07-27T10:00:00' as any,
                          customer_id: 'sample-customer-001' as any,
                          order_status: 'Pending'
                        },
                        {
                            order_id: 'sample-order-002' as any,
                            order_date: '2024-07-26T14:30:00' as any,
                            customer_id: 'sample-customer-002' as any,
                            order_status: 'Processing'
                        }
                     ]);
                    setPurchaseOrders([
                        {
                           purchase_order_id: 'sample-purchase-001' as any,
                           order_date: '2024-07-25T11:00:00' as any,
                           supplier_id: 'sample-supplier-001' as any,
                           order_status: 'Pending'
                       },
                       {
                           purchase_order_id: 'sample-purchase-002' as any,
                           order_date: '2024-07-24T16:00:00' as any,
                            supplier_id: 'sample-supplier-002' as any,
                           order_status: 'Shipped'
                         }
                     ]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
    }

    if (error) {
        return <div className="min-h-screen h-full flex justify-center items-center text-red-500">{error}</div>;
    }

    return (
          <div className="min-h-screen h-full flex">
            <SideMenu />
            <main className="flex-1 p-4">
                <Header />
               <h1 className="text-2xl font-bold mb-4">受発注一覧</h1>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">注文データ</h2>
                     {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注文ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注文日</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客ID</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.order_id} className="hover:bg-gray-100">
                                        <td className="px-6 py-4 whitespace-nowrap">{order.order_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(order.order_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{order.customer_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{order.order_status}</td>
                                     </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                    ) : (
                    <p>注文データがありません。</p>
                     )}
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">発注データ</h2>
                     {purchaseOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                         <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">発注ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注文日</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">サプライヤーID</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseOrders.map((po) => (
                                   <tr key={po.purchase_order_id} className="hover:bg-gray-100">
                                        <td className="px-6 py-4 whitespace-nowrap">{po.purchase_order_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(po.order_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{po.supplier_id}</td>
                                         <td className="px-6 py-4 whitespace-nowrap">{po.order_status}</td>
                                     </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    ) : (
                     <p>発注データがありません。</p>
                      )}
                </section>
             </main>
        <Footer />
       </div>
    );
};

export default OrderList;