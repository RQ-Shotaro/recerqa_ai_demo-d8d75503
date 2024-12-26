import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);


const ReAdjustPage = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const [adjustmentData, setAdjustmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

    useEffect(() => {
    const fetchAdjustmentData = async () => {
      setLoading(true);
      setError(null);
      try {
        if(orderId){
            const { data, error } = await supabase
              .from('purchase_orders')
              .select('*')
              .eq('purchase_order_id', orderId)
              .single();

            if (error) {
                console.error('Error fetching data:', error);
                setError('仕入情報の取得に失敗しました。');
                 setAdjustmentData({
                    purchase_order_id: orderId,
                    supplier_id: 'Sample Supplier ID',
                    order_date: new Date().toISOString().slice(0, 10),
                    order_status: '未調整',
                 });
              }else{
                 setAdjustmentData(data);
            }
          }

      } catch (err:any) {
          console.error('Unexpected error:', err);
          setError('予期せぬエラーが発生しました。');
          setAdjustmentData({
            purchase_order_id: orderId || 'Sample Order ID',
            supplier_id: 'Sample Supplier ID',
            order_date: new Date().toISOString().slice(0, 10),
            order_status: '未調整',
         });
      } finally {
        setLoading(false);
      }
    };

    fetchAdjustmentData();
  }, [orderId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdjustmentData((prevData:any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      if (adjustmentData) {
        const { error } = await supabase
          .from('purchase_orders')
          .upsert({ ...adjustmentData, purchase_order_id: orderId });

        if (error) {
          console.error('Error updating data:', error);
          setMessage('データの更新に失敗しました。');
        } else {
          setMessage('再調整が完了しました。');
          setTimeout(() => {
            router.push(`/adjust/${orderId}`);
          }, 1500);
        }
      }
    } catch (err: any) {
        console.error('Unexpected error:', err);
        setMessage('予期せぬエラーが発生しました。');
    } finally {
        setIsSubmitting(false);
      }
  };

    if (loading) {
    return <div className="min-h-screen h-full flex items-center justify-center">Loading...</div>;
    }

  if (error) {
    return (
      <div className="min-h-screen h-full flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

    return (
    <div className="min-h-screen h-full bg-gray-100">
      <header className="bg-blue-500 p-4 text-white flex justify-between items-center">
        <Link href='/adjust' className='flex items-center space-x-2 hover:text-blue-200'>
         <FaArrowLeft />
            <span>仕入調整一覧へ戻る</span>
        </Link>
          <h1 className="text-2xl font-semibold">再調整画面</h1>
        <div></div>
      </header>
      <div className="container mx-auto p-4">
      {message && <div className={`mb-4 p-2 text-white ${message.includes('失敗') ? 'bg-red-500' : 'bg-green-500'}`}>{message}</div>}
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="purchase_order_id">
              発注ID
            </label>
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="purchase_order_id"
                type="text"
                name="purchase_order_id"
                value={adjustmentData?.purchase_order_id || ''}
                onChange={handleInputChange}
                disabled
              />
          </div>
            <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supplier_id">
              仕入先ID
            </label>
             <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="supplier_id"
                type="text"
                name="supplier_id"
                value={adjustmentData?.supplier_id || ''}
                onChange={handleInputChange}
              />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="order_date">
              発注日
            </label>
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="order_date"
                type="date"
                name="order_date"
                value={adjustmentData?.order_date?.slice(0, 10) || ''}
                onChange={handleInputChange}
              />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="order_status">
              ステータス
            </label>
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="order_status"
                type="text"
                name="order_status"
                value={adjustmentData?.order_status || ''}
                onChange={handleInputChange}
              />
          </div>

          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={isSubmitting}
            >
              <span className='flex items-center space-x-2'><FaSave /><span>保存</span></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReAdjustPage;
