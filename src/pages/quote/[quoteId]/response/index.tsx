import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaHome, FaList, FaPlus, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const QuoteResponse = () => {
  const router = useRouter();
  const { quoteId } = router.query;
  const [responseDetails, setResponseDetails] = useState({
    quote_id: '',
      status: '',
      quote_item_id: '',
      unit_price: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quoteId) {
        fetchQuoteResponse();
    }
  }, [quoteId]);

    const fetchQuoteResponse = async () => {
    setLoading(true);
      try {
      const { data, error } = await supabase
          .from('quotes')
          .select('quote_id, status')
          .eq('quote_id', quoteId)
            .single();

      if(error){
        console.error('Error fetching quote:', error);
          setMessage('見積情報の取得に失敗しました。');
            setResponseDetails({
                quote_id: quoteId,
              status: '未回答',
                quote_item_id: '',
              unit_price: '',
            });
      }else{
        console.log('Fetched quote:', data)
        const { data: itemData, error: itemError } = await supabase
          .from('quote_items')
          .select('quote_item_id, unit_price')
          .eq('quote_id', quoteId)
            .single();

            if(itemError){
                console.error('Error fetching quote items:', itemError);
                setMessage('見積情報の取得に失敗しました。');
              setResponseDetails({
                  quote_id: data.quote_id,
                status: data.status || '未回答',
                  quote_item_id: '',
                unit_price: '',
              });
            }else{
                console.log('Fetched quote items:', itemData)
            setResponseDetails({
                  quote_id: data.quote_id,
                status: data.status || '未回答',
              quote_item_id: itemData.quote_item_id,
                unit_price: itemData.unit_price || '',
              });
            }
      }
      } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('データの取得に失敗しました。');
        setResponseDetails({
            quote_id: quoteId,
            status: '未回答',
          quote_item_id: '',
            unit_price: '',
        });
    } finally {
        setLoading(false);
    }
  };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setResponseDetails(prev => ({ ...prev, [name]: value }));
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        let errors = {};
        let isValid = true;

      if (!responseDetails.status) {
          errors.status = '回答状況を入力してください。';
          isValid = false;
      }
    if (!responseDetails.unit_price) {
            errors.unit_price = '単価を入力してください。';
          isValid = false;
        }
    
    setFormErrors(errors);
      return isValid;
    };

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
    setLoading(true);
      try {
      const { data: quoteData, error: quoteError } = await supabase
          .from('quotes')
          .update({ status: responseDetails.status })
          .eq('quote_id', quoteId)
          .select('quote_id, status')
              .single();

            if (quoteError) {
              console.error('Error updating quote:', quoteError);
              setMessage('見積回答の更新に失敗しました。');
              return;
            }

        const { data: itemData, error: itemError } = await supabase
          .from('quote_items')
          .update({ unit_price: responseDetails.unit_price })
            .eq('quote_item_id', responseDetails.quote_item_id)
          .select('quote_item_id, unit_price')
              .single();

        if (itemError) {
          console.error('Error updating quote items:', itemError);
          setMessage('見積回答の更新に失敗しました。');
          return;
            }

        setMessage('見積回答が更新されました。');
          setTimeout(() => {
            setMessage('');
        }, 3000);
    } catch (error) {
          console.error('Error updating data:', error);
        setMessage('データの更新に失敗しました。');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
        <Sidebar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">見積回答画面</h1>
        <div className="bg-white shadow rounded-lg p-6">
        {loading ? (<div className="text-center">Loading...</div>) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quote_id">見積ID:</label>
                    <input type="text" id="quote_id" name="quote_id" value={responseDetails.quote_id}  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" disabled/>
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">回答状況:</label>
                      <select
                        id="status"
                        name="status"
                        value={responseDetails.status}
                        onChange={handleInputChange}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.status ? 'border-red-500' : ''}`}
                        >
                        <option value="">選択してください</option>
                        <option value="回答済">回答済</option>
                        <option value="未回答">未回答</option>
                      </select>
                      {formErrors.status && <p className="text-red-500 text-xs italic">{formErrors.status}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="unit_price">単価:</label>
                    <input
                      type="number"
                      id="unit_price"
                      name="unit_price"
                      value={responseDetails.unit_price}
                      onChange={handleInputChange}
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.unit_price ? 'border-red-500' : ''}`}
                    />
                  {formErrors.unit_price && <p className="text-red-500 text-xs italic">{formErrors.unit_price}</p>}
                </div>
                <div className="flex justify-between">
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                      更新
                    </button>
                     <Link href={`/quote/${quoteId}`}><button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                      戻る
                    </button></Link>
                </div>
            </form>
        )}
        {message && <p className="mt-4 text-green-500">{message}</p>}
        </div>
      </main>
    </div>
  );
};



const Sidebar = () => {
  return (
    <aside className="bg-gray-800 text-white w-64 fixed top-0 left-0 h-full">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">メニュー</h2>
        <nav>
          <ul>
             <li className="mb-2">
               <Link href="/" >
                 <div className="flex items-center hover:bg-gray-700 p-2 rounded">
                    <FaHome className="mr-2" />
                     ホーム
                   </div>
               </Link>
             </li>
            <li className="mb-2">
              <Link href="/quote" >
                <div className="flex items-center hover:bg-gray-700 p-2 rounded">
                  <FaList className="mr-2" />
                   見積一覧
                </div>
              </Link>
            </li>
            
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default QuoteResponse;