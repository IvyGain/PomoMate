import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('[TRPC] Using EXPO_PUBLIC_RORK_API_BASE_URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  if (typeof window !== 'undefined') {
    console.log('[TRPC] Using window.location.origin:', window.location.origin);
    return '';
  }

  console.log('[TRPC] No base URL found, using empty string');
  return '';
};

const baseUrl = getBaseUrl();
const apiUrl = `${baseUrl}/api/trpc`;
console.log('[TRPC] Initializing client with URL:', apiUrl);

export const trpcReactClient = trpc.createClient({
  links: [
    httpLink({
      url: apiUrl,
      transformer: superjson,
      fetch: (url, options) => {
        console.log('[TRPC] Fetching:', url);
        return fetch(url, options).then(res => {
          console.log('[TRPC] Response status:', res.status);
          return res;
        }).catch(err => {
          console.error('[TRPC] Fetch error:', err);
          throw err;
        });
      },
    }),
  ],
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: apiUrl,
      transformer: superjson,
      fetch: (url, options) => {
        console.log('[TRPC] Client fetching:', url);
        return fetch(url, options).then(res => {
          console.log('[TRPC] Client response status:', res.status);
          return res;
        }).catch(err => {
          console.error('[TRPC] Client fetch error:', err);
          throw err;
        });
      },
    }),
  ],
});
