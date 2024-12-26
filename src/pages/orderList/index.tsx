import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const OrderList: React.FC = () => {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
      const [isMenuOpen, setIsMenuOpen] = useState(false);
    
     const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
      };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select('order_id,customer_id,order_date,order_status');
                
                    if(ordersError) {
                         console.error('Error fetching orders:', ordersError);
                         setError('Failed to load order data.');
                         setOrders([{"order_id": "sample-order-1", "customer_id": "sample-customer-1", "order_date": "2024-08-01", "order_status": "completed"}, {"order_id": "sample-order-2", "customer_id": "sample-customer-2", "order_date": "2024-08-02", "order_status": "pending"}]);
                    }
                    else {
                          setOrders(ordersData || []);
                    }
               
                const { data: purchaseOrdersData, error: purchaseOrdersError } = await supabase
                    .from('purchase_orders')
                    .select('purchase_order_id,supplier_id,order_date,order_status');
                if(purchaseOrdersError) {
                    console.error('Error fetching purchase orders:', purchaseOrdersError);
                    setError('Failed to load purchase order data.');
                    setPurchaseOrders([{"purchase_order_id": "sample-po-1", "supplier_id": "sample-supplier-1", "order_date": "2024-08-01", "order_status": "completed"}, {"purchase_order_id": "sample-po-2", "supplier_id": "sample-supplier-2", "order_date": "2024-08-02", "order_status": "pending"}]);
                }
                else {
                        setPurchaseOrders(purchaseOrdersData || []);
                }
                
            } catch (err:any) {
                console.error('An unexpected error occurred:', err);
                setError('An unexpected error occurred.');
                setOrders([{"order_id": "sample-order-1", "customer_id": "sample-customer-1", "order_date": "2024-08-01", "order_status": "completed"}, {"order_id": "sample-order-2", "customer_id": "sample-customer-2", "order_date": "2024-08-02", "order_status": "pending"}]);
                setPurchaseOrders([{"purchase_order_id": "sample-po-1", "supplier_id": "sample-supplier-1", "order_date": "2024-08-01", "order_status": "completed"}, {"purchase_order_id": "sample-po-2", "supplier_id": "sample-supplier-2", "order_date": "2024-08-02", "order_status": "pending"}]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };
    
    const sortedOrders = [...orders].sort((a:any, b:any) => {
         if (sortColumn && sortDirection) {
                const aValue = a[sortColumn];
                const bValue = b[sortColumn];
                 if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1; // Push null/undefined to the end
                if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1; // Push null/undefined to the end
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortDirection === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                   return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                } else if (aValue instanceof Date && bValue instanceof Date) {
                     return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
                 }
              else{
                  return 0; //If cannot sort return 0;                  
              }
            }
          return 0;
    });
    
   const sortedPurchaseOrders = [...purchaseOrders].sort((a:any, b:any) => {
         if (sortColumn && sortDirection) {
                const aValue = a[sortColumn];
                const bValue = b[sortColumn];
                  if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1; // Push null/undefined to the end
                if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1; // Push null/undefined to the end
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortDirection === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                   return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                }else if (aValue instanceof Date && bValue instanceof Date) {
                     return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
                } else{
                  return 0; //If cannot sort return 0;    
              }
            }
            return 0;
    });

    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const currentPurchaseOrders = sortedPurchaseOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    const totalOrderPages = Math.ceil(sortedOrders.length / itemsPerPage);
    const totalPurchaseOrderPages = Math.ceil(sortedPurchaseOrders.length / itemsPerPage);
    
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const renderSortIcon = (column: string) => {
        if (sortColumn === column) {
            if (sortDirection === 'asc') {
                return <FaSortUp className="inline-block ml-1"/>;
            } else {
                return <FaSortDown className="inline-block ml-1"/>;
            }
        }
        return <FaSort className="inline-block ml-1"/>;
    };

    return (
      <div className="min-h-screen h-full bg-gray-100 flex">
        <aside className={`bg-gray-800 text-white w-64 flex-shrink-0  ${isMenuOpen ? 'block' : 'hidden'}  md:block `}>
            <div className="p-4">
                <h2 className="text-2xl font-bold">RECERQA</h2>
            </div>
          <nav>
             <Link href="/orderList" legacyBehavior>
                <div className="block py-2 px-4 hover:bg-gray-700 cursor-pointer">
                     受発注データ一覧
                 </div>
              </Link>
                <Link href="/" legacyBehavior>
                    <div className="block py-2 px-4 hover:bg-gray-700 cursor-pointer">
                         ホーム
                    </div>
                 </Link>
                 <Link href="/productList" legacyBehavior>
                    <div className="block py-2 px-4 hover:bg-gray-700 cursor-pointer">
                       商品一覧
                    </div>
                  </Link>
                 <Link href="/customerList" legacyBehavior>
                   <div className="block py-2 px-4 hover:bg-gray-700 cursor-pointer">
                        顧客一覧
                     </div>
                  </Link>
                  <Link href="/supplierList" legacyBehavior>
                  <div className="block py-2 px-4 hover:bg-gray-700 cursor-pointer">
                        仕入先一覧
                    </div>
                  </Link>
           </nav>
        </aside>
       <div className="flex-1 flex flex-col overflow-hidden">
       <header className="bg-white shadow-md p-4">
            <div className="flex justify-between items-center">
                 <button onClick={toggleMenu} className="md:hidden text-gray-700 focus:outline-none">
                   <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                   </svg>
                </button>
                <h1 className="text-xl font-semibold">受発注データ一覧</h1>
            </div>
        </header>
            <main className="p-6 overflow-y-auto">
                {loading && <div className="text-center">Loading data...</div>}
                {error && <div className="text-red-500 text-center">{error}</div>}

                {!loading && !error && (
                    <>
                    <h2 className='text-xl font-semibold mb-4'>発注データ</h2>
                      <div className="overflow-x-auto shadow-md rounded">
                        <table className="min-w-full leading-normal bg-white">
                            <thead>
                            <tr className="bg-gray-200">
                                <th className="px-5 py-3 border-b-2 border-gray-200  text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('order_id')}>注文ID {renderSortIcon('order_id')}</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200  text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('customer_id')}>顧客ID {renderSortIcon('customer_id')}</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200  text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('order_date')}>注文日 {renderSortIcon('order_date')}</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200  text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('order_status')}>注文ステータス {renderSortIcon('order_status')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentOrders.map((order:any) => (
                                <tr key={order.order_id} className="hover:bg-gray-100">
                                    <td className="px-5 py-5 border-b border-gray-200  text-sm">{order.order_id}</td>
                                    <td className="px-5 py-5 border-b border-gray-200  text-sm">{order.customer_id}</td>
                                    <td className="px-5 py-5 border-b border-gray-200  text-sm">{order.order_date}</td>
                                    <td className="px-5 py-5 border-b border-gray-200  text-sm">{order.order_status}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                      </div>
                        <div className="mt-4 flex justify-center">
                            {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => paginate(page)}
                                    className={`mx-1 px-3 py-1 rounded ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-300'}`}
                                >
                                    {page}
                                </button>
                            ))}
                         </div>
                     <h2 className='text-xl font-semibold mt-8 mb-4'>仕入データ</h2>
                       <div className="overflow-x-auto shadow-md rounded">
                         <table className="min-w-full leading-normal bg-white">
                            <thead>
                            <tr className="bg-gray-200">
                                <th className="px-5 py-3 border-b-2 border-gray-200  text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('purchase_order_id')}>仕入ID {renderSortIcon('purchase_order_id')}</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200  text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('supplier_id')}>仕入先ID {renderSortIcon('supplier_id')}</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200  text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('order_date')}>注文日 {renderSortIcon('order_date')}</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200  text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('order_status')}>注文ステータス {renderSortIcon('order_status')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentPurchaseOrders.map((purchaseOrder:any) => (
                                <tr key={purchaseOrder.purchase_order_id} className="hover:bg-gray-100">
                                    <td className="px-5 py-5 border-b border-gray-200  text-sm">{purchaseOrder.purchase_order_id}</td>
                                    <td className="px-5 py-5 border-b border-gray-200  text-sm">{purchaseOrder.supplier_id}</td>
                                    <td className="px-5 py-5 border-b border-gray-200  text-sm">{purchaseOrder.order_date}</td>
                                    <td className="px-5 py-5 border-b border-gray-200  text-sm">{purchaseOrder.order_status}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </div>
                        <div className="mt-4 flex justify-center">
                            {Array.from({ length: totalPurchaseOrderPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => paginate(page)}
                                    className={`mx-1 px-3 py-1 rounded ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-300'}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    </div>
    );
};

export default OrderList;
