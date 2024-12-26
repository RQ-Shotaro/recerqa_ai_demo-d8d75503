import { jest } from '@jest/globals';
import axios from 'axios';

// Fetch のモック
global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(""),
  ok: true,
  status: 200,
  statusText: "OK",
})) as jest.Mock;

// Axios のモック
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Next.js の Router モック
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// グローバル変数の設定
declare global {
  namespace NodeJS {
    interface Global {
      fetch: jest.Mock;
      mockNextRouter: typeof mockRouter;
    }
  }
  var mockNextRouter: typeof mockRouter;
  var axios: typeof mockedAxios;
}

global.mockNextRouter = mockRouter;
global.axios = mockedAxios;

// テスト前の共通セットアップ
beforeEach(() => {
  jest.clearAllMocks();
});