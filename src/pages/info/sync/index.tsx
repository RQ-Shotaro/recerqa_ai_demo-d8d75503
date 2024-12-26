import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaSyncAlt, FaTimes, FaCheck } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const SyncStatus = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('ai_agents_log')
          .select('log_id, agent_type, log_time, log_message')
          .order('log_time', { ascending: false });

        if (error) {
          console.error('Error fetching logs:', error);
          setError('ログの取得に失敗しました。');
          setLogs([
            {
              log_id: '1', agent_type: '販売AI', log_time: '2024-08-07 10:00:00', log_message: 'サンプルログメッセージ1 (エラー)',
            },
            {
              log_id: '2', agent_type: '仕入AI', log_time: '2024-08-07 11:00:00', log_message: 'サンプルログメッセージ2 (エラー)',
            },
          ]);
        } else {
          setLogs(data || []);
        }
      } catch (err: any) {
        console.error('Error during fetch operation:', err);
        setError('予期せぬエラーが発生しました。');
        setLogs([
          {
            log_id: '1', agent_type: '販売AI', log_time: '2024-08-07 10:00:00', log_message: 'サンプルログメッセージ1 (エラー)',
          },
          {
            log_id: '2', agent_type: '仕入AI', log_time: '2024-08-07 11:00:00', log_message: 'サンプルログメッセージ2 (エラー)',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen h-full bg-gray-100 flex">
       <aside className="bg-gray-800 text-white w-64 py-6 px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center">RECERQA AI</h2>
          </div>
          <nav>
             <ul>
                <li className="mb-2">
                  <Link href="/" className="block py-2 px-4 hover:bg-gray-700 rounded transition duration-300">
                    ダッシュボード
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/info/sync" className="block py-2 px-4 hover:bg-gray-700 rounded transition duration-300 bg-gray-700">
                   情報連携状況
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/order/list" className="block py-2 px-4 hover:bg-gray-700 rounded transition duration-300">
                   受発注一覧
                  </Link>
                </li>
                 <li className="mb-2">
                   <Link href="/setting/agent" className="block py-2 px-4 hover:bg-gray-700 rounded transition duration-300">
                     AIエージェント設定
                    </Link>
                 </li>
                 <li className="mb-2">
                   <Link href="/report" className="block py-2 px-4 hover:bg-gray-700 rounded transition duration-300">
                     レポート
                    </Link>
                 </li>
              </ul>
            </nav>
        </aside>
      <main className="flex-1 p-4">
          <h1 className="text-2xl font-semibold mb-4">情報連携状況</h1>
           {loading && (
            <div className="text-center">
              <FaSyncAlt className="animate-spin text-blue-500 mx-auto mb-2" size={40} />
              <p>データ読み込み中...</p>
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 border-b text-left">ログID</th>
                    <th className="py-3 px-4 border-b text-left">エージェントタイプ</th>
                    <th className="py-3 px-4 border-b text-left">ログ時刻</th>
                    <th className="py-3 px-4 border-b text-left">ログメッセージ</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => (
                    <tr key={log.log_id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{log.log_id}</td>
                      <td className="py-2 px-4 border-b">{log.agent_type}</td>
                      <td className="py-2 px-4 border-b">{new Date(log.log_time).toLocaleString()}</td>
                      <td className="py-2 px-4 border-b">{log.log_message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
      </main>
    </div>
  );
};

export default SyncStatus;
