import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaBars, FaShoppingCart, FaUser, FaHome, FaList, FaFileInvoiceDollar, FaCog, FaSignOutAlt } from 'react-icons/fa';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
    const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('ログアウトエラー:', error);
    } else {
      router.push('/login');
    }
  };


  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
    <div className="flex items-center">
        <button onClick={toggleSidebar} className="text-white focus:outline-none mr-4 md:hidden">
            <FaBars className="h-6 w-6" />
        </button>
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold">RECERQA AI</span>
        </Link>
    </div>
    <nav className="hidden md:flex space-x-6">
        <Link href="/" className="hover:text-gray-300 flex items-center">
                <FaHome className="mr-1" /> ホーム
            </Link>
            <Link href="/order/list" className="hover:text-gray-300 flex items-center">
                <FaList className="mr-1" /> 受発注一覧
            </Link>
            <Link href="/quote/list" className="hover:text-gray-300 flex items-center">
                <FaFileInvoiceDollar className="mr-1" /> 見積一覧
            </Link>
            <Link href="/setting" className="hover:text-gray-300 flex items-center">
                <FaCog className="mr-1" /> 設定
            </Link>
             <button onClick={handleLogout} className="hover:text-gray-300 flex items-center">
              <FaSignOutAlt className="mr-1" />ログアウト
            </button>
    </nav>
    <div className={`md:hidden fixed top-0 left-0 h-full bg-gray-800 z-50 w-64 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4">
            <div className="flex justify-end">
              <button onClick={toggleSidebar} className="text-white focus:outline-none">
                X
              </button>
            </div>
            <nav className="mt-4 flex flex-col space-y-2">
               <Link href="/" className="block p-2 hover:bg-gray-700 rounded flex items-center">
                  <FaHome className="mr-2" /> ホーム
               </Link>
               <Link href="/order/list" className="block p-2 hover:bg-gray-700 rounded flex items-center">
                   <FaList className="mr-2" /> 受発注一覧
              </Link>
               <Link href="/quote/list" className="block p-2 hover:bg-gray-700 rounded flex items-center">
                 <FaFileInvoiceDollar className="mr-2" /> 見積一覧
                </Link>
                <Link href="/setting" className="block p-2 hover:bg-gray-700 rounded flex items-center">
                    <FaCog className="mr-2" /> 設定
                </Link>
                <button onClick={handleLogout} className="block p-2 hover:bg-gray-700 rounded flex items-center">
                  <FaSignOutAlt className="mr-2" /> ログアウト
                </button>
            </nav>
          </div>
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center p-4">
      <p>&copy; {new Date().getFullYear()} RECERQA AI. All rights reserved.</p>
    </footer>
  );
};

const RequestQuotePage = () => {
    const router = useRouter();
    const { quoteId } = router.query;
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState({});
    const [quoteData, setQuoteData] = useState({
        supplier_id: '',
        quote_date: new Date().toISOString().split('T')[0],
        valid_until: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    useEffect(() => {
        const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
              .from('products')
              .select('product_id,product_name,unit_price');
            if (error) {
              setError(error.message);
            } else {
                setProducts(data || []);
            }
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        };
        fetchProducts();
      }, []);

    const handleQuantityChange = (productId, quantity) => {
        setSelectedProducts(prev => ({
            ...prev,
            [productId]: parseInt(quantity, 10) || 0,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
          try {
            const { data: quote, error: quoteError } = await supabase
              .from('quotes')
              .insert([quoteData])
              .select('quote_id')
              .single();
    
             if (quoteError) {
              setError(quoteError.message);
            } else {
                 const quoteItems = Object.keys(selectedProducts).map(productId => ({
                    quote_id: quote.quote_id,
                    product_id: productId,
                    quantity: selectedProducts[productId],
                  }));
                  const { error: itemsError } = await supabase
                    .from('quote_items')
                    .insert(quoteItems);
    
              if(itemsError) {
                setError(itemsError.message);
               } else {
                   alert('見積依頼が送信されました。');
                   router.push('/quote/list');
                 }
               }
            } catch (err) {
                setError(err.message);
          } finally {
              setLoading(false);
           }
    };

    const handleDateChange = (e, key) => {
    setQuoteData({ ...quoteData, [key]: e.target.value });
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-center text-red-500">Error: {error}</div>;

    return (
      <div className="min-h-screen h-full bg-gray-100">
            <Header />
              <main className="container mx-auto p-4">
                 <h1 className="text-2xl font-bold mb-4">見積依頼</h1>
                 <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                   <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supplier_id">
                      仕入先ID
                    </label>
                     <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="supplier_id"
                        type="text"
                        placeholder="仕入先IDを入力してください"
                        value={quoteData.supplier_id}
                        onChange={(e) => setQuoteData({...quoteData,supplier_id: e.target.value})}
                        required
                    />
                  </div>
                   <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quote_date">
                            見積日
                         </label>
                         <input
                             className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="quote_date"
                             type="date"
                             value={quoteData.quote_date}
                            onChange={(e) => handleDateChange(e, 'quote_date')}
                            required
                       />
                    </div>
                   <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="valid_until">
                           有効期限
                        </label>
                        <input
                           className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                           id="valid_until"
                           type="date"
                            value={quoteData.valid_until}
                           onChange={(e) => handleDateChange(e, 'valid_until')}
                           required
                         />
                    </div>
                    <h2 className="text-xl font-semibold mb-4">商品リスト</h2>
                        <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white shadow-md rounded">
                                            <thead className="bg-gray-200">
                                            <tr>
                                                <th className="py-2 px-4 border-b text-left">商品ID</th>
                                                <th className="py-2 px-4 border-b text-left">商品名</th>
                                                <th className="py-2 px-4 border-b text-left">単価</th>
                                                <th className="py-2 px-4 border-b text-left">数量</th>
                                           </tr>
                                            </thead>
                                            <tbody>
                                                {products.map(product => (
                                                    <tr key={product.product_id} className="hover:bg-gray-100">
                                                        <td className="py-2 px-4 border-b">{product.product_id}</td>
                                                        <td className="py-2 px-4 border-b">{product.product_name}</td>
                                                       <td className="py-2 px-4 border-b">{product.unit_price}</td>
                                                        <td className="py-2 px-4 border-b">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                className="border rounded p-1 w-20"
                                                                onChange={(e) => handleQuantityChange(product.product_id, e.target.value)}
                                                                value={selectedProducts[product.product_id] || ''}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                        </div>
                    <div className="flex items-center justify-center mt-6">
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            見積依頼を送信
                        </button>
                    </div>
                 </form>
              </main>
              <Footer/>
        </div>
    );
};

export default RequestQuotePage;