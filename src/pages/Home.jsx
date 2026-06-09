import React, { useEffect, useState } from 'react'

export default function Home() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch('/users.json')
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => setUsers([]))
  }, [])

  return (
    <main>
      <h1>Bienvenido</h1>
      <section>
        <h2>Usuarios</h2>
        <ul>
          {users.map((u, i) => (
            <li key={u.id ?? i}>{u.name ?? u.email ?? JSON.stringify(u)}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
