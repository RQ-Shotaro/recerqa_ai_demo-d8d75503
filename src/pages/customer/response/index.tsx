import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaHome, FaList, FaUser, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const ResponsePage: React.FC = () => {
    const router = useRouter();
    const [responseDetails, setResponseDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [session, setSession] = useState<any>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchUser(session.user.id);
            }
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchUser(session.user.id);
            } else {
               setUser(null);
            }
        });
    }, []);
    
    const fetchUser = async (userId: string) => {
        try {
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single();
    
            if (error) {
              throw error;
            }
            setUser(data);
          } catch (error:any) {
             console.error('Error fetching user details:', error.message);
              setError('ユーザー情報の取得に失敗しました。');
          }
    };

    useEffect(() => {
        const fetchResponseData = async () => {
            setLoading(true);
            setError(null);
            try {
                 // TODO: This should be changed to fetch data based on the actual table.
                const { data, error } = await supabase
                    .from('ai_agents_log')
                    .select('*')
                    .limit(1); // Adjust query as needed based on table definition

                if (error) {
                    throw error;
                }

                if(data && data.length > 0) {
                  setResponseDetails(data[0]);
                } else {
                    setResponseDetails({
                        log_id: 'sample_log_id',
                        agent_type: 'Sample Agent',
                        log_time: '2024-08-25T10:00:00Z',
                        log_message: 'Sample response message.',
                        related_order_id: 'sample_order_id',
                        related_purchase_order_id: 'sample_purchase_order_id',
                        related_quote_id: 'sample_quote_id',
                    });
                }

            } catch (err: any) {
                 console.error('Error fetching response details:', err.message);
                setError('回答内容の取得に失敗しました。');
            } finally {
                setLoading(false);
            }
        };
        fetchResponseData();
    }, []);

      const handleSignOut = async () => {
        try {
          await supabase.auth.signOut();
          router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
            setError('サインアウトに失敗しました。');
        }
    };

    if(session === null){
        return (
          <div className="min-h-screen h-full bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow-md text-center">
                <h2 className="text-2xl font-semibold mb-4">ログインしてください</h2>
                  <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      ログイン画面へ
                  </Link>
            </div>
          </div>
        );
    }

    return (
        <div className="min-h-screen h-full bg-gray-100">
             <header className="bg-blue-500 p-4 flex justify-between items-center">
                <Link href="/" className="text-white font-bold text-xl flex items-center">
                     <FaHome className="mr-2" />
                    ホーム
                </Link>
                 <div className="flex items-center space-x-4">
                    {user && (<span className="text-white">ようこそ、{user.username}さん</span>)}
                    <button onClick={handleSignOut} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                      サインアウト
                    </button>
                  </div>
            </header>

            <div className="flex">
                <aside className="bg-gray-200 w-64 p-4">
                    <nav>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/customer/response" className="flex items-center px-4 py-2 rounded hover:bg-gray-300">
                                     <FaArrowLeft className="mr-2" />
                                    回答画面
                                </Link>
                            </li>
                            <li>
                                <Link href="/order/list" className="flex items-center px-4 py-2 rounded hover:bg-gray-300">
                                    <FaList className="mr-2" />
                                    発注一覧
                                </Link>
                            </li>
                            <li>
                                <Link href="/user/profile" className="flex items-center px-4 py-2 rounded hover:bg-gray-300">
                                   <FaUser className="mr-2" />
                                    ユーザープロフィール
                                </Link>
                            </li>
                           
                        </ul>
                    </nav>
                </aside>

            <main className="flex-1 p-8">
            <h1 className="text-2xl font-bold mb-6">得意先回答画面</h1>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {responseDetails && (
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">回答詳細</h2>
                    <div className="mb-4">
                        <strong className="block">ログID:</strong>
                        <span>{responseDetails.log_id}</span>
                    </div>
                    <div className="mb-4">
                        <strong className="block">エージェントタイプ:</strong>
                        <span>{responseDetails.agent_type}</span>
                    </div>
                     <div className="mb-4">
                        <strong className="block">ログ時間:</strong>
                        <span>{responseDetails.log_time}</span>
                    </div>
                    <div className="mb-4">
                        <strong className="block">メッセージ:</strong>
                        <span>{responseDetails.log_message}</span>
                    </div>
                     <div className="mb-4">
                        <strong className="block">関連注文ID:</strong>
                        <span>{responseDetails.related_order_id}</span>
                    </div>
                     <div className="mb-4">
                        <strong className="block">関連仕入注文ID:</strong>
                        <span>{responseDetails.related_purchase_order_id}</span>
                    </div>
                     <div className="mb-4">
                        <strong className="block">関連見積ID:</strong>
                        <span>{responseDetails.related_quote_id}</span>
                    </div>

                </div>
            )}
          </main>
        </div>
            <footer className="bg-gray-800 text-white text-center p-4">
                <p>&copy; 2024 RECERQA AI. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default ResponsePage;
