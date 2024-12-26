import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { FaHome, FaUser, FaShoppingCart, FaTruck, FaCreditCard, FaCommentDots, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Order = () => {
  const router = useRouter();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderId, setOrderId] = useState(uuidv4());
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setUserId(user.id);
          }
        };

        fetchUser();
      }, []);

  const handleAddressChange = (e) => {
    setDeliveryAddress(e.target.value);
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (!deliveryAddress || !paymentMethod) {
        setError('配送先住所と支払い方法を選択してください。');
        setLoading(false);
        return;
    }

      const orderData = {
        order_id: orderId,
        customer_id: userId,
        order_date: new Date().toISOString(),
        order_status: '注文受付',
      };

    try {
        const { error } = await supabase
          .from('orders')
          .insert([orderData]);
          
        if (error) {
          console.error('Supabase Error:', error.message);
          setError('発注処理中にエラーが発生しました。');
        } else {
          router.push('/orderconfirm');
        }
    } catch (err) {
        console.error('Unexpected Error:', err.message);
        setError('発注処理中に予期せぬエラーが発生しました。');
    }
      finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100 flex">
    <aside className="w-64 bg-gray-200 p-4">
        <nav>
          <Link href="/" legacyBehavior>
            <div className="flex items-center space-x-2 p-2 hover:bg-gray-300 cursor-pointer">
              <FaHome className="text-gray-600" />
              <span className="text-gray-700">ホーム</span>
            </div>
          </Link>
            <Link href="/profile" legacyBehavior>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-300 cursor-pointer">
                <FaUser className="text-gray-600" />
                <span className="text-gray-700">プロフィール</span>
              </div>
            </Link>
            <Link href="/order" legacyBehavior>
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-300 cursor-pointer bg-gray-300">
                    <FaShoppingCart className="text-gray-600" />
                    <span className="text-gray-700">発注</span>
                </div>
            </Link>
            <Link href="/orderhistory" legacyBehavior>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-300 cursor-pointer">
                <FaTruck className="text-gray-600" />
                <span className="text-gray-700">発注履歴</span>
                </div>
             </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
      <div className="mb-4 flex items-center">
        <Link href="/" legacyBehavior>
            <FaArrowLeft className="text-gray-600 mr-2 cursor-pointer hover:text-gray-800" />
        </Link>
          <h1 className="text-2xl font-bold text-gray-800">発注情報入力画面</h1>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
              <label htmlFor="deliveryAddress" className="block text-gray-700 text-sm font-bold mb-2">配送先住所</label>
              <input
                  type="text"
                  id="deliveryAddress"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="配送先住所を入力してください"
                  value={deliveryAddress}
                  onChange={handleAddressChange}
              />
          </div>
          <div className="mb-4">
              <label htmlFor="paymentMethod" className="block text-gray-700 text-sm font-bold mb-2">支払い方法</label>
              <select
                  id="paymentMethod"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={paymentMethod}
                  onChange={handlePaymentChange}
              >
                  <option value="">選択してください</option>
                  <option value="creditCard">クレジットカード</option>
                  <option value="bankTransfer">銀行振込</option>
                  <option value="paypal">PayPal</option>
              </select>
          </div>
          <div className="flex justify-between items-center">
              <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={handleSubmit}
                  disabled={loading}
              >
                  {loading ? '処理中...' : '発注確認画面へ'}
              </button>
              <Link href="/chat" legacyBehavior>
                <div className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 cursor-pointer">
                  <FaCommentDots />
                  <span className="text-sm">AIチャットサポート</span>
                </div>
            </Link>
          </div>
          </div>
        </main>
    </div>
  );
};

export default Order;