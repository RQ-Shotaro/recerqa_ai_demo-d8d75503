import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// メモ化されたコンポーネント
const RecordButton = React.memo(
  ({
    isRecording,
    onStartRecording,
    onStopRecording,
  }: {
    isRecording: boolean;
    onStartRecording: () => void;
    onStopRecording: () => void;
  }) => (
    <button
      onClick={isRecording ? onStopRecording : onStartRecording}
      className={`flex items-center justify-center px-6 py-3 rounded-full ${
        isRecording
          ? "bg-red-500 hover:bg-red-600"
          : "bg-blue-500 hover:bg-blue-600"
      } text-white focus:outline-none transition-all duration-200 hover:scale-105`}
    >
      {isRecording ? (
        <>
          <FaStop className="mr-2" />
          停止
        </>
      ) : (
        <>
          <FaMicrophone className="mr-2" />
          録音開始
        </>
      )}
    </button>
  )
);

RecordButton.displayName = "RecordButton";

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
            href="/chat"
            onClick={onToggle}
            className="block hover:bg-gray-700/50 p-3 rounded-lg transition-all duration-200 hover:translate-x-2"
          >
            AIチャット
          </Link>
        </li>
        <li>
          <Link
            href="/voice"
            onClick={onToggle}
            className="block bg-blue-500/20 p-3 rounded-lg transition-all duration-200 hover:translate-x-2"
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

// メモ化された結果表示コンポーネント
const TranscriptionResult = React.memo(
  ({ transcription }: { transcription: string }) => (
    <div className="w-full max-w-2xl bg-gray-800/30 backdrop-blur-md rounded-xl border border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-100">音声入力結果</h2>
      <div className="border border-gray-700 bg-gray-700/50 p-4 rounded-lg min-h-[100px] mb-4">
        {transcription ? (
          <div className="whitespace-pre-line">{transcription}</div>
        ) : (
          <p className="text-gray-400">ここに音声入力の結果が表示されます。</p>
        )}
      </div>
    </div>
  )
);

TranscriptionResult.displayName = "TranscriptionResult";

const Voice = () => {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // メモ化されたコールバック関数
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      setMediaRecorder(recorder);
      setAudioChunks([]);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = async () => {
        const currentChunks = await new Promise<BlobPart[]>((resolve) => {
          setAudioChunks((chunks) => {
            resolve(chunks);
            return chunks;
          });
        });

        if (currentChunks.length === 0) {
          setOrderStatus(
            "音声データが記録されませんでした。マイクの設定を確認してください。"
          );
          return;
        }

        const webmBlob = new Blob(currentChunks, { type: "audio/webm" });
        if (webmBlob.size === 0) {
          setOrderStatus(
            "音声データが空です。マイクの設定を確認してください。"
          );
          return;
        }

        try {
          const audioContext = new AudioContext();
          const arrayBuffer = await webmBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const mp3Blob = await convertToMp3(audioBuffer);
          sendAudioForTranscription(mp3Blob);
        } catch (error) {
          setOrderStatus("音声データの変換に失敗しました。");
        }
      };

      recorder.start(50);
      setIsRecording(true);
    } catch (error) {
      setOrderStatus(
        "音声入力に失敗しました。マイクの権限を確認してください。"
      );
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);
      }
    }
  }, [mediaRecorder, audioStream]);

  // Web Audio APIを使用してMP3に変換する関数
  const convertToMp3 = async (audioBuffer: AudioBuffer): Promise<Blob> => {
    const channelData = audioBuffer.getChannelData(0);
    const wavBlob = await convertToWav(channelData, audioBuffer.sampleRate);
    return wavBlob;
  };

  // Float32Array形式の音声データをWAV形式に変換
  const convertToWav = async (
    channelData: Float32Array,
    sampleRate: number
  ): Promise<Blob> => {
    const arrayBuffer = new ArrayBuffer(44 + channelData.length * 2);
    const view = new DataView(arrayBuffer);

    // WAVヘッダーの書き込み
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 32 + channelData.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, channelData.length * 2, true);

    // 音声データの書き込み
    const volume = 0.8;
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i])) * volume;
      view.setInt16(44 + i * 2, sample * 0x7fff, true);
    }

    // MIMEタイプを修正
    return new Blob([arrayBuffer], { type: "audio/x-wav" });
  };

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    try {
      setOrderStatus("解析中...");
      const formData = new FormData();

      // ファイル名を.wavに変更し、MIMEタイプを指定
      const file = new File([audioBlob], "voice.wav", { type: "audio/x-wav" });
      formData.append("audio", file);

      const response = await fetch("/api/order-voice", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error:", data);
        setTranscription(data.details || "音声認識エラーが発生しました。");
        setOrderStatus(data.error || "音声認識エラーが発生しました。");
        return;
      }

      setTranscription(
        data.transcription || "音声認識の結果を取得できませんでした。"
      );
      setOrderStatus("音声認識が完了しました。");
    } catch (error) {
      console.error("Error sending audio:", error);
      setTranscription("通信エラーが発生しました。");
      setOrderStatus("通信エラーが発生しました。");
    }
  };

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
          音声発注
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
          <div className="flex flex-col items-center space-y-6">
            <RecordButton
              isRecording={isRecording}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
            />
            {orderStatus && (
              <p
                className={`mt-4 text-center ${
                  orderStatus.includes("エラー")
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {orderStatus}
              </p>
            )}
            <TranscriptionResult transcription={transcription} />
          </div>
        </main>
      </div>
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
    </div>
  );
};

export default Voice;
