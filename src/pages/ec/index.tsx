import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaShoppingCart, FaUser, FaHome, FaList } from 'react-icons/fa';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const Ec = () => {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
    
                if (userError) {
                    console.error('ユーザーデータの取得エラー:', userError);
                    setUser(null);
                } else {
                    setUser(userData);
                }
            } else {
                setUser(null);
            }
        };
        fetchSession();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
              const { data, error } = await supabase.from('products').select('product_id, product_name, unit_price');
              if (error) {
                  console.error('Error fetching products:', error);
                  setProducts([
                        {
                            "product_id": "sample-001",
                            "product_name": "サンプル商品1",
                            "unit_price": 1000,
                          },
                          {
                            "product_id": "sample-002",
                            "product_name": "サンプル商品2",
                            "unit_price": 2000
                          },
                            {
                              "product_id": "sample-003",
                              "product_name": "サンプル商品3",
                              "unit_price": 1500,
                            }
                      ]);
              } else {
                setProducts(data);
              }
            } catch (error) {
              console.error('Unexpected error fetching products:', error);
              setProducts([
                {
                    "product_id": "sample-001",
                    "product_name": "サンプル商品1",
                    "unit_price": 1000,
                  },
                  {
                    "product_id": "sample-002",
                    "product_name": "サンプル商品2",
                    "unit_price": 2000
                  },
                    {
                      "product_id": "sample-003",
                      "product_name": "サンプル商品3",
                      "unit_price": 1500,
                    }
            ]);
            }
            finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

  const addToCart = (product: any) => {
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

    const handleCheckout = async () => {
        if (!user) {
            alert('ログインしてください。');
            return;
        }
    
        try {
          const orderItems = cart.map(item => ({
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price
          }));

            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([{
                  customer_id: user.id,
                  order_date: new Date().toISOString(),
                  order_status: 'pending',
                }])
                .select('order_id')
                .single();

          if(orderError) {
                console.error('Failed to create order:', orderError);
                alert('注文の作成に失敗しました。');
                return;
          }
          if(orderData && orderData.order_id) {
               const { error: orderItemError } = await supabase
                    .from('order_items')
                    .insert(
                      orderItems.map(item => ({
                        order_id: orderData.order_id,
                          product_id: item.product_id,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                      }))
                    );
        
              if (orderItemError) {
                    console.error('Failed to create order items:', orderItemError);
                    alert('注文明細の作成に失敗しました。');
                    return;
              } else {
                  alert('注文が完了しました。');
                  setCart([]);
                   router.push('/order-confirmation');
              }
         }
    } catch(error) {
      console.error('Error during checkout:', error);
        alert('注文処理中にエラーが発生しました。');
      }
  };

  if (loading) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen h-full bg-gray-100">
    <header className="bg-blue-500 p-4 flex justify-between items-center">
        <Link href="/" className="text-white font-bold text-xl flex items-center">
            <FaHome className="mr-2" />ホーム
        </Link>
            <nav className="flex space-x-4">
                <Link href="/order-history" className="text-white hover:text-gray-200 flex items-center">
                    <FaList className="mr-1" />注文履歴
                </Link>
                <Link href="/login" className="text-white hover:text-gray-200 flex items-center">
                <FaUser className="mr-1" />
                    {user ? 'ログアウト' : 'ログイン'}
                </Link>
            </nav>
        </header>
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">商品一覧</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product: any) => (
          <div key={product.product_id} className="bg-white shadow-md rounded-lg p-4">
            <img src={`https://placehold.co/300x200?text=${product.product_name}`} alt={product.product_name} className="mb-2 w-full h-40 object-cover rounded"/>
            <h2 className="text-lg font-semibold">{product.product_name}</h2>
            <p className="text-gray-600">価格: ¥{product.unit_price}</p>
            <button onClick={() => addToCart(product)} className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              カートに追加
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">カート</h2>
      {cart.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg p-4">
            <ul className="divide-y divide-gray-200">
            {cart.map((item, index) => (
                <li key={index} className="py-2 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <img src={`https://placehold.co/100x70?text=${item.product_name}`} alt={item.product_name} className="w-20 h-14 object-cover rounded"/>
                    <div>
                      <p className="font-semibold text-lg">{item.product_name}</p>
                      <p className="text-gray-600">単価: ¥{item.unit_price}</p>
                    </div>
                    </div>
                  <div className="flex items-center space-x-2">
                  <input
                      type="number"
                      className="border border-gray-300 rounded w-16 p-1 text-center"
                      value={item.quantity}
                      min="1"
                      onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                    />
                    <button onClick={() => removeFromCart(index)} className="text-red-500 hover:text-red-700">
                      削除
                    </button>
                  </div>
                </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end">
            <button onClick={handleCheckout} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              注文を確定する
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">カートは空です。</p>
      )}
    </div>
      <footer className="bg-gray-200 text-center p-4 mt-8">
      <p className="text-gray-600">© 2024 RECERQA AI</p>
    </footer>
    </div>
  );
};

export default Ec;