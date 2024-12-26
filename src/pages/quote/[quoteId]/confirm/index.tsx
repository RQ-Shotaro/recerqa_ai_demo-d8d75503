import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaHome, FaList, FaCheck, FaEdit } from 'react-icons/fa';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const Confirm = () => {
  const router = useRouter();
  const { quoteId } = router.query;
  const [quote, setQuote] = useState<any>(null);
  const [quoteItems, setQuoteItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuoteData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!quoteId) {
            setError('見積IDが無効です。');
            setLoading(false);
            return;
        }

        const { data: quoteData, error: quoteError } = await supabase
          .from('quotes')
          .select('quote_id, quote_date, supplier_id, status, valid_until')
          .eq('quote_id', quoteId)
          .single();

        if (quoteError) {
          console.error('見積データの取得エラー:', quoteError);
          throw new Error('見積データの取得に失敗しました。');
        }

        if (!quoteData) {
            setError('見積データが見つかりません。');
            setLoading(false);
            return;
        }
        setQuote(quoteData);

        const { data: itemsData, error: itemsError } = await supabase
          .from('quote_items')
          .select('product_id, quantity, unit_price')
          .eq('quote_id', quoteId);

        if (itemsError) {
          console.error('見積アイテムの取得エラー:', itemsError);
          throw new Error('見積アイテムの取得に失敗しました。');
        }
        setQuoteItems(itemsData || []);
      } catch (err:any) {
        setError(err.message || 'データの取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    if (quoteId) {
      fetchQuoteData();
    }
  }, [quoteId]);

    const handleApprove = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!quoteId) {
                setError('見積IDが無効です。');
                setLoading(false);
                return;
            }

            const { error: updateError } = await supabase
                .from('quotes')
                .update({ status: '承認済み' })
                .eq('quote_id', quoteId);

            if (updateError) {
                console.error('見積ステータスの更新エラー:', updateError);
                throw new Error('見積ステータスの更新に失敗しました。');
            }
            router.push('/quote');
        } catch (err:any) {
          setError(err.message || '見積ステータスの更新中にエラーが発生しました。');
        } finally {
          setLoading(false);
        }
    };

  if (loading) {
    return <div className="min-h-screen h-full flex justify-center items-center">読み込み中...</div>;
  }

  if (error) {
    return <div className="min-h-screen h-full flex justify-center items-center text-red-500">エラー: {error}</div>;
  }

  if (!quote) {
        return <div className="min-h-screen h-full flex justify-center items-center">見積データが見つかりません。</div>;
  }

  return (
    <div className="min-h-screen h-full bg-gray-100">
        <aside className="bg-gray-800 text-white w-64 p-4 fixed h-full">
            <nav>
            <Link href="/" className='block hover:bg-gray-700 p-2 rounded mb-2'>
              <div className='flex items-center'>
                <FaHome className='mr-2' />ホーム
              </div>
            </Link>
            <Link href="/quote" className='block hover:bg-gray-700 p-2 rounded mb-2'>
               <div className='flex items-center'>
                 <FaList className='mr-2' />見積一覧
                </div>
              </Link>
            </nav>
        </aside>
      <div className="ml-64 p-4">
        <h1 className="text-2xl font-bold mb-4">見積確認</h1>
        <div className="mb-6 bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">見積情報</h2>
          <p>見積ID: {quote.quote_id}</p>
          <p>見積日: {new Date(quote.quote_date).toLocaleDateString()}</p>
          <p>サプライヤーID: {quote.supplier_id}</p>
          <p>ステータス: {quote.status}</p>
           <p>有効期限: {new Date(quote.valid_until).toLocaleDateString()}</p>
        </div>

        <div className="mb-6 bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">商品リスト</h2>
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">商品ID</th>
                <th className="px-4 py-2">数量</th>
                <th className="px-4 py-2">単価</th>
                <th className="px-4 py-2">合計</th>
              </tr>
            </thead>
            <tbody>
              {quoteItems.map((item: any) => (
                <tr key={item.product_id} className="border-b">
                  <td className="px-4 py-2">{item.product_id}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">{item.unit_price}</td>
                  <td className="px-4 py-2">{(item.quantity * item.unit_price).toFixed(2)}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end space-x-4">
          <button onClick={handleApprove} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center">
              <FaCheck className='mr-2'/> 承認
          </button>
          <Link href={`/quote/${quoteId}/edit`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center no-underline">
            <FaEdit className='mr-2'/> 修正
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Confirm;
