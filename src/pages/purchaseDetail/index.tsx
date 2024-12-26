import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/supabase';
import { FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import Link from 'next/link';


const PurchaseDetail = () => {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [quotes, setQuotes] = useState<any[]>([]);

    const [selectedSupplier, setSelectedSupplier] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [dueDate, setDueDate] = useState<string>('');
    const [priceAdjustment, setPriceAdjustment] = useState<number>(0);
    const [orderStatus, setOrderStatus] = useState<string>('pending');
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [unitPrice, setUnitPrice] = useState<number>(0);
    

    useEffect(() => {
      const fetchProducts = async () => {
        const { data, error } = await supabase.from('products').select('product_id, product_name, unit_price');
          if(error) {
             console.error('Error fetching products:', error);
             setProducts([
                  {product_id: '1', product_name: 'Sample Product 1', unit_price: 100 },
                  {product_id: '2', product_name: 'Sample Product 2', unit_price: 200 }
                ])
            } else {
              setProducts(data);
            }
        };

      const fetchSuppliers = async () => {
          const { data, error } = await supabase.from('suppliers').select('supplier_id, supplier_name');
          if(error) {
              console.error('Error fetching suppliers:', error);
               setSuppliers([
                    {supplier_id: '1', supplier_name: 'Sample Supplier 1' },
                    {supplier_id: '2', supplier_name: 'Sample Supplier 2' }
                  ])
            } else {
              setSuppliers(data);
            }
        };
      const fetchQuotes = async () => {
        const { data, error } = await supabase.from('quotes').select('quote_id, supplier_id, quote_date, valid_until');
          if(error) {
            console.error('Error fetching quotes:', error);
             setQuotes([
                  {quote_id: '1', supplier_id: '1', quote_date: '2024-08-01T10:00:00.000Z', valid_until: '2024-08-15T10:00:00.000Z'},
                  {quote_id: '2', supplier_id: '2', quote_date: '2024-08-05T10:00:00.000Z', valid_until: '2024-08-20T10:00:00.000Z'}
                ])
            } else {
              setQuotes(data);
            }
          };

        fetchProducts();
        fetchSuppliers();
        fetchQuotes();
      }, []);

      const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const productId = e.target.value;
        setSelectedProduct(productId);
          const selected = products.find(product => product.product_id === productId);
        setUnitPrice(selected ? selected.unit_price : 0);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

          const { data: purchaseOrderData, error: purchaseOrderError } = await supabase
          .from('purchase_orders')
          .insert([
            {
              supplier_id: selectedSupplier,
              order_date: new Date().toISOString(),
              order_status: orderStatus
            }
          ])
          .select('purchase_order_id')
          .single();
    
          if (purchaseOrderError) {
            console.error('Error creating purchase order:', purchaseOrderError);
            return;
          }
        const purchaseOrderId = purchaseOrderData.purchase_order_id;

          const { error: purchaseOrderItemError } = await supabase
          .from('purchase_order_items')
          .insert([
            {
              purchase_order_id: purchaseOrderId,
              product_id: selectedProduct,
              quantity: quantity,
              unit_price: unitPrice
            }
          ]);
          if (purchaseOrderItemError) {
            console.error('Error creating purchase order item:', purchaseOrderItemError);
          return;
          }

        alert('仕入情報が登録されました');
        router.push('/');
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <header className="bg-blue-500 p-4 text-white flex justify-between items-center">
                <Link href="/" className="flex items-center">
                 <FaArrowLeft className="mr-2" />
                 <span>Back</span>
                </Link>
                 <h1 className="text-2xl font-bold">仕入詳細設定画面</h1>
                <div>
                <Link href="/" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50" >Home</Link>
            </div>

            </header>

            <main className="container mx-auto p-4">
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supplier">仕入先</label>
                        <select
                            id="supplier"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                            value={selectedSupplier}
                            required>
                            <option value="">仕入先を選択してください</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.supplier_id} value={supplier.supplier_id}>
                                    {supplier.supplier_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="product">商品</label>
                      <select
                        id="product"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        onChange={handleProductSelect}
                        value={selectedProduct}
                        required>
                           <option value="">商品を選択してください</option>
                            {products.map((product) => (
                                <option key={product.product_id} value={product.product_id}>
                                    {product.product_name} - ¥{product.unit_price}
                                </option>
                            ))}
                      </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">数量</label>
                        <input
                            type="number"
                            id="quantity"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            min="1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">納期</label>
                        <input
                            type="date"
                            id="dueDate"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priceAdjustment">金額調整</label>
                        <input
                            type="number"
                            id="priceAdjustment"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={priceAdjustment}
                            onChange={(e) => setPriceAdjustment(parseFloat(e.target.value))}
                        />
                    </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="orderStatus">発注ステータス</label>
                          <select
                            id="orderStatus"
                              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={orderStatus}
                            onChange={(e) => setOrderStatus(e.target.value)}>
                                <option value="pending">保留</option>
                                <option value="ordered">発注済み</option>
                                <option value="shipped">出荷済み</option>
                                <option value="delivered">配達済み</option>
                          </select>
                      </div>

                    <div className="flex items-center justify-between">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                          <FaCheck className="inline-block mr-1" />
                            登録
                        </button>
                         <button type="button" onClick={() => router.back()} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                         <FaTimes className="inline-block mr-1" />
                          キャンセル
                        </button>
                    </div>
                </form>
            </main>
             <footer className="bg-gray-200 text-center p-4">
                <p className="text-sm text-gray-500">© 2024 RECERQA AI. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default PurchaseDetail;