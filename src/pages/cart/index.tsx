import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaArrowLeft } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const CartPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCartItems = async () => {
        setLoading(true);
        setError(null);
      try {
        const { data, error } = await supabase
          .from('order_items')
          .select('order_item_id, product_id, quantity, unit_price');

        if (error) {
          setError('データの取得に失敗しました。');
          console.error('Supabase error:', error);
          setCartItems([
                {
                    order_item_id: 'sample-1',
                    product_id: 'prod-1',
                    quantity: 2,
                    unit_price: 100,
                },
                {
                    order_item_id: 'sample-2',
                    product_id: 'prod-2',
                    quantity: 1,
                    unit_price: 200,
                },
            ])

        } else {
          setCartItems(data);
        }
      } catch (err) {
        setError('データの取得中にエラーが発生しました。');
        console.error('Unexpected error:', err);
         setCartItems([
                {
                    order_item_id: 'sample-1',
                    product_id: 'prod-1',
                    quantity: 2,
                    unit_price: 100,
                },
                {
                    order_item_id: 'sample-2',
                    product_id: 'prod-2',
                    quantity: 1,
                    unit_price: 200,
                },
            ])
      } finally {
          setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleQuantityChange = async (order_item_id, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const { error } = await supabase
        .from('order_items')
        .update({ quantity: newQuantity })
        .eq('order_item_id', order_item_id);

      if (error) {
        console.error('Supabase error updating quantity:', error);
        setError('数量の更新に失敗しました。');
      } else {
          setCartItems(cartItems.map(item =>
            item.order_item_id === order_item_id ? { ...item, quantity: newQuantity } : item
        ));
      }
    } catch (err) {
      console.error('Unexpected error updating quantity:', err);
      setError('数量の更新中にエラーが発生しました。');
    }
  };

  const handleRemoveItem = async (order_item_id) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('order_item_id', order_item_id);

      if (error) {
        console.error('Supabase error deleting item:', error);
        setError('商品の削除に失敗しました。');
      } else {
        setCartItems(cartItems.filter(item => item.order_item_id !== order_item_id));
      }
    } catch (err) {
      console.error('Unexpected error deleting item:', err);
      setError('商品の削除中にエラーが発生しました。');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.unit_price * item.quantity, 0);
  };

    if (loading) {
      return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
    }

    if (error) {
      return <div className="min-h-screen h-full flex justify-center items-center text-red-500">{error}</div>
    }

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <header className="bg-blue-500 p-4 flex justify-between items-center text-white">
        <Link href="/" legacyBehavior>
            <div className="flex items-center cursor-pointer">
                <FaArrowLeft className="mr-2" />
                <span>ホームに戻る</span>
            </div>
        </Link>

        <h1 className="text-xl font-bold">買い物かご</h1>
        <Link href="/chat" legacyBehavior>
          <a className="text-white hover:text-gray-200">AIチャットサポート</a>
        </Link>

      </header>

      <div className="container mx-auto p-4">
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 my-8">買い物かごは空です。</div>
        ) : (
          <div className="flex flex-col gap-4">
            {cartItems.map((item) => (
              <div key={item.order_item_id} className="bg-white shadow rounded p-4 flex items-center">
                   <div className="mr-4">
                       <Image src={`https://placehold.co/50x50/grey/white?text=Product+${item.product_id}`} alt="Product" width={50} height={50}  />
                   </div>
                <div className="flex-1">
                  <p className="font-bold">商品ID: {item.product_id}</p>
                  <div className="flex items-center mt-2">
                    <span className="mr-2">数量:</span>
                    <div className="flex items-center border rounded">
                      <button
                        className="px-2 py-1 hover:bg-gray-200 focus:outline-none"
                        onClick={() => handleQuantityChange(item.order_item_id, item.quantity - 1)}
                      >
                        <FaMinus />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.order_item_id, parseInt(e.target.value, 10))}
                        className="w-16 text-center border-none focus:ring-0"
                      />
                      <button
                        className="px-2 py-1 hover:bg-gray-200 focus:outline-none"
                        onClick={() => handleQuantityChange(item.order_item_id, item.quantity + 1)}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                    <p className="mt-2">単価: ¥{item.unit_price}</p>
                    <p className="mt-2">小計: ¥{item.unit_price * item.quantity}</p>
                </div>
                <button
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                  onClick={() => handleRemoveItem(item.order_item_id)}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <div className="text-right mt-4">
                <p className="font-bold">合計: ¥{calculateTotal()}</p>
            </div>
          </div>
        )}
          <div className="mt-8 flex justify-end">
              <Link href="/order" legacyBehavior>
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    発注手続きに進む
                </button>
              </Link>
          </div>
      </div>

      <footer className="bg-gray-800 text-white text-center p-4 mt-8">
        <p>&copy; 2024 RECERQA AI</p>
      </footer>
    </div>
  );
};

export default CartPage;
