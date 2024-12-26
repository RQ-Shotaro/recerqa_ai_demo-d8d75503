import React from 'react';
import {  useRouter } from 'next/router';
import Link from 'next/link';
import { FaHome, FaList, FaUser, FaCog } from 'react-icons/fa';
import { useUser } from '@/supabase';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';


const Footer: React.FC = () => {
    const router = useRouter();
    const { user } = useUser();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
      <footer className="bg-gray-100 dark:bg-gray-800 border-t dark:border-gray-700 min-h-screen h-full">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center">
        <div className="text-gray-600 dark:text-gray-400 text-center md:text-left mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} RECERQA AI. All rights reserved.
        </div>
          <nav className="flex space-x-6 md:space-x-8">
              <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition duration-300 flex flex-col items-center">
                <FaHome className="text-xl mb-1" />
                <span className="text-xs">ホーム</span>
              </Link>

            {user && (
                <Link href="/order/list" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition duration-300 flex flex-col items-center">
                 <FaList className="text-xl mb-1" />
                 <span className="text-xs">受発注一覧</span>
                </Link>
              )}

           {user ? (
                <button onClick={handleLogout} className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition duration-300 flex flex-col items-center">
                  <FaUser className="text-xl mb-1"/>
                  <span className="text-xs">ログアウト</span>
              </button>
                ) : (
                <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition duration-300 flex flex-col items-center">
                 <FaUser className="text-xl mb-1" />
                  <span className="text-xs">ログイン</span>
              </Link>
              )}
          {user && (
          <Link href="/setting/salesAgent" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition duration-300 flex flex-col items-center">
              <FaCog className="text-xl mb-1" />
              <span className="text-xs">設定</span>
          </Link>
          )}
          </nav>
        </div>
      </footer>
    );
};

export default Footer;
