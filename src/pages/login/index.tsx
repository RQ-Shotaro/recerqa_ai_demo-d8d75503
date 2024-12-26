import React, { useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";
import { FaUser, FaLock } from "react-icons/fa";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const Login: React.FC = () => {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !password) {
      setError("ユーザーIDとパスワードを入力してください。");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userId,
        password: password,
      });

      if (error) {
        if (
          error.status === 400 &&
          error.message.includes("Invalid login credentials")
        ) {
          setError(
            "メールアドレスまたはパスワードが正しくありません。もう一度お試しください。"
          );
        } else {
          setError(
            "ログインに失敗しました。しばらく時間をおいて再度お試しください。"
          );
        }
      } else if (data?.user) {
        await router.push("/mainmenu");
      }
    } catch (err: any) {
      console.error("Error during login", err);
      setError("ログイン処理中にエラーが発生しました。");
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
          ログイン
        </h2>
        <form onSubmit={handleLogin}>
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-500" />
            </div>
            <input
              type="text"
              id="userId"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="ユーザーID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-500" />
            </div>
            <input
              type="password"
              id="password"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            ログイン
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/register" className="text-blue-500 hover:text-blue-700">
            新規登録はこちら
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
