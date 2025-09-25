import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Generate a unique session ID for cart management
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('cart-session-id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('cart-session-id', sessionId);
  }
  return sessionId;
}

// Auto-detect API URL based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? '' : 'https://artisanaljewels.onrender.com');

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {
    'x-session-id': getSessionId(),
  };
  
  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  // Use absolute URL for production, relative for development
  const fullUrl = API_BASE_URL ? `${API_BASE_URL}${url}` : url;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {
      'x-session-id': getSessionId(),
    };

    // Build URL from query key - first element is path, objects become query params
    const [basePath, ...rest] = queryKey as unknown[];
    let url = String(basePath);
    const params: Record<string, any> = {};

    // Process remaining segments
    for (const segment of rest) {
      if (segment == null) continue;
      
      if (typeof segment === 'string' || typeof segment === 'number') {
        // Add as path segment
        url += '/' + encodeURIComponent(String(segment));
      } else if (typeof segment === 'object') {
        // Add as query parameters
        Object.entries(segment).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params[key] = value;
          }
        });
      }
    }

    // Add query parameters if any
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          value.forEach(val => searchParams.append(key, String(val)));
        } else {
          searchParams.set(key, String(value));
        }
      }
      url += '?' + searchParams.toString();
    }

    // Use absolute URL for production, relative for development  
    const fullUrl = API_BASE_URL ? `${API_BASE_URL}${url}` : url;

    const res = await fetch(fullUrl, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && (res.status === 401 || res.status === 404)) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
