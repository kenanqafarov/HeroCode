// src/utils/authCheck.ts
import { NavigateFunction } from 'react-router-dom';

export const checkAndNavigate = (
  navigate: NavigateFunction,
  targetPath = '/play'    // ← buranı öz protected route-unuzla əvəz edin
): void => {
  const token = localStorage.getItem('token');

  if (!token) {
    navigate('/login');
    return;
  }

  try {
    // JWT token formatını yoxlayırıq (əgər sadə token istifadə edirsinizsə aşağıdakı bloku silə bilərsiniz)
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    const exp = payload.exp * 1000;

    if (Date.now() >= exp) {
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    // token hələ keçərlidir
    navigate(targetPath);
  } catch (err) {
    console.warn('Token parse xətası', err);
    localStorage.removeItem('token');
    navigate('/login');
  }
};