import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaHome, FaHistory, FaCog, FaList, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const AdjustOrder = () => {
    const router = useRouter();
    const { orderId } = router.query;
    const [purchaseOrder, setPurchaseOrder] = useState<any>(null);
    const [purchaseOrderItems, setPurchaseOrderItems] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantityChanges, setQuantityChanges] = useState<{ [key: string]: number }>({});
    const [unitPriceChanges, setUnitPriceChanges] = useState<{ [key: string]: number }>({});
    
    const [user, setUser] = useState<any>(null);
    const [session, setSession] = useState<any>(null);
    
      useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setSession(session)
            setUser(session?.user)
        }

        fetchSession();

        supabase.auth.onAuthStateChange((event, session) => {
            setSession(session)
            setUser(session?.user)
        })
    }, [])

    useEffect(() => {
      const fetchOrderData = async () => {
          if (!orderId) return;
          setLoading(true);
          setError(null);
          try {
            const { data: poData, error: poError } = await supabase
              .from('purchase_orders')
              .select('*')
              .eq('purchase_order_id', orderId)
              .single();

            if (poError) {
              throw new Error(`Failed to fetch purchase order: ${poError.message}`);
            }
            setPurchaseOrder(poData);

            const { data: poiData, error: poiError } = await supabase
              .from('purchase_order_items')
              .select('*')
              .eq('purchase_order_id', orderId);

            if (poiError) {
              throw new Error(`Failed to fetch purchase order items: ${poiError.message}`);
            }
            setPurchaseOrderItems(poiData);


            const productIds = poiData.map((item: { product_id: string }) => item.product_id);

            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .in('product_id', productIds);

            if (productsError) {
              throw new Error(`Failed to fetch products: ${productsError.message}`);
            }
            setProducts(productsData);

            if(poData){
                const { data: supplierData, error: supplierError } = await supabase
                .from('suppliers')
                .select('*')
                .eq('supplier_id', poData.supplier_id)
                .single();

                if(supplierError){
                    throw new Error(`Failed to fetch suppliers: ${supplierError.message}`);
                }
                setSuppliers([supplierData])
            }           

          } catch (err: any) {
            setError(err.message || 'Failed to load data');
            setPurchaseOrder({
                purchase_order_id: orderId,
                supplier_id: 'sample-supplier-id',
                order_date: '2024-07-30T10:00:00.000Z',
                order_status: 'pending'
            });

            setPurchaseOrderItems([
                {
                    purchase_order_item_id: 'sample-item-id-1',
                    purchase_order_id: orderId,
                    product_id: 'sample-product-id-1',
                    quantity: 10,
                    unit_price: 100
                },
                {
                    purchase_order_item_id: 'sample-item-id-2',
                    purchase_order_id: orderId,
                    product_id: 'sample-product-id-2',
                    quantity: 5,
                    unit_price: 250
                },
            ]);
            setProducts([
                {
                    product_id: 'sample-product-id-1',
                    product_name: 'Sample Product 1'
                },
                {
                    product_id: 'sample-product-id-2',
                    product_name: 'Sample Product 2'
                }
            ]);
            setSuppliers([{
                supplier_id: 'sample-supplier-id',
                supplier_name: 'Sample Supplier'
              }
            ]);
          } finally {
            setLoading(false);
          }
        };

      fetchOrderData();
    }, [orderId]);

    const handleQuantityChange = (itemId: string, value: number) => {
        setQuantityChanges({ ...quantityChanges, [itemId]: value });
    };

      const handleUnitPriceChange = (itemId: string, value: number) => {
        setUnitPriceChanges({ ...unitPriceChanges, [itemId]: value });
      };

    const handleSubmit = async (e: any) => {
      e.preventDefault();
        setLoading(true);
        setError(null);

    const updatedItems = purchaseOrderItems.map((item: any) => {
        const updatedQuantity = quantityChanges[item.purchase_order_item_id] !== undefined ? quantityChanges[item.purchase_order_item_id] : item.quantity;
        const updatedUnitPrice = unitPriceChanges[item.purchase_order_item_id] !== undefined ? unitPriceChanges[item.purchase_order_item_id] : item.unit_price;

          return {
              purchase_order_item_id: item.purchase_order_item_id,
              quantity: updatedQuantity,
              unit_price: updatedUnitPrice,
          }
    });
      
      try{
          const response = await axios.post('/api/ai-adjust', {
               purchase_order_id: purchaseOrder.purchase_order_id,
                items: updatedItems,
            });

            if(response.data.success){
               router.push(`/adjust/result/${orderId}`);
            } else {
                  setError('調整に失敗しました。');
              }

      } catch (err: any) {
            setError(err.message || '調整に失敗しました');
      } finally {
        setLoading(false);
      }
    };

  if(!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">ログインしてください</h1>
      <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50">ログイン</Link>
    </div>
    )
  }

    return (
        <div className="min-h-screen h-full bg-gray-100 flex">
             <aside className="bg-gray-800 text-white w-64 p-4">
                <nav>
                    <Link href="/" className="flex items-center p-2 hover:bg-gray-700 rounded">
                        <FaHome className="mr-2" /> ホーム
                    </Link>
                    <Link href="/history" className="flex items-center p-2 hover:bg-gray-700 rounded">
                        <FaHistory className="mr-2" /> 発注履歴
                    </Link>
                     <Link href="/settings" className="flex items-center p-2 hover:bg-gray-700 rounded">
                       <FaCog className="mr-2" /> 設定
                    </Link>
                     <Link href="/order" className="flex items-center p-2 hover:bg-gray-700 rounded">
                        <FaList className="mr-2" /> 発注
                    </Link>
                </nav>
            </aside>
            <main className="flex-1 p-4">
                <div className="mb-4">
                <Link href={`/order/${orderId}`}  className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
                   <FaArrowLeft className="mr-2"/> 戻る
                </Link>
                </div>
                 <h1 className="text-2xl font-bold mb-4">仕入条件調整画面</h1>
                    {loading && <p>Loading...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                {purchaseOrder && suppliers.length > 0 && (
                    <div>
                        <div className="mb-4">
                            <p><strong>発注ID:</strong> {purchaseOrder.purchase_order_id}</p>
                            <p><strong>仕入先:</strong> {suppliers[0].supplier_name}</p>
                            <p><strong>発注日:</strong> {new Date(purchaseOrder.order_date).toLocaleDateString()}</p>
                            <p><strong>ステータス:</strong> {purchaseOrder.order_status}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="overflow-x-auto">
                            <table className="w-full table-auto border-collapse border border-gray-300">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="border border-gray-300 px-4 py-2">商品名</th>
                                        <th className="border border-gray-300 px-4 py-2">数量</th>
                                         <th className="border border-gray-300 px-4 py-2">単価</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchaseOrderItems.map((item: any) => {
                                      const product = products.find((p: any) => p.product_id === item.product_id);
                                        return (
                                            <tr key={item.purchase_order_item_id} className="border-b border-gray-300">
                                                <td className="border border-gray-300 px-4 py-2">{product?.product_name || '不明'}</td>
                                                <td className="border border-gray-300 px-4 py-2">
                                                    <input
                                                        type="number"
                                                        className="border border-gray-300 px-2 py-1 w-24"
                                                        defaultValue={item.quantity}
                                                        onChange={(e) => handleQuantityChange(item.purchase_order_item_id, Number(e.target.value))}
                                                    />
                                                </td>
                                                 <td className="border border-gray-300 px-4 py-2">
                                                    <input
                                                        type="number"
                                                        className="border border-gray-300 px-2 py-1 w-24"
                                                        defaultValue={item.unit_price}
                                                        onChange={(e) => handleUnitPriceChange(item.purchase_order_item_id, Number(e.target.value))}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            </div>
                            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50">
                                調整を保存
                            </button>
                            <Link href={`/adjust/history/${orderId}`} className="ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50">
                                 調整履歴一覧
                            </Link>
                           
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdjustOrder;