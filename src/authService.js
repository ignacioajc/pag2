const USERS_KEY = 'site_users_v1'
const CURRENT_USER_KEY = 'current_user_v1'

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch {
    // ignore storage errors
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY))
  } catch {
    return null
  }
}

function saveCurrentUser(user) {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  } catch {
    // ignore storage errors
  }
}

export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function initUsersFromJSON() {
  const existing = loadUsers()
  if (existing.length) return Promise.resolve()

  return fetch('/js/users.json', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) return []
      return response.json()
    })
    .then((data) => {
      const users = []
      for (const user of data) {
        if (!user.email || !user.password) continue
        users.push({
          id: crypto.randomUUID(),
          username: user.username || user.email.split('@')[0],
          email: user.email,
          password: user.password,
          createdAt: Date.now()
        })
      }
      if (users.length) saveUsers(users)
    })
    .catch(() => {
      // ignore initialization errors
    })
}

export function getCurrentUserService() {
  return getCurrentUser()
}

export async function registerUser({ username, email, password }) {
  const existingUser = loadUsers().find((user) => user.email.toLowerCase() === email.toLowerCase())
  if (existingUser) {
    return { ok: false, message: 'Ya existe una cuenta con ese email.' }
  }

  const passwordHash = await hashPassword(password)
  const user = {
    id: crypto.randomUUID(),
    username,
    email,
    passwordHash,
    createdAt: Date.now()
  }

  const users = loadUsers()
  users.push(user)
  saveUsers(users)
  saveCurrentUser({ id: user.id, username: user.username, email: user.email })
  return { ok: true, user }
}

export async function loginUser({ email, password }) {
  const user = loadUsers().find((entry) => entry.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    return { ok: false, message: 'Usuario no encontrado.' }
  }

  const passwordHash = await hashPassword(password)
  if (passwordHash !== user.passwordHash) {
    return { ok: false, message: 'Contraseña incorrecta.' }
  }

  saveCurrentUser({ id: user.id, username: user.username, email: user.email })
  return { ok: true, user }
}

export function logoutUser() {
  try {
    localStorage.removeItem(CURRENT_USER_KEY)
  } catch {
    // ignore
  }
}
