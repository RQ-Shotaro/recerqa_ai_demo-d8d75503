import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaChartBar, FaHome, FaUsers, FaCog, FaSignOutAlt } from 'react-icons/fa';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const AnalyticsPage: React.FC = () => {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (!session) {
        router.push('/login');
      }
    };

    fetchSession();
  }, [router]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.from('ai_agents_log').select('*');
        if (error) {
          console.error('Supabase error fetching analytics data:', error);
          setError('データ取得に失敗しました。');
          setAnalyticsData([
            {
              log_id: 'sample-log-1',
              agent_type: '発注AI',
              log_time: '2024-01-01T10:00:00Z',
              log_message: '発注処理が開始されました。',
              related_order_id: 'order-1',
              related_purchase_order_id: null,
              related_quote_id: null,
            },
            {
              log_id: 'sample-log-2',
              agent_type: '仕入AI',
              log_time: '2024-01-02T14:30:00Z',
              log_message: '仕入条件が調整されました。',
              related_order_id: null,
              related_purchase_order_id: 'purchase-1',
              related_quote_id: null,
            },
            {
              log_id: 'sample-log-3',
              agent_type: '見積AI',
              log_time: '2024-01-03T18:00:00Z',
              log_message: '見積もり依頼が送信されました。',
               related_order_id: null,
               related_purchase_order_id: null,
               related_quote_id: 'quote-1'
             }
          ]);
        } else {
          setAnalyticsData(data);
        }
      } catch (err: any) {
        console.error('Error fetching analytics data:', err);
        setError('データの取得中にエラーが発生しました。');
         setAnalyticsData([
            {
              log_id: 'sample-log-1',
              agent_type: '発注AI',
              log_time: '2024-01-01T10:00:00Z',
              log_message: '発注処理が開始されました。',
              related_order_id: 'order-1',
              related_purchase_order_id: null,
              related_quote_id: null,
            },
            {
              log_id: 'sample-log-2',
              agent_type: '仕入AI',
              log_time: '2024-01-02T14:30:00Z',
              log_message: '仕入条件が調整されました。',
              related_order_id: null,
              related_purchase_order_id: 'purchase-1',
              related_quote_id: null,
            },
            {
              log_id: 'sample-log-3',
              agent_type: '見積AI',
              log_time: '2024-01-03T18:00:00Z',
              log_message: '見積もり依頼が送信されました。',
               related_order_id: null,
               related_purchase_order_id: null,
               related_quote_id: 'quote-1'
             }
          ]);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAnalyticsData();
    }
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
      <div className="min-h-screen h-full bg-gray-100 flex">
        <aside className="bg-gray-800 text-white w-64 p-4">
          <nav>
            <ul>
             <li className="mb-2">
               <Link href="/"  className="flex items-center hover:bg-gray-700 p-2 rounded-md">
                  <FaHome className="mr-2" /> ホーム
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/users" className="flex items-center hover:bg-gray-700 p-2 rounded-md">
                  <FaUsers className="mr-2" />  ユーザー管理
                </Link>
              </li>
                <li className="mb-2">
                  <Link href="/analytics" className="flex items-center bg-gray-700 p-2 rounded-md">
                    <FaChartBar className="mr-2" /> 分析レポート
                  </Link>
                </li>
                <li className="mb-2">
                    <Link href="/settings" className="flex items-center hover:bg-gray-700 p-2 rounded-md">
                        <FaCog className="mr-2" /> 設定
                    </Link>
                </li>
                <li className="mb-2">
                  <button onClick={handleLogout} className="flex items-center hover:bg-gray-700 p-2 rounded-md">
                    <FaSignOutAlt className="mr-2" /> ログアウト
                  </button>
                </li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-4 text-gray-700">分析レポート</h1>
          {loading && <p className="text-gray-600">データをロード中...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && analyticsData.length > 0 ? (
          <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-md">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="py-2 px-4 border-b">ログID</th>
                          <th className="py-2 px-4 border-b">エージェントタイプ</th>
                          <th className="py-2 px-4 border-b">ログタイム</th>
                          <th className="py-2 px-4 border-b">ログメッセージ</th>
                          <th className="py-2 px-4 border-b">関連発注ID</th>
                          <th className="py-2 px-4 border-b">関連仕入ID</th>
                          <th className="py-2 px-4 border-b">関連見積ID</th>
                      </tr>
                  </thead>
                  <tbody>
                      {analyticsData.map((item:any) => (
                          <tr key={item.log_id} className="hover:bg-gray-100">
                              <td className="py-2 px-4 border-b">{item.log_id}</td>
                              <td className="py-2 px-4 border-b">{item.agent_type}</td>
                              <td className="py-2 px-4 border-b">{item.log_time}</td>
                              <td className="py-2 px-4 border-b">{item.log_message}</td>
                              <td className="py-2 px-4 border-b">{item.related_order_id || '-'}</td>
                              <td className="py-2 px-4 border-b">{item.related_purchase_order_id || '-'}</td>
                              <td className="py-2 px-4 border-b">{item.related_quote_id || '-'}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
          ) : (!loading && !error && (
              <p className="text-gray-500">表示するデータがありません。</p>
          ))}
        </main>
      </div>
  );
};

export default AnalyticsPage;
