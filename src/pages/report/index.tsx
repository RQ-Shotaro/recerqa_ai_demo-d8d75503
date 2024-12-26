import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaChartBar, FaFileDownload } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const Report = () => {
  const router = useRouter();
  const [reportData, setReportData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('order_date, order_status')
          .order('order_date', { ascending: false });

        if (error) {
          console.error('Error fetching data:', error);
          setError('データの取得に失敗しました。');
          setReportData([
              {
                order_date: '2024-07-25',
                order_status: '準備中',
              },
              {
                order_date: '2024-07-24',
                order_status: '配送中',
              },
              {
                order_date: '2024-07-23',
                order_status: '完了',
              },
            ])
        } else {
          setReportData(data);
        }
      } catch (err: any) {
        console.error('Unexpected error:', err);
        setError('予期せぬエラーが発生しました。');
         setReportData([
              {
                order_date: '2024-07-25',
                order_status: '準備中',
              },
              {
                order_date: '2024-07-24',
                order_status: '配送中',
              },
              {
                order_date: '2024-07-23',
                order_status: '完了',
              },
            ])
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const filteredData = reportData.filter((item: any) => {
    if (!filter) return true;
    return item.order_status.toLowerCase().includes(filter.toLowerCase());
  });

  const handleDownload = () => {
    const jsonString = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


const handleNavigation = (path: string) => {
    router.push(path);
  };

  const chartData = filteredData.map((item:any) => ({
    name: item.order_date,
    status: item.order_status,
  }));


  return (
    <div className="min-h-screen h-full bg-gray-100 flex">
      <aside className="bg-gray-800 text-white w-64 p-4">
        <nav>
           <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">メニュー</h2>
            </div>
            <ul>
             <li className="mb-2">
                <button onClick={() => handleNavigation('/dashboard')} className="block px-4 py-2 hover:bg-gray-700 rounded w-full text-left">
                  ダッシュボード
                </button>
              </li>
              <li className="mb-2">
                  <button onClick={() => handleNavigation('/stockLevel')}  className="block px-4 py-2 hover:bg-gray-700 rounded w-full text-left">
                  在庫レベル設定
                   </button>
              </li>
                <li className="mb-2">
                  <button onClick={() => handleNavigation('/orderHistory')}  className="block px-4 py-2 hover:bg-gray-700 rounded w-full text-left">
                  取引履歴分析
                   </button>
              </li>
                <li className="mb-2">
                   <button onClick={() => handleNavigation('/demandForecast')}  className="block px-4 py-2 hover:bg-gray-700 rounded w-full text-left">
                   需要予測
                   </button>
                </li>
              <li className="mb-2">
                   <button onClick={() => handleNavigation('/autoOrderSetting')}  className="block px-4 py-2 hover:bg-gray-700 rounded w-full text-left">
                   自動発注設定
                   </button>
              </li>
             <li className="mb-2">
                  <button onClick={() => handleNavigation('/orderList')}  className="block px-4 py-2 hover:bg-gray-700 rounded w-full text-left">
                    発注一覧
                  </button>
              </li>
               <li className="mb-2">
                   <button onClick={() => handleNavigation('/report')}  className="block px-4 py-2 hover:bg-gray-700 rounded w-full text-left">
                    レポート
                   </button>
              </li>

            </ul>
        </nav>
      </aside>
      <main className="flex-1 p-4">
         <div className="bg-white shadow rounded-lg p-4 mb-4">
          <h1 className="text-2xl font-bold mb-4 flex items-center"><FaChartBar className="mr-2" />レポート</h1>
           <div className="mb-4 flex items-center">
            <input
              type="text"
              placeholder="ステータスでフィルタリング"    
              value={filter}
              onChange={handleFilterChange}
              className="border p-2 rounded mr-2"
            />
            <button onClick={handleDownload} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center">
              <FaFileDownload className="mr-2" />ダウンロード
            </button>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
             <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-2">日付</th>
                      <th className="px-4 py-2">ステータス</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="border px-4 py-2">{item.order_date}</td>
                        <td className="border px-4 py-2">{item.order_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
          )}
        </div>
           <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">発注ステータスチャート</h2>
                <ResponsiveContainer width="100%" height={400}>
                     <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="status" fill="#8884d8" />
                    </BarChart>
                 </ResponsiveContainer>
           </div>
      </main>
    </div>
  );
};

export default Report;