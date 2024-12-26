import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const PurchaseConfirm: React.FC = () => {
  const router = useRouter();
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('purchase_orders')
          .select('*, purchase_order_items(product_id, quantity, unit_price, products(product_name))')
        if (error) {
          console.error('Supabase error fetching purchase orders:', error);
          setError('仕入情報の取得に失敗しました。');
          setPurchaseOrders([
            {
              purchase_order_id: 'PO-001',
              order_date: '2024-03-15T10:00:00Z',
              order_status: '確認中',
              purchase_order_items: [
                {
                  product_id: 'PRD-001',
                  quantity: 10,
                  unit_price: 1000,
                  products: { product_name: '商品A' },
                },
                {
                  product_id: 'PRD-002',
                  quantity: 5,
                  unit_price: 2500,
                  products: { product_name: '商品B' },
                },
              ],
            },
              {
                  purchase_order_id: 'PO-002',
                  order_date: '2024-03-16T14:00:00Z',
                  order_status: '確認中',
                  purchase_order_items: [
                      {
                          product_id: 'PRD-003',
                          quantity: 20,
                          unit_price: 500,
                          products: { product_name: '商品C' },
                      },
                      {
                          product_id: 'PRD-004',
                          quantity: 10,
                          unit_price: 1500,
                          products: { product_name: '商品D' },
                      },
                  ],
              },
          ]);
        } else {
          setPurchaseOrders(data);
        }
      } catch (err: any) {
        console.error('Error fetching purchase orders:', err);
        setError('仕入情報の取得中にエラーが発生しました。');
        setPurchaseOrders([
            {
                purchase_order_id: 'PO-001',
                order_date: '2024-03-15T10:00:00Z',
                order_status: '確認中',
                purchase_order_items: [
                    {
                        product_id: 'PRD-001',
                        quantity: 10,
                        unit_price: 1000,
                        products: { product_name: '商品A' },
                    },
                    {
                        product_id: 'PRD-002',
                        quantity: 5,
                        unit_price: 2500,
                        products: { product_name: '商品B' },
                    },
                ],
            },
            {
                purchase_order_id: 'PO-002',
                order_date: '2024-03-16T14:00:00Z',
                order_status: '確認中',
                purchase_order_items: [
                    {
                        product_id: 'PRD-003',
                        quantity: 20,
                        unit_price: 500,
                        products: { product_name: '商品C' },
                    },
                    {
                        product_id: 'PRD-004',
                        quantity: 10,
                        unit_price: 1500,
                        products: { product_name: '商品D' },
                    },
                ],
            },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseOrders();
  }, []);

    useEffect(() => {
      if (purchaseOrders) {
        const calculatedTotal = purchaseOrders.reduce((acc, order) => {
          return acc + order.purchase_order_items.reduce((itemAcc, item) => itemAcc + (item.quantity * item.unit_price), 0);
        }, 0);
        setTotalAmount(calculatedTotal);
      }
    }, [purchaseOrders]);

  const handleConfirmPurchase = async () => {
    if(purchaseOrders.length === 0) return; 

     setLoading(true);
     setError(null);

    try {
        const updates = purchaseOrders.map(async (order) => {
          return supabase
            .from('purchase_orders')
            .update({ order_status: '確定済' })
            .eq('purchase_order_id', order.purchase_order_id);
      });
        await Promise.all(updates);
        router.push('/purchaseComplete');
    } catch (error: any) {
      console.error('Error updating purchase order status:', error);
      setError('発注確定処理中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
      router.push('/purchaseProposal');
    };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <header className="bg-blue-500 p-4 text-white flex justify-between items-center">
         <Link href="/" legacyBehavior>
            <a className="text-xl font-bold flex items-center"><FaArrowLeft className='mr-2'/>仕入確認画面</a>
         </Link>
          <nav>
             <Link href='/purchaseConfirm' legacyBehavior>
                 <a className='mr-4'>仕入確認</a>
             </Link>
              <Link href='/purchaseComplete' legacyBehavior>
                  <a className='mr-4'>仕入完了</a>
              </Link>
           </nav>
      </header>
      <main className="container mx-auto p-4">
      {loading && <div className="text-center">Loading...</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}

        {!loading && !error && purchaseOrders && purchaseOrders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
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
                {purchaseOrders.map((order) => (
                  order.purchase_order_items.map((item:any) =>(
                  <tr key={item.purchase_order_item_id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{order.purchase_order_id}</td>
                  <td className="py-2 px-4 border-b">{new Date(order.order_date).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border-b">{item.products.product_name}</td>
                  <td className="py-2 px-4 border-b">{item.quantity}</td>
                  <td className="py-2 px-4 border-b">{item.unit_price}</td>
                    <td className="py-2 px-4 border-b">{order.order_status}</td>
                  </tr>
                ))  
                ))}
              </tbody>
              <tfoot>
               <tr>
                <td colSpan={4} className="py-2 px-4 border-b text-right font-bold">合計金額</td>
                <td className="py-2 px-4 border-b font-bold">{totalAmount}</td>
                <td className="py-2 px-4 border-b"></td>
              </tr>
              </tfoot>
            </table>
          </div>
        )}

         {!loading && !error && (!purchaseOrders || purchaseOrders.length === 0) && (
            <div className="text-center text-gray-600 mt-6">仕入データが見つかりません。</div>
          )}


          <div className="flex justify-center mt-6">
          <button
            onClick={handleConfirmPurchase}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4"
            disabled={loading}
          >
             <FaCheck className='inline-block mr-2'/> 発注確定
          </button>

          <button
             onClick={handleCancel}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
           >
             <FaTimes className='inline-block mr-2'/> キャンセル
            </button>
        </div>
      </main>
      <footer className="bg-gray-800 text-white text-center p-4 mt-8">
       <p>&copy; 2024 RECERQA AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PurchaseConfirm;
