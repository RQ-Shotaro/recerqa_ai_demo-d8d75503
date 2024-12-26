import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaArrowLeft, FaSearch, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const OrderStatusIcon = ({ status }: { status: string }) => {
    if (status === '完了') {
        return <FaCheckCircle className="text-green-500" />;    
    } else if (status === 'キャンセル') {
        return <FaTimesCircle className="text-red-500" />;    
    } else {
        return <span className="text-gray-500">保留</span>;
    }
};

const History = () => {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('orders')
                    .select('order_id, order_date, order_status')
                    .order('order_date', { ascending: false });

                if (error) {
                  console.error('Error fetching orders:', error);
                    setOrders([
                        { order_id: '1', order_date: '2024-01-01', order_status: '完了' },
                        { order_id: '2', order_date: '2024-01-05', order_status: 'キャンセル' },
                        { order_id: '3', order_date: '2024-01-10', order_status: '保留' },
                    ]);
                } else {
                    setOrders(data || []);
                }
            } catch (err) {
               console.error('Unexpected error:', err);
                  setOrders([
                        { order_id: '1', order_date: '2024-01-01', order_status: '完了' },
                        { order_id: '2', order_date: '2024-01-05', order_status: 'キャンセル' },
                        { order_id: '3', order_date: '2024-01-10', order_status: '保留' },
                    ]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

   useEffect(() => {
        let filtered = [...orders];

        if (startDate) {
            filtered = filtered.filter(order => order.order_date >= startDate);
        }
        if (endDate) {
            filtered = filtered.filter(order => order.order_date <= endDate);
        }
        if (statusFilter) {
           filtered = filtered.filter(order => order.order_status === statusFilter);
        }
        setFilteredOrders(filtered);
    }, [orders, startDate, endDate, statusFilter]);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStatusFilter(e.target.value);
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setStatusFilter('');
        setFilteredOrders(orders);
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Header />
            <div className="container mx-auto p-4">
              <div className="mb-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center text-blue-500 hover:text-blue-700">
                    <FaArrowLeft className="mr-1" />
                    戻る
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-700">発注履歴画面</h1>
                </div>
                <div className="bg-white p-4 rounded shadow mb-4">
                 <h2 className="text-xl font-semibold mb-2 text-gray-700">絞り込み検索</h2>
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center">
                            <label htmlFor="startDate" className="mr-2 text-gray-600">開始日:</label>
                            <input
                                type="date"
                                id="startDate"
                                className="border p-2 rounded text-gray-700"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center">
                            <label htmlFor="endDate" className="mr-2 text-gray-600">終了日:</label>
                            <input
                                type="date"
                                id="endDate"
                                className="border p-2 rounded text-gray-700"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center">
                             <label htmlFor="orderStatus" className="mr-2 text-gray-600">ステータス:</label>
                             <select id="orderStatus" className="border p-2 rounded text-gray-700" value={statusFilter} onChange={handleStatusChange}>
                                <option value="">すべて</option>
                                <option value="完了">完了</option>
                                <option value="キャンセル">キャンセル</option>
                                <option value="保留">保留</option>
                            </select>
                        </div>
                         <button onClick={handleClearFilters} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                            クリア
                        </button>

                    </div>
                </div>

                 <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">発注履歴一覧</h2>
                    {loading ? (
                        <div className="text-center">Loading...</div>
                    ) : filteredOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-200">
                                <tr className="text-gray-700">
                                   <th className="px-4 py-2">注文ID</th>
                                    <th className="px-4 py-2">注文日</th>
                                     <th className="px-4 py-2">ステータス</th>
                                   <th className="px-4 py-2">詳細</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.order_id} className="border-b hover:bg-gray-100">
                                         <td className="px-4 py-2">{order.order_id}</td>
                                        <td className="px-4 py-2">{order.order_date}</td>
                                       <td className="px-4 py-2 flex items-center"><OrderStatusIcon status={order.order_status} />{order.order_status}</td>
                                         <td className="px-4 py-2">
                                         <Link href={`/order-detail/${order.order_id}`} className="text-blue-500 hover:text-blue-700">
                                             詳細
                                            </Link>
                                         </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    ) : (
                        <div className="text-center">発注履歴はありません。</div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

const Header = () => {
    return (
        <header className="bg-blue-600 p-4 text-white">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">RECERQA AI</Link>
                <nav>
                     <Link href="/" className="mr-4 hover:text-blue-200">ホーム</Link>
                     <Link href="/history" className="mr-4 hover:text-blue-200">発注履歴</Link>
                     <Link href="/chat" className="mr-4 hover:text-blue-200">チャット</Link>
                    <Link href="/login" className="hover:text-blue-200">ログイン</Link>
                </nav>
            </div>
        </header>
    );
};

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white text-center p-4">
            <p>&copy; 2024 RECERQA AI. All rights reserved.</p>
        </footer>
    );
};

export default History;
