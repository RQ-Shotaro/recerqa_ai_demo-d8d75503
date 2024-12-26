import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaHome } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const OrderComp = () => {
  const router = useRouter();
  const [message, setMessage] = useState('発注が完了しました。');

  useEffect(() => {
    // Here you can add any necessary logic after the order is completed.
    // For example, clearing the cart or performing other actions.
  }, []);

  return (
    <div className="min-h-screen h-full bg-[#f0f0f0] flex flex-col">
       <header className="bg-[#333333] text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">RECERQA AI</Link>
        </div>
      </header>
      <div className="flex-1 container mx-auto p-4 flex justify-center items-center">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4 text-center">発注完了</h2>
          <div className="text-center text-lg mb-6">{message}</div>
          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="bg-[#007bff] hover:bg-[#0056b3] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              メインメニューへ戻る
            </button>
          </div>
        </div>
      </div>
    <footer className="bg-[#333333] text-white text-center p-4">
        <p>&copy; {new Date().getFullYear()} RECERQA AI</p>
      </footer>
    </div>
  );
};

export default OrderComp;
