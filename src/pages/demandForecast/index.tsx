import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js';
import { FaCog, FaChartLine, FaHistory, FaSignOutAlt } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const DemandForecast = () => {
  const router = useRouter();
  const [forecastData, setForecastData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  }>({labels: [], datasets: []});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
      const fetchUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
      };

      fetchUser();
  }, []);

  useEffect(() => {
        const fetchForecastData = async () => {
          setLoading(true);
          try {
            // Replace this with actual data fetching logic from database or API
            // Assuming we have historical data and predicted data
            const historicalData = [
              { date: '2024-01-01', sales: 100 },
              { date: '2024-01-02', sales: 120 },
              { date: '2024-01-03', sales: 130 },
              { date: '2024-01-04', sales: 140 },
              { date: '2024-01-05', sales: 150 },
              { date: '2024-01-06', sales: 160 },
              { date: '2024-01-07', sales: 170 },
            ];
            const predictedData = [
                { date: '2024-01-08', sales: 180 },
                { date: '2024-01-09', sales: 190 },
                { date: '2024-01-10', sales: 200 },
                { date: '2024-01-11', sales: 210 },
            ]

            const labels = [...historicalData.map(d => d.date), ...predictedData.map(d => d.date)];
            const historicalSales = historicalData.map(d => d.sales);
            const predictedSales = predictedData.map(d => d.sales);

            setForecastData({
                labels: labels,
                datasets: [
                    {
                        label: '過去の売上',
                        data: historicalSales,
                        borderColor: '#007bff',  // Use main action color
                        backgroundColor: 'rgba(0, 123, 255, 0.1)', // Use a translucent version of main action color
                    },
                    {
                        label: '予測売上',
                        data: predictedSales,
                        borderColor: '#28a745', // Use success color
                        backgroundColor: 'rgba(40, 167, 69, 0.1)', // Use a translucent version of success color
                    }
                ],
            });

            setLoading(false);
          } catch (err: any) {
            setError(err.message || '需要予測データの取得に失敗しました。');
            setLoading(false);
          }
        };
        fetchForecastData();
      }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '商品需要予測',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '日付',
        },
      },
      y: {
        title: {
          display: true,
          text: '売上',
        },
      },
    },
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push('/login');
  };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };


    return (
    <div className="min-h-screen h-full bg-gray-100 flex">
      {/* Sidebar */}        <aside className={`bg-gray-800 text-white w-64 p-4 fixed top-0 left-0 h-full transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-50`}>
        <div className="flex justify-between items-center mb-8">
        <span className="text-2xl font-bold">RECERQA AI</span>
            <button onClick={toggleSidebar} className="md:hidden text-white focus:outline-none">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                </svg>
             </button>
        </div>
        <nav>
            <a href="/autoOrderDashboard" className="block py-2 px-4 hover:bg-gray-700 rounded flex items-center mb-2">
              <FaChartLine className="mr-2"/> 自動発注ダッシュボード
            </a>
            <a href="/stockLevelSetting" className="block py-2 px-4 hover:bg-gray-700 rounded flex items-center mb-2">
                <FaCog className="mr-2"/> 在庫レベル設定
            </a>
            <a href="/orderHistoryAnalysis" className="block py-2 px-4 hover:bg-gray-700 rounded flex items-center mb-2">
              <FaHistory className="mr-2"/> 取引履歴分析
            </a>
            <a href="/demandForecast" className="block py-2 px-4 hover:bg-gray-700 rounded flex items-center mb-2 bg-gray-700">
                <FaChartLine className="mr-2"/> 需要予測
            </a>
          <button onClick={handleLogout} className="block py-2 px-4 hover:bg-gray-700 rounded flex items-center mt-auto">
            <FaSignOutAlt className="mr-2" /> ログアウト
          </button>
        </nav>
      </aside>

        <div className={`flex-1 p-8 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">需要予測画面</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && forecastData.datasets.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
            <Line data={forecastData} options={chartOptions} />
            </div>
        )}
        </div>
    </div>
  );
};

export default DemandForecast;
