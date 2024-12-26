import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaChartBar, FaList, FaHome, FaUser } from 'react-icons/fa';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold">RECERQA AI</Link>
      <nav>
        <ul className="flex space-x-6">
        <li><Link href="/" className="hover:text-gray-300">ホーム</Link></li>
          <li><Link href="/productAnalytics" className="hover:text-gray-300">商品分析</Link></li>
        </ul>
      </nav>
       <div className="flex space-x-4 items-center">
          <Link href="/user" className="hover:text-gray-300"><FaUser size={20} /></Link>
        </div>
    </header>
  );
};


const SideMenu = () => {
  return (
    <aside className="bg-gray-200 w-64 min-h-screen p-4">
      <nav>
        <ul>
          <li className="mb-2">
            <Link href="/" className="flex items-center p-2 hover:bg-gray-300 rounded">
              <FaHome className="mr-2" />
              ホーム
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/productAnalytics" className="flex items-center p-2 hover:bg-gray-300 rounded">
              <FaChartBar className="mr-2" />
              商品分析
            </Link>
          </li>
           <li className="mb-2">
            <Link href="/orderList" className="flex items-center p-2 hover:bg-gray-300 rounded">
              <FaList className="mr-2" />
              発注一覧
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

const ProductAnalytics = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
    const [purchaseOrderItems, setPurchaseOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('product_id, product_name');

        if (productsError) {
          throw new Error(`商品データの取得に失敗しました: ${productsError.message}`);
        }

        const { data: orderItemsData, error: orderItemsError } = await supabase
          .from('order_items')
          .select('product_id, quantity');

        if (orderItemsError) {
             throw new Error(`注文商品データの取得に失敗しました: ${orderItemsError.message}`);
        }
        const { data: purchaseOrderItemsData, error: purchaseOrderItemsError } = await supabase
          .from('purchase_order_items')
          .select('product_id, quantity');

        if (purchaseOrderItemsError) {
          throw new Error(`仕入商品データの取得に失敗しました: ${purchaseOrderItemsError.message}`);
        }

        setProducts(productsData || []);
        setOrderItems(orderItemsData || []);
        setPurchaseOrderItems(purchaseOrderItemsData || []);
      } catch (err: any) {
        setError(err.message);
        setProducts([
          {
            product_id: "sample-product-id-1",
            product_name: "サンプル商品 1"
          },
           {
            product_id: "sample-product-id-2",
            product_name: "サンプル商品 2"
          },
         {
            product_id: "sample-product-id-3",
            product_name: "サンプル商品 3"
          }
        ]);
           setOrderItems([
          {
            product_id: "sample-product-id-1",
            quantity: 10
          },
           {
            product_id: "sample-product-id-2",
            quantity: 20
          },
         {
            product_id: "sample-product-id-3",
             quantity: 30
          }

        ]);
            setPurchaseOrderItems([
          {
            product_id: "sample-product-id-1",
            quantity: 5
          },
           {
            product_id: "sample-product-id-2",
            quantity: 15
          },
         {
            product_id: "sample-product-id-3",
            quantity: 25
          }
        ]);

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen h-full flex justify-center items-center text-red-500">エラー: {error}</div>;
  }

    const productSalesData = products.map((product) => {
        const totalOrderQuantity = orderItems
            .filter((item) => item.product_id === product.product_id)
            .reduce((acc, item) => acc + (item.quantity || 0), 0);

        const totalPurchaseQuantity = purchaseOrderItems
          .filter((item) => item.product_id === product.product_id)
          .reduce((acc, item) => acc + (item.quantity || 0), 0);

        return {
            product_name: product.product_name,
            totalOrderQuantity: totalOrderQuantity,
            totalPurchaseQuantity: totalPurchaseQuantity
        };
    });

  return (
    <div className="min-h-screen h-full flex">
      <SideMenu />
      <div className="flex-1 p-4">
      <Header/>
        <h1 className="text-2xl font-bold mb-4">商品分析</h1>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productSalesData.map((item) => (
            <div key={item.product_name} className="bg-white shadow rounded p-4">
              <h2 className="text-lg font-semibold mb-2">{item.product_name}</h2>
              <p className="text-gray-700">受注数: {item.totalOrderQuantity}</p>
               <p className="text-gray-700">発注数: {item.totalPurchaseQuantity}</p>
               <img src={`https://placehold.co/300x200?text=${item.product_name}`} alt={item.product_name} className="mt-2 w-full h-auto"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductAnalytics;