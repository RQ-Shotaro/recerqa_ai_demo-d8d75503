import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import OpenAI from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempPath = '';

  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);
    const audioFile = files.audio?.[0];

    if (!audioFile) {
      return res.status(400).json({ error: '音声ファイルが見つかりません。' });
    }

    console.log('Audio file received:', {
      filepath: audioFile.filepath,
      mimetype: audioFile.mimetype,
      size: audioFile.size,
      originalFilename: audioFile.originalFilename,
    });

    if (!fs.existsSync(audioFile.filepath)) {
      return res.status(400).json({ error: '音声ファイルの読み込みに失敗しました。' });
    }

    // ファイル���一時的にコピー
    tempPath = `${audioFile.filepath}.wav`;
    fs.copyFileSync(audioFile.filepath, tempPath);

    try {
      // Whisper APIを使用して音声をテキストに変換
      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempPath),
        model: 'whisper-1',
        language: 'ja',
      });

      console.log('Whisper API response:', transcriptionResponse);

      if (!transcriptionResponse) {
        throw new Error('音声認識の結果が空です。');
      }

      // ChatGPTを使用して商品名と個数を抽出
      const extractionResponse = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '音声テキストから商品名と個数のみを抽出し、「商品名：個数」の形式で出力してください。複数ある場合は改行で区切ってください。',
          },
          {
            role: 'user',
            content: transcriptionResponse.text || '',
          },
        ],
      });

      console.log('GPT-4 response:', extractionResponse);

      const extractedItems = extractionResponse.choices[0]?.message?.content || '商品名と個数を抽出できませんでした。';

      // 一時ファイルを削除
      cleanupFiles(audioFile.filepath, tempPath);

      return res.status(200).json({ transcription: extractedItems });
    } catch (apiError: any) {
      // 一時ファイルを削除
      cleanupFiles(audioFile.filepath, tempPath);

      console.error('OpenAI API Error:', {
        error: apiError,
        message: apiError.message,
        response: apiError.response?.data,
      });
      return res.status(500).json({ 
        error: 'OpenAI APIエラー',
        details: apiError.message,
      });
    }
  } catch (error: any) {
    // エラー時にも一時ファイルを削除
    if (tempPath) {
      cleanupFiles('', tempPath);
    }

    console.error('General Error:', {
      error,
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ 
      error: '音声処理中にエラーが発生しました。',
      details: error.message,
    });
  }
}

// ファイル削除のヘルパー関数
function cleanupFiles(originalPath: string, tempPath: string) {
  try {
    if (originalPath && fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
    }
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
}
