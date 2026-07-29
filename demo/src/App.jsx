import { useEffect } from 'react';
import { Routes, Route, Link, NavLink, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import GamePage from './pages/GamePage';
import Login from './pages/Login';
import TrackerPanel from './TrackerPanel';
import { getUser, logout } from './auth';
import { rstat } from './tracker';

let lastTrackedPath = null;

function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    // SPA-навигация: сообщаем трекеру о смене страницы
    if (lastTrackedPath !== location.pathname) {
      lastTrackedPath = location.pathname;
      rstat('page');
    }
  }, [location.pathname]);
}

function Header() {
  const user = getUser();
  const navigate = useNavigate();

  return (
    <header className="header">
      <Link to="/" className="logo">🎮 GameHub</Link>
      <nav>
        <NavLink to="/">Каталог</NavLink>
      </nav>
      <div className="header-user">
        {user ? (
          <>
            <span className="username">👤 {user}</span>
            <button
              className="btn btn-ghost"
              onClick={() => { logout(); navigate('/'); }}
            >
              Выйти
            </button>
          </>
        ) : (
          <Link className="btn" to="/login">Войти</Link>
        )}
      </div>
    </header>
  );
}

export default function App() {
  usePageTracking();

  return (
    <div className="app">
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:slug" element={<GamePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <TrackerPanel />
    </div>
  );
}
