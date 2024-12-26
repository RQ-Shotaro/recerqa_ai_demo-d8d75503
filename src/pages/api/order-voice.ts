import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const Voice = () => {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);


  useEffect(() => {
    // Check for user authentication on component mount
    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            router.push('/login'); // Redirect to login if not authenticated
        }
    };

      checkAuth();
  }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(stream);
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            setAudioChunks([]);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    setAudioChunks((prevChunks) => [...prevChunks, event.data]);
                }
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                sendAudioForTranscription(audioBlob);
            };

            recorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            setOrderStatus("音声入力に失敗しました。");
        }
    };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);
      }
    }
  };

 const sendAudioForTranscription = async (audioBlob: Blob) => {
    try {
      setOrderStatus("解析中...");
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.webm');

      const response = await fetch('/api/order-voice', {
        method: 'POST',
        body: formData,
      });

        if (!response.ok) {
        const errorData = await response.json(); // Try to parse the JSON error
        console.error('API Error:', errorData);
        setTranscription("音声認識エラーが発生しました。");
        setOrderStatus("音声認識エラーが発生しました。");
         return;
        }

        const data = await response.json();
        setTranscription(data.transcription || "音声認識の結果を取得できませんでした。");
        setOrderStatus("音声認識が完了しました。");

    } catch (error) {
      console.error('Error sending audio:', error);
      setTranscription("通信エラーが発生しました。");
      setOrderStatus("通信エラーが発生しました。");
    }
  };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

  return (
    <div className="min-h-screen h-full bg-gray-100 flex">
        <aside className="bg-gray-200 w-64 p-4">
                <nav>
                    <ul>
                         <li className="mb-2">
                            <Link href="/chat" className="block p-2 hover:bg-gray-300 rounded">チャット発注画面</Link>
                         </li>
                        <li className="mb-2">
                            <Link href="/voice" className="block p-2 hover:bg-gray-300 rounded">音声発注画面</Link>
                        </li>
                        <li className="mb-2">
                           <Link href="/ec" className="block p-2 hover:bg-gray-300 rounded">ECサイト発注画面</Link>
                         </li>
                         <li className="mb-2">
                           <button onClick={handleLogout} className="block p-2 hover:bg-gray-300 rounded">ログアウト</button>
                         </li>
                    </ul>
                </nav>
        </aside>
      <div className="flex-1 p-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">音声発注画面</h1>
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center justify-center px-6 py-3 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-700' : 'bg-blue-500 hover:bg-blue-700'} text-white focus:outline-none`}
          >
            {isRecording ? (
              <>
                <FaStop className="mr-2" />停止
              </>
            ) : (
              <>
                <FaMicrophone className="mr-2" />録音開始
              </>
            )}
          </button>
          </div>
             {orderStatus && (
              <p className={`mt-4 text-center ${orderStatus.includes("エラー") ? 'text-red-500' : 'text-green-500'}`}>
                {orderStatus}
            </p>
        )}
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">音声入力結果</h2>
          <div className="border p-4 rounded-md min-h-[100px] mb-4">
           {transcription ||  <p className="text-gray-500">ここに音声入力の結果が表示されます。</p>}
          </div>
             
        </div>
      </div>
    </div>
  );
};

export default Voice;
