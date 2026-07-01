import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { auctionProducts, heroSlides, randomUsers } from '../data'

const AUCTIONS_KEY = 'shop_auctions_v1'
const BIDS_KEY = 'shop_bids_v1'

function loadAuctions() {
  try {
    const stored = localStorage.getItem(AUCTIONS_KEY)
    return stored ? JSON.parse(stored) : auctionProducts
  } catch {
    return auctionProducts
  }
}

function loadBids() {
  try {
    const stored = localStorage.getItem(BIDS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export default function Home({ searchQuery, onAddToCart, products, categories, formatPrice }) {
  const [auctions, setAuctions] = useState(loadAuctions)
  const [bids, setBids] = useState(loadBids)
  const [clock, setClock] = useState(Date.now())
  const [contactStatus, setContactStatus] = useState({ text: '', type: 'error' })

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem(AUCTIONS_KEY, JSON.stringify(auctions))
  }, [auctions])

  useEffect(() => {
    localStorage.setItem(BIDS_KEY, JSON.stringify(bids))
  }, [bids])

  // Derive categories dynamically to support custom categories added in the Admin Panel
  const dynamicCategories = useMemo(() => {
    if (!products || products.length === 0) return []
    
    // Get unique categories from products
    const uniqueCatNames = Array.from(new Set(products.map((p) => p.category)))
    
    // Build categories objects
    return uniqueCatNames.map((catName) => {
      const defaultCat = categories.find((c) => c.title.toLowerCase() === catName.toLowerCase())
      return {
        title: catName,
        description: defaultCat ? defaultCat.description : 'Categoría personalizada de productos.',
        products: []
      }
    })
  }, [categories, products])

  // Filter categories and products based on the search query
  const filteredCategories = useMemo(() => {
    return dynamicCategories.map((cat) => {
      const catProducts = products.filter((p) => p.category === cat.title)
      const filtered = catProducts.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      return {
        ...cat,
        products: filtered
      }
    }).filter((cat) => cat.products.length > 0)
  }, [dynamicCategories, products, searchQuery])

  const featuredProducts = filteredCategories.flatMap((category) => category.products)

  const formatCountdown = (endTime) => {
    const diff = endTime - clock
    if (diff <= 0) return 'Finalizada'
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const handleBid = (auctionId) => {
    setAuctions((current) =>
      current.map((item) => {
        if (item.id !== auctionId) return item
        const increment = Math.max(1, Math.round(item.currentBid * 0.05))
        return { ...item, currentBid: Math.round((item.currentBid + increment) * 100) / 100 }
      })
    )
    setBids((current) => {
      const auction = auctions.find((item) => item.id === auctionId)
      if (!auction) return current
      const next = { ...current }
      const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)]
      const newBid = { userId: randomUser.id, amount: Math.round((auction.currentBid * 1.05) * 100) / 100, time: Date.now() }
      next[auctionId] = [...(next[auctionId] || []), newBid]
      return next
    })
  }

  const contactFormSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const name = form.name.value.trim()
    const email = form.email.value.trim()
    const subject = form.subject.value.trim()
    const message = form.message.value.trim()

    if (!name || !email || !subject || !message) {
      setContactStatus({ text: 'Por favor completa todos los campos.', type: 'error' })
      return
    }

    setContactStatus({ text: 'Mensaje enviado correctamente. Gracias por contactarnos.', type: 'success' })
    form.reset()
  }

  return (
    <main>
      <section id="carousel" className="carousel-section carousel-hero">
        <div className="carousel">
          <button className="carousel-btn prev" aria-label="Anterior" type="button" onClick={() => {}}>
            ❮
          </button>
          <div className="carousel-track">
            {heroSlides.map((src, index) => (
              <div
                key={src}
                className="carousel-slide"
                style={{ opacity: index === 0 ? 1 : 0, position: 'absolute', width: '100%', height: '100%' }}
              >
                <img src={src} alt={`Imagen deportiva ${index + 1}`} />
              </div>
            ))}
          </div>
          <button className="carousel-btn next" aria-label="Siguiente" type="button" onClick={() => {}}>
            ❯
          </button>
        </div>
      </section>

      <section id="hero">
        <h1>Tu tienda de artículos deportivos</h1>
        <p>Especialistas en artes marciales, baloncesto y fútbol. Compra, puja y compara precios históricos.</p>
      </section>

      <section id="tienda">
        <h2>Categorías destacadas</h2>
        <div className="categories">
          {filteredCategories.map((category) => (
            <div className="category" key={category.title}>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
              <div className="product-grid">
                {category.products.map((product) => (
                  <article className="product-card" key={product.id} data-name={product.title}>
                    <img src={product.img} alt={product.title} loading="lazy" />
                    <h4>{product.title}</h4>
                    <p className="price">{formatPrice(product.price)}</p>
                    <Link className="btn" to={`/product/${product.id}`}>
                      Ver artículo
                    </Link>
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ marginTop: '0.6rem' }} 
                      onClick={() => onAddToCart({ id: product.id, title: product.title, price: product.price, img: product.img, qty: 1 })}
                    >
                      Añadir al carrito
                    </button>
                  </article>
                ))}
              </div>
            </div>
          ))}
          {featuredProducts.length === 0 && (
            <p style={{ marginTop: '1rem' }}>No se encontraron productos con ese término de búsqueda.</p>
          )}
        </div>
      </section>

      <section id="subastas">
        <h2>Subastas</h2>
        <p className="lead">Puja por artículos exclusivos.</p>
        <div className="auction-grid" id="auctionGrid">
          {auctions.map((auction) => (
            <div className="auction-card" key={auction.id}>
              <img src={auction.img} alt={auction.title} />
              <h4>{auction.title}</h4>
              <div className="auction-meta">
                <div className="auction-price">{formatPrice(auction.currentBid)}</div>
                <div className="auction-countdown">{formatCountdown(auction.ends)}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem' }}>
                <Link className="btn" to={`/product/${auction.id}`}>
                  Detalles
                </Link>
                <button type="button" className="btn" onClick={() => handleBid(auction.id)}>
                  Pujar
                </button>
              </div>
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--accent)' }}>Historial de pujas</h5>
                {(bids[auction.id] || []).slice(-3).reverse().map((bid, index) => {
                  const user = randomUsers.find((userItem) => userItem.id === bid.userId) || { name: 'Usuario', avatar: '👤' }
                  return (
                    <div key={`${auction.id}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.3rem 0', borderBottom: '1px solid var(--border)' }}>
                      <span>{user.avatar}</span>
                      <span style={{ flex: 1, color: 'var(--text)' }}>{user.name}</span>
                      <strong>{formatPrice(bid.amount)}</strong>
                    </div>
                  )
                })}
                {!bids[auction.id] && <div style={{ fontSize: '0.9rem', color: 'var(--text)', opacity: 0.7 }}>Sin pujas aún</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="contacto" className="content-section">
        <h2>Contacto</h2>
        <div className="form-grid">
          <article className="form-card contactar-cliente-form">
            <h3>Envíanos un mensaje</h3>
            <form id="contactForm" onSubmit={contactFormSubmit}>
              <label htmlFor="contactName">Nombre</label>
              <input type="text" id="contactName" name="name" placeholder="Tu nombre" required />
              <label htmlFor="contactEmail">Email</label>
              <input type="email" id="contactEmail" name="email" placeholder="usuario@ejemplo.com" required />
              <label htmlFor="contactSubject">Asunto</label>
              <input type="text" id="contactSubject" name="subject" placeholder="¿En qué podemos ayudarte?" required />
              <label htmlFor="contactMessage">Mensaje</label>
              <textarea id="contactMessage" name="message" rows="5" placeholder="Escribe tu mensaje" required />
              <div className={`message${contactStatus.type === 'success' ? ' message--success' : ''}`} aria-live="polite">
                {contactStatus.text}
              </div>
              <button type="submit" className="btn">Enviar mensaje</button>
            </form>
          </article>
          <article className="servicio-contacto">
            <h3>Soporte técnico</h3>
            <p>Contáctanos si necesitas ayuda con tu pedido o tu cuenta.</p>
            <p>Teléfono: <a href="tel:+34900111222">+34 900 111 222</a></p>
            <p>Email: <a href="mailto:soporte@deportes.example">soporte@deportes.example</a></p>
          </article>
        </div>
      </section>
    </main>
  )
}
