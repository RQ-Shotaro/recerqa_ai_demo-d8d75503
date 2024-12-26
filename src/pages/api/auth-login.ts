import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ error: 'ユーザーIDとパスワードを入力してください。' });
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: userId,
            password: password,
        });

        if (error) {
            return res.status(401).json({ error: 'ログインに失敗しました。ユーザーIDまたはパスワードが間違っています。' });
        }

        return res.status(200).json({ message: 'ログイン成功', user: data.user });

    } catch (err: any) {
        console.error("Error during login", err);
        return res.status(500).json({ error: 'ログイン処理中にエラーが発生しました。' });
    }
}