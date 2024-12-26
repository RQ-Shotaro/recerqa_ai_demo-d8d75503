import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FaSearch, FaHistory, FaQuestionCircle, FaComment } from 'react-icons/fa';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);


const Home: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
      const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      };
      fetchUser();

      supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
      });
    }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };


  return (
    <div className="min-h-screen h-full bg-[#f0f0f0] flex">
       {/* Sidebar */}       <aside className="bg-gray-800 text-white w-64 flex flex-col">
        <div className="p-4">
          <h2 className="text-xl font-bold">RECERQA AI</h2>
        </div>
        <nav>
          <Link href="/home" className="block py-2 px-4 hover:bg-gray-700">
            ホーム
          </Link>
          <Link href="/search" className="block py-2 px-4 hover:bg-gray-700">
            商品検索
          </Link>
          <Link href="/history" className="block py-2 px-4 hover:bg-gray-700">
            発注履歴
          </Link>
          <Link href="/chat" className="block py-2 px-4 hover:bg-gray-700">
            AIチャットサポート
          </Link>
          <Link href="/faq" className="block py-2 px-4 hover:bg-gray-700">
            よくある質問
          </Link>
        </nav>
         <div className="mt-auto p-4">
            {user ? (
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                ログアウト
              </button>
            ) : (
              <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                 ログイン
              </Link>
            )}
          </div>
      </aside>

      <main className="flex-1 p-8">
          <h1 className="text-2xl font-semibold mb-6 text-[#333333]">ホーム画面</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/search" className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 flex items-center justify-center">
              <FaSearch className="text-4xl text-[#007bff]" />
            </div>
            <span className="text-lg font-medium text-[#333333]">商品検索</span>
            <img src="https://placehold.co/200x150/ffffff/007bff?text=Search" alt="商品検索" className="mt-2 w-full h-auto max-h-32 object-cover rounded-md" />
          </Link>

          <Link href="/history" className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
             <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 flex items-center justify-center">
              <FaHistory className="text-4xl text-[#007bff]" />
            </div>
            <span className="text-lg font-medium text-[#333333]">発注履歴</span>
            <img src="https://placehold.co/200x150/ffffff/007bff?text=History" alt="発注履歴" className="mt-2 w-full h-auto max-h-32 object-cover rounded-md" />
          </Link>

         <Link href="/chat" className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
           <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 flex items-center justify-center">
              <FaComment className="text-4xl text-[#007bff]" />
            </div>
            <span className="text-lg font-medium text-[#333333]">AIチャットサポート</span>
            <img src="https://placehold.co/200x150/ffffff/007bff?text=Chat" alt="AIチャットサポート" className="mt-2 w-full h-auto max-h-32 object-cover rounded-md" />
          </Link>

          <Link href="/faq" className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
             <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 flex items-center justify-center">
              <FaQuestionCircle className="text-4xl text-[#007bff]" />
            </div>
            <span className="text-lg font-medium text-[#333333]">よくある質問</span>
             <img src="https://placehold.co/200x150/ffffff/007bff?text=FAQ" alt="よくある質問" className="mt-2 w-full h-auto max-h-32 object-cover rounded-md" />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;
