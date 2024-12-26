import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  FaComment,
  FaMicrophone,
  FaShoppingCart,
  FaHome,
  FaHistory,
  FaFileAlt,
  FaSignOutAlt,
  FaCog,
  FaQuestionCircle,
  FaVideo,
} from "react-icons/fa";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const MainMenu = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("ログアウトエラー:", error.message);
    } else {
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen h-full bg-gray-900 flex justify-center items-center text-gray-100">
        読み込み中...
      </div>
    );
  }
  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen h-full bg-gray-900 text-gray-100">
      <header className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700 h-16 flex items-center justify-between px-6 fixed w-full top-0 z-50">
        <div className="flex items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            RECERQA
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
            <FaCog className="text-gray-300 hover:text-blue-400" size={18} />
          </button>
          <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
            <FaQuestionCircle
              className="text-gray-300 hover:text-blue-400"
              size={18}
            />
          </button>
          <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
            <FaVideo className="text-gray-300 hover:text-blue-400" size={18} />
          </button>
          <div className="text-sm bg-gray-700/50 backdrop-blur-md px-4 py-2 rounded-lg border border-gray-700">
            {user.email}
          </div>
        </div>
      </header>

      <div className="pt-16 flex">
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-md border-r border-gray-700 text-white w-64 p-6 shadow-xl fixed h-full"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              メニュー
            </h2>
          </div>

          <nav className="space-y-2">
            <Link href="/mainMenu" legacyBehavior>
              <motion.div
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 bg-blue-500/20"
              >
                <FaHome className="mr-3 text-blue-400" />
                <span>メインメニュー</span>
              </motion.div>
            </Link>
            <Link href="/orderHistory" legacyBehavior>
              <motion.div
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-700/50"
              >
                <FaHistory className="mr-3 text-gray-300" />
                <span>発注履歴</span>
              </motion.div>
            </Link>
            <Link href="/orderDetail" legacyBehavior>
              <motion.div
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-700/50"
              >
                <FaFileAlt className="mr-3 text-gray-300" />
                <span>発注詳細</span>
              </motion.div>
            </Link>
          </nav>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="mt-8 w-full flex items-center justify-center bg-gray-700/50 backdrop-blur-md text-white font-bold py-3 px-4 rounded-lg border border-gray-700 hover:bg-gray-600/50 transition-all duration-200"
          >
            <FaSignOutAlt className="mr-2" />
            ログアウト
          </motion.button>
        </motion.aside>

        <div className="flex-1 p-12 ml-64">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              メインメニュー
            </h1>
            <p className="mb-8 text-gray-400 text-lg">
              発注方法を選択してください。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link href="/chat" legacyBehavior>
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gray-800/30 backdrop-blur-md shadow-lg hover:shadow-xl p-8 rounded-xl text-center cursor-pointer transition-all duration-300 border border-gray-700"
                >
                  <div className="bg-blue-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaComment size={40} className="text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    チャット発注
                  </h2>
                  <p className="text-gray-400">
                    AIチャットで簡単に発注できます
                  </p>
                </motion.div>
              </Link>

              <Link href="/voice" legacyBehavior>
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gray-800/30 backdrop-blur-md shadow-lg hover:shadow-xl p-8 rounded-xl text-center cursor-pointer transition-all duration-300 border border-gray-700"
                >
                  <div className="bg-purple-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaMicrophone size={40} className="text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    音声発注
                  </h2>
                  <p className="text-gray-400">音声認識で手軽に発注できます</p>
                </motion.div>
              </Link>

              <Link href="/ec" legacyBehavior>
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gray-800/30 backdrop-blur-md shadow-lg hover:shadow-xl p-8 rounded-xl text-center cursor-pointer transition-all duration-300 border border-gray-700"
                >
                  <div className="bg-green-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaShoppingCart size={40} className="text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    ECサイト発注
                  </h2>
                  <p className="text-gray-400">従来のECサイトで発注できます</p>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
