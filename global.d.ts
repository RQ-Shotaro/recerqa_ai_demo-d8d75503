
import { MockedFunction } from 'jest-mock';
declare global {
  var fetch: MockedFunction<typeof fetch> & {
    mockClear: () => void;
    mockReset: () => void;
    mockRestore: () => void;
    mockImplementation: (impl: typeof fetch) => void;
    mockImplementationOnce: (impl: typeof fetch) => void;
    mockResolvedValue: (value: Response) => void;
    mockResolvedValueOnce: (value: Response) => void;
    mockRejectedValue: (reason: any) => void;
    mockRejectedValueOnce: (reason: any) => void;
  };
}
export {};

import { NextRouter } from 'next/router';

declare global {
  namespace jest {
    interface MockedFunction<T> extends jest.Mock<ReturnType<T>, Parameters<T>> {}
  }
}

declare module 'next/router' {
  export function useRouter(): jest.MockedFunction<() => NextRouter> & {
    mockReturnValue: (value: Partial<NextRouter>) => void;
    mockImplementation: (impl: () => Partial<NextRouter>) => void;
  };
}