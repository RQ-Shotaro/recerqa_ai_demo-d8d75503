import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import { FaPaperPlane } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import Link from "next/link";
import { supabase } from "@/supabase";

type Message = {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
};

// メモ化されたサイドバーコンポーネント
const Sidebar = React.memo(
  ({
    isOpen,
    onToggle,
    onLogout,
  }: {
    isOpen: boolean;
    onToggle: () => void;
    onLogout: () => void;
  }) => (
    <aside
      className={`bg-gray-800/50 backdrop-blur-md border-r border-gray-700 text-white w-64 p-4 fixed md:relative transition-all duration-300 ease-in-out h-full ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 z-10`}
    >
      <div className="font-bold text-xl mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        メニュー
      </div>
      <ul className="space-y-2">
        <li>
          <Link
            href="/"
            onClick={onToggle}
            className="block hover:bg-gray-700/50 p-3 rounded-lg transition-all duration-200 hover:translate-x-2"
          >
            ホーム
          </Link>
        </li>
        <li>
          <Link
            href="/chat"
            onClick={onToggle}
            className="block bg-blue-500/20 p-3 rounded-lg transition-all duration-200 hover:translate-x-2"
          >
            AIチャット
          </Link>
        </li>
        <li>
          <Link
            href="/voice"
            onClick={onToggle}
            className="block hover:bg-gray-700/50 p-3 rounded-lg transition-all duration-200 hover:translate-x-2"
          >
            音声発注
          </Link>
        </li>
        <li>
          <Link
            href="/ec"
            onClick={onToggle}
            className="block hover:bg-gray-700/50 p-3 rounded-lg transition-all duration-200 hover:translate-x-2"
          >
            ECサイト発注
          </Link>
        </li>
        <li>
          <button
            onClick={onLogout}
            className="block w-full text-left hover:bg-gray-700/50 p-3 rounded-lg transition-all duration-200 hover:translate-x-2"
          >
            ログアウト
          </button>
        </li>
      </ul>
    </aside>
  )
);

Sidebar.displayName = "Sidebar";

// メモ化されたメッセージ入力コンポーネント
const MessageInput = React.memo(
  ({
    value,
    onChange,
    onSend,
    loading,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSend: () => void;
    loading: boolean;
  }) => (
    <div className="flex gap-2 bg-gray-800/30 backdrop-blur-md p-2 rounded-xl border border-gray-700">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyPress={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="メッセージを入力してください..."
        className="flex-1 bg-gray-700/50 border-none p-4 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
      <button
        onClick={onSend}
        disabled={loading}
        className={`${
          loading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
        } text-white p-4 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:hover:scale-100 disabled:hover:bg-gray-500`}
      >
        <FaPaperPlane className="text-xl" />
      </button>
    </div>
  )
);

MessageInput.displayName = "MessageInput";

// メモ化されたメッセージ表示コンポーネント
const MessageList = React.memo(({ messages }: { messages: Message[] }) => (
  <div className="h-[calc(100vh-180px)] overflow-y-auto mb-4 rounded-xl bg-gray-800/30 backdrop-blur-md border border-gray-700 p-4 custom-scrollbar">
    {messages.map((msg) => (
      <div
        key={msg.id}
        className={`mb-4 p-2 ${
          msg.sender === "あなた" ? "ml-auto" : "mr-auto"
        } max-w-[80%] animate-fadeIn`}
      >
        <div
          className={`flex items-end gap-2 ${
            msg.sender === "あなた" ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              msg.sender === "あなた" ? "bg-blue-500" : "bg-purple-500"
            }`}
          >
            {msg.sender === "あなた" ? "U" : "AI"}
          </div>
          <div
            className={`${
              msg.sender === "あなた"
                ? "bg-blue-500 rounded-t-xl rounded-l-xl"
                : "bg-gray-700 rounded-t-xl rounded-r-xl"
            } p-4 shadow-lg`}
          >
            <div className="break-words">{msg.text}</div>
            <div className="text-xs text-gray-300 mt-2">{msg.timestamp}</div>
          </div>
        </div>
      </div>
    ))}
  </div>
));

MessageList.displayName = "MessageList";

// メインコンポーネント
const Chat = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // メモ化されたコールバック関数
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewMessage(e.target.value);
    },
    []
  );

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || loading) return;

    const userMessage = {
      id: uuidv4(),
      sender: "あなた",
      text: newMessage,
      timestamp: new Date().toLocaleTimeString("ja-JP"),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-qa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newMessage,
          history: messages.map((msg) => ({
            role: msg.sender === "あなた" ? "user" : "assistant",
            content: msg.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("API response was not ok");
      }

      const data = await response.json();

      if (data.response) {
        const aiMessage = {
          id: uuidv4(),
          sender: "AI",
          text: data.response,
          timestamp: new Date().toLocaleTimeString("ja-JP"),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: uuidv4(),
        sender: "AI",
        text: "申し訳ありません。エラーが発生しました。",
        timestamp: new Date().toLocaleTimeString("ja-JP"),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [newMessage, loading, messages]);

  return (
    <div className="min-h-screen h-full bg-gray-900 text-gray-100">
      <nav className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700 p-4 text-white flex items-center justify-between fixed w-full top-0 z-20">
        <button
          onClick={toggleSidebar}
          className="text-white text-2xl focus:outline-none md:hidden hover:text-blue-400 transition-colors"
        >
          <IoMenu />
        </button>
        <div className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AIチャット
        </div>
        <div className="w-8" />
      </nav>
      <div className="flex h-full pt-16">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-4">
          <MessageList messages={messages} />
          <MessageInput
            value={newMessage}
            onChange={handleMessageChange}
            onSend={sendMessage}
            loading={loading}
          />
        </main>
      </div>
    </div>
  );
};

export default Chat;
