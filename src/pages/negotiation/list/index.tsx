import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaSearch, FaEdit, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const NegotiationList = () => {
  const router = useRouter();
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: purchase_orders_data, error: purchase_orders_error } = await supabase
                .from('purchase_orders')
                .select('purchase_order_id, order_date, supplier_id, order_status');
            if (purchase_orders_error) {
                setError(`Failed to fetch purchase orders: ${purchase_orders_error.message}`);
                setPurchaseOrders([
                  {
                    purchase_order_id: 'PO-001',
                    order_date: '2024-07-26',
                    supplier_id: 'S-001',
                    order_status: 'pending',
                  },
                  {
                    purchase_order_id: 'PO-002',
                    order_date: '2024-07-27',
                    supplier_id: 'S-002',
                    order_status: 'processing',
                  },
                ]);
                return;
            }
            const { data: purchase_order_items_data, error: purchase_order_items_error } = await supabase
            .from('purchase_order_items')
            .select('purchase_order_id, product_id, quantity, unit_price');
        if (purchase_order_items_error) {
          setError(`Failed to fetch purchase order items: ${purchase_order_items_error.message}`);
           setPurchaseOrders([
                {
                  purchase_order_id: 'PO-001',
                  order_date: '2024-07-26',
                  supplier_id: 'S-001',
                  order_status: 'pending',
                },
                {
                  purchase_order_id: 'PO-002',
                  order_date: '2024-07-27',
                  supplier_id: 'S-002',
                  order_status: 'processing',
                },
            ]);
            return;
        }
    
          const { data: products_data, error: products_error } = await supabase
                .from('products')
                .select('product_id, product_name');
          if (products_error) {
               setError(`Failed to fetch products: ${products_error.message}`);
               setPurchaseOrders([
                    {
                      purchase_order_id: 'PO-001',
                      order_date: '2024-07-26',
                      supplier_id: 'S-001',
                      order_status: 'pending',
                    },
                    {
                      purchase_order_id: 'PO-002',
                      order_date: '2024-07-27',
                      supplier_id: 'S-002',
                      order_status: 'processing',
                    },
                ]);
               return;
          }
          // Combine data
          const enrichedPurchaseOrders = purchase_orders_data.map(po => {
              const items = purchase_order_items_data.filter(item => item.purchase_order_id === po.purchase_order_id).map(item => {
                const product = products_data.find(p => p.product_id === item.product_id);
                return {
                    ...item,
                    product_name: product ? product.product_name : '不明',
                };
              });
              return {
                  ...po,
                  items
              };
          });
          setPurchaseOrders(enrichedPurchaseOrders);

        } catch (err: any) {
            setError(`An unexpected error occurred: ${err.message}`);
            setPurchaseOrders([
                {
                    purchase_order_id: 'PO-001',
                    order_date: '2024-07-26',
                    supplier_id: 'S-001',
                    order_status: 'pending',
                  },
                  {
                    purchase_order_id: 'PO-002',
                    order_date: '2024-07-27',
                    supplier_id: 'S-002',
                    order_status: 'processing',
                  },
              ]);
        }
         finally {
             setLoading(false);
         }
      };

      fetchPurchaseOrders();
    }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredPurchaseOrders = purchaseOrders.filter((po) =>
    po?.purchase_order_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen h-full bg-gray-100">
        <Header />
        <div className="flex">
            <SideMenu />
             <main className="flex-1 p-4">

            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">納期金額調整一覧</h1>
              <div className="relative">
                <input
                  type="text"
                  placeholder="検索..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="px-4 py-2 border rounded border-gray-300 focus:ring focus:ring-blue-200 focus:border-blue-300"
                />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
              </div>
            </div>
             {loading && <p className="text-center">Loading...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {!loading && !error && filteredPurchaseOrders.length === 0 && <p className="text-center">調整データが見つかりません。</p>}
          {!loading && !error && filteredPurchaseOrders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">発注ID</th>
                     <th className="py-2 px-4 border-b text-left">発注日</th>
                    <th className="py-2 px-4 border-b text-left">サプライヤーID</th>
                    <th className="py-2 px-4 border-b text-left">ステータス</th>
                    <th className="py-2 px-4 border-b text-left">商品</th>
                    <th className="py-2 px-4 border-b text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                {filteredPurchaseOrders.map((po) => (
                    <tr key={po.purchase_order_id} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b">{po.purchase_order_id}</td>
                      <td className="py-2 px-4 border-b">{po.order_date}</td>
                      <td className="py-2 px-4 border-b">{po.supplier_id}</td>
                      <td className="py-2 px-4 border-b">{po.order_status}</td>
                      <td className="py-2 px-4 border-b">
                       {po.items?.map(item => (<div key={item.product_id}>{item.product_name}</div>) )}
                       </td>
                      <td className="py-2 px-4 border-b">
                        <Link href={`/negotiation/detail?id=${po.purchase_order_id}`} className="flex items-center gap-1 text-blue-500 hover:text-blue-700">
                          <FaEdit /> 詳細
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
           )}
         </main>
        </div>
        <Footer />
    </div>
  );
};


const Header = () => {
    return (
        <header className="bg-blue-500 p-4 text-white">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">RECERQA AI</Link>
                <nav>
                    <ul className="flex space-x-6">
                       <li><Link href="/" className="hover:text-gray-200">ホーム</Link></li>
                        <li><Link href="/login" className="hover:text-gray-200">ログイン</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white text-center p-4">
            <p>&copy; {new Date().getFullYear()} RECERQA AI. All rights reserved.</p>
        </footer>
    );
};

const SideMenu = () => {
    return (
         <aside className="bg-gray-200 w-64 p-4">
            <nav>
                <ul>
                   <li className="mb-2">
                        <Link href="/" className="block p-2 rounded hover:bg-gray-300">
                             ホーム
                        </Link>
                    </li>
                   <li className="mb-2">
                       <Link href="/negotiation/list" className="block p-2 rounded hover:bg-gray-300 font-semibold text-blue-600">
                            納期金額調整一覧
                        </Link>
                    </li>
                    <li className="mb-2">
                        <Link href="/order/list" className="block p-2 rounded hover:bg-gray-300">
                           発注一覧
                        </Link>
                    </li>
                    <li className="mb-2">
                        <Link href="/quote/list" className="block p-2 rounded hover:bg-gray-300">
                            見積一覧
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default NegotiationList;
