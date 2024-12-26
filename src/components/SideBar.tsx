import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaHome, FaList, FaCog, FaChartBar, FaCalendarAlt, FaTruck, FaUserCog, FaSyncAlt, FaFileAlt, FaInfoCircle, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const SideBar: React.FC = () => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        fetchUser();
        supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setUser(session.user);
            } else {
              setUser(null)
            }
        });
    }, []);


    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
    };
    
    return (
        <div className="min-h-screen h-full bg-gray-100 text-gray-800">
          <div className='flex'>
            <aside className={`bg-gray-800 text-white w-64  transition-transform transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static top-0 left-0 h-full z-50`} >
            
                <div className="p-4  border-b border-gray-700">
                  <div className='flex items-center justify-between'>
                    <h2 className="text-xl font-bold">RECERQA AI</h2>
                    <button onClick={toggleMenu} className='md:hidden text-2xl'>
                      <FaBars />
                    </button>
                  </div>
                </div>
                <nav className="p-4">
                    <ul>
                        <li className="mb-2">
                            <Link href="/home" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                                <FaHome className="mr-2" />ホーム
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link href="/dashboard" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                                <FaChartBar className="mr-2" />ダッシュボード
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link href="/order/list" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                                <FaList className="mr-2" />受発注一覧
                            </Link>
                        </li>

                        <li className="mb-2">
                            <Link href="/purchase/status" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                                <FaTruck className="mr-2" />仕入情報
                            </Link>
                        </li>


                        <li className="mb-2">
                            <Link href="/purchase/delivery" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                                  <FaCalendarAlt className="mr-2" />納期金額確認
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link href="/customer/response" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                                  <FaInfoCircle className="mr-2" />得意先対応
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link href="/info/sync" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                                <FaSyncAlt className="mr-2" />情報連携
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link href="/setting/salesAgent" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                                  <FaUserCog className="mr-2" />販売AI設定
                            </Link>
                        </li>
                        <li className="mb-2">
                           <Link href="/setting/purchaseAgent" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                                 <FaCog className="mr-2" />仕入AI設定
                            </Link>
                        </li>

                         <li className="mb-2">
                            <Link href="/analytics" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                                  <FaFileAlt className="mr-2" />分析レポート
                            </Link>
                        </li>
                    </ul>
                </nav>
                {user && (
                <div className='absolute bottom-0 p-4 w-full'>
                    <button onClick={handleLogout} className='flex items-center w-full p-2 hover:bg-gray-700 rounded-md'>
                        <FaSignOutAlt className="mr-2"/>ログアウト
                    </button>
                </div>
            )}
            </aside>
          <main className="flex-1 p-4 md:ml-64">
            {/* Content will be rendered here */}
          </main>
          </div>
        </div>
    );
};

export default SideBar;
