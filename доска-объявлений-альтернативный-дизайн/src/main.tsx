import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Ad = { id: number; title: string; description: string; price: number; image_url: string | null };
const api = 'https://inai-col1.fishrungames.com';

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(Number(value) || 0)} сом`;
}

function App() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [message, setMessage] = useState('Загрузка объявлений…');
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [fileName, setFileName] = useState('Выберите изображение с устройства');

  async function load() {
    try {
      const response = await fetch(api + '/ads');
      if (!response.ok) throw new Error();
      setAds((await response.json()).items);
      setMessage('');
    } catch {
      setMessage('Не удалось загрузить объявления. Попробуйте обновить страницу.');
    }
  }

  useEffect(() => { load(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    try {
      const response = await fetch(api + '/ads', { method: 'POST', body: data });
      if (!response.ok) throw new Error();
      const ad: Ad = await response.json();
      setAds(items => [ad, ...items]);
      form.reset();
      setFileName('Выберите изображение с устройства');
      setMessage('Объявление опубликовано');
    } catch {
      setMessage('Не удалось отправить объявление. Проверьте соединение и попробуйте ещё раз.');
    } finally {
      setBusy(false);
    }
  }

  const visibleAds = useMemo(() => {
    const value = query.trim().toLocaleLowerCase('ru');
    if (!value) return ads;
    return ads.filter(ad => `${ad.title} ${ad.description}`.toLocaleLowerCase('ru').includes(value));
  }, [ads, query]);

  return <div className="app-shell">
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Доска — на главную"><span className="brand-symbol">д.</span><span>доска<span className="brand-period">.</span></span></a>
      <nav className="header-nav" aria-label="Основная навигация"><a href="#listings">Объявления</a><a className="nav-cta" href="#publish">Разместить объявление <span>↗</span></a></nav>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow"><span className="live-dot"></span> ПОКУПАЙТЕ И ПРОДАВАЙТЕ РЯДОМ</p>
          <h1>Хорошие вещи<br />находят <em>своих.</em></h1>
          <p className="hero-copy">Всё нужное — от людей рядом. Найдите свою следующую удачную покупку.</p>
          <a className="hero-link" href="#listings">Смотреть объявления <span>↓</span></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-sun"></div><div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div>
          <div className="art-card card-back"><span>SALE</span><i>✳</i></div>
          <div className="art-card card-front"><span className="art-tag">НАШЛОСЬ</span><span className="art-spark">✦</span><span className="art-price">сом<br /><b>1 200</b></span></div>
          <span className="art-star star-a">✳</span><span className="art-star star-b">✦</span>
        </div>
      </section>

      <section className="publish-panel" id="publish">
        <div className="publish-intro"><span className="publish-number">01 / ПУБЛИКАЦИЯ</span><h2>Есть что предложить?</h2><p>Добавьте объявление — покупатель может быть совсем рядом.</p></div>
        <form className="publish-form" onSubmit={submit}>
          <label className="form-field title-field"><span>ЧТО ПРОДАЁТЕ?</span><input name="title" placeholder="Например, велосипед" required maxLength={100} /></label>
          <label className="form-field price-field"><span>ЦЕНА, СОМ</span><input name="price" type="number" min="0" step="0.01" placeholder="0" required /></label>
          <label className="form-field description-field"><span>КОРОТКОЕ ОПИСАНИЕ</span><textarea name="description" placeholder="Состояние, детали, важные нюансы…" required rows={3} maxLength={1000} /></label>
          <label className="upload-field"><input name="image" type="file" accept="image/*" required onChange={event => setFileName(event.currentTarget.files?.[0]?.name || 'Выберите изображение с устройства')} /><span className="upload-icon">↥</span><span className="upload-copy"><b>Добавьте фото</b><small>{fileName}</small></span><span className="upload-arrow">＋</span></label>
          <button className="submit-button" disabled={busy} type="submit">{busy ? 'Публикуем…' : 'Опубликовать'} <span>↗</span></button>
          {message && <p className="form-status" role="status">{message}</p>}
        </form>
      </section>

      <section className="listings-section" id="listings">
        <div className="section-heading"><div><p className="eyebrow">02 / ВЫБИРАЙТЕ С УДОВОЛЬСТВИЕМ</p><h2>Свежие объявления<span className="heading-dot">.</span></h2></div><span className="listing-count">{ads.length} {ads.length === 1 ? 'объявление' : 'объявлений'}</span></div>
        <div className="listing-toolbar"><label className="search-box"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Найти по названию или описанию" aria-label="Поиск по объявлениям" /></label><button className="refresh-button" type="button" onClick={load} aria-label="Обновить объявления" title="Обновить">↻</button></div>
        {visibleAds.length > 0 ? <div className="ads-grid">{visibleAds.map(ad => <article className="ad-card" key={ad.id}>
          <div className="ad-image-wrap">{ad.image_url ? <img className="ad-image" src={new URL(ad.image_url, api).href} alt={ad.title} loading="lazy" /> : <div className="image-placeholder"><span>д.</span></div>}<span className="ad-badge">ОБЪЯВЛЕНИЕ</span></div>
          <div className="ad-content"><h3>{ad.title}</h3><p className="ad-description">{ad.description}</p><div className="ad-bottom"><strong>{formatPrice(ad.price)}</strong><span className="ad-arrow" aria-hidden="true">↗</span></div></div>
        </article>)}</div> : <div className="empty-state"><span className="empty-mark">⌕</span><h3>{query ? 'Ничего не нашлось' : 'Пока объявлений нет'}</h3><p>{query ? 'Попробуйте изменить запрос.' : 'Здесь появятся предложения от пользователей.'}</p>{query && <button type="button" onClick={() => setQuery('')}>Очистить поиск</button>}</div>}
      </section>
    </main>
    <footer className="site-footer"><a className="brand footer-brand" href="#top"><span className="brand-symbol">д.</span><span>доска<span className="brand-period">.</span></span></a><span>Хорошие вещи. Хорошие люди.</span><a href="#top" className="back-top">НАВЕРХ ↑</a></footer>
  </div>;
}

createRoot(document.getElementById('root')!).render(<App />);
