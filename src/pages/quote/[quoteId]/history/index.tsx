import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaArrowLeft, FaHistory } from 'react-icons/fa';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const QuoteHistory = () => {
  const router = useRouter();
  const { quoteId } = router.query;
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      if (!quoteId || typeof quoteId !== 'string') {
        setError('見積IDが無効です。');
        setLoading(false);
        return;
      }

      try {
        const { data, error: supabaseError } = await supabase
          .from('ai_agents_log')
          .select('log_id, log_time, log_message, agent_type')
          .eq('related_quote_id', quoteId)
          .order('log_time', { ascending: false });

        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          setError('見積履歴の取得に失敗しました。');
          setHistory([
            {
                "log_id": "SAMPLE-LOG-001",
                "log_time": "2024-08-01T10:00:00",
                "log_message": "見積作成",
                "agent_type": "system"
            },
            {
                "log_id": "SAMPLE-LOG-002",
                "log_time": "2024-08-01T11:00:00",
                "log_message": "見積更新",
                "agent_type": "user"
            }
            ]);
        } else {
          setHistory(data);
        }
      } catch (err:any) {
          console.error('Error fetching history:', err);
          setError('見積履歴の取得中にエラーが発生しました。');
          setHistory([
            {
                "log_id": "SAMPLE-LOG-001",
                "log_time": "2024-08-01T10:00:00",
                "log_message": "見積作成",
                "agent_type": "system"
            },
            {
                "log_id": "SAMPLE-LOG-002",
                "log_time": "2024-08-01T11:00:00",
                "log_message": "見積更新",
                "agent_type": "user"
            }
            ]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [quoteId]);

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Header />
             <div className="container mx-auto px-4 py-8">
             <div className="mb-4">
                  <Link href="/quote" legacyBehavior>
                    <a className="inline-flex items-center text-blue-500 hover:text-blue-700">
                      <FaArrowLeft className="mr-1" /> 見積一覧へ戻る
                    </a>
                  </Link>
                </div>
             <h1 className="text-2xl font-bold mb-4">見積履歴</h1>
        
                {loading && <p>履歴を読み込み中...</p>}
                {error && <p className="text-red-500">エラー: {error}</p>}
                {!loading && !error && history.length === 0 && <p>履歴がありません。</p>}

                {!loading && !error && history.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="py-2 px-4 border-b">履歴ID</th>
                          <th className="py-2 px-4 border-b">履歴日時</th>
                          <th className="py-2 px-4 border-b">操作内容</th>
                           <th className="py-2 px-4 border-b">エージェントタイプ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((item) => (
                          <tr key={item.log_id} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{item.log_id}</td>
                            <td className="py-2 px-4 border-b">{new Date(item.log_time).toLocaleString()}</td>
                            <td className="py-2 px-4 border-b">{item.log_message}</td>
                            <td className="py-2 px-4 border-b">{item.agent_type}</td>
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
          <header className="bg-blue-600 p-4 text-white">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" legacyBehavior>
                <a className="text-xl font-bold">RECERQA AI</a>
              </Link>
              <nav>
                <Link href="/" legacyBehavior>
                  <a className="mr-4 hover:text-blue-200">ホーム</a>
                </Link>
               <Link href="/quote" legacyBehavior>
                 <a className="mr-4 hover:text-blue-200">見積</a>
               </Link>
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

export default QuoteHistory;
