import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const QA = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState<{
    id: number;
    question: string;
    answer: string;
  }[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<{
    id: number;
    question: string;
    answer: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
    const fetchQA = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('qa_table')
                .select('*');
    
            if (error) {
                console.error('Error fetching QA:', error);
              setError('よくある質問データの取得に失敗しました。');
              setQuestions([
                {
                  id: 1,
                  question: "Q1. 注文のキャンセル方法を教えてください。",
                  answer: "A1. ご注文のキャンセルは、注文履歴画面からキャンセルリクエストを行ってください。",
                },
                 {
                  id: 2,
                  question: "Q2. 返品・交換はできますか？",
                  answer: "A2. はい、商品到着後7日以内であれば、返品・交換を承ります。詳細は返品・交換ポリシーをご確認ください。",
                },
                {
                  id: 3,
                  question: "Q3. 支払い方法は何がありますか？",
                  answer: "A3. クレジットカード、銀行振込、代金引換がご利用いただけます。",
                },
              ]);
            }else{
                setQuestions(data || []);
            }
    
        } catch (e) {
          console.error('Unexpected error fetching QA:', e);
          setError('予期せぬエラーが発生しました。');
          setQuestions([
            {
              id: 1,
              question: "Q1. 注文のキャンセル方法を教えてください。",
              answer: "A1. ご注文のキャンセルは、注文履歴画面からキャンセルリクエストを行ってください。",
            },
             {
              id: 2,
              question: "Q2. 返品・交換はできますか？",
              answer: "A2. はい、商品到着後7日以内であれば、返品・交換を承ります。詳細は返品・交換ポリシーをご確認ください。",
            },
            {
              id: 3,
              question: "Q3. 支払い方法は何がありますか？",
              answer: "A3. クレジットカード、銀行振込、代金引換がご利用いただけます。",
            },
          ]);
        } finally {
            setLoading(false);
        }
    };

  useEffect(() => {
    fetchQA();
  }, []);

  const handleQuestionClick = (question: {
    id: number;
    question: string;
    answer: string;
  }) => {
    setSelectedQuestion(question);
  };

  return (
    <div className="min-h-screen h-full bg-gray-100 flex">
      <aside className="bg-gray-200 w-64 p-4">
      <nav>
           <Link href="/"  className="block mb-4 p-2 rounded hover:bg-gray-300">
              <FaArrowLeft className="inline-block mr-2"/>
               メインメニューに戻る
          </Link>
          <Link href="/order" className="block mb-4 p-2 rounded hover:bg-gray-300">
           発注画面
          </Link>
           <Link href="/orderhistory" className="block mb-4 p-2 rounded hover:bg-gray-300">
           発注履歴
          </Link>
          <Link href="/products" className="block mb-4 p-2 rounded hover:bg-gray-300">
           商品一覧
          </Link>
           <Link href="/settings" className="block mb-4 p-2 rounded hover:bg-gray-300">
           設定
          </Link>
          <Link href="/chat" className="block mb-4 p-2 rounded hover:bg-gray-300">
           チャットサポート
          </Link>
          <Link href="/qa" className="block mb-4 p-2 rounded bg-gray-300 text-black font-bold">
           よくある質問
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
          <h1 className="text-2xl font-semibold mb-6">よくある質問</h1>
        {loading ? (
          <p>ロード中...</p>
        ) : error ? (
            <p className="text-red-500">{error}</p>
        ) : (
          <div className="flex">
            <ul className="w-1/3 pr-4">
              {questions.map((question) => (
                <li
                  key={question.id}
                  className={`p-2 border-b cursor-pointer hover:bg-gray-200 ${selectedQuestion?.id === question.id ? 'bg-gray-200 font-semibold' : ''}`}
                  onClick={() => handleQuestionClick(question)}
                >
                  {question.question}
                </li>
              ))}
            </ul>
            <div className="w-2/3 pl-4">
              {selectedQuestion ? (
                <div className="p-4 bg-white rounded shadow">
                  <h2 className="text-xl font-semibold mb-2">{selectedQuestion.question}</h2>
                  <p>{selectedQuestion.answer}</p>
                </div>
              ) : (
                  <div className="flex justify-center items-center h-48 bg-gray-50 rounded shadow">
                       <img src="https://placehold.co/400x200/FFFFFF/CCCCCC?text=質問を選択してください" alt="placeholder"/>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QA;
