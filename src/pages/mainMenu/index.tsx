import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaComment, FaMicrophone, FaShoppingCart } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);


const MainMenu = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            const { data: { user: currentUser }, error } = await supabase.auth.getUser();

            if (error) {
                console.error('Error fetching user:', error);
            } else {
                setUser(currentUser);
            }
            setLoading(false);
        };

        fetchUser();
        
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('ログアウトエラー:', error.message);
        } else {
            router.push('/login');
        }
    };

    if (loading) {
        return <div className="min-h-screen h-full flex justify-center items-center">読み込み中...</div>
    }
    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="min-h-screen h-full bg-gray-100 flex">
             <aside className="bg-gray-800 text-white w-64 p-4">
                <div className="mb-8">
                   <h2 className="text-xl font-bold">メニュー</h2>
                </div>

                 <nav>
                    <Link href="/mainMenu" legacyBehavior>
                     <div className="py-2 px-4 hover:bg-gray-700 rounded cursor-pointer">
                         メインメニュー
                        </div>
                    </Link>
                     <Link href="/orderHistory" legacyBehavior>
                       <div className="py-2 px-4 hover:bg-gray-700 rounded cursor-pointer">
                             発注履歴
                       </div>
                    </Link>
                    <Link href="/orderDetail" legacyBehavior>
                       <div className="py-2 px-4 hover:bg-gray-700 rounded cursor-pointer">
                           発注詳細
                       </div>
                   </Link>
                </nav>
                 <button onClick={handleLogout} className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    ログアウト
                </button>
            </aside>
            <div className="flex-1 p-8">
                <h1 className="text-2xl font-bold mb-4">メインメニュー</h1>
                <p className="mb-6">発注方法を選択してください。</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/chatOrder" legacyBehavior>
                        <div className="bg-white shadow-md p-6 rounded-lg text-center hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                            <FaComment size={40} className="mx-auto mb-4 text-blue-500" />
                            <h2 className="text-lg font-semibold">チャット発注</h2>
                            <p className="text-gray-600 mt-2">チャットで発注</p>
                        </div>
                   </Link>
                   <Link href="/voiceOrder" legacyBehavior>
                        <div className="bg-white shadow-md p-6 rounded-lg text-center hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                            <FaMicrophone size={40} className="mx-auto mb-4 text-green-500" />
                            <h2 className="text-lg font-semibold">音声発注</h2>
                            <p className="text-gray-600 mt-2">音声で発注</p>
                        </div>
                     </Link>
                     <Link href="/ecOrder" legacyBehavior>
                        <div className="bg-white shadow-md p-6 rounded-lg text-center hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                            <FaShoppingCart size={40} className="mx-auto mb-4 text-indigo-500" />
                            <h2 className="text-lg font-semibold">ECサイト発注</h2>
                            <p className="text-gray-600 mt-2">ECサイトで発注</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
