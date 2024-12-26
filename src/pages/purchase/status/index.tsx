import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaHome, FaList, FaShoppingCart, FaUser, FaSignOutAlt } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const fetchPurchaseData = async () => {
  try {
    const { data: purchaseOrders, error: purchaseOrdersError } = await supabase
      .from('purchase_orders')
      .select('purchase_order_id, order_date, supplier_id, order_status');

    if (purchaseOrdersError) {
      console.error('Error fetching purchase orders:', purchaseOrdersError);
      return {
        purchaseOrders: [
          { purchase_order_id: '001', order_date: '2024-01-15', supplier_id: 'S001', order_status: 'pending' },
          { purchase_order_id: '002', order_date: '2024-01-20', supplier_id: 'S002', order_status: 'processing' },
        ],
        purchaseOrderItems: [
          {
            purchase_order_item_id: '101',
            purchase_order_id: '001',
            product_id: 'P001',
            quantity: 10,
            unit_price: 100,
          },
          {
            purchase_order_item_id: '102',
            purchase_order_id: '001',
            product_id: 'P002',
            quantity: 5,
            unit_price: 200,
          },
        ],
      };
    }
    const { data: purchaseOrderItems, error: purchaseOrderItemsError } = await supabase
      .from('purchase_order_items')
      .select('purchase_order_item_id, purchase_order_id, product_id, quantity, unit_price');

    if (purchaseOrderItemsError) {
      console.error('Error fetching purchase order items:', purchaseOrderItemsError);
      return {
        purchaseOrders,
        purchaseOrderItems: [
          {
            purchase_order_item_id: '101',
            purchase_order_id: '001',
            product_id: 'P001',
            quantity: 10,
            unit_price: 100,
          },
          {
            purchase_order_item_id: '102',
            purchase_order_id: '001',
            product_id: 'P002',
            quantity: 5,
            unit_price: 200,
          },
        ],
      };
    }

    return { purchaseOrders, purchaseOrderItems };
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return {
        purchaseOrders: [
          { purchase_order_id: '001', order_date: '2024-01-15', supplier_id: 'S001', order_status: 'pending' },
          { purchase_order_id: '002', order_date: '2024-01-20', supplier_id: 'S002', order_status: 'processing' },
        ],
        purchaseOrderItems: [
          {
            purchase_order_item_id: '101',
            purchase_order_id: '001',
            product_id: 'P001',
            quantity: 10,
            unit_price: 100,
          },
          {
            purchase_order_item_id: '102',
            purchase_order_id: '001',
            product_id: 'P002',
            quantity: 5,
            unit_price: 200,
          },
        ],
    };
  }
};

const PurchaseStatus = () => {
  const router = useRouter();
  const [purchaseData, setPurchaseData] = useState({ purchaseOrders: [], purchaseOrderItems: [] });
  const [user, setUser] = useState(null);

    useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null);
        }
    );
    fetchPurchaseData().then((data) => {
        setPurchaseData(data);
      });
        return () => {
            authListener?.unsubscribe();
        };
  }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (!user) {
        router.push('/login');
        return null;
    }

  return (
    <div className="min-h-screen h-full flex">
      <aside className="bg-gray-100 w-64 p-4 border-r">
          <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">メニュー</h2>
          </div>
          <nav>
            <ul>
              <li className="mb-2">
                <Link href="/" legacyBehavior>
                  <a className="flex items-center p-2 rounded hover:bg-gray-200">
                    <FaHome className="mr-2" />
                    ホーム
                  </a>
                 </Link>
              </li>
              <li className="mb-2">
                <Link href="/purchase/status" legacyBehavior>
                  <a className="flex items-center p-2 rounded hover:bg-gray-200 bg-gray-200">
                    <FaList className="mr-2" />
                    仕入情報確認
                  </a>
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/order/list" legacyBehavior>
                  <a className="flex items-center p-2 rounded hover:bg-gray-200">
                   <FaShoppingCart className="mr-2"/>
                    発注一覧
                  </a>
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/user/profile" legacyBehavior>
                 <a className="flex items-center p-2 rounded hover:bg-gray-200">
                    <FaUser className="mr-2"/>
                    プロフィール
                  </a>
                </Link>
              </li>
              <li className="mb-2">
                    <button onClick={handleLogout} className="flex items-center p-2 rounded hover:bg-gray-200">
                        <FaSignOutAlt className="mr-2" />
                        ログアウト
                    </button>
                </li>
            </ul>
          </nav>
        </aside>

      <main className="flex-1 p-4">
        <h1 className="text-2xl font-semibold mb-4">仕入情報確認</h1>

        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">仕入先情報</h2>
            <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-50">
                <tr>
                    <th className="py-2 px-4 border-b">仕入ID</th>
                    <th className="py-2 px-4 border-b">発注日</th>
                    <th className="py-2 px-4 border-b">仕入先ID</th>
                    <th className="py-2 px-4 border-b">ステータス</th>
                </tr>
                </thead>
                <tbody>
                {purchaseData.purchaseOrders.map((order) => (
                    <tr key={order.purchase_order_id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{order.purchase_order_id}</td>
                    <td className="py-2 px-4 border-b">{order.order_date}</td>
                    <td className="py-2 px-4 border-b">{order.supplier_id}</td>
                    <td className="py-2 px-4 border-b">{order.order_status}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">仕入明細</h2>
          <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                  <th className="py-2 px-4 border-b">明細ID</th>
                <th className="py-2 px-4 border-b">仕入ID</th>
                <th className="py-2 px-4 border-b">商品ID</th>
                <th className="py-2 px-4 border-b">数量</th>
                <th className="py-2 px-4 border-b">単価</th>
              </tr>
            </thead>
            <tbody>
              {purchaseData.purchaseOrderItems.map((item) => (
                <tr key={item.purchase_order_item_id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{item.purchase_order_item_id}</td>
                  <td className="py-2 px-4 border-b">{item.purchase_order_id}</td>
                  <td className="py-2 px-4 border-b">{item.product_id}</td>
                  <td className="py-2 px-4 border-b">{item.quantity}</td>
                  <td className="py-2 px-4 border-b">{item.unit_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchaseStatus;
