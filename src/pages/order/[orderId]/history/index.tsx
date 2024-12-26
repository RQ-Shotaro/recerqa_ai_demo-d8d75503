import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaHome, FaHistory, FaArrowLeft } from 'react-icons/fa';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);



const HistoryPage = () => {
    const router = useRouter();
    const { orderId } = router.query;
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistoryData = async () => {
          setLoading(true);
          setError(null);
    
          if (!orderId) {
            setError('注文IDが提供されていません。');
            setLoading(false);
            return;
          }
    
          try {
            const { data, error } = await supabase
              .from('ai_agents_log')
              .select('*')
              .or(`related_order_id.eq.${orderId},related_purchase_order_id.eq.${orderId},related_quote_id.eq.${orderId}`);
    
            if (error) {
              throw new Error(`データの取得に失敗しました: ${error.message}`);
            }
    
            if (data) {
              setHistoryData(data);
            } else {
              setHistoryData([]);
            }
          } catch (err: any) {
            setError(err.message || 'データの取得中にエラーが発生しました。');
          } finally {
            setLoading(false);
          }
        };
    
        fetchHistoryData();
      }, [orderId]);


    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Header />
            <div className="flex">
                <SideMenu />
                <main className="flex-1 p-4">
                    <div className="mb-4">
                        <Link href={
                            orderId ? `/order/${orderId}` : '/order'
                        } legacyBehavior>
                            <a className="inline-flex items-center text-blue-500 hover:text-blue-700">
                                <FaArrowLeft className="mr-1" />
                                戻る
                            </a>
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold mb-4">取引履歴</h1>
                    {loading && <p>Loading...</p>}
                    {error && <p className="text-red-500">Error: {error}</p>}
                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            {historyData.length > 0 ? (
                                <table className="min-w-full bg-white border border-gray-200 shadow-md">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-2 px-4 border-b text-left">ログID</th>
                                            <th className="py-2 px-4 border-b text-left">エージェントタイプ</th>
                                            <th className="py-2 px-4 border-b text-left">ログ時間</th>
                                            <th className="py-2 px-4 border-b text-left">ログメッセージ</th>
                                            <th className="py-2 px-4 border-b text-left">関連注文ID</th>
                                            <th className="py-2 px-4 border-b text-left">関連購入注文ID</th>
                                            <th className="py-2 px-4 border-b text-left">関連見積ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyData.map((historyItem) => (
                                            <tr key={historyItem.log_id} className="hover:bg-gray-50">
                                                <td className="py-2 px-4 border-b">{historyItem.log_id}</td>
                                                <td className="py-2 px-4 border-b">{historyItem.agent_type}</td>
                                                <td className="py-2 px-4 border-b">{new Date(historyItem.log_time).toLocaleString()}</td>
                                                <td className="py-2 px-4 border-b">{historyItem.log_message}</td>
                                                 <td className="py-2 px-4 border-b">{historyItem.related_order_id || '-'}</td>
                                                <td className="py-2 px-4 border-b">{historyItem.related_purchase_order_id || '-'}</td>
                                                <td className="py-2 px-4 border-b">{historyItem.related_quote_id || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>取引履歴はありません。</p>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};



const Header = () => {
    return (
        <header className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <h1 className="text-xl font-bold">RECERQA AI</h1>
            <nav>
                <Link href="/" legacyBehavior>
                   <a className="hover:text-gray-200">ホーム</a>
                </Link>
            </nav>
        </header>
    );
};

const SideMenu = () => {
    return (
        <aside className="bg-gray-200 p-4 w-64">
            <nav>
                <ul>
                  <li className="mb-2">
                      <Link href="/" legacyBehavior>
                          <a className="flex items-center p-2 hover:bg-gray-300 rounded">
                            <FaHome className="mr-2" />
                            ホーム
                            </a>
                      </Link>
                  </li>
                     <li className="mb-2">
                        <Link href="/order" legacyBehavior>
                           <a className="flex items-center p-2 hover:bg-gray-300 rounded">
                             <FaHistory className="mr-2" />
                            発注履歴
                           </a>
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default HistoryPage;
