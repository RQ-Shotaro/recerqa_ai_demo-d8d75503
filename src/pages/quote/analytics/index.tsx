import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { FaChartBar, FaFileAlt, FaHome, FaCog } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const QuoteAnalytics = () => {
    const router = useRouter();
    const [quotes, setQuotes] = useState<any[]>([]);
    const [quoteItems, setQuoteItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuotesData = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: quotesData, error: quotesError } = await supabase
                    .from('quotes')
                    .select('quote_id, quote_date, supplier_id, status, valid_until');

                if (quotesError) {
                    console.error('Error fetching quotes:', quotesError);
                    setError('見積もりデータの取得に失敗しました。');
                    setQuotes([{"quote_id":"sample-1","quote_date":"2024-07-20","supplier_id":"supplier-1","status":"pending","valid_until":"2024-07-30"},{"quote_id":"sample-2","quote_date":"2024-07-22","supplier_id":"supplier-2","status":"completed","valid_until":"2024-08-01"}]);
                } else {
                    setQuotes(quotesData || []);
                }
                const { data: quoteItemsData, error: quoteItemsError } = await supabase
                    .from('quote_items')
                    .select('product_id, quantity, unit_price');
                    if(quoteItemsError){
                        console.error('Error fetching quote items:', quoteItemsError);
                        setError('見積品目データの取得に失敗しました。');
                        setQuoteItems([{"product_id":"product-1","quantity":10,"unit_price":100},{"product_id":"product-2","quantity":5,"unit_price":200}]);
                    } else {
                        setQuoteItems(quoteItemsData || []);
                    }

            } catch (err:any) {
                console.error('Unexpected error:', err);
                setError('予期せぬエラーが発生しました。');
                 setQuotes([{"quote_id":"sample-1","quote_date":"2024-07-20","supplier_id":"supplier-1","status":"pending","valid_until":"2024-07-30"},{"quote_id":"sample-2","quote_date":"2024-07-22","supplier_id":"supplier-2","status":"completed","valid_until":"2024-08-01"}]);
                 setQuoteItems([{"product_id":"product-1","quantity":10,"unit_price":100},{"product_id":"product-2","quantity":5,"unit_price":200}]);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotesData();
    }, []);

     // Sample data for the chart
    const chartData = {
      labels: quotes.map((quote, index) => `見積 ${index + 1}`), // Use quote IDs as labels
      datasets: [
        {
          label: '見積金額', // Example data: total value of each quote
          backgroundColor: '#007bff',
          borderColor: '#007bff',          
          borderWidth: 1,
          data: quotes.map(quote => {
              const total = quoteItems.filter(item => quote.quote_id === item.quote_id)
              .reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
                return total;
            }),
        },
      ],
    };
      
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: '金額 (円)' },
        },
        x: {
          title: { display: true, text: '見積ID' },
        },
      },
      plugins: {
        legend: { display: false },
      },
    };

      const renderQuoteReport = () => {
        if (quotes.length === 0) {
            return <p className="text-gray-600">見積データがありません。</p>;
          }
    
        return (
           <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b">見積ID</th>
                  <th className="py-2 px-4 border-b">見積日</th>
                  <th className="py-2 px-4 border-b">サプライヤーID</th>
                  <th className="py-2 px-4 border-b">ステータス</th>
                  <th className="py-2 px-4 border-b">有効期限</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.quote_id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{quote.quote_id}</td>
                    <td className="py-2 px-4 border-b">{quote.quote_date}</td>
                    <td className="py-2 px-4 border-b">{quote.supplier_id}</td>
                    <td className="py-2 px-4 border-b">{quote.status}</td>
                    <td className="py-2 px-4 border-b">{quote.valid_until}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          );
        };


  return (
    <div className="min-h-screen h-full bg-gray-100">
        <div className="flex">
             <aside className="bg-gray-800 text-white w-64 min-h-screen">
                <div className="p-4">
                     <h2 className="text-2xl font-bold mb-4">RECERQA</h2>
                         <nav>
                             <Link href="/" legacyBehavior>
                                 <div className="flex items-center p-2 hover:bg-gray-700 cursor-pointer">
                                     <FaHome className="mr-2" />
                                     ホーム
                                 </div>
                             </Link>
                             <Link href="/quote/list" legacyBehavior>
                                 <div className="flex items-center p-2 hover:bg-gray-700 cursor-pointer">
                                      <FaFileAlt className="mr-2" />
                                     見積一覧
                                 </div>
                             </Link>
                             <Link href="/quote/analytics" legacyBehavior>
                                 <div className="flex items-center p-2 hover:bg-gray-700 cursor-pointer bg-gray-700">
                                     <FaChartBar className="mr-2" />
                                     見積分析
                                 </div>
                             </Link>
                               <Link href="/settings" legacyBehavior>
                                  <div className="flex items-center p-2 hover:bg-gray-700 cursor-pointer">
                                        <FaCog className="mr-2" />
                                      設定
                                  </div>
                             </Link>
                         </nav>
                </div>
          </aside>
        <main className="flex-1 p-4">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">見積分析画面</h1>

        {loading && <p className="text-gray-600">データをロード中...</p>}
        {error && <p className="text-red-500">エラー: {error}</p>}

         {!loading && !error && (
          <div className="mb-8">
              <div className="bg-white p-4 shadow rounded-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">分析結果グラフ</h2>
                <div style={{ height: '400px', position: 'relative' }}>
                   <Bar data={chartData} options={chartOptions} />
                 </div>
              </div>
         </div>
          )}
        {!loading && !error && ( 
        <div className="mb-8">
            <div className="bg-white p-4 shadow rounded-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">レポート表示</h2>
              {renderQuoteReport()}
            </div>
         </div>
        )}
       </main>
     </div>
    </div>
  );
};

export default QuoteAnalytics;
