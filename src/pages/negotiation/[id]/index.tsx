import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaBars, FaHome, FaHistory, FaCog } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const NegotiationDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [purchaseOrderItems, setPurchaseOrderItems] = useState([]);
  const [productDetails, setProductDetails] = useState({});
  const [adjustedDeliveryDate, setAdjustedDeliveryDate] = useState('');
  const [adjustedPrice, setAdjustedPrice] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchPurchaseOrderData = async () => {
      if (!id) return;

      try {
        // Fetch purchase order
        const { data: purchaseOrderData, error: purchaseOrderError } = await supabase
          .from('purchase_orders')
          .select('*')
          .eq('purchase_order_id', id)
          .single();

        if (purchaseOrderError) {
          console.error('Error fetching purchase order:', purchaseOrderError);
            setPurchaseOrder({
                purchase_order_id: 'PO-SAMPLE-001',
                order_date: '2024-05-01T10:00:00Z',
                supplier_id: 'SUP-SAMPLE-001',
                order_status: 'Pending'
            });
            setPurchaseOrderItems([
                { purchase_order_id: 'PO-SAMPLE-001', product_id: 'PROD-SAMPLE-001', quantity: 10, unit_price: 100 },
                { purchase_order_id: 'PO-SAMPLE-001', product_id: 'PROD-SAMPLE-002', quantity: 5, unit_price: 200 }
            ]);
             setProductDetails({
                'PROD-SAMPLE-001': { product_name: 'Sample Product 1' },
                'PROD-SAMPLE-002': { product_name: 'Sample Product 2' }
            });
            return;
        }
          

        setPurchaseOrder(purchaseOrderData);

        // Fetch purchase order items
        const { data: purchaseOrderItemsData, error: purchaseOrderItemsError } = await supabase
          .from('purchase_order_items')
          .select('*')
          .eq('purchase_order_id', id);

        if (purchaseOrderItemsError) {
          console.error('Error fetching purchase order items:', purchaseOrderItemsError);
           setPurchaseOrderItems([
                { purchase_order_id: 'PO-SAMPLE-001', product_id: 'PROD-SAMPLE-001', quantity: 10, unit_price: 100 },
                { purchase_order_id: 'PO-SAMPLE-001', product_id: 'PROD-SAMPLE-002', quantity: 5, unit_price: 200 }
            ]);
        return;

        }
          setPurchaseOrderItems(purchaseOrderItemsData);

        // Fetch product details for each item
        const productDetailsMap = {};
        for (const item of purchaseOrderItemsData) {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('product_id', item.product_id)
            .single();

          if (productError) {
            console.error(`Error fetching product details for ${item.product_id}:`, productError);
            productDetailsMap[item.product_id] = { product_name: '不明な商品' };
           } else {
             productDetailsMap[item.product_id] = productData;
          }
        }
        setProductDetails(productDetailsMap);
      } catch (error) {
        console.error('Error during data fetching:', error);
       setPurchaseOrder({
                purchase_order_id: 'PO-SAMPLE-001',
                order_date: '2024-05-01T10:00:00Z',
                supplier_id: 'SUP-SAMPLE-001',
                order_status: 'Pending'
            });
            setPurchaseOrderItems([
                { purchase_order_id: 'PO-SAMPLE-001', product_id: 'PROD-SAMPLE-001', quantity: 10, unit_price: 100 },
                { purchase_order_id: 'PO-SAMPLE-001', product_id: 'PROD-SAMPLE-002', quantity: 5, unit_price: 200 }
            ]);
             setProductDetails({
                'PROD-SAMPLE-001': { product_name: 'Sample Product 1' },
                'PROD-SAMPLE-002': { product_name: 'Sample Product 2' }
            });

      }
    };

    fetchPurchaseOrderData();
  }, [id]);

    const handleAdjustNegotiation = async () => {
        if (!id) return;

        try {
            const deliveryResponse = await axios.post('/api/ai-negotiate-delivery', {
                purchase_order_id: id,
                original_delivery_date: purchaseOrder?.order_date, // Replace with actual delivery date field if needed
                adjusted_delivery_date: adjustedDeliveryDate,
            });

            const priceResponse = await axios.post('/api/ai-negotiate-price', {
                purchase_order_id: id,
                original_price: purchaseOrderItems?.reduce((sum,item) => sum + item.quantity * item.unit_price, 0),
                adjusted_price: adjustedPrice,
            });

          if(deliveryResponse.status === 200 && priceResponse.status === 200){
                alert('調整が完了しました。');
            } else{
              alert('調整に失敗しました。');
            }
          } catch (error) {
            console.error('Error during negotiation adjustment:', error);
             alert('調整に失敗しました。');
        }
    };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
      <div className="min-h-screen h-full bg-gray-100 flex">
          {/* Sidebar */}  
            <aside
                className={`bg-gray-800 text-white w-64 p-4 space-y-4 fixed top-0 left-0 h-full transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-50`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Menu</h2>
                  <button onClick={toggleSidebar} className="md:hidden">
                      <FaBars className="text-2xl" />
                  </button>
              </div>
              <nav>
                <Link href="/" legacyBehavior>
                 <div className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded">
                    <FaHome className="text-xl" />
                    <span>ホーム</span>
                </div>
                </Link>
                <Link href="/order-history" legacyBehavior>
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded">
                  <FaHistory className="text-xl" />
                  <span>発注履歴</span>
                  </div>
                </Link>
                <Link href="/settings" legacyBehavior>
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded">
                    <FaCog className="text-xl" />
                    <span>設定</span>
                  </div>
                </Link>
                <Link href='/negotiation' legacyBehavior>
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded">
                      <span>納期・金額調整</span>
                  </div>
                </Link>
              </nav>
            </aside>

        <div className={`flex-1 p-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <button onClick={toggleSidebar} className="md:hidden mb-4">
          <FaBars className="text-2xl" />
        </button>
          <h1 className="text-2xl font-bold mb-4">納期金額調整詳細</h1>

          {purchaseOrder ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">案件詳細情報</h2>
              <p><strong>案件ID:</strong> {purchaseOrder.purchase_order_id}</p>
              <p><strong>発注日:</strong> {purchaseOrder.order_date}</p>
              {purchaseOrderItems.map((item) => (
                <div key={item.purchase_order_item_id} className='mb-2 p-2 border rounded'>
                  <p><strong>商品名:</strong> {productDetails[item.product_id]?.product_name || '不明な商品'}</p>
                  <p><strong>数量:</strong> {item.quantity}</p>
                  <p><strong>単価:</strong> {item.unit_price}</p>
                 </div>
                
              ))}
              
              <p><strong>調整前合計金額:</strong> {purchaseOrderItems?.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)}</p>
              {/* Add other details as necessary */}
            </div>
          ) : (
            <p>Loading purchase order details...</p>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">調整フォーム</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">新しい納期:</label>
              <input
                type="date"
                value={adjustedDeliveryDate}
                onChange={(e) => setAdjustedDeliveryDate(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">新しい金額:</label>
              <input
                type="number"
                value={adjustedPrice}
                onChange={(e) => setAdjustedPrice(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <button
              onClick={handleAdjustNegotiation}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              調整実行
            </button>
          </div>

          <div className="flex space-x-4">
             <Link href={`/negotiation/history?id=${id}`} legacyBehavior>
                <div className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    過去取引履歴
                  </div>
              </Link>
               <Link href={`/negotiation/ai-suggestion?id=${id}`} legacyBehavior>
                <div className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    AI提案内容
                  </div>
              </Link>
          </div>
        </div>
      </div>
  );
};

export default NegotiationDetail;
