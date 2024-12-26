import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaHome, FaCog, FaList, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const StockLevel = () => {
    const [products, setProducts] = useState<any>([]);
    const [inventory, setInventory] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [newStockLevel, setNewStockLevel] = useState<number | ''>('');
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
      const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (!user) {
          router.push('/login');
        }
      }
        fetchUser();
      
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select('product_id, product_name');
                if (productsError) throw productsError;
                setProducts(productsData || []);
                
                const { data: inventoryData, error: inventoryError } = await supabase
                  .from('inventory')
                  .select('product_id, stock_quantity');
                  if (inventoryError) throw inventoryError;
                setInventory(inventoryData || []);
              

            } catch (err: any) {
                setError(err.message || 'データの取得に失敗しました');
                setProducts([
                    {product_id: '1', product_name: 'サンプル商品A' },
                    {product_id: '2', product_name: 'サンプル商品B'},
                ]);
                setInventory([
                  {product_id: '1', stock_quantity: 100},
                  {product_id: '2', stock_quantity: 50}
                ]);
                
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    const handleProductSelect = (product: any) => {
      setSelectedProduct(product);
      const currentInventory = inventory.find((item: any) => item.product_id === product.product_id);
      setNewStockLevel(currentInventory?.stock_quantity || '');
  };
    

    const handleStockLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (/^\d*$/.test(value)) {
          setNewStockLevel(value === '' ? '' : parseInt(value));
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;
    
        try {
          const {error } = await supabase
            .from('inventory')
            .upsert([
              {
                product_id: selectedProduct.product_id,
                stock_quantity: newStockLevel,
                updated_at: new Date().toISOString()
              }
            ],{ onConflict: ['product_id'] })
          
          if (error) {
            console.log(error);
            throw error
          }
    
            setMessage('在庫レベルが更新されました。');
           const { data: inventoryData, error: inventoryError } = await supabase
                  .from('inventory')
                  .select('product_id, stock_quantity');
                  if (inventoryError) throw inventoryError;
                setInventory(inventoryData || []);
    
    
        } catch (err: any) {
            setError(err.message || '在庫レベルの更新に失敗しました');
            setMessage(null);
        }
    };

    const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push('/login');
    };

    if (!user) {
      return <div className="min-h-screen h-full flex items-center justify-center">Loading...</div>;
    }

    return (
      <div className="min-h-screen h-full bg-gray-100 flex">
        <aside className="bg-gray-800 text-white w-64 py-4 px-3">
          <nav>
            <ul>
              <li className="mb-2">
                  <Link href="/" className="flex items-center hover:bg-gray-700 p-2 rounded">
                    <FaHome className="mr-2" />
                    ホーム
                  </Link>
              </li>
              <li className="mb-2">
                  <Link href="/stockLevel" className="flex items-center hover:bg-gray-700 p-2 rounded">
                  <FaCog className="mr-2" />
                  在庫レベル設定
                  </Link>
              </li>
              <li className="mb-2">
                  <Link href="/orderHistory" className="flex items-center hover:bg-gray-700 p-2 rounded">
                  <FaList className="mr-2" />
                    取引履歴分析
                  </Link>
              </li>
              <li className="mb-2">
                <Link href="/demandForecast" className="flex items-center hover:bg-gray-700 p-2 rounded">
                  <FaPlus className="mr-2" />
                  需要予測
                </Link>
              </li>
              <li className="mb-2">
                <button onClick={handleLogout} className="flex items-center hover:bg-gray-700 p-2 rounded">
                  <FaEdit className="mr-2" />
                  ログアウト
                </button>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-4">
          <h1 className="text-2xl font-semibold mb-4">在庫レベル設定</h1>
    
          {loading && <div className="text-center">Loading...</div>}
          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-500">{message}</p>}
          
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-1/2">
                <h2 className="text-xl font-semibold mb-2">商品リスト</h2>
                <div className="overflow-auto rounded border border-gray-300">
                <table className="min-w-full bg-white">
                    <thead>
                    <tr className="bg-gray-200">
                        <th className="py-2 px-4 border-b">商品ID</th>
                        <th className="py-2 px-4 border-b">商品名</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((product: any) => (
                        <tr
                        key={product.product_id}
                        onClick={() => handleProductSelect(product)}
                        className={
                          `hover:bg-gray-100 cursor-pointer ${selectedProduct?.product_id === product.product_id ? 'bg-blue-100' : ''}`
                        }
                        >
                        <td className="py-2 px-4 border-b text-center">{product.product_id}</td>
                        <td className="py-2 px-4 border-b text-center">{product.product_name}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>

            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold mb-2">在庫レベル設定フォーム</h2>
              {selectedProduct ? (
                  <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">商品名:</label>
                        <input type="text" value={selectedProduct.product_name} className="border rounded py-2 px-3 w-full bg-gray-100" disabled />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">現在の在庫レベル:</label>
                        <input type="text" value={inventory.find((item:any) => item.product_id === selectedProduct.product_id)?.stock_quantity || '0'} className="border rounded py-2 px-3 w-full bg-gray-100" disabled />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">新しい在庫レベル:</label>
                        <input type="text" value={newStockLevel} onChange={handleStockLevelChange}  className="border rounded py-2 px-3 w-full" />
                    </div>
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">更新</button>
                </form>
              ) : (
                  <p>商品リストから商品を選択してください。</p>
              )}
            </div>
          </div>
        </main>
      </div>
    );
};

export default StockLevel;