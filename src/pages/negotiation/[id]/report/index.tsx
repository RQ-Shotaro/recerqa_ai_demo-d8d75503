import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaHome, FaList, FaCog, FaFileAlt, FaChartBar } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const ReportPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user);
    };

    fetchSession();
  }, []);

  useEffect(() => {
        const fetchReportData = async () => {
            setLoading(true);
            setError(null);
            try {
              if (id) {
                  // Assuming you have a 'negotiation_adjustments' table in Supabase
                  const { data, error: fetchError } = await supabase
                  .from('negotiation_adjustments')
                  .select('*')
                  .eq('id', id)
                  .single();
    
                if (fetchError) {
                    console.error('Error fetching report data:', fetchError);
                    setError('データ取得中にエラーが発生しました。');
                } else {
                  setReportData(data);
                }
              }
            } catch (err) {
              console.error('Unexpected error fetching data:', err);
              setError('予期せぬエラーが発生しました。');
            } finally {
              setLoading(false);
            }
        };
        if(user){
            fetchReportData();
        }
    }, [id, user]);

    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
    };
    
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

  if (!user) {
    return (
        <div className="min-h-screen h-full flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded shadow-md">
            <p className="text-gray-700">ログインしてください。</p>
            <Link href="/login">
              <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                 ログイン画面へ
                </button>
            </Link>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen h-full bg-gray-100">
       <div className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 p-4 z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">メニュー</h2>
                <button onClick={toggleMenu} className="text-2xl">×</button>
            </div>
             <nav>
             <Link href="/"  className="block py-2 px-4 hover:bg-gray-700 rounded flex items-center">
                 <FaHome className="mr-2" /> ホーム
            </Link>
                <Link href="/negotiation"  className="block py-2 px-4 hover:bg-gray-700 rounded flex items-center">
                    <FaList className="mr-2" /> 調整一覧
                </Link>
                 <Link href="/dashboard" className="block py-2 px-4 hover:bg-gray-700 rounded flex items-center">
                    <FaChartBar className="mr-2" /> ダッシュボード
                 </Link>
                <Link href="/settings"  className="block py-2 px-4 hover:bg-gray-700 rounded flex items-center">
                    <FaCog className="mr-2" /> 設定
                </Link>
                <Link href="/report"  className="block py-2 px-4 hover:bg-gray-700 rounded flex items-center">
                    <FaFileAlt className="mr-2" /> レポート
                </Link>
           </nav>
             <button onClick={handleSignOut} className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full">
                サインアウト
            </button>
          </div>
          <div className="absolute top-0 left-0 ml-4 mt-4 z-50">
                <button onClick={toggleMenu} className="text-3xl text-gray-700 focus:outline-none">☰</button>
            </div>
            <div className={`ml-0 lg:ml-64 p-4 transition-all duration-300 ${isMenuOpen ? 'opacity-30 pointer-events-none' : ''}`}>
        <h1 className="text-2xl font-bold mb-4">調整結果レポート</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {reportData && (
            <div className="bg-white shadow rounded p-4">
            <div className="mb-4">
                <h2 className="text-xl font-semibold">調整詳細</h2>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div><span className="font-medium">調整ID:</span> {reportData.id}</div>
                   <div> <span className="font-medium">調整日:</span> {reportData.created_at}</div>
                     <div><span className="font-medium">調整前の納期:</span> {reportData.original_delivery_date}</div>
                    <div><span className="font-medium">調整後の納期:</span> {reportData.adjusted_delivery_date}</div>
                    <div><span className="font-medium">調整前の金額:</span> {reportData.original_amount}</div>
                    <div><span className="font-medium">調整後の金額:</span> {reportData.adjusted_amount}</div>
                     <div> <span className="font-medium">調整理由:</span> {reportData.reason}</div>
                      <div> <span className="font-medium">ステータス:</span> {reportData.status}</div>

                </div>
                </div>
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-2">追加情報</h2>
                    <p><span className="font-medium">備考:</span> {reportData.notes || 'なし'}</p>
                   {/* 必要に応じて追加情報を表示 */} 
                </div>
                 <div className="mt-6 flex justify-end">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">印刷</button>
                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">ダウンロード</button>
                </div>
            </div>
          )}
          {!reportData && !loading && !error && <p>該当する調整結果が見つかりません。</p>}
      </div>
     </div>
    </div>
  );
};

export default ReportPage;
