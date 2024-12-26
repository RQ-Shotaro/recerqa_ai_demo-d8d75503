import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const AdjustHistory = () => {
    const router = useRouter();
    const { orderId } = router.query;
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
          setLoading(true);
          setError(null);
          if (!orderId) {
            setError('発注IDが提供されていません。');
            setLoading(false);
            return;
          }
          
          try {
            const { data, error } = await supabase
              .from('ai_agents_log')
              .select('log_id, agent_type, log_time, log_message, related_purchase_order_id')
              .eq('related_purchase_order_id', orderId)
            if (error) {
                console.error('Supabaseからのデータ取得エラー:', error);
                setError('データ取得中にエラーが発生しました。');
                setHistoryData([{
                  log_id: 'サンプルID',
                  agent_type: 'サンプルエージェント',
                  log_time: new Date().toISOString(),
                  log_message: 'サンプルメッセージ',
                  related_purchase_order_id: orderId
                }]);
            } else {
                setHistoryData(data);
            }
        } catch (err:any) {
          console.error('予期せぬエラー:', err);
            setError('予期せぬエラーが発生しました。');
              setHistoryData([{
                log_id: 'サンプルID',
                agent_type: 'サンプルエージェント',
                log_time: new Date().toISOString(),
                log_message: 'サンプルメッセージ',
                related_purchase_order_id: orderId
              }]);
        }
        finally {
            setLoading(false);
        }
        };
    
        fetchHistory();
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
            <div className="container mx-auto px-4 py-8">
                 <div className="mb-4">
                     <Link href={`/adjust/${orderId}`}  className="inline-flex items-center text-blue-600 hover:text-blue-800">
                            <FaArrowLeft className="mr-1" />
                            戻る
                    </Link>
                 </div>

                <h1 className="text-2xl font-bold mb-4">仕入条件調整履歴一覧</h1>
                {historyData.length === 0 ? (
                    <p className="text-gray-500">調整履歴はありません。</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded shadow">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="py-2 px-4 border-b">ログID</th>
                                    <th className="py-2 px-4 border-b">エージェントタイプ</th>
                                    <th className="py-2 px-4 border-b">ログ時間</th>
                                    <th className="py-2 px-4 border-b">ログメッセージ</th>
                                    <th className="py-2 px-4 border-b">関連発注ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyData.map((item: any) => (
                                    <tr key={item.log_id} className="hover:bg-gray-100">
                                        <td className="py-2 px-4 border-b">{item.log_id}</td>
                                        <td className="py-2 px-4 border-b">{item.agent_type}</td>
                                        <td className="py-2 px-4 border-b">{new Date(item.log_time).toLocaleString()}</td>
                                        <td className="py-2 px-4 border-b">{item.log_message}</td>
                                        <td className="py-2 px-4 border-b">{item.related_purchase_order_id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
             <Footer />
        </div>
    );
};


const Header = () => {
  return (
    <header className="bg-blue-500 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">RECERQA AI</Link>
        <nav>
            <Link href="/" className="mr-4 hover:text-blue-200">ホーム</Link>
             <Link href="/adjust/" className="mr-4 hover:text-blue-200">仕入調整</Link>
          
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

export default AdjustHistory;