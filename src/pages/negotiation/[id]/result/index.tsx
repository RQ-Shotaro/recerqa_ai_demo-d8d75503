import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaArrowLeft, FaFileDownload } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const ResultPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [purchaseOrder, setPurchaseOrder] = useState<any>(null);
    const [purchaseOrderItems, setPurchaseOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNegotiationResult = async () => {
            setLoading(true);
            setError(null);
            try {
                if (id) {
                    // Fetch purchase order
                  const { data: purchaseOrderData, error: purchaseOrderError } = await supabase
                      .from('purchase_orders')
                      .select('*')
                      .eq('purchase_order_id', id)
                      .single();
                      if(purchaseOrderError){
                        console.error('Error fetching purchase order:', purchaseOrderError);
                        setError('データの取得に失敗しました');
                        setPurchaseOrder(null);
                      } else {
                        setPurchaseOrder(purchaseOrderData);
                        // Fetch purchase order items
                        const { data: purchaseOrderItemsData, error: purchaseOrderItemsError } = await supabase
                            .from('purchase_order_items')
                            .select('*')
                            .eq('purchase_order_id', id);
                        if(purchaseOrderItemsError) {
                          console.error('Error fetching purchase order items:', purchaseOrderItemsError);
                          setError('購入商品データの取得に失敗しました');
                          setPurchaseOrderItems([]);
                        } else {
                            setPurchaseOrderItems(purchaseOrderItemsData || []);
                          }
                      }
                } else {
                    setError('IDが無効です。');
                  setPurchaseOrder(null);
                    setPurchaseOrderItems([]);
                }
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError('データ取得中にエラーが発生しました。');
                setPurchaseOrder(null);
                  setPurchaseOrderItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNegotiationResult();
    }, [id]);

    const handleReportOutput = () => {
        // Handle report output logic here
        console.log('Report output initiated.');
      alert('レポートが出力されました');
    };

  if (loading) {
    return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen h-full flex justify-center items-center text-red-500">{error}</div>;
  }
    
    if (!purchaseOrder) {
      return <div className="min-h-screen h-full flex justify-center items-center">調整結果が見つかりませんでした。</div>;  
    }

  return (
    <div className="min-h-screen h-full bg-gray-100">
       <Header />
       <SideMenu />
      <main className="ml-64 p-6">
        <div className="flex items-center mb-4">
          <Link href="/negotiation" className="text-blue-500 hover:text-blue-700 flex items-center">
            <FaArrowLeft className="mr-1" />
            一覧へ戻る
          </Link>
        </div>
      <h1 className="text-2xl font-semibold mb-4">調整結果</h1>

        <div className="bg-white shadow rounded p-4 mb-4">
            <h2 className="text-xl font-semibold mb-2">発注情報</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p><strong>発注ID:</strong> {purchaseOrder.purchase_order_id}</p>
                    <p><strong>発注日:</strong> {purchaseOrder.order_date}</p>
                </div>
                <div>
                    <p><strong>サプライヤーID:</strong> {purchaseOrder.supplier_id}</p>
                    <p><strong>発注ステータス:</strong> {purchaseOrder.order_status}</p>
                </div>
            </div>
        </div>

         <div className="bg-white shadow rounded p-4 mb-4">
            <h2 className="text-xl font-semibold mb-2">購入商品</h2>
            {purchaseOrderItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-2">商品ID</th>
                            <th className="px-4 py-2">数量</th>
                            <th className="px-4 py-2">単価</th>
                         </tr>
                    </thead>
                    <tbody>
                    {purchaseOrderItems.map((item:any) => (
                            <tr key={item.purchase_order_item_id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2">{item.product_id}</td>
                                <td className="px-4 py-2">{item.quantity}</td>
                                <td className="px-4 py-2">{item.unit_price}</td>
                            </tr>
                        ))}
                   </tbody>
                </table>
              </div>
            ) : (
                <p>購入商品データがありません。</p>
            )}
        </div>
        <div className="flex justify-end">
          <button onClick={handleReportOutput} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center">
            <FaFileDownload className="mr-2" />
            レポート出力
          </button>
        </div>
      </main>
       <Footer/>
    </div>
  );
};

const Header: React.FC = () => {
    return (
        <header className="bg-gray-800 text-white fixed w-full top-0 left-0 h-16 flex items-center justify-between px-6 z-10">
            <h1 className="text-xl font-bold">RECERQA AI</h1>
            <div className="flex items-center">
                <span className="mr-4">User Name</span>
                  <button onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/login';
                  }} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">ログアウト</button>

            </div>
        </header>
    );
};



const Footer: React.FC = () => {
    return (
      <footer className="bg-gray-800 text-white text-center py-4 fixed bottom-0 w-full">
        <p>&copy; {new Date().getFullYear()} RECERQA AI. All rights reserved.</p>
      </footer>
    );
  };

  const SideMenu: React.FC = () => {
    return (
        <aside className="bg-gray-700 text-white fixed top-16 left-0 w-64 h-full overflow-y-auto z-10">
            <nav className="p-4">
                <ul>
                    <li className="mb-2">
                        <Link href="/" className="block hover:bg-gray-600 p-2 rounded">ダッシュボード</Link>
                    </li>
                     <li className="mb-2">
                        <Link href="/order" className="block hover:bg-gray-600 p-2 rounded">発注一覧</Link>
                    </li>
                     <li className="mb-2">
                        <Link href="/purchase" className="block hover:bg-gray-600 p-2 rounded">仕入一覧</Link>
                    </li>
                    <li className="mb-2">
                         <Link href="/negotiation" className="block hover:bg-gray-600 p-2 rounded">納期・金額調整</Link>
                    </li>
                     <li className="mb-2">
                         <Link href="/quote" className="block hover:bg-gray-600 p-2 rounded">見積一覧</Link>
                    </li>
                     <li className="mb-2">
                        <Link href="/setting" className="block hover:bg-gray-600 p-2 rounded">設定</Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default ResultPage;
