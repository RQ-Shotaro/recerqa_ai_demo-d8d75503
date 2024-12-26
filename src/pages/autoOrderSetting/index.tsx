import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaCog, FaChartBar, FaHistory, FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import Link from 'next/link';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl as string, supabaseKey as string);

const AutoOrderSetting = () => {
    const router = useRouter();
    const [stockLevel, setStockLevel] = useState('');
    const [tradeHistory, setTradeHistory] = useState('');
    const [demandForecast, setDemandForecast] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);



    useEffect(() => {
      const fetchUser = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (!user) {
              router.push('/login'); // Redirect to login if not logged in
            }
        } catch (err:any) {
          setError(err.message || 'Failed to fetch user data.');
        } finally {
            setLoading(false);
        }
      };
  
      fetchUser();
    }, []);

    const handleStockLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStockLevel(e.target.value);
    };

    const handleTradeHistoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTradeHistory(e.target.value);
    };

    const handleDemandForecastChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDemandForecast(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for saving to Supabase or other backend
        console.log('Form submitted with:', { stockLevel, tradeHistory, demandForecast });
        router.push('/orderConfirm');
    };

    if (loading) {
      return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
    }
  
    if (error) {
      return <div className="min-h-screen h-full flex justify-center items-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen h-full bg-gray-100">
         <Header />
            <div className="flex">
                <SideBar />
                <main className="flex-1 p-4">
                    <h1 className="text-2xl font-bold mb-4 text-gray-800">自動発注設定画面</h1>
                    <p className="mb-4 text-gray-700">自動発注の詳細設定を行う画面です。</p>

                    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stockLevel">
                                在庫レベル設定
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="stockLevel"
                                type="text"
                                placeholder="在庫レベルを設定"
                                value={stockLevel}
                                onChange={handleStockLevelChange}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tradeHistory">
                                取引履歴設定
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="tradeHistory"
                                type="text"
                                placeholder="取引履歴を設定"
                                value={tradeHistory}
                                onChange={handleTradeHistoryChange}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="demandForecast">
                                需要予測設定
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="demandForecast"
                                type="text"
                                placeholder="需要予測を設定"
                                value={demandForecast}
                                onChange={handleDemandForecastChange}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit"
                            >
                                設定を保存
                            </button>
                            <Link href='/orderConfirm'>
                              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                  発注内容確認画面へ
                              </button>
                            </Link>

                        </div>
                    </form>
                </main>
            </div>
            <Footer />
        </div>
    );
};

const Header = () => {
    return (
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">RECERQA AI</h1>
            <div className='flex items-center'>
                <span className="mr-4">User Name</span>
                <button onClick={() => supabase.auth.signOut()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    ログアウト
                </button>
            </div>
        </header>
    );
};

const SideBar = () => {
    return (
        <aside className="bg-gray-200 w-64 p-4">
            <nav>
              <Link href="/autoOrderSetting">
                <div className="flex items-center p-2 hover:bg-gray-300 rounded">
                   <FaCog className="mr-2" />
                     自動発注設定
                </div>
               </Link>
                <Link href="/stockLevel">
                    <div className="flex items-center p-2 hover:bg-gray-300 rounded">
                        <FaChartBar className="mr-2" />
                        在庫レベル設定
                    </div>
                </Link>
                <Link href="/orderHistory">
                <div className="flex items-center p-2 hover:bg-gray-300 rounded">
                     <FaHistory className="mr-2" />
                      取引履歴分析
                </div>
                </Link>
                <Link href="/demandForecast">
                    <div className="flex items-center p-2 hover:bg-gray-300 rounded">
                        <FaChartBar className="mr-2" />
                        需要予測
                   </div>
                  </Link>
            </nav>
        </aside>
    );
};

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white text-center p-4">
            <p>&copy; 2024 RECERQA AI. All rights reserved.</p>
        </footer>
    );
};

export default AutoOrderSetting;
