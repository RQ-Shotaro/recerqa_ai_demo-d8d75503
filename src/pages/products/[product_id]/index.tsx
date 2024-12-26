import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaShoppingCart, FaArrowLeft } from 'react-icons/fa';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);


const ProductDetail = () => {
  const router = useRouter();
  const { product_id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (product_id) {
          const { data, error } = await supabase
            .from('products')
            .select('product_id, product_name, unit_price')
            .eq('product_id', product_id)
            .single();

          if (error) {
            console.error('Supabase error:', error);
            setError('商品情報の取得に失敗しました。');
            setProduct(null);
          } else {
            setProduct(data);
          }
        } else {
          setError('商品IDが無効です。');
          setProduct(null);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('商品情報の取得中にエラーが発生しました。');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [product_id]);

  if (loading) {
    return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen h-full flex justify-center items-center text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="min-h-screen h-full flex justify-center items-center">商品が見つかりませんでした。</div>;
  }

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <header className="bg-blue-500 p-4 flex items-center justify-between">
        <Link href="/" legacyBehavior>
            <FaArrowLeft className="text-white text-2xl cursor-pointer"/>
        </Link>
        <h1 className="text-white text-2xl font-bold">商品詳細</h1>
         <Link href="/cart" legacyBehavior>
              <FaShoppingCart className="text-white text-2xl cursor-pointer"/>
         </Link>
      </header>

    <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row bg-white shadow-md rounded-lg overflow-hidden">
        <div className="md:w-1/2 p-4 flex items-center justify-center">
           <img src={`https://placehold.co/400x300?text=${encodeURIComponent(product.product_name)}`} alt={product.product_name} className="max-w-full h-auto rounded-lg" />
        </div>
          <div className="md:w-1/2 p-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{product.product_name}</h2>
            <p className="text-lg text-gray-700 mb-4">商品ID: {product.product_id}</p>
            <p className="text-xl font-bold text-gray-900">価格: ¥{product.unit_price}</p>
            <div className="mt-6">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              買い物かごに追加
              </button>
               <Link href="/chat" legacyBehavior>
                <button className="ml-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  AIチャットサポート
                  </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-800 text-white text-center p-4 mt-auto">
        <p>&copy; 2024 RECERQA</p>
      </footer>
    </div>
  );
};

export default ProductDetail;
