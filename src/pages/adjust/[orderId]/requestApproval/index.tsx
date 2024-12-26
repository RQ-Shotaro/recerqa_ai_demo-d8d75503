import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const RequestApproval = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        if (orderId) {
            const { data, error } = await supabase
                .from('purchase_orders')
                .select('order_status')
                .eq('purchase_order_id', orderId)
                .single();
            if (error) {
                console.error('Supabase error fetching order status:', error);
                setError('データ取得中にエラーが発生しました。');
                setOrderStatus('エラー'); // Set a default error state
            } else if (data) {
                setOrderStatus(data.order_status);
            } else {
              setError('注文ステータスが見つかりませんでした。');
            }
        } else {
            setError('注文IDが無効です。');
        }
      } catch (err: any) {
        console.error('Error fetching order status:', err);
        setError('データ取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderStatus();
  }, [orderId]);

    const handleRequestApproval = async () => {
        setLoading(true);
        setError(null);
        try {
            if (orderId) {
              const { error } = await supabase
                .from('purchase_orders')
                .update({ order_status: '承認依頼中'})
                .eq('purchase_order_id', orderId)

              if (error) {
                console.error('Supabase error updating order status:', error);
                setError('承認依頼中にエラーが発生しました。');
              } else {
                router.push(`/adjust/${orderId}/reAdjust`);
              }
            } else {
                setError('注文IDが無効です。');
            }
        } catch (err: any) {
            console.error('Error updating order status:', err);
            setError('承認依頼中にエラーが発生しました。');
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="min-h-screen h-full bg-gray-100 flex flex-col">
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center">
          <Link href={`/adjust/${orderId}`}><FaArrowLeft className="mr-2 text-gray-600 hover:text-gray-800" /></Link>
            <h1 className="text-xl font-bold text-gray-800">承認依頼画面</h1>
          </div>
          <nav>
            <ul className="flex space-x-4">
            <li className=""><Link href="/" className="text-gray-600 hover:text-gray-800">ホーム</Link></li>
               <li className=""><Link href={`/adjust/${orderId}`} className="text-gray-600 hover:text-gray-800">戻る</Link></li>
            </ul>
          </nav>
        </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="bg-white shadow rounded p-6">
            <h2 className="text-lg font-semibold mb-4">仕入条件調整結果の承認依頼</h2>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <div>
                <p className="mb-4">現在の注文ステータス: {orderStatus}</p>
                <div className="flex justify-center">
                  <button onClick={handleRequestApproval} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    承認依頼
                  </button>
                </div>
            </div>
          )}
        </div>
      </main>
       <footer className="bg-gray-200 text-center p-4">
          <p className="text-sm text-gray-600">© 2024 RECERQA AI. All rights reserved.</p>
        </footer>
    </div>
  );
};

export default RequestApproval;
