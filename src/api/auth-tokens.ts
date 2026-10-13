import Cookies from 'js-cookie';

// Single source of truth for where auth tokens live.
// The access token is stored in a cookie (not localStorage) so that
// server components / middleware can read it for route protection.
export const ACCESS_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'auth_refresh_token';

const ACCESS_COOKIE_DAYS = 7;
const REFRESH_COOKIE_DAYS = 30;

const cookieOptions = (days: number) => ({
  expires: days,
  // Only force HTTPS in production; local dev runs over http.
  secure: process.env.NODE_ENV === 'production',
  // 'lax' keeps working for top-level navigations while still preventing
  // the cookie from being sent on cross-site sub-requests.
  sameSite: 'lax' as const,
  path: '/',
});

export const getAccessToken = (): string | undefined =>
  Cookies.get(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | undefined =>
  Cookies.get(REFRESH_TOKEN_KEY);

export const setTokens = (tokens: {
  token?: string;
  refreshToken?: string;
}): void => {
  if (tokens.token) {
    Cookies.set(ACCESS_TOKEN_KEY, tokens.token, cookieOptions(ACCESS_COOKIE_DAYS));
  }
  if (tokens.refreshToken) {
    Cookies.set(
      REFRESH_TOKEN_KEY,
      tokens.refreshToken,
      cookieOptions(REFRESH_COOKIE_DAYS),
    );
  }
};

export const clearTokens = (): void => {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
};
