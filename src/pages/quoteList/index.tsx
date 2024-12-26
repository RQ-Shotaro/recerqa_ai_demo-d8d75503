import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaBars, FaTimes, FaHome, FaFileInvoiceDollar, FaCog } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);


const QuoteList = () => {
  const [quotes, setQuotes] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();


  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('quotes')
          .select('quote_id, quote_date, supplier_id, status');

        if (error) {
          console.error('Supabase error:', error);
          setError('見積情報の取得に失敗しました。');
          setQuotes([
              {
                quote_id: "SAMPLE-001",
                quote_date: "2024-04-20",
                supplier_id: "SUP-001",
                status: "作成"
              },
              {
                quote_id: "SAMPLE-002",
                quote_date: "2024-04-21",
                supplier_id: "SUP-002",
                status: "送信済"
              }
          ]);


        } else {
            if(data){
              setQuotes(data);
            }
             else{
               setError('見積情報が見つかりませんでした。');
             }

        }
      } catch (err:any) {
          console.error('Unexpected error:', err);
          setError('予期せぬエラーが発生しました。');

        setQuotes([
              {
                quote_id: "SAMPLE-001",
                quote_date: "2024-04-20",
                supplier_id: "SUP-001",
                status: "作成"
              },
              {
                quote_id: "SAMPLE-002",
                quote_date: "2024-04-21",
                supplier_id: "SUP-002",
                status: "送信済"
              }
          ]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };


    const renderSidebar = () => {
      return (
          <div className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 p-4 z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
             <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">メニュー</h2>
               <button onClick={toggleSidebar} className="text-white text-2xl focus:outline-none">
                <FaTimes />
              </button>
            </div>
            <nav>
              <ul>
                   <li className="mb-4">
                    <Link href="/" legacyBehavior>
                        <div className="flex items-center p-2 hover:bg-gray-700 rounded">
                             <FaHome className="mr-2" />
                            ホーム
                         </div>
                     </Link>
                   </li>
                <li className="mb-4">
                 <Link href="/quoteList" legacyBehavior>
                      <div className="flex items-center p-2 hover:bg-gray-700 rounded">
                            <FaFileInvoiceDollar className="mr-2" />
                           見積一覧
                      </div>
                   </Link>
                  </li>
                   <li className="mb-4">
                      <Link href="/setting" legacyBehavior>
                            <div className="flex items-center p-2 hover:bg-gray-700 rounded">
                               <FaCog className="mr-2" />
                              設定
                            </div>
                       </Link>
                  </li>

              </ul>
            </nav>
        </div>
      );
    };

  return (
    <div className="min-h-screen h-full bg-gray-100 text-gray-800">
    {renderSidebar()}
        <div className="flex justify-between items-center p-4 bg-gray-200 shadow-md">
             <button onClick={toggleSidebar} className="text-gray-600 text-3xl focus:outline-none md:hidden">
                <FaBars />
              </button>
              <h1 className="text-2xl font-bold">見積一覧</h1>
              <div></div>
            </div>
      <div className="container mx-auto p-4">
        {loading ? (
          <div className="text-center text-gray-600">Loading quotes...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 border-b">見積ID</th>
                  <th className="py-2 px-4 border-b">見積日</th>
                  <th className="py-2 px-4 border-b">仕入先ID</th>
                  <th className="py-2 px-4 border-b">ステータス</th>
                  <th className="py-2 px-4 border-b">詳細</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote: any) => (
                  <tr key={quote.quote_id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b text-center">{quote.quote_id}</td>
                    <td className="py-2 px-4 border-b text-center">{quote.quote_date}</td>
                    <td className="py-2 px-4 border-b text-center">{quote.supplier_id}</td>
                    <td className="py-2 px-4 border-b text-center">{quote.status}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => router.push(`/quoteDetail?id=${quote.quote_id}`)}
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteList;
