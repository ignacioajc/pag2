import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

// XSS sanitization helper
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export default function AdminPanel({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  formatPrice,
  rates,
  currency
}) {
  const [editingId, setEditingId] = useState(null)
  
  // Form states
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Artes Marciales')
  const [priceInput, setPriceInput] = useState('')
  const [imgUrl, setImgUrl] = useState('images/basketball.svg')
  const [customCategory, setCustomCategory] = useState('')
  const [useCustomCategory, setUseCustomCategory] = useState(false)

  // Validation / Message states
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // Pre-calculated currency conversions for preview
  const parsedPrice = parseFloat(priceInput) || 0
  const previewUSD = useMemo(() => {
    if (!rates || isNaN(parsedPrice)) return 0
    return parsedPrice * (rates.USD || 1)
  }, [parsedPrice, rates])

  const previewCLP = useMemo(() => {
    if (!rates || isNaN(parsedPrice)) return 0
    return parsedPrice * (rates.CLP || 1)
  }, [parsedPrice, rates])

  // Reset form helper
  const resetForm = () => {
    setEditingId(null)
    setTitle('')
    setCategory('Artes Marciales')
    setPriceInput('')
    setImgUrl('images/basketball.svg')
    setCustomCategory('')
    setUseCustomCategory(false)
    setFormError('')
  }

  // Handle Edit click
  const handleEditClick = (product) => {
    setEditingId(product.id)
    setTitle(product.title)
    
    // Check if category is standard
    const isStandard = categories.some((c) => c.title === product.category)
    if (isStandard) {
      setCategory(product.category)
      setUseCustomCategory(false)
    } else {
      setCustomCategory(product.category)
      setUseCustomCategory(true)
    }
    
    setPriceInput(product.price.toString())
    setImgUrl(product.img)
    setFormError('')
    setFormSuccess('')
  }

  // Handle Form Submit (Add or Update)
  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    // Validate fields
    const trimmedTitle = title.trim()
    const finalCategory = useCustomCategory ? customCategory.trim() : category
    const parsedPriceValue = parseFloat(priceInput)

    if (!trimmedTitle) {
      setFormError('El nombre del artículo es obligatorio.')
      return
    }

    if (!finalCategory) {
      setFormError('La categoría es obligatoria.')
      return
    }

    if (isNaN(parsedPriceValue) || parsedPriceValue <= 0) {
      setFormError('El precio debe ser un número válido y mayor que cero.')
      return
    }

    // Apply sanitization to inputs to prevent XSS (Indicator 2)
    const sanitizedTitle = sanitizeInput(trimmedTitle)
    const sanitizedCategory = sanitizeInput(finalCategory)
    const sanitizedImg = sanitizeInput(imgUrl)

    const productData = {
      title: sanitizedTitle,
      category: sanitizedCategory,
      price: parsedPriceValue,
      img: sanitizedImg
    }

    if (editingId) {
      // Update operation
      onUpdateProduct({ ...productData, id: editingId })
      setFormSuccess('¡Artículo actualizado correctamente!')
    } else {
      // Create operation
      onAddProduct(productData)
      setFormSuccess('¡Artículo añadido al catálogo correctamente!')
    }

    resetForm()
    // Clear success message after 3 seconds
    setTimeout(() => setFormSuccess(''), 3000)
  }

  // Confirm delete handler
  const handleDeleteClick = (id, name) => {
    const confirmed = window.confirm(`¿Seguro que deseas eliminar "${name}" del catálogo?`)
    if (confirmed) {
      onDeleteProduct(id)
      setFormSuccess('Artículo eliminado correctamente.')
      setTimeout(() => setFormSuccess(''), 3000)
      if (editingId === id) {
        resetForm()
      }
    }
  }

  return (
    <main style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" className="btn" style={{ textDecoration: 'none' }}>
          ← Volver a la Tienda
        </Link>
      </div>

      <h1 style={{ marginBottom: '.5rem', color: 'var(--accent)' }}>Administración del Catálogo</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
        Crea, edita o elimina los artículos del inventario deportivo. Los precios se guardan en Euros (€) y se convierten automáticamente.
      </p>

      {formSuccess && (
        <div style={{
          background: '#d1fae5',
          color: '#065f46',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          border: '1px solid #a7f3d0',
          fontWeight: 600
        }}>
          ✅ {formSuccess}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Form Card (Create/Update) */}
        <section style={{
          background: 'var(--panel, #f9f9f9)',
          padding: '2rem',
          borderRadius: '8px',
          border: '1px solid var(--border, #eee)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.4rem' }}>
            {editingId ? '✏️ Editar Artículo' : '➕ Agregar Artículo'}
          </h2>

          {formError && (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '.8rem',
              borderRadius: '4px',
              marginBottom: '1.2rem',
              border: '1px solid #fca5a5',
              fontSize: '.9rem'
            }}>
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label htmlFor="prodTitle" style={{ fontWeight: 600, display: 'block', marginBottom: '.4rem' }}>
                Nombre del Artículo
              </label>
              <input
                type="text"
                id="prodTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Balón de Rugby Pro"
                style={{
                  width: '100%',
                  padding: '.6rem',
                  border: '1px solid var(--border, #ccc)',
                  borderRadius: '4px',
                  background: 'var(--search-bg, #fff)',
                  color: 'var(--text, #333)'
                }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '.4rem' }}>
                Categoría
              </label>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '.5rem' }}>
                <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    checked={!useCustomCategory}
                    onChange={() => setUseCustomCategory(false)}
                    style={{ marginRight: '.4rem' }}
                  />
                  Existente
                </label>
                <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    checked={useCustomCategory}
                    onChange={() => setUseCustomCategory(true)}
                    style={{ marginRight: '.4rem' }}
                  />
                  Personalizada
                </label>
              </div>

              {!useCustomCategory ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '.6rem',
                    border: '1px solid var(--border, #ccc)',
                    borderRadius: '4px',
                    background: 'var(--search-bg, #fff)',
                    color: 'var(--text, #333)'
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.title} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Escribe la nueva categoría"
                  style={{
                    width: '100%',
                    padding: '.6rem',
                    border: '1px solid var(--border, #ccc)',
                    borderRadius: '4px',
                    background: 'var(--search-bg, #fff)',
                    color: 'var(--text, #333)'
                  }}
                  required
                />
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label htmlFor="prodPrice" style={{ fontWeight: 600, display: 'block', marginBottom: '.4rem' }}>
                Precio Base (Euros €)
              </label>
              <input
                type="number"
                id="prodPrice"
                step="0.01"
                min="0.01"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="Ej. 49.99"
                style={{
                  width: '100%',
                  padding: '.6rem',
                  border: '1px solid var(--border, #ccc)',
                  borderRadius: '4px',
                  background: 'var(--search-bg, #fff)',
                  color: 'var(--text, #333)',
                  boxSizing: 'border-box'
                }}
                required
              />
              
              {/* Real-time currency conversion preview (Indicator 3 & 5) */}
              {parsedPrice > 0 && (
                <div style={{
                  marginTop: '.6rem',
                  padding: '.6rem',
                  background: 'rgba(var(--accent-rgb, 179, 157, 219), 0.1)',
                  borderRadius: '4px',
                  fontSize: '.85rem',
                  borderLeft: '3px solid var(--accent, #b39ddb)',
                  color: 'var(--text)'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '.2rem' }}>Previsualización del cambio:</div>
                  <div>• USD: <strong>${previewUSD.toFixed(2)} USD</strong></div>
                  <div>• CLP: <strong>${Math.round(previewCLP).toLocaleString('es-CL')} CLP</strong></div>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="prodImg" style={{ fontWeight: 600, display: 'block', marginBottom: '.4rem' }}>
                Imagen del Artículo
              </label>
              <select
                id="prodImg"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '.6rem',
                  border: '1px solid var(--border, #ccc)',
                  borderRadius: '4px',
                  background: 'var(--search-bg, #fff)',
                  color: 'var(--text, #333)',
                  marginBottom: '.5rem'
                }}
              >
                <option value="images/bball-shoe.svg">Zapatillas Baloncesto (SVG)</option>
                <option value="images/basketball.svg">Balón Baloncesto (SVG)</option>
                <option value="images/boxing-gloves.svg">Guantes Boxeo (SVG)</option>
                <option value="images/kids-gi.svg">Kimono Artes Marciales (SVG)</option>
                <option value="images/football-boot.svg">Botas de Fútbol (SVG)</option>
                <option value="images/football.svg">Balón de Fútbol (SVG)</option>
              </select>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>O escribe una ruta de imagen personalizada:</div>
              <input
                type="text"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                placeholder="images/mi_imagen.jpg"
                style={{
                  width: '100%',
                  padding: '.6rem',
                  border: '1px solid var(--border, #ccc)',
                  borderRadius: '4px',
                  background: 'var(--search-bg, #fff)',
                  color: 'var(--text, #333)',
                  marginTop: '.3rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn" style={{ flex: 1, padding: '.7rem' }}>
                {editingId ? 'Guardar Cambios' : 'Añadir Producto'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn"
                  onClick={resetForm}
                  style={{ background: '#666', color: '#fff', padding: '.7rem' }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Products List Table */}
        <section style={{
          background: 'var(--panel, #f9f9f9)',
          padding: '2rem',
          borderRadius: '8px',
          border: '1px solid var(--border, #eee)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          overflowX: 'auto'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.4rem' }}>
            📋 Artículos Registrados ({products.length})
          </h2>

          {products.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 0' }}>
              No hay artículos en el catálogo. ¡Añade uno nuevo!
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border, #ddd)' }}>
                  <th style={{ padding: '.7rem 0' }}>Miniatura</th>
                  <th style={{ padding: '.7rem' }}>Nombre / Categoría</th>
                  <th style={{ padding: '.7rem', textAlign: 'right' }}>Precio Base</th>
                  <th style={{ padding: '.7rem', textAlign: 'right' }}>Equivalencias</th>
                  <th style={{ padding: '.7rem', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const pUSD = p.price * (rates.USD || 1)
                  const pCLP = p.price * (rates.CLP || 1)
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border, #eee)' }}>
                      <td style={{ padding: '.7rem 0', width: '50px' }}>
                        <img
                          src={p.img}
                          alt={p.title}
                          style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'contain',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            background: '#fff'
                          }}
                          onError={(e) => {
                            e.target.src = 'images/basketball.svg'
                          }}
                        />
                      </td>
                      <td style={{ padding: '.7rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{p.title}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{p.category}</div>
                      </td>
                      <td style={{ padding: '.7rem', textAlign: 'right', fontWeight: '600' }}>
                        €{p.price.toFixed(2)}
                      </td>
                      <td style={{ padding: '.7rem', textAlign: 'right', fontSize: '.8rem', color: '#666' }}>
                        <div>${pUSD.toFixed(2)} USD</div>
                        <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>
                          ${Math.round(pCLP).toLocaleString('es-CL')} CLP
                        </div>
                      </td>
                      <td style={{ padding: '.7rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '.4rem', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleEditClick(p)}
                            style={{
                              background: 'var(--accent, #b39ddb)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '.3rem .6rem',
                              cursor: 'pointer',
                              fontSize: '.8rem'
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(p.id, p.title)}
                            style={{
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '.3rem .6rem',
                              cursor: 'pointer',
                              fontSize: '.8rem'
                            }}
                          >
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  )
}
