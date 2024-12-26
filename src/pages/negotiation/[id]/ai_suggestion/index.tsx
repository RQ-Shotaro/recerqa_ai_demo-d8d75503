import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaHome, FaCog, FaChartBar, FaHistory, FaFileInvoiceDollar } from 'react-icons/fa';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const AiSuggestionPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [suggestion, setSuggestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
        };
        fetchSession();

        supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            if (session) {
                fetchUser(session.user.id);
            } else {
                setUser(null);
            }
        });
    }, []);

    const fetchUser = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user:', error);
                setError('ユーザー情報の取得に失敗しました。');
            } else {
                setUser(data);
            }
        } catch (err) {
            console.error('Unexpected error fetching user:', err);
            setError('ユーザー情報の取得中に予期せぬエラーが発生しました。');
        }
    };

    useEffect(() => {
        const fetchSuggestion = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Replace with actual API call if needed
                // const { data, error } = await axios.get(`/api/negotiation/${id}/ai_suggestion`);

                // Sample Data
                const sampleData = {
                  proposed_delivery_date: '2024-07-20', // Proposed delivery date
                  proposed_amount: 150000,         // Proposed amount
                  reason: '過去の取引履歴と需要予測に基づき、最適な納期と金額を提案します。',  // Reason for proposal
                  current_delivery_date: '2024-07-25',//current delivery date
                  current_amount: 160000,           // current amount
                  product_name: 'サンプル商品A',
                  supplier_name: 'サンプルサプライヤー',
                  supplier_id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',   // sample supplier uuid
                  order_id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',      // sample order uuid
                  customer_name: 'サンプル顧客',
                  customer_id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',    // sample customer uuid
                };

                setSuggestion(sampleData);
            } catch (err) {
                console.error('Error fetching AI suggestion:', err);
                setError('AI提案内容の取得に失敗しました。');
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestion();
    }, [id]);

    if (!session) {
        return (
          <div className="min-h-screen h-full bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow-md w-96 text-center">
                <h2 className="text-2xl font-semibold mb-6">ログインが必要です</h2>
                <p className="mb-4">このページにアクセスするにはログインしてください。</p>
                <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    ログイン
                </Link>
             </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Header user={user} />
            <div className="flex">
              <SideMenu />
              <main className="flex-1 p-4">
              <h1 className="text-2xl font-bold mb-4">AI提案内容</h1>
              {loading && <p>Loading...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {suggestion && (
                  <div className="bg-white shadow rounded p-4">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold">提案された内容</h2>
                      <p><strong>商品名:</strong> {suggestion.product_name}</p>
                      <p><strong>仕入先名:</strong> {suggestion.supplier_name}</p>
                       <p><strong>顧客名:</strong> {suggestion.customer_name}</p>
                      <p><strong>現在の納期:</strong> {suggestion.current_delivery_date}</p>
                      <p><strong>現在の金額:</strong> {suggestion.current_amount}円</p>
                    </div>
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold">AI提案</h2>
                      <p><strong>提案納期:</strong> {suggestion.proposed_delivery_date}</p>
                      <p><strong>提案金額:</strong> {suggestion.proposed_amount}円</p>
                      <p><strong>提案理由:</strong> {suggestion.reason}</p>
                    </div>
                    <div className="flex justify-end">
                        <Link href={`/negotiation/${id}/negotiate`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            調整実行
                        </Link>
                   </div>
                </div>
              )}
           </main>
         </div>
         <Footer />
        </div>
    );
};

const Header = ({ user }) => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">RECERQA AI</Link>
        <div className="flex items-center">
          {user ? (
            <span className="mr-4">こんにちは, {user.customer_name} 様</span>
           ) : null}
            <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              {user ? "ログアウト" : "ログイン"}
            </Link>
         </div>
      </header>
  );
};

const Footer = () => (
    <footer className="bg-gray-800 text-white text-center p-4">
        <p>&copy; 2024 RECERQA AI. All rights reserved.</p>
    </footer>
);


const SideMenu = () => {
    return (
        <aside className="bg-gray-200 p-4 w-64 min-h-screen">
            <nav>
                <ul>
                   <li className="mb-2">
                        <Link href="/" className="flex items-center p-2 hover:bg-gray-300 rounded">
                            <FaHome className="mr-2" />
                            ホーム
                        </Link>
                    </li>
                   <li className="mb-2">
                        <Link href="/order_history" className="flex items-center p-2 hover:bg-gray-300 rounded">
                           <FaHistory className="mr-2" />
                            発注履歴
                        </Link>
                    </li>
                    <li className="mb-2">
                        <Link href="/dashboard" className="flex items-center p-2 hover:bg-gray-300 rounded">
                           <FaChartBar className="mr-2" />
                           ダッシュボード
                        </Link>
                    </li>
                    <li className="mb-2">
                       <Link href="/negotiation" className="flex items-center p-2 hover:bg-gray-300 rounded">
                           <FaFileInvoiceDollar className="mr-2" />
                            納期・金額調整
                        </Link>
                    </li>
                     <li className="mb-2">
                        <Link href="/settings" className="flex items-center p-2 hover:bg-gray-300 rounded">
                            <FaCog className="mr-2" />
                            設定
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default AiSuggestionPage;
