import React, { useEffect, useMemo, useState } from 'react';

const Recommendations = ({ loading, items, targetPrice }) => {
  const [sortedBy, setSortedBy] = useState('score'); // score | price | delta
  const [modalItem, setModalItem] = useState(null);
  // Favorites removed per request
  const [compareIds, setCompareIds] = useState([]); // up to 2 ids

  // Favorites removed per request

  const toggleCompare = (car) => {
    let next = compareIds.includes(car.id)
      ? compareIds.filter((id) => id !== car.id)
      : [...compareIds, car.id];
    if (next.length > 2) next = next.slice(1); // keep max 2
    setCompareIds(next);
  };

  const withDelta = useMemo(() => {
    const add = (arr) => (arr || []).map((car) => ({
      ...car,
      priceDelta: (car.price_in_euro ?? 0) - (targetPrice ?? 0),
    }));
    return add(items);
  }, [items, targetPrice]);

  const sorted = useMemo(() => {
    const copy = [...withDelta];
    if (sortedBy === 'price') {
      copy.sort((a, b) => (a.price_in_euro ?? 0) - (b.price_in_euro ?? 0));
    } else if (sortedBy === 'delta') {
      copy.sort((a, b) => Math.abs(a.priceDelta) - Math.abs(b.priceDelta));
    } else {
      copy.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
    }
    return copy;
  }, [withDelta, sortedBy]);

  if (loading) {
    return (
      <div className="recs-section">
        <h3>🔍 Finding similar cars…</h3>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  const Badge = ({ children, tone }) => (
    <span className={`badge badge-${tone || 'neutral'}`}>{children}</span>
  );

  const MoneyDelta = ({ value }) => {
    if (!value) return <span className="delta neutral">≈</span>;
    const abs = Math.abs(value);
    if (value > 0) return <span className="delta up">+€{abs.toLocaleString()}</span>;
    if (value < 0) return <span className="delta down">-€{abs.toLocaleString()}</span>;
    return <span className="delta neutral">€0</span>;
  };

  const DetailRow = ({ label, value }) => (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );

  const compareItems = sorted.filter((c) => compareIds.includes(c.id)).slice(0, 2);

  return (
    <div className="recs-section">
      <div className="recs-header">
        <h3>✨ Recommended For You</h3>
        <div className="recs-controls">
          <span className="sort-label">Sort by:</span>
          <select value={sortedBy} onChange={(e) => setSortedBy(e.target.value)}>
            <option value="score">Best match</option>
            <option value="delta">Closest to estimate</option>
            <option value="price">Lowest price</option>
          </select>
        </div>
      </div>

      {/* Compare widget */}
      {compareItems.length === 2 && (
        <div className="compare-bar">
          <div className="compare-title">Compare</div>
          {compareItems.map((c) => (
            <div key={c.id} className="compare-pill">
              <span>{c.brand?.toUpperCase?.()} • {c.year} • €{c.price_in_euro?.toLocaleString?.()}</span>
              <button onClick={() => toggleCompare(c)}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="recs-grid">
        {sorted.map((car) => (
          <div key={car.id} className="rec-card">
            <div className="rec-body">
              <div className="rec-title">
                {car.brand?.toUpperCase?.()} • {car.year}
              </div>
              <div className="rec-badges">
                <Badge tone="info">{car.power_ps} PS</Badge>
                <Badge tone="neutral">{car.transmission_type}</Badge>
                <Badge tone="neutral">{car.fuel_type}</Badge>
                <Badge tone="muted">{(car.mileage_in_km || 0).toLocaleString()} km</Badge>
                <Badge tone="success">Match {Math.round(car.match_score)}%</Badge>
              </div>
              <div className="rec-price-row">
                <div className="rec-price">€{car.price_in_euro?.toLocaleString?.()}</div>
                <MoneyDelta value={car.priceDelta} />
              </div>
              <div className="rec-actions">
                <button type="button" className="btn ghost" onClick={() => toggleCompare(car)}>
                  {compareIds.includes(car.id) ? 'Remove from Compare' : 'Add to Compare'}
                </button>
                {/* Favorites removed per request */}
                {/* View Details removed per request */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal removed per request */}
    </div>
  );
};

export default Recommendations;


