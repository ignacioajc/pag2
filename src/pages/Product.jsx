import React, { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { buildPriceHistory } from '../data'

export default function Product({ onAddToCart, products, formatPrice, rates, currency }) {
  const { id: routeId } = useParams()
  const [searchParams] = useSearchParams()
  const id = routeId || searchParams.get('id') || 'unknown'
  
  // Find product dynamically from catalog
  const product = useMemo(() => {
    return products.find((p) => p.id === id) || { id: 'unknown', title: 'Artículo', img: '/images/basketball.svg', price: 100 }
  }, [products, id])

  const [selectedImage, setSelectedImage] = useState(product.img)
  
  // Handle thumbnail selection if it changes on product load
  useMemo(() => {
    setSelectedImage(product.img)
  }, [product.img])

  const productBasePrice = product.price || product.base || 100
  const { labels, values } = useMemo(() => buildPriceHistory(productBasePrice), [productBasePrice])
  const currentPrice = values[values.length - 1]
  
  const priceChange = currentPrice - values[0]
  const priceDirection = priceChange >= 0 ? 'up' : 'down'
  const thumbnails = [product.img]

  const handleAdd = () => {
    onAddToCart({ id: product.id, title: product.title, price: productBasePrice, img: product.img, qty: 1 })
  }

  // Calculate formatted price change in selected currency
  const rate = rates[currency] || 1
  const priceChangeConverted = Math.round(priceChange * rate * 100) / 100
  const formattedPriceChange = currency === 'CLP'
    ? `$${Math.round(Math.abs(priceChangeConverted)).toLocaleString('es-CL')} CLP`
    : `${currency === 'USD' ? '$' : '€'}${Math.abs(priceChangeConverted).toFixed(2)} ${currency === 'USD' ? 'USD' : ''}`

  return (
    <main className="product-page">
      <div>
        <div className="product-hero">
          <div className="gallery">
            <img 
              id="productImg" 
              src={selectedImage} 
              alt={product.title} 
              onError={(e) => {
                e.target.src = '/images/basketball.svg'
              }}
            />
            <div id="thumbnails" className="gallery-thumbnails">
              {thumbnails.map((src, index) => (
                <img
                  key={`${src}-${index}`}
                  src={src}
                  alt={`${product.title} ${index + 1}`}
                  className={selectedImage === src ? 'active' : ''}
                  onClick={() => setSelectedImage(src)}
                  onError={(e) => {
                    e.target.src = '/images/basketball.svg'
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <h1 id="productTitle">{product.title}</h1>
            <div style={{ fontSize: '.9rem', color: 'var(--muted)', marginBottom: '.5rem' }}>
              Categoría: <strong>{product.category || 'Deportes'}</strong>
            </div>
            <div id="currentPrice" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', marginTop: '.3rem' }}>
              {formatPrice(currentPrice)}
            </div>
            <div id="priceChange" style={{ marginTop: '.3rem', color: 'var(--text)', fontWeight: 500 }}>
              {priceChange >= 0 ? 'Subida' : 'Bajada'} {priceDirection === 'up' ? '▲' : '▼'} {formattedPriceChange} desde el inicio del año
            </div>
            <div style={{ marginTop: '1.2rem', display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
              <button type="button" id="buyNow" className="btn buy-now" onClick={handleAdd}>
                Comprar ahora
              </button>
              <button 
                type="button" 
                id="addCart" 
                className="btn add-to-cart" 
                style={{ background: '#444', color: '#fff' }} 
                onClick={handleAdd}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>

        <div className="chart-wrap">
          <h3>Historial de precios ({currency})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.8rem', marginTop: '1rem' }}>
            {labels.filter((_, index) => index % 30 === 0).map((label, index) => {
              const baseVal = values[index * 30] || 0
              return (
                <div key={label} style={{ fontSize: '.85rem', color: 'var(--text)', background: 'var(--panel)', padding: '.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  <strong>{label}</strong>
                  <br />
                  {formatPrice(baseVal)}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <aside className="price-panel">
        <div className="price-summary">
          <div>
            <div style={{ fontSize: '.9rem', color: 'var(--muted)' }}>Últimos 12 meses</div>
            <div id="summaryMax" style={{ fontSize: '1rem', fontWeight: 800 }}>
              Max: {formatPrice(Math.max(...values))}
            </div>
            <div id="summaryMin" style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
              Min: {formatPrice(Math.min(...values))}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '.9rem', color: 'var(--muted)' }}>Último precio</div>
            <div id="summaryLast" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>
              {formatPrice(currentPrice)}
            </div>
          </div>
        </div>

        <div className="price-history-list" id="priceHistory">
          {values.filter((_, index) => index % 30 === 0).map((value, index) => {
            const monthsAgo = 12 - index
            return (
              <div key={`price-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.4rem 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.9rem', color: 'var(--muted)' }}>Hace {monthsAgo}m</div>
                <div className={`price-badge ${value > currentPrice ? 'up' : 'down'}`} style={{ fontWeight: 600 }}>
                  {formatPrice(value)}
                </div>
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
