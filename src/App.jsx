import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Product from './pages/Product'
import {
  addToCart,
  changeCartQty,
  clearCart,
  getCartCount,
  getCartItems,
  removeFromCart
} from './cartService'
import { getCurrentUserService, initUsersFromJSON, loginUser, logoutUser, registerUser } from './authService'

function CartPanel({ visible, onClose, onChangeQty, onRemove, onClear }) {
  const cartItems = useMemo(() => getCartItems(), [visible])
  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0)

  if (!visible) return null

  return (
    <div className="cart-panel" role="dialog" aria-label="Carrito de compras">
      <h3>Carrito</h3>
      {cartItems.length === 0 ? (
        <div className="cart-empty">No hay artículos en el carrito.</div>
      ) : (
        <>
          {cartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={item.img} alt={item.title} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{item.title}</div>
                <div style={{ color: 'var(--muted)' }}>€{(item.price || 0).toFixed(2)}</div>
              </div>
              <div className="cart-actions">
                <button type="button" onClick={() => onChangeQty(item.id, -1)}>-</button>
                <div style={{ padding: '0 .6rem' }}>{item.qty}</div>
                <button type="button" onClick={() => onChangeQty(item.id, 1)}>+</button>
                <button type="button" onClick={() => onRemove(item.id)} style={{ marginLeft: '.4rem' }}>✕</button>
              </div>
            </div>
          ))}
          <div style={{ padding: '.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Total</strong>
            <strong>€{total.toFixed(2)}</strong>
          </div>
          <div style={{ padding: '.4rem', display: 'flex', gap: '.5rem' }}>
            <button type="button" className="btn" onClick={onClose}>Cerrar</button>
            <button type="button" className="btn" onClick={onClear}>Vaciar</button>
          </div>
        </>
      )}
    </div>
  )
}

export default function App() {
  const [cartCount, setCartCount] = useState(getCartCount())
  const [cartVisible, setCartVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [accessibilityOpen, setAccessibilityOpen] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [authUser, setAuthUser] = useState(getCurrentUserService())
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const [authMessage, setAuthMessage] = useState({ text: '', type: 'error' })
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(storedTheme ? storedTheme === 'dark' : prefersDark)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('darkmode', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    initUsersFromJSON().then(() => setAuthUser(getCurrentUserService()))
  }, [])

  useEffect(() => {
    const saved = parseInt(localStorage.getItem('fontSize'))
    if (saved && saved >= 12 && saved <= 24) {
      setFontSize(saved)
      document.documentElement.style.fontSize = saved + 'px'
    }
  }, [])

  const handleFontSize = (delta) => {
    setFontSize((prev) => {
      const next = Math.min(24, Math.max(12, prev + delta))
      document.documentElement.style.fontSize = next + 'px'
      localStorage.setItem('fontSize', next)
      return next
    })
  }

  const updateCartState = () => setCartCount(getCartCount())

  const handleAddToCart = (product) => {
    addToCart(product)
    updateCartState()
    setCartVisible(true)
  }

  const handleChangeQty = (id, delta) => {
    changeCartQty(id, delta)
    updateCartState()
  }

  const handleRemoveItem = (id) => {
    removeFromCart(id)
    updateCartState()
  }

  const handleClearCart = () => {
    clearCart()
    updateCartState()
  }

  const handleAuthButton = () => {
    if (authUser) {
      const confirmed = window.confirm(`¿Cerrar sesión de ${authUser.username}?`)
      if (confirmed) {
        logoutUser()
        setAuthUser(null)
      }
      return
    }

    setAuthModalOpen(true)
    setAuthTab('login')
    setAuthMessage({ text: '', type: 'error' })
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    if (authTab === 'login') {
      const email = formData.get('email')?.toString().trim() || ''
      const password = formData.get('password')?.toString() || ''
      const result = await loginUser({ email, password })
      if (!result.ok) {
        setAuthMessage({ text: result.message || 'Error al iniciar sesión.', type: 'error' })
        return
      }
      setAuthUser(getCurrentUserService())
      setAuthMessage({ text: `Bienvenido de nuevo, ${result.user.username}.`, type: 'success' })
      setTimeout(() => {
        setAuthModalOpen(false)
        setAuthMessage({ text: '', type: 'error' })
        form.reset()
      }, 700)
      return
    }

    const username = formData.get('username')?.toString().trim() || ''
    const email = formData.get('email')?.toString().trim() || ''
    const password = formData.get('password')?.toString() || ''
    const confirmPassword = formData.get('confirmPassword')?.toString() || ''
    if (password !== confirmPassword) {
      setAuthMessage({ text: 'Las contraseñas deben coincidir.', type: 'error' })
      return
    }
    const result = await registerUser({ username, email, password })
    if (!result.ok) {
      setAuthMessage({ text: result.message || 'Error al registrarse.', type: 'error' })
      return
    }
    setAuthUser(getCurrentUserService())
    setAuthMessage({ text: `Cuenta creada. Bienvenido ${username}.`, type: 'success' })
    setTimeout(() => {
      setAuthModalOpen(false)
      setAuthMessage({ text: '', type: 'error' })
      form.reset()
    }, 800)
  }

  const cartItems = useMemo(() => getCartItems(), [cartCount, cartVisible])

  return (
    <div>
      <header>
        <button
          id="accessibilityBtn"
          aria-label="Opciones de accesibilidad"
          title="Accesibilidad"
          className="darkmode-btn"
          type="button"
          onClick={() => setAccessibilityOpen((v) => !v)}
        >
          ♿
        </button>

        {accessibilityOpen && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 1100 }}
              onClick={() => setAccessibilityOpen(false)}
            />
            <div style={{
              position: 'fixed', top: '4rem', right: '1rem', zIndex: 1200,
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '1.2rem', minWidth: '220px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)', color: 'var(--text)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Accesibilidad</h3>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ marginBottom: '.4rem', fontSize: '.9rem' }}>Tema</div>
                <button type="button" className="btn" onClick={() => setDarkMode((v) => !v)}>
                  {darkMode ? '☀️ Modo claro' : '🌙 Modo oscuro'}
                </button>
              </div>

              <div>
                <div style={{ marginBottom: '.4rem', fontSize: '.9rem' }}>Tamaño de letra</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <button type="button" className="btn" onClick={() => handleFontSize(-2)}>A−</button>
                  <span style={{ minWidth: '2.5rem', textAlign: 'center' }}>{fontSize}px</span>
                  <button type="button" className="btn" onClick={() => handleFontSize(2)}>A+</button>
                </div>
              </div>

              <button type="button" className="btn" style={{ marginTop: '1rem', width: '100%' }}
                onClick={() => setAccessibilityOpen(false)}>
                Cerrar
              </button>
            </div>
          </>
        )}
        <button
          id="navToggle"
          className="nav-toggle"
          aria-label="Abrir menú"
          type="button"
          onClick={() => setNavOpen((value) => !value)}
        >
          ☰
        </button>
        <div className={`logo-nav${navOpen ? ' open' : ''}`}>
          <div className="logo-space">
            <img src="images/logo.png" alt="Logo" className="logo" />
          </div>
          <nav>
            <ul>
              <li>
                <a href="/#hero">Inicio</a>
              </li>
              <li>
                <a href="/#tienda">Tienda</a>
              </li>
              <li>
                <a href="/#subastas">Subastas</a>
              </li>
              <li>
                <a href="/#contacto">Contacto soporte</a>
              </li>
            </ul>
          </nav>
          <div className="header-actions">
            <label htmlFor="siteSearch" className="sr-only">
              Buscar productos
            </label>
            <input
              id="siteSearch"
              className="site-search"
              placeholder="Buscar productos..."
              aria-label="Buscar productos"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button
              id="loginBtn"
              className="login-btn"
              aria-label={authUser ? 'Cuenta' : 'Iniciar sesión'}
              type="button"
              onClick={handleAuthButton}
            >
              {authUser ? `👤 ${authUser.username}` : '👤'}
            </button>
            <button
              id="cartBtn"
              className="cart-btn"
              aria-label="Abrir carrito"
              type="button"
              onClick={() => setCartVisible((visible) => !visible)}
            >
              🛒 <span id="cartCount" className="cart-count">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      <CartPanel
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        onChangeQty={handleChangeQty}
        onRemove={handleRemoveItem}
        onClear={handleClearCart}
      />

      <div className={`modal${authModalOpen ? ' active' : ''}`} role="dialog" aria-labelledby="authModalTitle" aria-hidden={!authModalOpen}>
        <div className="modal-overlay" onClick={() => setAuthModalOpen(false)} />
        <div className="modal-content">
          <button id="closeModal" className="modal-close" aria-label="Cerrar modal" type="button" onClick={() => setAuthModalOpen(false)}>
            ×
          </button>
          <h2 id="authModalTitle">Acceso</h2>
          <div className="tab-buttons">
            <button type="button" className={`tab-btn${authTab === 'login' ? ' active' : ''}`} onClick={() => setAuthTab('login')}>
              Iniciar Sesión
            </button>
            <button type="button" className={`tab-btn${authTab === 'register' ? ' active' : ''}`} onClick={() => setAuthTab('register')}>
              Registrarse
            </button>
          </div>
          <form id="authForm" className="tab-content active" onSubmit={handleAuthSubmit}>
            {authTab === 'register' && (
              <>
                <div className="form-group">
                  <label htmlFor="registerUsername">Usuario</label>
                  <input type="text" id="registerUsername" name="username" placeholder="Nombre de usuario" required />
                </div>
              </>
            )}
            <div className="form-group">
              <label htmlFor="authEmail">Email</label>
              <input type="email" id="authEmail" name="email" placeholder="usuario@ejemplo.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="authPassword">Contraseña</label>
              <input type="password" id="authPassword" name="password" placeholder="Contraseña" required />
            </div>
            {authTab === 'register' && (
              <div className="form-group">
                <label htmlFor="registerConfirmPassword">Confirmar contraseña</label>
                <input type="password" id="registerConfirmPassword" name="confirmPassword" placeholder="Repite la contraseña" required />
              </div>
            )}
            <div className={`message${authMessage.type === 'success' ? ' message--success' : ' message--error'}`} aria-live="polite">
              {authMessage.text}
            </div>
            <button type="submit" className="btn">
              {authTab === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Home searchQuery={searchTerm} onAddToCart={handleAddToCart} />} />
        <Route path="/product" element={<Product onAddToCart={handleAddToCart} />} />
        <Route path="/product/:id" element={<Product onAddToCart={handleAddToCart} />} />
      </Routes>
    </div>
  )
}
