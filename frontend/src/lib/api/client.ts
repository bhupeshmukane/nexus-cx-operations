/**
 * Reusable HTTP API client for NEXUS CX Operations Console.
 */

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail || message;
  }
}

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const baseUrl = (envUrl && typeof envUrl === 'string' ? envUrl : 'http://127.0.0.1:8000').trim();
  return baseUrl.replace(/\/+$/, '');
};

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${baseUrl}${normalizedEndpoint}`);

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');

  let body: BodyInit | undefined = undefined;
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      ...options,
      headers,
      body,
    });
  } catch (networkErr: unknown) {
    const originalMessage = networkErr instanceof Error ? networkErr.message : 'Network error';
    throw new ApiError(
      'Unable to connect to NEXUS API server. Please check your network connection and verify the backend is running.',
      0,
      originalMessage
    );
  }

  if (!response.ok) {
    let errorDetail = response.statusText || 'API request failed';
    try {
      const data = await response.json();
      if (data && typeof data === 'object') {
        if (typeof data.detail === 'string') {
          errorDetail = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorDetail = data.detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join('; ');
        } else if (data.message && typeof data.message === 'string') {
          errorDetail = data.message;
        }
      }
    } catch {
      // Body is not JSON; fallback to statusText
    }

    throw new ApiError(errorDetail, response.status, errorDetail);
  }

  // If status is 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  try {
    return (await response.json()) as T;
  } catch (err: unknown) {
    throw new ApiError(
      'Invalid JSON response received from API server.',
      response.status,
      err instanceof Error ? err.message : 'JSON parse error'
    );
  }
}
