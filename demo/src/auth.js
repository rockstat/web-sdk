import { rstat } from './tracker';

const KEY = 'demo:user';

export const getUser = () => localStorage.getItem(KEY);

// Псевдо-авторизация: пропускает с любым логином и паролем
export const login = (username) => {
  localStorage.setItem(KEY, username);
  rstat('identify', username, { demo: true });
};

export const logout = () => localStorage.removeItem(KEY);
