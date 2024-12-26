import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  FaShoppingCart,
  FaUser,
  FaHome,
  FaList,
  FaComments,
  FaPaperPlane,
  FaTimes,
} from "react-icons/fa";
import { IoMenu } from "react-icons/io5";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const Ec = () => {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [
      {
        role: "assistant",
        content: "こんにちは！商品について何かお困りのことはありますか？",
      },
    ]
  );
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (userError) {
          console.error("ユーザーデータの取得エラー:", userError);
          setUser(null);
        } else {
          setUser(userData);
        }
      } else {
        setUser(null);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("product_id, product_name, unit_price");
        if (error) {
          console.error("Error fetching products:", error);
          setProducts([
            {
              product_id: "sample-001",
              product_name: "サンプル商品1",
              unit_price: 1000,
            },
            {
              product_id: "sample-002",
              product_name: "サンプル商品2",
              unit_price: 2000,
            },
            {
              product_id: "sample-003",
              product_name: "サンプル商品3",
              unit_price: 1500,
            },
          ]);
        } else {
          setProducts(data);
        }
      } catch (error) {
        console.error("Unexpected error fetching products:", error);
        setProducts([
          {
            product_id: "sample-001",
            product_name: "サンプル商品1",
            unit_price: 1000,
          },
          {
            product_id: "sample-002",
            product_name: "サンプル商品2",
            unit_price: 2000,
          },
          {
            product_id: "sample-003",
            product_name: "サンプル商品3",
            unit_price: 1500,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (product: any) => {
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const handleCheckout = async () => {
    if (!user) {
      alert("ログインしてください。");
      return;
    }

    try {
      const orderItems = cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_id: user.id,
            order_date: new Date().toISOString(),
            order_status: "pending",
          },
        ])
        .select("order_id")
        .single();

      if (orderError) {
        console.error("Failed to create order:", orderError);
        alert("注文の作成に失敗しました。");
        return;
      }
      if (orderData && orderData.order_id) {
        const { error: orderItemError } = await supabase
          .from("order_items")
          .insert(
            orderItems.map((item) => ({
              order_id: orderData.order_id,
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
            }))
          );

        if (orderItemError) {
          console.error("Failed to create order items:", orderItemError);
          alert("注文明細の作成に失敗しました。");
          return;
        } else {
          alert("注文が完了しました。");
          setCart([]);
          router.push("/order-confirmation");
        }
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("注文処理中にエラーが発生しました。");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = { role: "user", content: newMessage };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai-qa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newMessage,
          history: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          context: {
            products: products.map((product) => ({
              product_name: product.product_name,
              unit_price: product.unit_price,
              product_id: product.product_id,
            })),
            cart: cart.map((item) => ({
              product_name: item.product_name,
              unit_price: item.unit_price,
              quantity: item.quantity,
            })),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("API response was not ok");
      }

      const data = await response.json();

      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "申し訳ありません。エラーが発生しました。",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + item.unit_price * item.quantity,
      0
    );
  };

  return (
    <div className="min-h-screen h-full bg-gray-900 text-gray-100">
      <nav className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700 p-4 text-white flex items-center justify-between fixed w-full top-0 z-20">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white text-2xl focus:outline-none md:hidden hover:text-blue-400 transition-colors"
        >
          <IoMenu />
        </button>
        <div className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          ECストア
        </div>
        <div className="relative">
          <FaShoppingCart className="text-2xl text-gray-300 hover:text-blue-400 transition-colors cursor-pointer" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
              {cart.length}
            </span>
          )}
        </div>
      </nav>
      <div className="flex h-full pt-16">
        <aside
          className={`bg-gray-800/50 backdrop-blur-md border-r border-gray-700 text-white w-64 p-4 fixed md:relative transition-all duration-300 ease-in-out h-full ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 z-10`}
        >
          <div className="font-bold text-xl mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            メニュー
          </div>
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="block hover:bg-gray-700/50 p-3 rounded-lg transition-all duration-200 hover:translate-x-2 group"
              >
                <FaHome className="inline mr-2 group-hover:text-blue-400" />
                <span className="group-hover:text-blue-400">ホーム</span>
              </Link>
            </li>
            <li>
              <Link
                href="/order-history"
                className="block hover:bg-gray-700/50 p-3 rounded-lg transition-all duration-200 hover:translate-x-2 group"
              >
                <FaList className="inline mr-2 group-hover:text-blue-400" />
                <span className="group-hover:text-blue-400">注文履歴</span>
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="block hover:bg-gray-700/50 p-3 rounded-lg transition-all duration-200 hover:translate-x-2 group"
              >
                <FaUser className="inline mr-2 group-hover:text-blue-400" />
                <span className="group-hover:text-blue-400">
                  {user ? "ロ���アウト" : "ログイン"}
                </span>
              </Link>
            </li>
          </ul>
        </aside>
        <main className="flex-1 p-4 md:p-6">
          <div className="container mx-auto max-w-7xl">
            <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              商品一覧
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <div
                  key={product.product_id}
                  className="group bg-gray-800/30 backdrop-blur-md border border-gray-700 rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={`https://placehold.co/300x200?text=${product.product_name}`}
                      alt={product.product_name}
                      className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <h2 className="text-lg font-semibold text-white mb-2">
                    {product.product_name}
                  </h2>
                  <p className="text-gray-400 mb-4">
                    ¥{product.unit_price.toLocaleString()}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 group-hover:shadow-lg"
                  >
                    カートに追加
                  </button>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-bold mt-12 mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              カート
            </h2>
            {cart.length > 0 ? (
              <div className="bg-gray-800/30 backdrop-blur-md border border-gray-700 rounded-lg p-6">
                <ul className="divide-y divide-gray-700">
                  {cart.map((item, index) => (
                    <li
                      key={index}
                      className="py-4 flex items-center justify-between animate-fadeIn"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative overflow-hidden rounded-lg">
                          <img
                            src={`https://placehold.co/100x70?text=${item.product_name}`}
                            alt={item.product_name}
                            className="w-24 h-16 object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-lg text-white">
                            {item.product_name}
                          </p>
                          <p className="text-gray-400">
                            単価: ¥{item.unit_price.toLocaleString()}
                          </p>
                          <p className="text-blue-400">
                            小計: ¥
                            {(item.unit_price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center bg-gray-700/50 rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(
                                index,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="px-3 py-1 text-gray-300 hover:text-white transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="bg-transparent w-16 p-1 text-center text-white focus:outline-none"
                            value={item.quantity}
                            min="1"
                            onChange={(e) =>
                              updateQuantity(
                                index,
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                          <button
                            onClick={() =>
                              updateQuantity(index, item.quantity + 1)
                            }
                            className="px-3 py-1 text-gray-300 hover:text-white transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-red-400 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-full"
                        >
                          削除
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg text-gray-300">合計金額:</span>
                    <span className="text-2xl font-bold text-white">
                      ¥{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleCheckout}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 hover:shadow-lg"
                    >
                      注文を確定する
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/30 backdrop-blur-md border border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-400 text-lg">カートは空です</p>
                <p className="text-gray-500 mt-2">商品を追加してください</p>
              </div>
            )}
          </div>
        </main>
      </div>
      <footer className="bg-gray-800/50 backdrop-blur-md border-t border-gray-700 text-center p-4 mt-8">
        <p className="text-gray-400">© 2024 RECERQA AI</p>
      </footer>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-30 ${
          isChatOpen ? "hidden" : ""
        }`}
      >
        <FaComments className="text-2xl" />
      </button>
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[32rem] bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl z-30 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              商品アシスタント
            </h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-white"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-white p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="メッセージを入力..."
                className="flex-1 bg-gray-700/50 border-none rounded-lg p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={isTyping}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors disabled:bg-gray-600"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ec;
