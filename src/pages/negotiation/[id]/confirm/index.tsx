import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaBars, FaHome, FaList, FaCog, FaArrowLeft } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const ConfirmPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [negotiation, setNegotiation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchNegotiation = async () => {
      setLoading(true);
      setError(null);
      try {
        if (id) {
          const { data, error } = await supabase
            .from('negotiations')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            setError(error.message);
            console.error('Supabase error:', error);
            setNegotiation(sampleNegotiation);
          } else {
            setNegotiation(data);
          }
        } else {
          setNegotiation(sampleNegotiation);
        }
      } catch (err: any) {
        setError(err.message || 'データの取得中にエラーが発生しました。');
        console.error('Error fetching negotiation:', err);
          setNegotiation(sampleNegotiation);
      } finally {
        setLoading(false);
      }
    };

    fetchNegotiation();
  }, [id]);

  const handleConfirm = () => {
    router.push(`/negotiation/${id}/result`);
  };

    const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const sampleNegotiation = {
    id: id || 'sample-id',
    details: 'サンプル調整内容詳細',
    current_price: '10000',
    proposed_price: '9500',
    current_delivery_date: '2024-09-30',
    proposed_delivery_date: '2024-10-15',
    reason: 'サンプル調整理由',
    supplier_name: 'サンプル仕入先',
    customer_name: 'サンプル得意先'
  };

  if (loading) {
    return <div className="min-h-screen h-full flex justify-center items-center">読み込み中...</div>;
  }

  if (error) {
    return <div className="min-h-screen h-full flex justify-center items-center text-red-500">エラー: {error}</div>;
  }

  return (
    <div className="min-h-screen h-full bg-gray-100 flex">
       {/* Sidebar */}      <div className={`bg-gray-800 text-white w-64 p-4  transition-transform duration-300 ease-in-out  ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

        <div className="mb-8 flex justify-between items-center">
          <span className="text-2xl font-bold">RECERQA AI</span>
         <button onClick={toggleSidebar} className="md:hidden">
            <FaBars className="h-6 w-6"/>
          </button>
        </div>

        <nav>
        <Link href="/"  className="block py-2 px-4 hover:bg-gray-700 flex items-center">
              <FaHome className="mr-2" /> ホーム
              </Link>
            <Link href="/negotiation"  className="block py-2 px-4 hover:bg-gray-700 flex items-center">
              <FaList className="mr-2"/> 調整一覧
            </Link>
             <Link href="/settings"  className="block py-2 px-4 hover:bg-gray-700 flex items-center">
              <FaCog className="mr-2"/> 設定
            </Link>
          </nav>
      </div>
      {/* Main Content */}       <div className="flex-1 p-4">
      <button onClick={() => router.back()} className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-800">
        <FaArrowLeft className="mr-2" /> 戻る
      </button>
        <h1 className="text-2xl font-semibold mb-4">調整内容確認</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">調整内容詳細</h2>
          <div className="mb-4">
            <p className="text-gray-600">仕入先: {negotiation?.supplier_name}</p>
            <p className="text-gray-600">得意先: {negotiation?.customer_name}</p>
            <p className="text-gray-600">調整理由: {negotiation?.reason}</p>
            <p className="text-gray-600">調整内容詳細: {negotiation?.details}</p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">現在の条件</h3>
            <p className="text-gray-600">現在の金額: {negotiation?.current_price}円</p>
            <p className="text-gray-600">現在の納期: {negotiation?.current_delivery_date}</p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">提案された条件</h3>
            <p className="text-gray-600">提案された金額: {negotiation?.proposed_price}円</p>
            <p className="text-gray-600">提案された納期: {negotiation?.proposed_delivery_date}</p>
          </div>
          <div className="mt-6">
            <button
              onClick={handleConfirm}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              確認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPage;
