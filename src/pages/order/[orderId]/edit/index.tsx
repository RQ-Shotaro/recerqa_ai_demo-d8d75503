import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaSave, FaTimes } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);



const EditOrderPage = () => {
    const router = useRouter();
    const { orderId } = router.query;
    const [order, setOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [purchaseOrder, setPurchaseOrder] = useState(null);
    const [purchaseOrderItems, setPurchaseOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [customer_id, setCustomerId] = useState('');
    const [order_date, setOrderDate] = useState('');
    const [order_status, setOrderStatus] = useState('');
    const [newOrderItems, setNewOrderItems] = useState([{ product_id: '', quantity: 0, unit_price: 0 }]);

    const [supplier_id, setSupplierId] = useState('');
    const [purchase_order_date, setPurchaseOrderDate] = useState('');
    const [purchase_order_status, setPurchaseOrderStatus] = useState('');
    const [newPurchaseOrderItems, setNewPurchaseOrderItems] = useState([{ product_id: '', quantity: 0, unit_price: 0 }]);


    useEffect(() => {
        if (orderId) {
            fetchData();
        }
    }, [orderId]);


   const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch orders data
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('order_id', orderId)
                .single();
            if (orderError) throw orderError;
            setOrder(orderData);
            setCustomerId(orderData.customer_id || '');
            setOrderDate(orderData.order_date ? new Date(orderData.order_date).toISOString().split('T')[0] : '');
            setOrderStatus(orderData.order_status || '');

            // Fetch order items data
            const { data: orderItemsData, error: orderItemsError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId);

            if (orderItemsError) throw orderItemsError;
            setOrderItems(orderItemsData);
            setNewOrderItems(orderItemsData.map(item => ({ product_id: item.product_id, quantity: item.quantity, unit_price: item.unit_price })));


            // Fetch purchase orders data
            const { data: purchaseOrderData, error: purchaseOrderError } = await supabase
                .from('purchase_orders')
                .select('*')
                .eq('purchase_order_id', orderId)
                .single();

            if (purchaseOrderError) {
                console.error("Error fetching purchase order:", purchaseOrderError)
                setPurchaseOrder(null)

            } else {
              setPurchaseOrder(purchaseOrderData);
                setSupplierId(purchaseOrderData.supplier_id || '');
                setPurchaseOrderDate(purchaseOrderData.order_date ? new Date(purchaseOrderData.order_date).toISOString().split('T')[0] : '');
                setPurchaseOrderStatus(purchaseOrderData.order_status || '');
            }


             // Fetch purchase order items data
             const { data: purchaseOrderItemsData, error: purchaseOrderItemsError } = await supabase
                .from('purchase_order_items')
                .select('*')
                .eq('purchase_order_id', orderId);
            if (purchaseOrderItemsError) {
                console.error("Error fetching purchase order items:", purchaseOrderItemsError);
                setPurchaseOrderItems([]);
                setNewPurchaseOrderItems([{ product_id: '', quantity: 0, unit_price: 0 }]);
            } else {
            setPurchaseOrderItems(purchaseOrderItemsData);
            setNewPurchaseOrderItems(purchaseOrderItemsData.map(item => ({ product_id: item.product_id, quantity: item.quantity, unit_price: item.unit_price })));
        }

        } catch (err) {
            setError(err.message || 'データの取得に失敗しました。');
            setOrder({order_id: orderId, customer_id: 'sample-customer', order_date: new Date().toISOString(), order_status:'pending'})
            setOrderItems([{order_id: orderId, product_id: 'sample-product-1', quantity: 1, unit_price: 100}, {order_id: orderId, product_id: 'sample-product-2', quantity: 2, unit_price: 200}]);
            setPurchaseOrder({purchase_order_id: orderId, supplier_id: 'sample-supplier', order_date: new Date().toISOString(), order_status:'pending'})
            setPurchaseOrderItems([{purchase_order_id: orderId, product_id: 'sample-product-3', quantity: 3, unit_price: 300}, {purchase_order_id: orderId, product_id: 'sample-product-4', quantity: 4, unit_price: 400}]);


        } finally {
            setLoading(false);
        }
    };


    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Update orders table
            const { error: updateOrderError } = await supabase
                .from('orders')
                .update({ customer_id, order_date, order_status })
                .eq('order_id', orderId);
            if (updateOrderError) throw updateOrderError;

             // Delete existing order items
            const { error: deleteOrderItemsError } = await supabase
              .from('order_items')
              .delete()
              .eq('order_id', orderId);
            if (deleteOrderItemsError) throw deleteOrderItemsError;

              // Insert new order items
              const orderItemsToInsert = newOrderItems.map(item => ({...item, order_id: orderId}))
            const { error: insertOrderItemsError } = await supabase
              .from('order_items')
              .insert(orderItemsToInsert);
            if (insertOrderItemsError) throw insertOrderItemsError;

            router.push('/order');
        } catch (err) {
            setError(err.message || '注文データの更新に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

  const handlePurchaseOrderSubmit = async (e) => {
    e.preventDefault();
        setLoading(true);
        setError(null);

        try {
             // Update purchase_orders table
            const { error: updatePurchaseOrderError } = await supabase
              .from('purchase_orders')
              .update({ supplier_id, order_date:purchase_order_date, order_status:purchase_order_status})
              .eq('purchase_order_id', orderId);
            if (updatePurchaseOrderError) throw updatePurchaseOrderError;

             // Delete existing purchase order items
            const { error: deletePurchaseOrderItemsError } = await supabase
              .from('purchase_order_items')
              .delete()
              .eq('purchase_order_id', orderId);
            if (deletePurchaseOrderItemsError) throw deletePurchaseOrderItemsError;

            const purchaseOrderItemsToInsert = newPurchaseOrderItems.map(item => ({...item, purchase_order_id: orderId}))

               // Insert new purchase order items
              const { error: insertPurchaseOrderItemsError } = await supabase
              .from('purchase_order_items')
              .insert(purchaseOrderItemsToInsert);

              if(insertPurchaseOrderItemsError) throw insertPurchaseOrderItemsError


            router.push('/order');
        } catch (err) {
            setError(err.message || '仕入データの更新に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/order');
    };

    const handleAddItem = () => {
      setNewOrderItems([...newOrderItems, { product_id: '', quantity: 0, unit_price: 0 }]);
    };

   const handleRemoveItem = (index) => {
        const list = [...newOrderItems];
        list.splice(index, 1);
        setNewOrderItems(list);
    };

    const handleItemChange = (e, index) => {
        const { name, value } = e.target;
        const list = [...newOrderItems];
        list[index][name] = value;
        setNewOrderItems(list);
      };

    const handleAddPurchaseItem = () => {
       setNewPurchaseOrderItems([...newPurchaseOrderItems, { product_id: '', quantity: 0, unit_price: 0 }]);
    };

     const handleRemovePurchaseItem = (index) => {
        const list = [...newPurchaseOrderItems];
        list.splice(index, 1);
        setNewPurchaseOrderItems(list);
    };

     const handlePurchaseItemChange = (e, index) => {
        const { name, value } = e.target;
         const list = [...newPurchaseOrderItems];
        list[index][name] = value;
        setNewPurchaseOrderItems(list);
    };

    if (loading) {
        return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
    }

    if (error) {
        return <div className="min-h-screen h-full flex justify-center items-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen h-full bg-gray-100 flex">
             <aside className="bg-gray-800 text-white w-64 flex-shrink-0">
                <div className="p-4">
                   <Link href="/" legacyBehavior>
                    <h2 className="text-2xl font-bold mb-4 cursor-pointer">RECERQA AI</h2>
                  </Link>

                    <ul>
                      <li className="mb-2">
                        <Link href="/order" legacyBehavior>
                         <div className="block hover:bg-gray-700 p-2 rounded">発注一覧</div>
                         </Link>
                      </li>
                      <li className="mb-2">
                         <Link href="/product" legacyBehavior>
                         <div className="block hover:bg-gray-700 p-2 rounded">商品一覧</div>
                        </Link>
                      </li>
                      <li className="mb-2">
                       <Link href="/customer" legacyBehavior>
                        <div  className="block hover:bg-gray-700 p-2 rounded">顧客一覧</div>
                        </Link>
                      </li>
                       <li className="mb-2">
                       <Link href="/supplier" legacyBehavior>
                       <div className="block hover:bg-gray-700 p-2 rounded">仕入先一覧</div>
                        </Link>
                       </li>
                    </ul>
                </div>
            </aside>
            <main className="flex-1 p-4">
                <h1 className="text-2xl font-bold mb-4">受発注データ編集</h1>

                <div className="mb-8 border rounded p-4 bg-white shadow-md">
                    <h2 className="text-xl font-semibold mb-4">注文データ編集</h2>
                    <form onSubmit={handleOrderSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">顧客ID</label>
                            <input type="text" value={customer_id} onChange={(e) => setCustomerId(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="顧客ID"/>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">注文日</label>
                            <input type="date" value={order_date} onChange={(e) => setOrderDate(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="注文日"/>
                        </div>
                         <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">注文ステータス</label>
                            <input type="text" value={order_status} onChange={(e) => setOrderStatus(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="注文ステータス"/>
                        </div>
                       <h3 className='text-lg font-semibold mt-4 mb-2'>注文商品</h3>
                         {newOrderItems.map((item, index) => (
                          <div key={index} className="flex items-center space-x-2 mb-2">
                            <input type="text" name="product_id" value={item.product_id} onChange={(e) => handleItemChange(e, index)} placeholder="商品ID" className="shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                             <input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(e, index)} placeholder="数量" className="shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                             <input type="number" name="unit_price" value={item.unit_price} onChange={(e) => handleItemChange(e, index)} placeholder="単価" className="shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                             <button type='button' onClick={() => handleRemoveItem(index)} className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded'>削除</button>
                           </div>
                         ))}
                         <button type='button' onClick={handleAddItem} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>商品追加</button>
                         <div className="flex justify-end space-x-4 mt-6">
                            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"><FaSave className="inline mr-2"/> 保存</button>
                            <button type="button" onClick={handleCancel} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"><FaTimes className="inline mr-2"/> キャンセル</button>
                        </div>
                    </form>
                </div>
                <div className="mb-8 border rounded p-4 bg-white shadow-md">
                    <h2 className="text-xl font-semibold mb-4">仕入データ編集</h2>
                    <form onSubmit={handlePurchaseOrderSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">仕入先ID</label>
                            <input type="text" value={supplier_id} onChange={(e) => setSupplierId(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="仕入先ID"/>
                        </div>
                        <div>
                           <label className="block text-gray-700 text-sm font-bold mb-2">注文日</label>
                            <input type="date" value={purchase_order_date} onChange={(e) => setPurchaseOrderDate(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="注文日"/>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">注文ステータス</label>
                           <input type="text" value={purchase_order_status} onChange={(e) => setPurchaseOrderStatus(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="注文ステータス"/>
                        </div>
                          <h3 className='text-lg font-semibold mt-4 mb-2'>仕入商品</h3>
                         {newPurchaseOrderItems.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                            <input type="text" name="product_id" value={item.product_id} onChange={(e) => handlePurchaseItemChange(e, index)} placeholder="商品ID" className="shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                             <input type="number" name="quantity" value={item.quantity} onChange={(e) => handlePurchaseItemChange(e, index)} placeholder="数量" className="shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                             <input type="number" name="unit_price" value={item.unit_price} onChange={(e) => handlePurchaseItemChange(e, index)} placeholder="単価" className="shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                             <button type='button' onClick={() => handleRemovePurchaseItem(index)} className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded'>削除</button>
                             </div>
                         ))}
                          <button type='button' onClick={handleAddPurchaseItem} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>商品追加</button>
                        <div className="flex justify-end space-x-4 mt-6">
                          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"><FaSave className="inline mr-2"/> 保存</button>
                            <button type="button" onClick={handleCancel} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"><FaTimes className="inline mr-2"/> キャンセル</button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditOrderPage;