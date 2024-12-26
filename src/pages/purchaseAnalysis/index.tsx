import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FaChartBar, FaList, FaUser, FaSignOutAlt } from 'react-icons/fa';
import Link from 'next/link';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const PurchaseAnalysis = () => {
  const router = useRouter();
  const [purchaseData, setPurchaseData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: '仕入データ分析',
        },
      },
    };

  const sidebarItems = [
        { name: '仕入分析', href: '/purchaseAnalysis', icon: <FaChartBar /> },
        { name: '発注一覧', href: '/orderList', icon: <FaList /> },
        { name: 'ユーザー設定', href: '/userSettings', icon: <FaUser /> },
    ];

  useEffect(() => {
    const fetchSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
    };
    fetchSession();
  }, []);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
          const { data: purchaseOrders, error: purchaseOrdersError } = await supabase
          .from('purchase_orders')
          .select('purchase_order_id, supplier_id, order_date, order_status');

          if (purchaseOrdersError) throw purchaseOrdersError;

          const { data: purchaseOrderItems, error: purchaseOrderItemsError } = await supabase
            .from('purchase_order_items')
            .select('purchase_order_id, product_id, quantity, unit_price');
          if(purchaseOrderItemsError) throw purchaseOrderItemsError;

          const { data: suppliers, error: suppliersError } = await supabase
            .from('suppliers')
            .select('supplier_id, supplier_name');
          if(suppliersError) throw suppliersError;
          
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('product_id, product_name');
            if(productsError) throw productsError;
          
          const mergedData = purchaseOrders.map((po: any) => {
            const items = purchaseOrderItems.filter((poi: any) => poi.purchase_order_id === po.purchase_order_id)
            .map((poi: any) => {
                const product = products.find((p: any) => p.product_id === poi.product_id);
                return {...poi, product_name: product?.product_name};
            });
            const supplier = suppliers.find((s: any) => s.supplier_id === po.supplier_id);
            return {...po, items, supplier_name: supplier?.supplier_name};
           });
          setPurchaseData(mergedData);
      } catch (err: any) {
        setError(err.message || 'データ取得中にエラーが発生しました。');
          console.error("Error fetching data:",err)
          // サンプルデータの設定
          setPurchaseData([
          {
              "purchase_order_id": "sample-po-1",
              "supplier_id": "sample-supplier-1",
              "order_date": "2024-01-15T10:00:00",
              "order_status": "完了",
                "items": [
                  {"product_id": "sample-product-1", "quantity": 10, "unit_price": 100, "product_name": "サンプル商品A"},
                  {"product_id": "sample-product-2", "quantity": 5, "unit_price": 200, "product_name": "サンプル商品B"},
                ],
                "supplier_name": "サンプル仕入先A",
              },
              {
                  "purchase_order_id": "sample-po-2",
                  "supplier_id": "sample-supplier-2",
                  "order_date": "2024-02-15T10:00:00",
                  "order_status": "処理中",
                  "items": [
                    {"product_id": "sample-product-1", "quantity": 15, "unit_price": 100, "product_name": "サンプル商品A"},
                    {"product_id": "sample-product-3", "quantity": 8, "unit_price": 300, "product_name": "サンプル商品C"},
                    ],
                    "supplier_name": "サンプル仕入先B",
                }
          ]);

        }
        finally{
          setLoading(false);
        }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: purchaseData.map((po: any) => po.purchase_order_id),
    datasets: [
      {
        label: '合計金額',
        data: purchaseData.map((po: any) => {
            return po.items?.reduce((sum: number, item:any) => sum + (item.quantity * item.unit_price),0)
        }),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

    if (loading) {
        return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
    }

    if (error) {
        return <div className="min-h-screen h-full flex justify-center items-center text-red-500">{error}</div>;
    }

  return (
    <div className="min-h-screen h-full flex">
        <aside className="w-64 bg-gray-100 p-4">
             <div className="flex items-center mb-6">
                <img src="https://placehold.co/40x40/007bff/ffffff?text=Logo" alt="Logo" className="w-8 h-8 mr-2 rounded"/>
                <span className="text-xl font-bold">RECERQA AI</span>
            </div>
            <nav>
                {sidebarItems.map((item, index) => (
                    <Link href={item.href} key={index}>
                        <div className={`flex items-center p-2 rounded hover:bg-gray-200 cursor-pointer mb-2`}>
                            <span className="mr-2 text-xl">{item.icon}</span>
                            <span>{item.name}</span>
                        </div>
                    </Link>
                ))}
            </nav>
             <div className="mt-auto p-4">
                {user && (
                    <div className="flex items-center space-x-2">
                        <img src="https://placehold.co/30x30/007bff/ffffff?text=U" alt="User" className="w-8 h-8 rounded-full" />
                        <span className="text-sm">{user.email}</span>
                    </div>
                )}
                 <button onClick={handleLogout} className="flex items-center mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                        <FaSignOutAlt className="mr-2" /> ログアウト
                    </button>
            </div>
        </aside>

      <main className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">仕入分析画面</h1>
        <div className="mb-8 border p-4 rounded shadow">
            <Bar data={chartData} options={options} />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 border-b">発注ID</th>
                <th className="py-2 px-4 border-b">仕入先名</th>
                <th className="py-2 px-4 border-b">発注日</th>
                <th className="py-2 px-4 border-b">発注ステータス</th>
                <th className="py-2 px-4 border-b">商品名</th>
                  <th className="py-2 px-4 border-b">数量</th>
                <th className="py-2 px-4 border-b">単価</th>
                <th className="py-2 px-4 border-b">合計金額</th>
              </tr>
            </thead>
            <tbody>
              {purchaseData.map((po: any, index:number) => (
                  po.items?.map((item: any, itemIndex:number) =>(
                <tr key={`${index}-${itemIndex}`} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                  <td className="py-2 px-4 border-b">{po.purchase_order_id}</td>
                  <td className="py-2 px-4 border-b">{po.supplier_name}</td>
                  <td className="py-2 px-4 border-b">{po.order_date}</td>
                  <td className="py-2 px-4 border-b">{po.order_status}</td>
                      <td className="py-2 px-4 border-b">{item.product_name}</td>
                  <td className="py-2 px-4 border-b">{item.quantity}</td>
                  <td className="py-2 px-4 border-b">{item.unit_price}</td>
                  <td className="py-2 px-4 border-b">{item.quantity * item.unit_price}</td>
                </tr>
                  ))
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default PurchaseAnalysis;
