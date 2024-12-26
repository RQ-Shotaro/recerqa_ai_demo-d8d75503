import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaArrowLeft, FaRegFileAlt, FaHistory, FaPaperPlane, FaReply } from 'react-icons/fa';
import {Header} from '@/components/Header';
import {Footer} from '@/components/Footer';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const QuoteDetail = () => {
  const router = useRouter();
  const { quoteId } = router.query;
  const [quote, setQuote] = useState(null);
  const [quoteItems, setQuoteItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuoteData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!quoteId) {
          setError('見積IDが指定されていません。');
          setLoading(false);
          return;
        }

        const { data: quotesData, error: quotesError } = await supabase
          .from('quotes')
          .select('quote_id, quote_date, supplier_id, status, valid_until')
          .eq('quote_id', quoteId)
          .single();

        if (quotesError) {
          throw new Error(`見積情報の取得に失敗しました: ${quotesError.message}`);
        }
        if (!quotesData) {
          throw new Error("見積情報が見つかりませんでした。");
        }

        setQuote(quotesData);

        const { data: itemsData, error: itemsError } = await supabase
          .from('quote_items')
          .select('product_id, quantity, unit_price')
          .eq('quote_id', quoteId);

        if (itemsError) {
            throw new Error(`見積品目情報の取得に失敗しました: ${itemsError.message}`);
          }
          setQuoteItems(itemsData || []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteData();
  }, [quoteId]);

  if (loading) {
    return <div className="min-h-screen h-full flex items-center justify-center">Loading...</div>;
  }

  if (error) {
        return (
            <div className="min-h-screen h-full flex items-center justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">エラー:</strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }


  return (
    <div className="min-h-screen h-full bg-gray-100">
        <Header />
      <div className="container mx-auto p-4">
      <div className="mb-4">
            <Link href="/quote" className="inline-flex items-center text-blue-500 hover:text-blue-700">
              <FaArrowLeft className="mr-1" /> 見積一覧へ戻る
            </Link>
          </div>
      
        <h1 className="text-2xl font-bold mb-4">見積詳細</h1>

        {quote && (
          <div className="bg-white shadow rounded p-4 mb-4">
            <div className="flex justify-between mb-2">
            <p className="text-gray-700"><strong>見積ID:</strong> {quote.quote_id}</p>
            <p className="text-gray-700"><strong>ステータス:</strong> {quote.status}</p>
            </div>
            <div className="flex justify-between mb-2">
              <p className="text-gray-700"><strong>見積日:</strong> {new Date(quote.quote_date).toLocaleDateString()}</p>
              <p className="text-gray-700"><strong>仕入先ID:</strong> {quote.supplier_id}</p>
            </div>
             <p className="text-gray-700 mb-2"><strong>有効期限:</strong> {new Date(quote.valid_until).toLocaleDateString()}</p>
          </div>
        )}

        <div className="bg-white shadow rounded p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">商品リスト</h2>
          {quoteItems.length > 0 ? (
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2">商品ID</th>
                  <th className="px-4 py-2">数量</th>
                  <th className="px-4 py-2">単価</th>
                </tr>
              </thead>
              <tbody>
                {quoteItems.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{item.product_id}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                    <td className="px-4 py-2">{item.unit_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>商品データがありません。</p>
          )}
        </div>

        <div className="flex justify-around">
        <Link href={`/quote/request/${quoteId}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center">
            <FaPaperPlane className="mr-2" /> 見積依頼
        </Link>
          <Link href={`/quote/response/${quoteId}`} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center">
            <FaReply className="mr-2" /> 見積回答
          </Link>
          <Link href={`/quote/history/${quoteId}`}  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center">
            <FaHistory className="mr-2" /> 見積履歴
          </Link>

        </div>


      </div>
      <Footer />
    </div>
  );
};

export default QuoteDetail;
