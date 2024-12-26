import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaChartBar, FaListUl, FaTasks, FaBoxOpen } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select('order_id,order_date,order_status');
                if (ordersError) {
                    throw ordersError;
                }
                setOrders(ordersData || []);

                const { data: purchaseOrdersData, error: purchaseOrdersError } = await supabase
                    .from('purchase_orders')
                    .select('purchase_order_id,order_date,order_status');
                if (purchaseOrdersError) {
                    throw purchaseOrdersError;
                }
                setPurchaseOrders(purchaseOrdersData || []);
            } catch (err) {
                setError(err.message || 'データの取得に失敗しました');
                setOrders([
                    { order_id: '1', order_date: '2024-08-01', order_status: '処理中' },
                    { order_id: '2', order_date: '2024-08-02', order_status: '完了' },
                ]);
                 setPurchaseOrders([
                    { purchase_order_id: '1', order_date: '2024-08-01', order_status: '処理中' },
                    { purchase_order_id: '2', order_date: '2024-08-02', order_status: '完了' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const orderStatusCounts = orders.reduce((acc, order) => {
        acc[order.order_status] = (acc[order.order_status] || 0) + 1;
        return acc;
    }, {});

    const purchaseOrderStatusCounts = purchaseOrders.reduce((acc, po) => {
        acc[po.order_status] = (acc[po.order_status] || 0) + 1;
        return acc;
    }, {});
    const chartData = [
        {
            name: '受注', 
            ...orderStatusCounts
        },
        {
            name: '発注', 
            ...purchaseOrderStatusCounts
        }
    ];

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('ログアウトに失敗しました:', error.message);
        } else {
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Header onLogout={handleLogout} />
            <div className="flex">
                <SideMenu />
                <main className="flex-1 p-4">
                    <h1 className="text-2xl font-semibold mb-6 text-gray-700">受発注ダッシュボード</h1>
                    {loading && <p>Loading...</p>}
                    {error && <p className="text-red-500">エラー: {error}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white shadow rounded p-4 flex items-center">
                             <div className="mr-4"><FaBoxOpen size={32} className="text-blue-500"/></div>
                            <div>
                                <h3 className="font-semibold text-gray-700">受注状況サマリー</h3>
                                <p className="text-gray-600">合計受注数: {orders.length}</p>
                                <div className="text-sm mt-2">
                                    {Object.entries(orderStatusCounts).map(([status, count]) => (
                                        <p key={status}><span className="font-medium">{status}:</span> {count}件</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white shadow rounded p-4 flex items-center">
                             <div className="mr-4"><FaBoxOpen size={32} className="text-green-500"/></div>
                            <div>
                            <h3 className="font-semibold text-gray-700">発注状況サマリー</h3>
                                <p className="text-gray-600">合計発注数: {purchaseOrders.length}</p>
                                <div className="text-sm mt-2">
                                    {Object.entries(purchaseOrderStatusCounts).map(([status, count]) => (
                                        <p key={status}><span className="font-medium">{status}:</span> {count}件</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                         <div className="bg-white shadow rounded p-4 flex items-center">
                         <div className="mr-4"><FaTasks size={32} className="text-yellow-500"/></div>
                            <div>
                                <h3 className="font-semibold text-gray-700">未処理タスク</h3>
                                <ul className="text-gray-600">
                                    <li>未処理の受注: {orders.filter(order => order.order_status === '未処理').length} 件</li>
                                    <li>未処理の発注: {purchaseOrders.filter(po => po.order_status === '未処理').length} 件</li>
                                </ul>
                            </div>
                        </div>
                        <div className="bg-white shadow rounded p-4 flex items-center">
                             <div className="mr-4"><FaChartBar size={32} className="text-purple-500"/></div>
                            <div>
                                <h3 className="font-semibold text-gray-700">分析</h3>
                                <p className="text-gray-600">受注と発注の状況をグラフで表示</p>
                            </div>
                        </div>
                    </div>
                   <div className="bg-white shadow rounded p-4">
                       <BarChart width={730} height={250} data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Object.keys(orderStatusCounts).map((status,index) => (
                                <Bar key={status + index} dataKey={status} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
                            ))}
                         {Object.keys(purchaseOrderStatusCounts).map((status,index) => (
                                <Bar key={status + index + 'po'} dataKey={status} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
                            ))}
                        </BarChart>
                  </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

const Header = ({ onLogout }) => (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold">RECERQA AI</Link>
        <nav>
             <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">ログアウト</button>
        </nav>
    </header>
);

const SideMenu = () => (
  <aside className="bg-gray-200 w-64 p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">メニュー</h2>
      <nav>
         <Link href="/dashboard" className="block py-2 px-4 hover:bg-gray-300 rounded text-gray-700">ダッシュボード</Link>
          <Link href="/orderList" className="block py-2 px-4 hover:bg-gray-300 rounded text-gray-700">受発注一覧</Link>
          <Link href="/settings" className="block py-2 px-4 hover:bg-gray-300 rounded text-gray-700">設定</Link>
      </nav>
  </aside>
);

const Footer = () => (
    <footer className="bg-gray-800 text-white text-center p-4">
        <p>&copy; 2024 RECERQA AI. All rights reserved.</p>
    </footer>
);

export default Dashboard;
