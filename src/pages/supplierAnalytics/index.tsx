import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaChartBar, FaList, FaUsers, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const SupplierAnalytics = () => {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupplierData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: suppliersData, error: suppliersError } = await supabase
          .from('suppliers')
          .select('supplier_id, supplier_name');

        if (suppliersError) {
          console.error('Error fetching suppliers:', suppliersError);
          setError('仕入先データの取得に失敗しました。');
           setSuppliers([
              { supplier_id: '1', supplier_name: 'サンプル仕入先A' },
              { supplier_id: '2', supplier_name: 'サンプル仕入先B' },
             ]);
        } else {
          setSuppliers(suppliersData || []);
        }

        const { data: purchaseOrdersData, error: purchaseOrdersError } = await supabase
          .from('purchase_orders')
          .select('supplier_id, order_date, order_status');

        if (purchaseOrdersError) {
          console.error('Error fetching purchase orders:', purchaseOrdersError);
          setError('発注データの取得に失敗しました。');
          setPurchaseOrders([
              { supplier_id: '1', order_date: '2024-01-01', order_status: '完了' },
              { supplier_id: '2', order_date: '2024-01-05', order_status: '処理中' },
             ]);
        } else {
           setPurchaseOrders(purchaseOrdersData || []);
        }

      } catch (err: any) {
        console.error('Unexpected error:', err);
        setError('予期せぬエラーが発生しました。');
       setSuppliers([
              { supplier_id: '1', supplier_name: 'サンプル仕入先A' },
              { supplier_id: '2', supplier_name: 'サンプル仕入先B' },
             ]);
          setPurchaseOrders([
              { supplier_id: '1', order_date: '2024-01-01', order_status: '完了' },
              { supplier_id: '2', order_date: '2024-01-05', order_status: '処理中' },
             ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierData();
  }, []);

    const groupedOrders = purchaseOrders.reduce((acc:any, order:any) => {
    if (!acc[order.supplier_id]) {
      acc[order.supplier_id] = [];
    }
    acc[order.supplier_id].push(order);
    return acc;
  }, {});


  if (loading) {
    return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen h-full flex justify-center items-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen h-full bg-gray-100">
       <div className="flex">
        <aside className="bg-gray-200 w-64 p-4">
           <div className="mb-4">
           <Link href="/" className="flex items-center hover:text-blue-500">
                  <FaArrowLeft className="mr-2" />
                  戻る
            </Link>
            </div>
          <h2 className="text-lg font-semibold mb-4">メニュー</h2>
          <nav>
            <ul>
              <li className="mb-2">
                <Link href="/supplierAnalytics" className="flex items-center hover:text-blue-500">
                  <FaChartBar className="mr-2" />
                  仕入先分析
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/orderList" className="flex items-center hover:text-blue-500">
                  <FaList className="mr-2" />
                  発注一覧
                </Link>
              </li>
               <li className="mb-2">
                 <Link href="/customerAnalytics" className="flex items-center hover:text-blue-500">
                  <FaUsers className="mr-2" />
                   得意先分析
                  </Link>
                </li>
            </ul>
          </nav>
        </aside>

      <main className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-6">仕入先分析</h1>
           <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 border-b">仕入先ID</th>
                  <th className="py-2 px-4 border-b">仕入先名</th>
                   <th className="py-2 px-4 border-b">発注情報</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.supplier_id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{supplier.supplier_id}</td>
                    <td className="py-2 px-4 border-b">{supplier.supplier_name}</td>
                      <td className="py-2 px-4 border-b">
                         {groupedOrders[supplier.supplier_id] ? (
                         <ul>
                            {groupedOrders[supplier.supplier_id].map((order:any, index:number) => (
                              <li key={index}>
                                 発注日: {order.order_date}, ステータス: {order.order_status}
                            </li>
                            ))}
                        </ul>
                         ) :  (
                           <p>発注データなし</p>
                            )}
                       </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
           <div className="mt-6">
             <img src="https://placehold.co/600x200/333/fff.png?text=仕入先分析グラフ" alt="Supplier Analytics Graph" className="w-full"/>
            </div>

      </main>
    </div>
    </div>
  );
};

export default SupplierAnalytics;
