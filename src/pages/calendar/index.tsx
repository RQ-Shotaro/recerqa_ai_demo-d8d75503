import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const Calendar = () => {
    const router = useRouter();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [orders, setOrders] = useState<any[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<any>(null);

    const fetchOrders = async () => {
        try {
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('order_id, order_date');
          if (ordersError) throw ordersError;
          setOrders(ordersData || []);

          const { data: purchaseOrdersData, error: purchaseOrdersError } = await supabase
            .from('purchase_orders')
            .select('purchase_order_id, order_date');
          if (purchaseOrdersError) throw purchaseOrdersError;
          setPurchaseOrders(purchaseOrdersData || []);
        } catch (error:any) {
          console.error('Error fetching data:', error.message);
          setOrders([
            {
              order_id: '123',
              order_date: '2024-07-15T12:00:00.000Z',
            },
            {
              order_id: '456',
              order_date: '2024-07-20T15:00:00.000Z',
            }
          ]);
            setPurchaseOrders([
            {
              purchase_order_id: '789',
              order_date: '2024-07-18T10:00:00.000Z',
            },
            {
                purchase_order_id: '101',
                order_date: '2024-07-25T13:00:00.000Z',
            }
        ]);
        }
      };

    useEffect(() => {
        fetchOrders();
    }, []);


    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const getDaysInMonth = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = () => {
        return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    };
    
    const handleDateClick = (day: number) => {
        const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(clickedDate);

        const ordersOnDate = orders.filter((order) => {
            const orderDate = new Date(order.order_date);
            return orderDate.toDateString() === clickedDate.toDateString();
        });
    
        const purchaseOrdersOnDate = purchaseOrders.filter((po) => {
            const poDate = new Date(po.order_date);
            return poDate.toDateString() === clickedDate.toDateString();
        });
    
        setSelectedData({ orders: ordersOnDate, purchaseOrders: purchaseOrdersOnDate });
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
        setSelectedData(null);
    };

    const daysInMonth = getDaysInMonth();
    const firstDayOfMonth = getFirstDayOfMonth();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthYearString = format(currentMonth, 'yyyy年M月', { locale: ja });

    return (
        <div className="min-h-screen h-full bg-gray-100 flex">
          <aside className="w-64 bg-gray-200 p-4">
        <nav>
          <ul>
             <li className="mb-2">
              <Link href="/calendar" className="block p-2 rounded hover:bg-gray-300">
               <span className='flex items-center'>
               <img src="https://placehold.co/20x20/787878/ffffff.png?text=📅" alt="calendar"  className="mr-2" />
               納期カレンダー
               </span>
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/" className="block p-2 rounded hover:bg-gray-300">
               <span className='flex items-center'>
               <img src="https://placehold.co/20x20/787878/ffffff.png?text=🏠" alt="home"  className="mr-2" />
               ホーム
               </span>
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/order" className="block p-2 rounded hover:bg-gray-300">
               <span className='flex items-center'>
               <img src="https://placehold.co/20x20/787878/ffffff.png?text=📃" alt="order"  className="mr-2" />
               発注画面
               </span>
              </Link>
            </li>
           
          </ul>
        </nav>
      </aside>
            <main className="flex-1 p-4">
                <h1 className="text-2xl font-bold mb-4">納期カレンダー</h1>
                <div className="bg-white shadow rounded p-4">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded">
                            <BsChevronLeft />
                        </button>
                        <h2 className="text-xl font-semibold">{monthYearString}</h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded">
                            <BsChevronRight />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center">
                        {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                            <div key={index} className="font-semibold">{day}</div>
                        ))}
                        {Array(firstDayOfMonth).fill(null).map((_, index) => (
                            <div key={`empty-${index}`}></div>
                        ))}
                        {days.map(day => (
                            <div key={day}
                                className={`p-2 rounded hover:bg-gray-200 cursor-pointer ${selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear() ? 'bg-blue-200' : ''}`}
                                onClick={() => handleDateClick(day)}>
                                {day}
                                {orders.some(order => new Date(order.order_date).getDate() === day && new Date(order.order_date).getMonth() === currentMonth.getMonth() && new Date(order.order_date).getFullYear() === currentMonth.getFullYear()) &&
                                 <span className='block text-xs text-green-500'>受注</span>
                                }
                                 {purchaseOrders.some(po => new Date(po.order_date).getDate() === day && new Date(po.order_date).getMonth() === currentMonth.getMonth() && new Date(po.order_date).getFullYear() === currentMonth.getFullYear()) &&
                                    <span className='block text-xs text-red-500'>発注</span>
                                  }
                            </div>
                        ))}
                    </div>
                </div>

                 {isModalOpen && (
                   <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                            <h2 className="text-xl font-semibold mb-4">{selectedDate && format(selectedDate, 'yyyy年M月d日', { locale: ja })}</h2>
                            {
                                selectedData && selectedData.orders.length > 0 &&
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold mb-2">受注データ:</h3>
                                        {selectedData.orders.map((order:any) => (
                                            <div key={order.order_id} className='mb-2'>
                                                <p>受注ID: {order.order_id}</p>
                                                <p>受注日: {format(new Date(order.order_date), 'yyyy年M月d日 H時m分', { locale: ja })}</p>
                                            </div>
                                        ))}
                                </div>
                            }
                            {
                                selectedData && selectedData.purchaseOrders.length > 0 &&
                                 <div className='mb-4'>
                                      <h3 className="text-lg font-semibold mb-2">発注データ:</h3>
                                        {selectedData.purchaseOrders.map((po:any) => (
                                        <div key={po.purchase_order_id} className='mb-2'>
                                            <p>発注ID: {po.purchase_order_id}</p>
                                            <p>発注日: {format(new Date(po.order_date), 'yyyy年M月d日 H時m分', { locale: ja })}</p>
                                        </div>
                                    ))}
                                 </div>
                            }
                             {
                                 selectedData && selectedData.orders.length === 0 && selectedData.purchaseOrders.length === 0 && (
                                   <p>該当するデータはありません。</p>
                                 )
                             }
                            <button onClick={closeModal} className="bg-gray-300 hover:bg-gray-400 rounded p-2 mt-4">閉じる</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Calendar;