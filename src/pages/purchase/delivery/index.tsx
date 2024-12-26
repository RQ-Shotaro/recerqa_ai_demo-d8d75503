import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaBars, FaHome, FaList, FaTruck, FaFileInvoiceDollar, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const DeliveryPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [deliveryData, setDeliveryData] = useState<any>({
    deliveryInfo: {
      orderId: 'サンプル注文ID',
      deliveryDate: '2024-03-15',
      estimatedDeliveryDate: '2024-03-20',
      shippingAddress: 'サンプル住所',
    },
    amountInfo: {
      totalAmount: 10000,
      tax: 1000,
      discount: 500,
      netAmount: 9500,
    },
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };
    fetchUser();
  }, []);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen h-full flex">
      {/* Sidebar */}     
      <aside
        className={`bg-gray-800 text-white w-64 py-4 px-3 space-y-4 fixed top-0 left-0 h-full transition-transform duration-300 transform ${ isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-50`}
      >
       <div className="flex items-center justify-between mb-6">
            <span className="text-2xl font-bold">RECERQA</span>
            <button onClick={toggleSidebar} className="md:hidden focus:outline-none">
                <FaBars className="h-6 w-6" />
            </button>
          </div>
        <nav>
            <Link href="/" legacyBehavior>
              <div className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded transition-colors">
                <FaHome className="h-5 w-5" />
                <span>ホーム</span>
               </div>
             </Link>
          <Link href="/purchase/orderlist" legacyBehavior>
            <div className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded transition-colors">
              <FaList className="h-5 w-5" />
              <span>発注一覧</span>
             </div>
          </Link>
          <Link href="/purchase/delivery" legacyBehavior>
            <div className="flex items-center space-x-2 py-2 px-4 bg-gray-700 rounded transition-colors">
              <FaTruck className="h-5 w-5" />
              <span>納期金額確認</span>
            </div>
          </Link>
           <Link href="/purchase/quotation" legacyBehavior>
              <div className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded transition-colors">
                <FaFileInvoiceDollar className="h-5 w-5" />
                <span>見積一覧</span>
               </div>
           </Link>
          <Link href="/setting" legacyBehavior>
            <div className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded transition-colors">
              <FaCog className="h-5 w-5" />
              <span>設定</span>
             </div>
          </Link>
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded transition-colors w-full text-left"
          >
            <FaSignOutAlt className="h-5 w-5" />
            <span>ログアウト</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}   
      <main className="flex-1 p-6 md:ml-64">
        <h1 className="text-2xl font-bold mb-6">納期金額確認</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">納期情報</h2>
          <div className="mb-4">
            <p><span className="font-medium">注文ID:</span> {deliveryData.deliveryInfo.orderId}</p>
            <p><span className="font-medium">発注日:</span> {deliveryData.deliveryInfo.deliveryDate}</p>
            <p><span className="font-medium">納期:</span> {deliveryData.deliveryInfo.estimatedDeliveryDate}</p>
            <p><span className="font-medium">配送先住所:</span> {deliveryData.deliveryInfo.shippingAddress}</p>
          </div>
          <h2 className="text-xl font-semibold mt-6 mb-4">金額情報</h2>
          <div className="mb-4">
            <p><span className="font-medium">合計金額:</span> ¥{deliveryData.amountInfo.totalAmount}</p>
            <p><span className="font-medium">消費税:</span> ¥{deliveryData.amountInfo.tax}</p>
            <p><span className="font-medium">割引:</span> ¥{deliveryData.amountInfo.discount}</p>
            <p><span className="font-medium">請求金額:</span> ¥{deliveryData.amountInfo.netAmount}</p>
          </div>
           <div className='flex justify-end'>
            <button onClick={() => router.back()} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">戻る</button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default DeliveryPage;