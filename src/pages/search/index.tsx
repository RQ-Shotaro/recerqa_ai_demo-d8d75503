import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Search: React.FC = () => {
    const router = useRouter();
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>(['家具', '家電', '雑貨', '食品']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                const { data: user, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error('Error fetching user:', error);
                    setError('ユーザー情報の取得に失敗しました。');
                } else {
                    setUser(user);
                }
            } else {
                router.push('/login');
            }
        };

        fetchSession();
    }, [router]);



    useEffect(() => {
        const fetchProducts = async () => {
          setLoading(true);
          setError(null);
          try {
            const { data, error } = await supabase
              .from('products')
              .select('product_name, unit_price')
              .or(
                `product_name.ilike.%${searchKeyword}%,category.eq.${selectedCategory ? selectedCategory : ''}`
               )
              ;
    
            if (error) {
                console.error('Error fetching products:', error);
              setError('商品データの取得に失敗しました。');
              setProducts([
                  {
                    product_name: 'サンプル商品 1', unit_price: 1000,
                   },
                  {
                    product_name: 'サンプル商品 2', unit_price: 2000,
                  },
                ]);
            } else {
              if (data && data.length > 0) {
                setProducts(data);
              } else {
                 setProducts([
                      {
                        product_name: 'サンプル商品 1', unit_price: 1000,
                      },
                      {
                        product_name: 'サンプル商品 2', unit_price: 2000,
                      },
                    ]);
              }
            }
          } catch (err: any) {
            console.error('Unexpected error:', err);
            setError('予期せぬエラーが発生しました。');
             setProducts([
                  {
                    product_name: 'サンプル商品 1', unit_price: 1000,
                   },
                  {
                    product_name: 'サンプル商品 2', unit_price: 2000,
                  },
                ]);
          } finally {
            setLoading(false);
          }
        };
        fetchProducts();
      }, [searchKeyword, selectedCategory]);


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchKeyword(e.target.value);
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategory(e.target.value);
    };


  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <header className="bg-blue-500 p-4 flex items-center justify-between">
                 <Link href="/" passHref>
                    <span className="text-white text-xl font-bold cursor-pointer">RECERQA</span>
                </Link>
                  <nav>
                    <ul className="flex space-x-4">
                    <li><button onClick={handleLogout} className="text-white hover:text-gray-200">ログアウト</button></li>
                    </ul>
                </nav>
            </header>
              <aside className="w-64 bg-gray-200 p-4">
                    <nav>
                        <ul className="space-y-2">
                               <li>
                                <Link href="/"  className="block p-2 rounded hover:bg-gray-300">
                                    ホーム
                                </Link>
                            </li>
                            <li>
                                <Link href="/search"  className="block p-2 rounded hover:bg-gray-300">
                                    商品検索
                                </Link>
                            </li>
                             <li>
                                 <Link href="/history"  className="block p-2 rounded hover:bg-gray-300">
                                    発注履歴
                                 </Link>
                              </li>
                            <li>
                                 <Link href="/ai-chat"  className="block p-2 rounded hover:bg-gray-300">
                                    AIチャットサポート
                                 </Link>
                            </li>
                             <li>
                                  <Link href="/qa"  className="block p-2 rounded hover:bg-gray-300">
                                       よくある質問
                                  </Link>
                              </li>
                        </ul>
                    </nav>
              </aside>
            <main className="flex-1 p-4">

              <div className="mb-4 flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="キーワードで検索"
                    value={searchKeyword}
                    onChange={handleSearchChange}
                    className="p-2 border rounded border-gray-300 flex-1"
                  />
                   <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        className="p-2 border rounded border-gray-300"
                    >
                        <option value="">すべてのカテゴリー</option>
                         {categories.map(category => (
                           <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center">
                       <FaSearch className="mr-2" /> 検索
                </button>

              </div>
                {loading && <div className="text-center">Loading...</div>}
                {error && <div className="text-red-500 text-center">{error}</div>}
               {products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map((product, index) => (
                           <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <img
                                    src={`https://placehold.co/400x200?text=${encodeURIComponent(product.product_name)}`}
                                    alt={product.product_name}
                                    className="w-full h-40 object-cover"
                                />
                                <div className="p-4">
                                    <h2 className="text-xl font-semibold mb-2">{product.product_name}</h2>
                                     <p className="text-gray-700">価格: ¥{product.unit_price}</p>
                                    <div className="mt-4">
                                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                                <FaShoppingCart className="mr-2" /> カートに追加
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    !loading && !error && <div className="text-center">商品が見つかりませんでした。</div>
                )}
            </main>
            <footer className="bg-gray-800 text-white text-center p-4">
                <p>&copy; 2024 RECERQA. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Search;