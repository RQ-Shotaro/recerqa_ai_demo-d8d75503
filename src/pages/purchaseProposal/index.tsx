import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaHome, FaList, FaArrowLeft } from 'react-icons/fa';
import { Header } from './Header';
import { Footer } from './Footer';
import Image from 'next/image';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl as string, supabaseKey as string);

const PurchaseProposal = () => {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const productsResult = await supabase.from('products').select('product_id, product_name');
        if (productsResult.error) {
            throw new Error(`Failed to fetch products: ${productsResult.error.message}`)
        }
        setProducts(productsResult.data || []);

        const suppliersResult = await supabase.from('suppliers').select('supplier_id, supplier_name');
        if(suppliersResult.error) {
           throw new Error(`Failed to fetch suppliers: ${suppliersResult.error.message}`);
        }
        setSuppliers(suppliersResult.data || []);

      } catch (err: any) {
        setError(err.message || 'データ取得中にエラーが発生しました');
        setProducts([{"product_id": "sample_product_id_1","product_name": "サンプル商品1"},{"product_id": "sample_product_id_2", "product_name": "サンプル商品2"}]);
        setSuppliers([{"supplier_id": "sample_supplier_id_1", "supplier_name": "サンプル仕入先1"},{"supplier_id": "sample_supplier_id_2", "supplier_name": "サンプル仕入先2"}]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGoBack = () => {
      router.back();
    };

    return (
      <div className="min-h-screen h-full bg-gray-100 flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
      <button onClick={handleGoBack} className="mb-4 flex items-center text-blue-500 hover:text-blue-700">
            <FaArrowLeft className="mr-2" />
            戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">仕入提案画面</h1>

        {loading && <div className="text-center">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="flex flex-col md:flex-row gap-6">

            <div className="flex-1 bg-white shadow rounded p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">仕入提案リスト</h2>
              <ul className="space-y-2">
                {products.map((product) => (
                  <li key={product.product_id} className="border-b border-gray-200 py-2">
                    <div className="flex items-center justify-between">
                        <span>{product.product_name}</span>
                        <Image
                          src={`https://placehold.co/50x50/007bff/ffffff?text=${encodeURIComponent(product.product_name.slice(0, 2))}`}
                          alt={product.product_name} 
                          width={50} 
                          height={50}
                          className="rounded-full"
                        />
                      </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-1 bg-white shadow rounded p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">商品別仕入推奨量</h2>
              <ul className="space-y-2">
                 {products.map((product) => (
                  <li key={product.product_id} className="border-b border-gray-200 py-2">
                    <div className="flex items-center justify-between">
                        <span>{product.product_name}</span>
                        <span className="text-gray-500">推奨量: 100</span>
                      </div>
                  </li>
                ))}
              </ul>
            </div>

             <div className="flex-1 bg-white shadow rounded p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">仕入先情報</h2>
              <ul className="space-y-2">
                  {suppliers.map((supplier) => (
                  <li key={supplier.supplier_id} className="border-b border-gray-200 py-2">
                    <div className="flex items-center justify-between">
                        <span>{supplier.supplier_name}</span>
                         <Image
                           src={`https://placehold.co/50x50/28a745/ffffff?text=${encodeURIComponent(supplier.supplier_name.slice(0, 2))}`}
                            alt={supplier.supplier_name} 
                            width={50} 
                            height={50}
                            className="rounded-full"
                          />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
       <Footer />
    </div>
    );
  };
export default PurchaseProposal;