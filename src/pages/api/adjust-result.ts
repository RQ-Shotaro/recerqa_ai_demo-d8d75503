import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaArrowLeft, FaCheck, FaPaperPlane } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const AdjustConfirm = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const [purchaseOrder, setPurchaseOrder] = useState<any>(null);
  const [purchaseOrderItems, setPurchaseOrderItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch purchase order
                const { data: purchaseOrderData, error: purchaseOrderError } = await supabase
                    .from('purchase_orders')
                    .select('*')
                    .eq('purchase_order_id', orderId)
                    .single();

                if (purchaseOrderError) {
                    throw new Error(`Failed to fetch purchase order: ${purchaseOrderError.message}`);
                }
                setPurchaseOrder(purchaseOrderData);

                // Fetch purchase order items
                const { data: purchaseOrderItemsData, error: purchaseOrderItemsError } = await supabase
                    .from('purchase_order_items')
                    .select('*')
                    .eq('purchase_order_id', orderId);

                if (purchaseOrderItemsError) {
                    throw new Error(`Failed to fetch purchase order items: ${purchaseOrderItemsError.message}`);
                }
                setPurchaseOrderItems(purchaseOrderItemsData);

                // Fetch products
                const productIds = purchaseOrderItemsData.map((item: any) => item.product_id);
                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select('*')
                    .in('product_id', productIds);

                if (productsError) {
                    throw new Error(`Failed to fetch products: ${productsError.message}`);
                }
                setProducts(productsData);

                // Fetch suppliers
                if(purchaseOrderData && purchaseOrderData.supplier_id){
                const { data: supplierData, error: supplierError } = await supabase
                    .from('suppliers')
                    .select('*')
                    .eq('supplier_id', purchaseOrderData.supplier_id)
                    .single();
                    if(supplierError){
                         throw new Error(`Failed to fetch suppliers: ${supplierError.message}`);
                    }
                    setSuppliers(supplierData);
                }



            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchData();
        }
    }, [orderId]);

  const handleComplete = async () => {
    try {
            // Simulate API call to reflect the adjustment result.
           const res = await fetch(`/api/adjust-result`, {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify({ orderId: orderId, status: '調整完了' }),
           });

           if (!res.ok) {
               throw new Error('Failed to update adjustment result.');
           }
      router.push(`/adjust/${orderId}/complete`);
    } catch (error:any) {
        setError(error.message || '調整結果の反映に失敗しました。');
    }
  };

  const handleRequestApproval = () => {
        router.push(`/adjust/${orderId}/request-approval`);
  };

  if (loading) {
    return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
  }

    if (error) {
        return <div className="min-h-screen h-full flex justify-center items-center text-red-500">Error: {error}</div>;
    }


    const getProductName = (productId:string) => {
        const product = products.find((p:any) => p.product_id === productId);
        return product ? product.product_name : '不明な商品';
    };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <header className="bg-blue-500 p-4 text-white flex items-center justify-between">
         <Link href='/adjust' className='flex items-center'>
          <FaArrowLeft className="mr-2" />
          戻る
          </Link>
          <h1 className="text-xl font-bold">調整結果確認画面</h1>
        <div></div>
      </header>
      <main className="p-6">
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">発注情報詳細</h2>
            {purchaseOrder && (
            <div className='mb-4'>
            <p><strong>発注ID:</strong> {purchaseOrder.purchase_order_id}</p>
            <p><strong>発注日:</strong> {purchaseOrder.order_date}</p>
            <p><strong>サプライヤー:</strong> {suppliers?.supplier_name}</p>
            <p><strong>発注ステータス:</strong> {purchaseOrder.order_status}</p>
            </div>
          )}

          <h3 className="text-md font-semibold mb-2">発注品目</h3>
          <table className="w-full table-auto">
              <thead>
              <tr className="bg-gray-200">
                  <th className="px-4 py-2">商品名</th>
                  <th className="px-4 py-2">数量</th>
                  <th className="px-4 py-2">単価</th>
              </tr>
              </thead>
              <tbody>
              {purchaseOrderItems.map((item:any) => (
                  <tr key={item.purchase_order_item_id} className='border-b border-gray-200'>
                      <td className="px-4 py-2">{getProductName(item.product_id)}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">{item.unit_price}</td>
                  </tr>
              ))}
              </tbody>
          </table>
        </div>

        <div className="flex justify-end space-x-4">
          <button onClick={handleComplete} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center">
            <FaCheck className="mr-2" />
            調整完了
          </button>
          <button onClick={handleRequestApproval} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center">
            <FaPaperPlane className="mr-2" />
            承認依頼
          </button>
        </div>
      </main>
        <footer className='bg-gray-800 text-white text-center p-4'>
            <p>&copy; 2024 RECERQA AI. All rights reserved.</p>
        </footer>
    </div>
  );
};

export default AdjustConfirm;
