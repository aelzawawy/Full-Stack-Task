const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    tokenOverride?: string | null
  ): Promise<T> {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const token = tokenOverride !== undefined ? tokenOverride : localStorage.getItem('auth_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    let response: Response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(
        'Unable to connect to the server. Please check your connection or verify the backend is running.',
        0
      );
    }

    let data: any = {};
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred. Please try again.';
      if (Array.isArray(data.message)) {
        errorMessage = data.message.join(', ');
      } else if (typeof data.message === 'string') {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  }

  get<T>(endpoint: string, tokenOverride?: string | null): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, tokenOverride);
  }

  post<T>(endpoint: string, body: any, tokenOverride?: string | null): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      tokenOverride
    );
  }
}

export const apiClient = new ApiClient();
