import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/supabase';

const AdjustComplete = () => {
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleBackToOrderList = () => {
    router.push('/order');
  };

  return (
    <div className="min-h-screen h-full bg-gray-100 flex flex-col">
      <header className="bg-blue-500 p-4 text-white text-center">
        <h1 className="text-2xl font-bold">調整完了画面</h1>
      </header>

      <main className="flex-1 p-4 flex flex-col justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">調整が完了しました。</h2>
          <p className="text-gray-700 mb-6">仕入条件の調整が完了しました。発注一覧画面へ遷移します。</p>
          <button
            onClick={handleBackToOrderList}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            発注一覧へ
          </button>
        </div>
      </main>

      <footer className="bg-gray-200 p-4 text-center text-gray-500">
        <p>© 2024 RECERQA AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AdjustComplete;
