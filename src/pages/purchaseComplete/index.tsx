import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

const PurchaseComplete = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen h-full bg-gray-100 flex flex-col">
             <header className="bg-blue-500 p-4 text-white shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/dashboard" className="text-xl font-bold hover:text-blue-200 transition duration-300 ease-in-out">
                    RECERQA
                    </Link>
                </div>
            </header>
            <div className="flex-1 flex flex-col justify-center items-center p-6">
                <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md flex flex-col items-center">
                 <FaCheckCircle className="text-green-500 text-6xl mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">仕入処理が完了しました</h2>
                    <p className="text-gray-600 mb-6">発注ID: {router.query.orderId || 'サンプルID'}</p>
                     <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                    >
                         <FaArrowLeft className="inline-block mr-2" /> ダッシュボードへ戻る
                    </button>
                </div>
            </div>
            <footer className="bg-gray-800 text-white p-4 text-center">
                <p>&copy; 2024 RECERQA. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default PurchaseComplete;
