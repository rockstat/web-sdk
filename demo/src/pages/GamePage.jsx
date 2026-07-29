import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getGame } from '../games';

export default function GamePage() {
  const { slug } = useParams();
  const game = getGame(slug);
  const [sent, setSent] = useState(false);

  if (!game) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <Link to="/" className="back">← к каталогу</Link>

      <div className="game-hero" style={{ background: game.gradient }}>
        <span className="game-hero-emoji">{game.emoji}</span>
        <div>
          <h1>{game.title}</h1>
          <div className="meta">
            <span className="badge">{game.genre}</span>
            <span className="badge">{game.year}</span>
            <span className="badge">{game.developer}</span>
            <span className="rating big">★ {game.rating}</span>
          </div>
        </div>
      </div>

      <p className="description">{game.description}</p>

      <section className="review">
        <h2>Оставить отзыв</h2>
        {sent ? (
          <p className="success">Спасибо! Отзыв отправлен 🎉</p>
        ) : (
          <form name="review" onSubmit={onSubmit}>
            <label>
              Оценка
              <select name="score" defaultValue="10">
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <label>
              Отзыв
              <textarea
                name="review_text"
                rows="4"
                placeholder="Что понравилось, что нет..."
                required
              />
            </label>
            <label className="checkbox">
              <input type="checkbox" name="recommend" defaultChecked />
              Рекомендую эту игру
            </label>
            <button className="btn btn-primary" type="submit">Отправить отзыв</button>
          </form>
        )}
      </section>
    </>
  );
}
