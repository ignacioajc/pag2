import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Product from './pages/Product'
import AdminPanel from './pages/AdminPanel'
import {
  addToCart,
  changeCartQty,
  clearCart,
  getCartCount,
  getCartItems,
  removeFromCart
} from './cartService'
import { getCurrentUserService, initUsersFromJSON, loginUser, logoutUser, registerUser } from './authService'

function CartPanel({ visible, onClose, onChangeQty, onRemove, onClear, formatPrice }) {
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
                <div style={{ color: 'var(--muted)' }}>{formatPrice(item.price)}</div>
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
            <strong>{formatPrice(total)}</strong>
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

  // -- EVA4 States --
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [currency, setCurrency] = useState(() => localStorage.getItem('shop_currency_v1') || 'EUR')
  const [rates, setRates] = useState({ EUR: 1, USD: 1.09, CLP: 980 })
  const [ratesLoading, setRatesLoading] = useState(true)
  const [ratesError, setRatesError] = useState(null)

  // Load products and categories from localStorage orproductos.json
  useEffect(() => {
    const PRODUCTS_KEY = 'shop_products_v1'
    const CATEGORIES_KEY = 'shop_categories_v1'
    
    const localProducts = localStorage.getItem(PRODUCTS_KEY)
    const localCategories = localStorage.getItem(CATEGORIES_KEY)
    
    if (localProducts && localCategories) {
      setProducts(JSON.parse(localProducts))
      setCategories(JSON.parse(localCategories))
    } else {
      fetch('/js/productos.json')
        .then((res) => {
          if (!res.ok) throw new Error('Error al cargar productos iniciales.')
          return res.json()
        })
        .then((data) => {
          setProducts(data.products)
          setCategories(data.categories)
          localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data.products))
          localStorage.setItem(CATEGORIES_KEY, JSON.stringify(data.categories))
        })
        .catch((err) => {
          console.error('Error al inicializar catálogo:', err)
        })
    }
  }, [])

  // Currency API Fetch
  const fetchRates = async () => {
    setRatesLoading(true)
    setRatesError(null)
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/EUR')
      if (!res.ok) throw new Error('Error al contactar con la API de tipos de cambio.')
      const data = await res.json()
      if (data && data.rates) {
        setRates(data.rates)
      } else {
        throw new Error('Datos de divisas no válidos.')
      }
    } catch (err) {
      setRatesError('Error de red al actualizar divisas. Usando tasas aproximadas.')
      console.error(err)
    } finally {
      setRatesLoading(false)
    }
  }

  useEffect(() => {
    fetchRates()
  }, [])

  useEffect(() => {
    localStorage.setItem('shop_currency_v1', currency)
  }, [currency])

  const formatPrice = (priceInEUR) => {
    const rate = rates[currency] || 1
    const converted = (priceInEUR || 0) * rate
    if (currency === 'CLP') {
      return `$${Math.round(converted).toLocaleString('es-CL')} CLP`
    }
    if (currency === 'USD') {
      return `$${converted.toFixed(2)} USD`
    }
    return `€${converted.toFixed(2)}`
  }

  const saveProductsToStorage = (updatedProducts) => {
    setProducts(updatedProducts)
    localStorage.setItem('shop_products_v1', JSON.stringify(updatedProducts))
  }

  const handleAddProduct = (newProduct) => {
    const updated = [...products, { ...newProduct, id: crypto.randomUUID() }]
    saveProductsToStorage(updated)
  }

  const handleUpdateProduct = (updatedProduct) => {
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    saveProductsToStorage(updated)
  }

  const handleDeleteProduct = (productId) => {
    const updated = products.filter((p) => p.id !== productId)
    saveProductsToStorage(updated)
  }

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

  return (
    <div>
      {ratesError && (
        <div style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '.8rem',
          textAlign: 'center',
          fontSize: '.9rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          borderBottom: '1px solid #fca5a5',
          fontWeight: 600
        }}>
          <span>⚠️ {ratesError}</span>
          <button 
            type="button" 
            onClick={fetchRates} 
            style={{
              background: '#991b1b', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              padding: '.3rem .7rem', 
              cursor: 'pointer',
              fontSize: '.8rem'
            }}
          >
            Reintentar
          </button>
        </div>
      )}
      {ratesLoading && !ratesError && (
        <div style={{
          background: '#e0f2fe',
          color: '#0369a1',
          padding: '.5rem',
          textAlign: 'center',
          fontSize: '.85rem',
          borderBottom: '1px solid #bae6fd',
          fontWeight: 500
        }}>
          🔄 Cargando tipos de cambio de divisas en tiempo real...
        </div>
      )}

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
            <Link to="/"><img src="/images/logo.png" alt="Logo" className="logo" /></Link>
          </div>
          <nav>
            <ul>
              <li>
                <Link to="/">Inicio</Link>
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
              <li>
                <Link to="/admin" style={{ fontWeight: 'bold', color: 'var(--accent)' }}>Administración</Link>
              </li>
            </ul>
          </nav>
          <div className="header-actions">
            <select
              className="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Seleccionar divisa"
              style={{
                background: 'var(--bg-card, #2c2c2c)',
                color: 'var(--text, #fff)',
                border: '1px solid var(--border, #444)',
                borderRadius: '4px',
                padding: '.35rem .6rem',
                marginRight: '.5rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="CLP">CLP ($)</option>
            </select>
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
        formatPrice={formatPrice}
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
        <Route 
          path="/" 
          element={
            <Home 
              searchQuery={searchTerm} 
              onAddToCart={handleAddToCart} 
              products={products}
              categories={categories}
              formatPrice={formatPrice}
            />
          } 
        />
        <Route 
          path="/product" 
          element={
            <Product 
              onAddToCart={handleAddToCart} 
              products={products}
              formatPrice={formatPrice}
              rates={rates}
              currency={currency}
            />
          } 
        />
        <Route 
          path="/product/:id" 
          element={
            <Product 
              onAddToCart={handleAddToCart} 
              products={products}
              formatPrice={formatPrice}
              rates={rates}
              currency={currency}
            />
          } 
        />
        <Route 
          path="/admin" 
          element={
            <AdminPanel 
              products={products} 
              categories={categories} 
              onAddProduct={handleAddProduct} 
              onUpdateProduct={handleUpdateProduct} 
              onDeleteProduct={handleDeleteProduct} 
              formatPrice={formatPrice}
              rates={rates}
              currency={currency}
            />
          } 
        />
      </Routes>
    </div>
  )
}
