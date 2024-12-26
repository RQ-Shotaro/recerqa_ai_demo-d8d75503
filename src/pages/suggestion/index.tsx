import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaHome, FaList, FaShoppingCart, FaSearch, FaUser } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);


const SuggestionPage = () => {
  const [products, setProducts] = useState<Database['public']['Tables']['products']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('products')
          .select('product_id, product_name, unit_price');
        
        if (error) {
          console.error('Supabase error fetching products:', error);
          setError('商品情報の取得に失敗しました。');
           setProducts([
              {product_id: 'sample-1', product_name: 'サンプル商品1', unit_price: 1000},
              {product_id: 'sample-2', product_name: 'サンプル商品2', unit_price: 2000},
              {product_id: 'sample-3', product_name: 'サンプル商品3', unit_price: 3000}
          ])
        } else if(data) {
            setProducts(data);
        } else {
            setError('商品データが見つかりませんでした。')
              setProducts([
                {product_id: 'sample-1', product_name: 'サンプル商品1', unit_price: 1000},
                {product_id: 'sample-2', product_name: 'サンプル商品2', unit_price: 2000},
                {product_id: 'sample-3', product_name: 'サンプル商品3', unit_price: 3000}
            ])
        }
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError('商品情報の取得中にエラーが発生しました。');
          setProducts([
              {product_id: 'sample-1', product_name: 'サンプル商品1', unit_price: 1000},
              {product_id: 'sample-2', product_name: 'サンプル商品2', unit_price: 2000},
              {product_id: 'sample-3', product_name: 'サンプル商品3', unit_price: 3000}
          ])
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen h-full bg-gray-100 flex">
    <aside className="bg-gray-800 text-white w-64 py-6 px-3">
        <nav>
          <ul>
            <li className="mb-4">
              <Link href="/" className="flex items-center hover:bg-gray-700 rounded p-2">
                <FaHome className="mr-2" />
                ホーム
              </Link>
            </li>
             <li className="mb-4">
              <Link href="/search" className="flex items-center hover:bg-gray-700 rounded p-2">
               <FaSearch className="mr-2" />
                商品検索
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/history" className="flex items-center hover:bg-gray-700 rounded p-2">
                <FaList className="mr-2" />
                発注履歴
              </Link>
            </li>
             <li className="mb-4">
               <Link href="/cart" className="flex items-center hover:bg-gray-700 rounded p-2">
                <FaShoppingCart className="mr-2" />
                 買い物かご
                </Link>
            </li>
             <li className="mb-4">
              <Link href="/profile" className="flex items-center hover:bg-gray-700 rounded p-2">
               <FaUser className="mr-2" />
                プロフィール
              </Link>
             </li>
          </ul>
        </nav>
    </aside>
    <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">商品提案</h1>
          {loading && <div className="text-center">Loading products...</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}
      {products && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.product_id} className="bg-white shadow rounded-lg overflow-hidden">
               <img
                  src={`https://placehold.co/400x300?text=${encodeURIComponent(product.product_name)}`}
                  alt={product.product_name}    className="w-full h-48 object-cover"
                />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">{product.product_name}</h2>
                <p className="text-gray-600 mt-2">価格: ¥{product.unit_price}</p>
                <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">詳細を見る</button>
              </div>
            </div>
          ))}
        </div>
      )}
       {products && products.length === 0 && !loading && !error &&(
        <div className="text-center">提案できる商品はありません</div>
      )}
      </main>
    </div>
  );
};

export default SuggestionPage;
