import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaCog, FaHome, FaUser } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const aiConfig = () => {
    const router = useRouter();
    const [aiConfigs, setAiConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [agentType, setAgentType] = useState('');
    const [configData, setConfigData] = useState('');


    useEffect(() => {
        const fetchAiConfigs = async () => {
            setLoading(true);
            setError(null);
            try {
              const { data, error } = await supabase
                .from('ai_agents_config')
                .select('*');

              if (error) {
                console.error("Supabase error:", error);
                setError('設定データの取得に失敗しました。');
                setAiConfigs([
                  {
                      agent_type: 'sample_agent_type_1',
                      config_data: '{"auto_order": true, "recommend": true, "response": {"type": "chat", "delay": 500}}'
                  },
                  {
                    agent_type: 'sample_agent_type_2',
                    config_data: '{"auto_order": false, "recommend": false, "response": {"type": "email", "delay": 1000}}'
                  }
                  
                ])
              } else {
                setAiConfigs(data);
              }
            } catch (e:any) {
              console.error("Unexpected error:", e)
              setError('設定データの取得中にエラーが発生しました。');
                setAiConfigs([
                  {
                      agent_type: 'sample_agent_type_1',
                      config_data: '{"auto_order": true, "recommend": true, "response": {"type": "chat", "delay": 500}}'
                  },
                  {
                    agent_type: 'sample_agent_type_2',
                    config_data: '{"auto_order": false, "recommend": false, "response": {"type": "email", "delay": 1000}}'
                  }
                ])
            } finally {
              setLoading(false);
            }
        };

        fetchAiConfigs();
    }, []);

    const handleSaveConfig = async (e:any) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
          const { error } = await supabase
            .from('ai_agents_config')
            .upsert({
              agent_type: agentType,
              config_data: configData,
            });
    
          if(error){
            console.error("Supabase error:", error);
            setError('設定の保存に失敗しました。');
          } else {
            router.reload();
          }
        }catch(e:any){
          console.error("Unexpected error", e);
            setError('設定の保存中にエラーが発生しました。');
        } finally {
          setLoading(false)
        }

    };

    const Sidebar = () => {
      return (
        <aside className="bg-gray-100 w-64 p-4 min-h-screen">
          <nav>
            <ul>
              <li className="mb-2">
                <Link href="/" legacyBehavior>
                    <div className="flex items-center hover:bg-gray-200 p-2 rounded">
                        <FaHome className="mr-2" />
                        ホーム
                    </div>
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/aiConfig" legacyBehavior>
                  <div className="flex items-center hover:bg-gray-200 p-2 rounded">
                    <FaCog className="mr-2" />
                    AI設定
                  </div>
                </Link>
              </li>
            <li className="mb-2">
                <Link href="/profile" legacyBehavior>
                    <div className="flex items-center hover:bg-gray-200 p-2 rounded">
                      <FaUser className="mr-2" />
                        プロフィール
                    </div>
                </Link>
            </li>
            </ul>
          </nav>
        </aside>
      );
    };


    return (
        <div className="min-h-screen h-full bg-gray-100 flex">
             <Sidebar />
            <main className="flex-1 p-4">
                <h1 className="text-2xl font-bold mb-4">AIエージェント設定画面</h1>
                <div className="mb-4">
                    <p>AIエージェントの動作設定を行う画面です。各設定項目を調整し、設定を保存してください。</p>
                </div>
                <div className='mb-4'>
                  {loading && <p>Loading...</p>}
                  {error && <p className="text-red-500">Error: {error}</p>}
                </div>

                {aiConfigs.map((config, index) => (
                    <div key={index} className="bg-white shadow rounded p-4 mb-4">
                        <h2 className="text-xl font-semibold mb-2">AIエージェント設定 {index + 1}</h2>
                        <div className="mb-2">
                            <span className="font-medium">エージェントタイプ:</span> {config.agent_type}
                        </div>
                        <div>
                        <span className="font-medium">設定データ:</span> {config.config_data}
                        </div>
                    </div>
                ))}

                <div className="bg-white shadow rounded p-4 mb-4">
                    <h2 className="text-xl font-semibold mb-2">新規設定または更新</h2>
                    <form onSubmit={handleSaveConfig} className="space-y-4">
                         <div>
                          <label htmlFor="agent_type" className="block font-medium">エージェントタイプ:</label>
                           <input
                             type="text"
                             id="agent_type"
                             className="border rounded w-full py-2 px-3"
                             value={agentType}
                             onChange={(e) => setAgentType(e.target.value)}
                            />
                       </div>
                        <div>
                            <label htmlFor="config_data" className="block font-medium">設定データ (JSON):</label>
                            <textarea
                                id="config_data"
                                className="border rounded w-full py-2 px-3 h-32"
                                value={configData}
                                onChange={(e) => setConfigData(e.target.value)}
                            ></textarea>
                        </div>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            保存
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default aiConfig;