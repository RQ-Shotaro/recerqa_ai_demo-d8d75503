import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaHome, FaHistory, FaCog, FaUser } from 'react-icons/fa';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const HistoryPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [purchaseOrderItems, setPurchaseOrderItems] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistoryData = async () => {
            setLoading(true);
            setError(null);
            try {
              const { data: ordersData, error: ordersError } = await supabase
              .from('purchase_orders')
              .select('purchase_order_id, order_date, supplier_id, order_status');

              if(ordersError){
                setError(ordersError.message);
                setLoading(false);
                return;
            }
            setPurchaseOrders(ordersData || []);

              const { data: itemsData, error: itemsError } = await supabase
              .from('purchase_order_items')
              .select('purchase_order_id, product_id, quantity, unit_price');

              if(itemsError){
                setError(itemsError.message);
                setLoading(false);
                return;
            }
              setPurchaseOrderItems(itemsData || []);

                const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('product_id, product_name');

              if(productsError){
                setError(productsError.message);
                setLoading(false);
                return;
              }
                setProducts(productsData || []);


            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
          fetchHistoryData();
      }
    }, [id]);

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.product_id === productId);
    return product ? product.product_name : '不明な商品';
  };

    if (loading) {
        return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
    }

    if (error) {
        return <div className="min-h-screen h-full flex justify-center items-center text-red-500">Error: {error}</div>;
    }

    const combinedData = purchaseOrders.map(order => {
      const items = purchaseOrderItems.filter(item => item.purchase_order_id === order.purchase_order_id);
      const orderItemsWithProductNames = items.map(item => ({
        ...item,
        product_name: getProductName(item.product_id),
      }));
      return { ...order, items: orderItemsWithProductNames };
    });

    return (
        <div className="min-h-screen h-full flex">
          <aside className="bg-gray-800 text-white w-64 p-4">
                <nav>
                    <Link href="/" legacyBehavior>
                        <div className="flex items-center py-2 hover:bg-gray-700 rounded cursor-pointer">
                            <FaHome className="mr-2" />
                            ホーム
                        </div>
                    </Link>
                    <Link href={`/negotiation/${id}`} legacyBehavior>
                         <div className="flex items-center py-2 hover:bg-gray-700 rounded cursor-pointer">
                            <FaCog className="mr-2" />
                            納期・金額調整
                        </div>
                    </Link>
                    <Link href={`/negotiation/${id}/history`} legacyBehavior>
                        <div className="flex items-center py-2 hover:bg-gray-700 rounded cursor-pointer bg-gray-700">
                            <FaHistory className="mr-2" />
                             過去取引履歴
                        </div>
                    </Link>
                   <Link href="/user/profile" legacyBehavior>
                        <div className="flex items-center py-2 hover:bg-gray-700 rounded cursor-pointer">
                            <FaUser className="mr-2" />
                            マイページ
                         </div>
                     </Link>
                </nav>
            </aside>
            <main className="flex-1 p-8 bg-gray-100">
                <h1 className="text-2xl font-bold mb-6">過去取引履歴</h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="py-2 px-4 border-b">発注ID</th>
                                <th className="py-2 px-4 border-b">発注日</th>
                                <th className="py-2 px-4 border-b">商品名</th>
                                <th className="py-2 px-4 border-b">数量</th>
                                <th className="py-2 px-4 border-b">単価</th>
                                <th className="py-2 px-4 border-b">ステータス</th>
                            </tr>
                        </thead>
                        <tbody>
                            {combinedData.map((order) => (
                                order.items.map((item, index) => (
                                    <tr key={`${order.purchase_order_id}-${index}`} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 border-b">{order.purchase_order_id}</td>
                                        <td className="py-2 px-4 border-b">{new Date(order.order_date).toLocaleDateString()}</td>
                                         <td className="py-2 px-4 border-b">{item.product_name}</td>
                                        <td className="py-2 px-4 border-b">{item.quantity}</td>
                                        <td className="py-2 px-4 border-b">{item.unit_price}</td>
                                        <td className="py-2 px-4 border-b">{order.order_status}</td>
                                    </tr>
                                ))
                             ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default HistoryPage;
