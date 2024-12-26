import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaBars, FaHome, FaHistory } from 'react-icons/fa';
import { IconType } from 'react-icons';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Order {
  order_id: string;
  customer_id: string;
  order_date: string;
  order_status: string;
}

interface OrderItem {
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

interface NavItem {
    label: string;
    icon: IconType;
    href: string;
  }

const OrderHistory = () => {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

      const navItems: NavItem[] = [
        { label: 'ホーム', icon: FaHome, href: '/' },
        { label: '取引履歴分析', icon: FaHistory, href: '/orderHistory' },
      
      ];

      const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select('order_id, customer_id, order_date, order_status');

                if (ordersError) {
                    console.error('Error fetching orders:', ordersError);
                    setError('注文履歴の取得に失敗しました。');
                    setOrders([{
                      order_id: 'sample-001',
                      customer_id: 'sample-cust-001',
                      order_date: '2024-01-01',
                      order_status: '発送済み',
                      }
                    ]);
                  }else{
                     setOrders(ordersData || []);
                  }

                const { data: orderItemsData, error: orderItemsError } = await supabase
                    .from('order_items')
                    .select('order_id, product_id, quantity, unit_price');

                if (orderItemsError) {
                    console.error('Error fetching order items:', orderItemsError);
                    setError('注文商品の取得に失敗しました。');
                     setOrderItems([{
                        order_id: 'sample-001',
                        product_id: 'sample-prod-001',
                        quantity: 2,
                        unit_price: 100,
                      },
                       {
                        order_id: 'sample-001',
                        product_id: 'sample-prod-002',
                        quantity: 1,
                        unit_price: 200,
                      }]);

                  }else{
                    setOrderItems(orderItemsData || []);
                   }

            } catch (err: any) {
                console.error('Unexpected error:', err);
                setError('予期せぬエラーが発生しました。');
                setOrders([{
                  order_id: 'sample-001',
                  customer_id: 'sample-cust-001',
                  order_date: '2024-01-01',
                  order_status: '発送済み',
                  }
                ]);
              setOrderItems([{
                  order_id: 'sample-001',
                    product_id: 'sample-prod-001',
                    quantity: 2,
                   unit_price: 100,
                },
                 {
                  order_id: 'sample-001',
                    product_id: 'sample-prod-002',
                   quantity: 1,
                    unit_price: 200,
                  }]);

            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
    }

    if (error) {
        return <div className="min-h-screen h-full flex justify-center items-center text-red-500">{error}</div>;
    }

    return (
        <div className="min-h-screen h-full flex">
        <aside
          className={`bg-gray-100 w-64 p-4 space-y-4 min-h-screen h-full transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        >
          <div className="mb-4 flex justify-between items-center md:hidden">
          <button onClick={toggleSidebar} className="text-gray-700 hover:text-gray-900 focus:outline-none">
          <FaBars className="h-6 w-6" />
          </button>
          </div>
          <nav>
            {navItems.map((item) => (
              <Link href={item.href} key={item.label} >
               <div className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-md">
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.label}
               </div>
            </Link>
          ))}
          </nav>
        </aside>
        <main className="flex-1 p-4">
            <h1 className="text-2xl font-bold mb-4">取引履歴分析画面</h1>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-2 px-4 border-b text-left">注文ID</th>
                            <th className="py-2 px-4 border-b text-left">顧客ID</th>
                            <th className="py-2 px-4 border-b text-left">注文日</th>
                            <th className="py-2 px-4 border-b text-left">注文ステータス</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.order_id} className="hover:bg-gray-100">
                                <td className="py-2 px-4 border-b">{order.order_id}</td>
                                <td className="py-2 px-4 border-b">{order.customer_id}</td>
                                <td className="py-2 px-4 border-b">{order.order_date}</td>
                                <td className="py-2 px-4 border-b">{order.order_status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <br></br>
                <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="py-2 px-4 border-b text-left">注文ID</th>
                        <th className="py-2 px-4 border-b text-left">商品ID</th>
                        <th className="py-2 px-4 border-b text-left">数量</th>
                        <th className="py-2 px-4 border-b text-left">単価</th>
                    </tr>
                </thead>
                <tbody>
                    {orderItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-100">
                             <td className="py-2 px-4 border-b">{item.order_id}</td>
                            <td className="py-2 px-4 border-b">{item.product_id}</td>
                            <td className="py-2 px-4 border-b">{item.quantity}</td>
                            <td className="py-2 px-4 border-b">{item.unit_price}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </main>
        </div>
    );
};

export default OrderHistory;