import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaHome, FaList, FaChartBar, FaCalendarAlt, FaCog } from 'react-icons/fa';


const SideMenu: React.FC = () => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className={`fixed top-0 left-0 h-full bg-gray-100 text-gray-800 shadow-md z-50 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 `} style={{ width: '250px' }}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
                <span className="text-lg font-semibold">メニュー</span>
                <button onClick={toggleMenu} className="text-gray-600 hover:text-gray-800 focus:outline-none">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <nav className="p-4">
                 <Link href="/dashboard"  className="block py-2 px-4 hover:bg-gray-200 rounded flex items-center gap-2">
                     <FaHome className="h-5 w-5" />
                    ダッシュボード
                 </Link>
                <Link href="/order/list" className="block py-2 px-4 hover:bg-gray-200 rounded flex items-center gap-2">
                     <FaList className="h-5 w-5" />
                   受発注一覧
                </Link>
                <Link href="/analytics"  className="block py-2 px-4 hover:bg-gray-200 rounded flex items-center gap-2">
                    <FaChartBar className="h-5 w-5" />
                    分析レポート
                </Link>
                <Link href="/calendar" className="block py-2 px-4 hover:bg-gray-200 rounded flex items-center gap-2">
                  <FaCalendarAlt className="h-5 w-5" />
                   カレンダー
                </Link>
                <Link href="/setting/salesAgent" className="block py-2 px-4 hover:bg-gray-200 rounded flex items-center gap-2">
                  <FaCog className="h-5 w-5" />
                    設定
                </Link>
            </nav>
        </div>
    );
};

export default SideMenu;
