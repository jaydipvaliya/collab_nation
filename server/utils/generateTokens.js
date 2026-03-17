import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

export const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

export const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearRefreshCookie = (res) => {
  res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
};
