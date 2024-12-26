import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import { IoMenu } from 'react-icons/io5';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const Chat = () => {
    const [messages, setMessages] = useState<{
        id: string;
        sender: string;
        text: string;
        timestamp: string;
    }[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user: currentUser }, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Error fetching user:', error);
                return;
            }
            if (currentUser) {
                setUser(currentUser);
                console.log('Current user:', currentUser);
                fetchChatHistory(currentUser.id);
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchChatHistory = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('ai_agents_log')
                .select('log_id, log_time, log_message, agent_type')
                .order('log_time', { ascending: true });

            if (error) {
                console.error('Error fetching chat history:', error);
                setMessages([ {
                    id: uuidv4(),
                    sender: 'AI', text: '過去のチャット履歴の読み込みに失敗しました。', timestamp: new Date().toLocaleTimeString('ja-JP')
                  }
                ]);

                return;
            }

            if (data) {
                const formattedMessages = data.map((item) => ({
                    id: item.log_id,
                    sender: item.agent_type === 'user' ? 'あなた' : 'AI',
                    text: item.log_message,
                    timestamp: new Date(item.log_time).toLocaleTimeString('ja-JP'),
                }));
                setMessages(formattedMessages);
            } else {
              setMessages([ {
                id: uuidv4(),
                sender: 'AI', text: 'チャット履歴が見つかりません。', timestamp: new Date().toLocaleTimeString('ja-JP')
              }]);

            }
        } catch (error) {
            console.error('Unexpected error fetching chat history:', error);
             setMessages([ {
                id: uuidv4(),
                sender: 'AI', text: '過去のチャット履歴の読み込みに失敗しました。', timestamp: new Date().toLocaleTimeString('ja-JP')
              }]);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        const newLogId = uuidv4();
        const timestamp = new Date().toISOString();

        const userMessage = {
            id: newLogId,
            sender: 'あなた',
            text: newMessage,
            timestamp: new Date().toLocaleTimeString('ja-JP'),
        };
        setMessages((prev) => [...prev, userMessage]);
        setNewMessage('');

        try {
            const { data, error } = await supabase
                .from('ai_agents_log')
                .insert([
                    {
                        log_id: newLogId,
                        log_time: timestamp,
                        log_message: newMessage,
                        agent_type: 'user',
                    },
                ])
                .select();

            if (error) {
                console.error('Error saving user message:', error);
                setMessages(prev=>[...prev, {
                id: uuidv4(),
                sender: 'AI', text: 'メッセージの送信に失敗しました。', timestamp: new Date().toLocaleTimeString('ja-JP')
            }]);
                return;
            }

            const aiResponse = await fetch('/api/ai-qa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: newMessage }),
            });

            if (!aiResponse.ok) {
                console.error('Error from AI API:', aiResponse.statusText);
                 setMessages(prev=>[...prev, {
                id: uuidv4(),
                sender: 'AI', text: 'AIからの応答に失敗しました。', timestamp: new Date().toLocaleTimeString('ja-JP')
            }]);

                return;
            }
            const aiResponseData = await aiResponse.json();

            if(aiResponseData.response){
                const aiMessage = {
                    id: uuidv4(),
                    sender: 'AI',
                    text: aiResponseData.response,
                    timestamp: new Date().toLocaleTimeString('ja-JP'),
                };
                setMessages((prev) => [...prev, aiMessage]);
                 await supabase
                .from('ai_agents_log')
                .insert([
                    {
                        log_id: uuidv4(),
                        log_time: new Date().toISOString(),
                        log_message: aiResponseData.response,
                        agent_type: 'ai',
                    },
                ]);
            }else{
                 setMessages(prev=>[...prev, {
                id: uuidv4(),
                sender: 'AI', text: 'AIからの応答がありませんでした。', timestamp: new Date().toLocaleTimeString('ja-JP')
            }]);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
             setMessages(prev=>[...prev, {
                id: uuidv4(),
                sender: 'AI', text: 'メッセージの送信中にエラーが発生しました。', timestamp: new Date().toLocaleTimeString('ja-JP')
            }]);
        }
    };

     const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }
    if (!user) {
        return (<div className="flex flex-col justify-center items-center min-h-screen">
            <p className='text-center m-4'>ログインしてください。</p>
                <Link href='/login' className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
                ログイン画面へ
                </Link>
            </div>
        );
    }


    return (
        <div className="min-h-screen h-full bg-gray-100">
             <nav className="bg-gray-800 p-4 text-white flex items-center justify-between">
                <button onClick={toggleSidebar} className="text-white text-2xl focus:outline-none md:hidden">
                        <IoMenu />
                    </button>
                <div className="font-bold text-xl">チャットサポート</div>
                <div className="flex items-center">
                    <FaUserCircle className="mr-2 text-2xl" />
                     <span className="text-sm">{user.email}</span>
                </div>

            </nav>
            <div className="flex h-full">
            <aside className={`bg-gray-700 text-white w-64 p-4 absolute md:relative transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-10`}>
                    <div className="font-bold text-xl mb-4">メニュー</div>
                    <ul className="space-y-2">
                        <li><Link href='/'  onClick={toggleSidebar}  className="block hover:bg-gray-600 p-2 rounded">ホーム</Link></li>
                        <li><Link href='/chat' onClick={toggleSidebar} className="block hover:bg-gray-600 p-2 rounded">AIチャット</Link></li>
                        <li><Link href='/order-history' onClick={toggleSidebar} className="block hover:bg-gray-600 p-2 rounded">発注履歴</Link></li>
                        <li><Link href='/product-search' onClick={toggleSidebar} className="block hover:bg-gray-600 p-2 rounded">商品検索</Link></li>
                          <li><Link href='/login' onClick={toggleSidebar} className="block hover:bg-gray-600 p-2 rounded">ログイン</Link></li>
                    </ul>
                </aside>
            <main className="flex-1 p-4">
            <div ref={chatContainerRef} className="h-[calc(100vh-150px)] overflow-y-auto mb-4 border rounded p-4 bg-white">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`mb-2 p-2 rounded-md max-w-[80%] ${msg.sender === 'あなた'
                            ? 'bg-blue-100 ml-auto text-right' : 'bg-gray-200 mr-auto'}
                    `}>
                        <div className="text-sm text-gray-600">{msg.sender}</div>
                        <div className="break-words">{msg.text}</div>
                        <div className="text-xs text-gray-500">{msg.timestamp}</div>
                    </div>
                ))}
            </div>
            <div className="flex">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="メッセージを入力してください..."
                    className="flex-1 border p-2 rounded-l-md focus:outline-none"
                />
                <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-700 focus:outline-none">
                    <FaPaperPlane />
                </button>
            </div>
            </main>
            </div>
        </div>
    );
};

export default Chat;
