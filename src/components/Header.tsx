import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { AiOutlineMenu } from 'react-icons/ai';

const Header: React.FC = () => {
    const router = useRouter();
    const session = useSession();
    const supabaseClient = useSupabaseClient();

    const handleLogout = async () => {
        await supabaseClient.auth.signOut();
        router.push('/login');
    };

    return (
        <header className="bg-gray-100 shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center">
                    <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-gray-600">
                        RECERQA AI
                    </Link>
                </div>
                <nav className="hidden md:flex space-x-6">
                    <Link href="/" className="text-gray-700 hover:text-gray-500">ホーム</Link>
                    <Link href="/search" className="text-gray-700 hover:text-gray-500">商品検索</Link>
                    <Link href="/history" className="text-gray-700 hover:text-gray-500">発注履歴</Link>
                    <Link href="/dashboard" className="text-gray-700 hover:text-gray-500">ダッシュボード</Link>
                    {session ? (
                        <button onClick={handleLogout} className="text-gray-700 hover:text-gray-500">
                            ログアウト
                        </button>
                    ) : (
                        <Link href="/login" className="text-gray-700 hover:text-gray-500">
                            ログイン
                        </Link>
                    )}
                </nav>
                <div className="md:hidden">
                    <button className="text-gray-700 hover:text-gray-500">
                    <AiOutlineMenu size={24} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
