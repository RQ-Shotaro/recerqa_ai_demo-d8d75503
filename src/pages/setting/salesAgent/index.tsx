import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaCog, FaUser, FaSignOutAlt } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);


const SalesAgentSettings = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
      agentName: '',
      greetingMessage: '',
      agentDescription: '',
      defaultLanguage: 'ja'
    });
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
          setLoading(true);
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            setUser(currentUser);
             fetchSettings(currentUser.id);
           } else {
            router.push('/login');
           }
          setLoading(false);
        };

        fetchUser();
      }, [router]);

      const fetchSettings = async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('sales_agent_settings')
            .select('*')
            .eq('user_id', userId)
            .single();
          if(error){
            console.error("Error fetching settings", error)
            setSettings({
              agentName: '初期設定',   
              greetingMessage: 'こんにちは、ご用件をどうぞ。',   
              agentDescription: '販売AIエージェント', 
              defaultLanguage: 'ja' 
            })
          }
          else if (data) {
             setSettings(data);
             console.log("Fetched settings", data);
           }
        } catch (err) {
            console.error("An unexpected error occurred:", err);
            setError("設定の取得に失敗しました。");
        }
      };

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
          setSettings(prevSettings => ({
           ...prevSettings,
          [name]: value
        }));
      };
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage(null);
        setError(null);

        try {
          if (user) {
              const { error } = await supabase
              .from('sales_agent_settings')
              .upsert({
                user_id: user.id,
                agent_name: settings.agentName,
                greeting_message: settings.greetingMessage,
                agent_description: settings.agentDescription,
                default_language: settings.defaultLanguage,
              }, { onConflict: ['user_id'] });

              if (error) {
                console.error('Error updating settings:', error);
                  setError("設定の更新に失敗しました。:" + error.message);
               } else {
                 setSuccessMessage('設定が正常に保存されました。');
                  fetchSettings(user.id);
               }
          }
         
        } catch (err) {
          console.error('An unexpected error occurred:', err);
          setError('予期せぬエラーが発生しました。');
        } finally {
          setLoading(false);
        }
      };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };
    if (loading) return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>

    if (!user) {
      return <div className="min-h-screen h-full flex justify-center items-center">ログインしてください</div>
    }
    return (
    <div className="min-h-screen h-full bg-gray-100">
          <header className="bg-blue-600 p-4 flex justify-between items-center">
              <div className="text-white font-bold text-xl">RECERQA AI</div>
               <nav className="flex items-center">
                 <Link href="/setting/salesAgent" className="mr-4"><FaCog className="text-white" size={24} /></Link>
                 <button onClick={handleLogout} className="text-white hover:text-gray-200 flex items-center">
                     <FaSignOutAlt className="mr-1" />ログアウト
                </button>
              </nav>
          </header>

        <div className="flex">
                <aside className="bg-gray-200 p-4 w-64">
                    <nav>
                        <h3 className="font-bold mb-4">メニュー</h3>
                         <Link href="/" className="block py-2 px-4 hover:bg-gray-300">ホーム</Link>
                         <Link href="/order/chat" className="block py-2 px-4 hover:bg-gray-300">チャット発注</Link>
                         <Link href="/order/voice" className="block py-2 px-4 hover:bg-gray-300">音声発注</Link>
                         <Link href="/order/ec" className="block py-2 px-4 hover:bg-gray-300">ECサイト発注</Link>
                         <Link href="/order/history" className="block py-2 px-4 hover:bg-gray-300">発注履歴</Link>
                         <Link href="/setting/salesAgent" className="block py-2 px-4 bg-gray-300">販売AIエージェント設定</Link>
                          <Link href="/setting/purchaseAgent" className="block py-2 px-4 hover:bg-gray-300">仕入AIエージェント設定</Link>
                           <Link href="/setting/user" className="block py-2 px-4 hover:bg-gray-300">ユーザー設定</Link>
                   </nav>
                </aside>
            
            <main className="flex-1 p-8">
                <h1 className="text-2xl font-bold mb-6">販売AIエージェント設定</h1>
                 {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                 </div>}
                {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                     <span className="block sm:inline">{successMessage}</span>
                </div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                         <label htmlFor="agentName" className="block text-gray-700 text-sm font-bold mb-2">エージェント名</label>
                          <input
                            type="text"
                            id="agentName"
                            name="agentName"
                            value={settings.agentName}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="エージェント名を入力してください"
                            required
                           />
                    </div>
                    <div>
                         <label htmlFor="greetingMessage" className="block text-gray-700 text-sm font-bold mb-2">挨拶メッセージ</label>
                         <textarea
                           id="greetingMessage"
                           name="greetingMessage"
                           value={settings.greetingMessage}
                           onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                           placeholder="挨拶メッセージを入力してください"
                            rows={3}
                            required
                           />
                    </div>
                    <div>
                          <label htmlFor="agentDescription" className="block text-gray-700 text-sm font-bold mb-2">エージェントの説明</label>
                         <textarea
                            id="agentDescription"
                            name="agentDescription"
                            value={settings.agentDescription}
                             onChange={handleInputChange}
                             className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                             placeholder="エージェントの説明を入力してください"
                            rows={3}
                            required
                            />
                    </div>
                    <div>
                        <label htmlFor="defaultLanguage" className="block text-gray-700 text-sm font-bold mb-2">デフォルト言語</label>
                        <select
                          id="defaultLanguage"
                          name="defaultLanguage"
                           value={settings.defaultLanguage}
                           onChange={handleInputChange}
                           className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                           >
                              <option value="ja">日本語</option>
                              <option value="en">英語</option>
                            </select>
                     </div>

                    <div className="flex justify-center">
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            保存
                        </button>
                    </div>
                </form>
            </main>
        </div>
    </div>
    );
};

export default SalesAgentSettings;