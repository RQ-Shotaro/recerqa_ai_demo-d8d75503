import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaCog, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);


const PurchaseAgentSetting = () => {
  const router = useRouter();
  const [settings, setSettings] = useState({
    agent_name: "",
    active: false,
    purchase_criteria: "",
    auto_order: false,
    ai_model: "",
    notification_email: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
          setError('ログイン情報の取得に失敗しました: ' + sessionError.message);
          setLoading(false);
          return;
      }
      if (session) {
          const { data: user, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
          if (userError) {
              setError('ユーザー情報の取得に失敗しました: ' + userError.message);
              setLoading(false);
              return;
            }
          setUser(user)
          fetchSettings(user.id);
        } else {
          router.push('/login');
      }

    }
    fetchSession();
    
  }, [router]);

  const fetchSettings = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_agent_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching settings:', error);
        setError('設定の取得に失敗しました。');
        setLoading(false);
        setSettings({
          agent_name: "サンプルエージェント",
          active: false,
          purchase_criteria: "特に指定なし",
          auto_order: false,
          ai_model: "gpt-3.5-turbo",
          notification_email: "user@example.com",
        });

        return;
      }

      if (data) {
        setSettings({
          agent_name: data.agent_name || "",
          active: data.active || false,
          purchase_criteria: data.purchase_criteria || "",
          auto_order: data.auto_order || false,
          ai_model: data.ai_model || "",
          notification_email: data.notification_email || "",
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('予期せぬエラーが発生しました。');
       setSettings({
          agent_name: "サンプルエージェント",
          active: false,
          purchase_criteria: "特に指定なし",
          auto_order: false,
          ai_model: "gpt-3.5-turbo",
          notification_email: "user@example.com",
        });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;

    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };


 const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user) {
        setError('ログインしてください。');
        setLoading(false);
        return;
    }
      const { error } = await supabase
        .from('ai_agent_settings')
        .upsert({
          user_id: user.id,
          agent_name: settings.agent_name,
          active: settings.active,
          purchase_criteria: settings.purchase_criteria,
          auto_order: settings.auto_order,
          ai_model: settings.ai_model,
          notification_email: settings.notification_email,
        }, { onConflict: ['user_id'] });

      if (error) {
        console.error('Error updating settings:', error);
        setError('設定の保存に失敗しました。');
        return;
      }

      alert('設定が保存されました。');
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('予期せぬエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;


  return (
    <div className="min-h-screen h-full bg-gray-100 flex">
          <aside className="bg-gray-800 text-white w-64 p-4">
        <div className="mb-8">
          <Link href="/" className="flex items-center">
          <FaArrowLeft className="mr-2" />
            ホームに戻る
          </Link>
        </div>
        <nav>
        <Link href="/setting/purchaseAgent" className="block py-2 px-4 hover:bg-gray-700 rounded flex items-center">
          <FaCog className="mr-2" />
            仕入AIエージェント設定
          </Link>
          <Link href="/setting/salesAgent" className="block py-2 px-4 hover:bg-gray-700 rounded flex items-center">
          <FaCog className="mr-2" />
            販売AIエージェント設定
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">仕入AIエージェント設定</h1>
          <div className="bg-white shadow rounded p-6">

            <div className="mb-4">
              <label htmlFor="agent_name" className="block text-gray-700 text-sm font-bold mb-2">エージェント名:</label>
              <input
                  type="text"
                  id="agent_name"
                  name="agent_name"
                  value={settings.agent_name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>

          <div className="mb-4">
            <label htmlFor="active" className="block text-gray-700 text-sm font-bold mb-2">有効:</label>
            <input
                type="checkbox"
                id="active"
                name="active"
                checked={settings.active}
                onChange={handleInputChange}
                className="mr-2 leading-tight"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="purchase_criteria" className="block text-gray-700 text-sm font-bold mb-2">仕入基準:</label>
            <textarea
              id="purchase_criteria"
              name="purchase_criteria"
              value={settings.purchase_criteria}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
              <label htmlFor="auto_order" className="block text-gray-700 text-sm font-bold mb-2">自動発注:</label>
              <input
                  type="checkbox"
                  id="auto_order"
                  name="auto_order"
                  checked={settings.auto_order}
                  onChange={handleInputChange}
                  className="mr-2 leading-tight"
              />
          </div>

          <div className="mb-4">
            <label htmlFor="ai_model" className="block text-gray-700 text-sm font-bold mb-2">AIモデル:</label>
            <input
              type="text"
              id="ai_model"
              name="ai_model"
              value={settings.ai_model}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

            <div className="mb-4">
              <label htmlFor="notification_email" className="block text-gray-700 text-sm font-bold mb-2">通知メール:</label>
              <input
                type="email"
                id="notification_email"
                name="notification_email"
                value={settings.notification_email}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>


          <button
              onClick={handleSaveSettings}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              設定を保存
            </button>
        </div>

      </main>
    </div>
  );
};

export default PurchaseAgentSetting;
