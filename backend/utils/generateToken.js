import jwt from 'jsonwebtoken';

export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const setTokenCookie = (res, token) => {
  const cookieName = process.env.JWT_COOKIE_NAME || 'church_token';
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // Always 'lax', never 'none'. The frontend authenticates with a Bearer
    // token (see api/axios.js) which browsers never attach to cross-site
    // requests automatically, so it can't be forged by another site (CSRF).
    // This cookie is only a same-site convenience fallback — sameSite:'none'
    // would make it auto-attach to cross-site requests too, which reopens
    // exactly the CSRF hole the Bearer token was designed to avoid.
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
