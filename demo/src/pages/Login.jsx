import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  const onSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const username = String(form.get('login') || '').trim();

    if (!username) {
      return setError('Введите логин — пароль подойдёт любой 😉');
    }

    // Псевдо-авторизация: любые логин и пароль проходят
    login(username);
    navigate(location.state?.from || '/', { replace: true });
  };

  return (
    <div className="login-wrap">
      <form className="login-form" name="auth" onSubmit={onSubmit}>
        <h1>Вход в GameHub</h1>
        <p className="subtitle">Подойдут любые логин и пароль</p>

        <label>
          Логин
          <input name="login" type="text" placeholder="player_one" autoFocus />
        </label>
        <label>
          E-mail (необязательно)
          <input name="email" type="email" placeholder="you@example.com" />
        </label>
        <label>
          Пароль
          <input name="password" type="password" placeholder="••••••••" />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="btn btn-primary" type="submit">Войти</button>
      </form>
    </div>
  );
}
