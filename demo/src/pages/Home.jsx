import { Link } from 'react-router-dom';
import { games } from '../games';

export default function Home() {
  return (
    <>
      <h1>Популярные игры</h1>
      <p className="subtitle">
        Каталог для теста Rockstat SDK: клики, страницы и формы (значения полей шифруются).
      </p>
      <div className="grid">
        {games.map((game) => (
          <Link key={game.slug} to={`/game/${game.slug}`} className="card">
            <div className="cover" style={{ background: game.gradient }}>
              <span className="cover-emoji">{game.emoji}</span>
            </div>
            <div className="card-body">
              <h3>{game.title}</h3>
              <div className="meta">
                <span className="badge">{game.genre}</span>
                <span className="rating">★ {game.rating}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
