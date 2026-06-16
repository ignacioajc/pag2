import React, { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { buildPriceHistory, findProductById, products } from '../data'

export default function Product({ onAddToCart }) {
  const { id: routeId } = useParams()
  const [searchParams] = useSearchParams()
  const id = routeId || searchParams.get('id') || 'unknown'
  const product = findProductById(id) || { id: 'unknown', title: 'Artículo', img: 'images/basketball.jpg', base: 100 }
  const [selectedImage, setSelectedImage] = useState(product.img)
  const { labels, values } = useMemo(() => buildPriceHistory(product.base), [product.base])
  const currentPrice = values[values.length - 1]
  const priceChange = Math.round((currentPrice - values[0]) * 100) / 100
  const priceDirection = priceChange >= 0 ? 'up' : 'down'
  const thumbnails = [product.img]

  const handleAdd = () => {
    onAddToCart({ id: product.id, title: product.title, price: currentPrice, img: product.img, qty: 1 })
  }

  return (
    <main className="product-page">
      <div>
        <div className="product-hero">
          <div className="gallery">
            <img id="productImg" src={selectedImage} alt={product.title} />
            <div id="thumbnails" className="gallery-thumbnails">
              {thumbnails.map((src, index) => (
                <img
                  key={`${src}-${index}`}
                  src={src}
                  alt={`${product.title} ${index + 1}`}
                  className={selectedImage === src ? 'active' : ''}
                  onClick={() => setSelectedImage(src)}
                />
              ))}
            </div>
          </div>
          <div>
            <h1 id="productTitle">{product.title}</h1>
            <div id="currentPrice" style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '.3rem' }}>
              €{currentPrice.toFixed(2)}
            </div>
            <div id="priceChange" style={{ marginTop: '.3rem', color: '#4a4a4a' }}>
              {priceChange >= 0 ? 'Subida' : 'Bajada'} {priceDirection === 'up' ? '▲' : '▼'} €{Math.abs(priceChange).toFixed(2)} desde el inicio
            </div>
            <div style={{ marginTop: '.8rem', display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
              <button type="button" id="buyNow" className="btn buy-now" onClick={handleAdd}>
                Comprar ahora
              </button>
              <button type="button" id="addCart" className="btn add-to-cart" style={{ background: '#444', color: '#fff' }} onClick={handleAdd}>
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>

        <div className="chart-wrap">
          <h3>Historial de precios</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', marginTop: '1rem' }}>
            {labels.filter((_, index) => index % 30 === 0).map((label, index) => (
              <div key={label} style={{ fontSize: '.85rem', color: '#555' }}>
                <strong>{label}</strong><br />€{values[index * 30]?.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="price-panel">
        <div className="price-summary">
          <div>
            <div style={{ fontSize: '.9rem', color: '#666' }}>Últimos 12 meses</div>
            <div id="summaryMax" style={{ fontSize: '1rem', fontWeight: 800 }}>
              Max €{Math.max(...values).toFixed(2)}
            </div>
            <div id="summaryMin" style={{ color: '#666' }}>
              Min €{Math.min(...values).toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '.9rem', color: '#666' }}>Último precio</div>
            <div id="summaryLast" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              €{currentPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="price-history-list" id="priceHistory">
          {values.filter((_, index) => index % 30 === 0).map((value, index) => {
            const monthsAgo = 12 - index
            return (
              <div key={`price-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '.9rem', color: 'var(--muted)' }}>Hace {monthsAgo}m</div>
                <div className={`price-badge ${value > currentPrice ? 'up' : 'down'}`}>€{value.toFixed(2)}</div>
              </div>
            )
          })}
        </div>
      </aside>

      <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem' }}>
        <Link to="/" className="btn">
          ← Volver a la tienda
        </Link>
      </div>
    </main>
  )
}
