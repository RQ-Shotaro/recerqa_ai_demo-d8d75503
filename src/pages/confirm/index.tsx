import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaCheckCircle, FaEdit } from 'react-icons/fa';
import { Header } from './Header';
import { Footer } from './Footer';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);


const Confirm: React.FC = () => {
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
      const fetchSession = async () => {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error('Error fetching session:', sessionError);
              setError('セッションの取得に失敗しました。');
              setLoading(false);
              return;
          }

           if (session) {
            setUser(session.user);
            fetchOrderData(session.user.id)
          } else {
              router.push('/login');
          }
        };
    fetchSession();
  }, []);

  const fetchOrderData = async (userId: string) => {
    setLoading(true);
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
              order_id,
              order_date,
              order_status,
              customers (customer_name),
              order_items (
              quantity,
              unit_price,
                products(product_name)
              )
        `)
        .eq('customer_id', userId)
          .order('order_date', { ascending: false })
          .limit(1); //直近の注文を一つ取得

        if (error) {
          console.error('Error fetching order data:', error);
            setError('注文データの取得に失敗しました。');
        } else if (data && data.length > 0) {
            const latestOrder = data[0];
             setOrderData(latestOrder);
        } else {
             setError('注文データが見つかりませんでした。');
        }
    } catch (err: any) {
      console.error('Unexpected error:', err);
        setError('予期せぬエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };


  const handleConfirmOrder = async () => {
      if (!orderData || !user) {
        setError('発注データを読み込めませんでした。');
        return;
      }
      setLoading(true);
    try {
      const { error: updateError } = await supabase
          .from('orders')
          .update({ order_status: '発注済' })
          .eq('order_id', orderData.order_id)

       if (updateError) {
           console.error('Error updating order status:', updateError);
           setError('発注の確定に失敗しました。');
        } else {
          router.push('/complete');
        }
    } catch (err: any) {
      console.error('Error confirming order:', err);
        setError('発注処理中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrder = () => {
    router.push('/order');
  };

  if (loading) {
    return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen h-full flex justify-center items-center text-red-500">{error}</div>;
  }

  if (!orderData) {
    return <div className="min-h-screen h-full flex justify-center items-center">注文データがありません。</div>;
  }
  return (
    <div className="min-h-screen h-full bg-gray-100">
         <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">発注確認</h1>
        <div className="bg-white shadow rounded p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">発注情報</h2>
            {orderData && (
                  <div>
                  <p className="mb-1"><strong>注文ID:</strong> {orderData.order_id}</p>
                      <p className="mb-1"><strong>注文日:</strong> {orderData.order_date}</p>
                    <p className="mb-1"><strong>顧客名:</strong> {orderData.customers?.customer_name}</p>
                   <h3 className="text-lg font-semibold mb-2">注文商品</h3>
                   <ul>
                    {orderData.order_items && orderData.order_items.map((item:any, index:number) =>(
                       <li key={index} className="mb-2 border-b pb-2">
                         <p><strong>商品名:</strong> {item.products?.product_name}</p>
                         <p><strong>数量:</strong> {item.quantity}</p>
                           <p><strong>単価:</strong> {item.unit_price}</p>
                       </li>
                    ))}
                    </ul>
              </div>
             )}

        </div>
          <div className="flex justify-end space-x-4">
              <button
                  onClick={handleEditOrder}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded flex items-center space-x-2"
              >
                  <FaEdit /> <span>修正する</span>
              </button>
            <button
              onClick={handleConfirmOrder}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center space-x-2"
            >
              <FaCheckCircle /> <span>発注を確定する</span>
            </button>
          </div>
      </div>
     <Footer/>
    </div>
  );
};

export default Confirm;
