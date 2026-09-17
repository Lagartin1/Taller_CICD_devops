import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL
type ApiResult = { message?: string; status?: string; ok?: boolean; user?: unknown; errors?: string[] }

async function callApi(path: string, options: RequestInit = {}) {
  if (!API_URL) throw new Error('Falta configurar VITE_API_URL en frontend/.env')
  const response = await fetch(`${API_URL}${path}`, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers } })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || data.errors?.join(', ') || 'La API devolvió un error')
  return data as ApiResult
}

function App() {
  const [result, setResult] = useState<ApiResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', email: '', name: '', user_type: 'user' })
  const run = async (action: () => Promise<ApiResult>) => { setLoading(true); setError(''); try { setResult(await action()) } catch (err) { setError(err instanceof Error ? err.message : 'Error inesperado') } finally { setLoading(false) } }
  const register = (event: FormEvent) => { event.preventDefault(); void run(() => callApi('/auth/register', { method: 'POST', body: JSON.stringify(form) })) }
  const login = () => void run(() => callApi('/auth/login', { method: 'POST', body: JSON.stringify({ username: form.username, password: form.password }) }))
  const update = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value })
  return <main className="shell">
    <header><span className="eyebrow">API playground</span><h1>Recordando</h1><p>Una consola pequeña para probar autenticación y sesiones.</p></header>
    <section className="workspace">
      <form className="panel" onSubmit={register}><div className="panel-heading"><span>01</span><h2>Crear usuario</h2></div>
        <label>Nombre<input required value={form.name} onChange={e => update('name', e.target.value)} /></label>
        <label>Usuario<input required value={form.username} onChange={e => update('username', e.target.value)} /></label>
        <label>Email<input required type="email" value={form.email} onChange={e => update('email', e.target.value)} /></label>
        <label>Contraseña<input required type="password" value={form.password} onChange={e => update('password', e.target.value)} /></label>
        <button disabled={loading} type="submit">Registrar</button><small>8+ caracteres, mayúscula, minúscula, número y símbolo.</small>
      </form>
      <section className="panel actions"><div className="panel-heading"><span>02</span><h2>Probar sesión</h2></div><p className="hint">Usa el mismo usuario y contraseña del formulario.</p>
        <button disabled={loading} onClick={login}>Iniciar sesión</button><button disabled={loading} className="secondary" onClick={() => void run(() => callApi('/protected'))}>Consultar protegida</button><button disabled={loading} className="secondary" onClick={() => void run(() => callApi('/auth/refresh', { method: 'POST' }))}>Refrescar token</button><button disabled={loading} className="quiet" onClick={() => void run(() => callApi('/auth/logout', { method: 'POST' }))}>Cerrar sesión</button><button disabled={loading} className="health" onClick={() => void run(() => callApi('/health'))}>Comprobar health</button>
      </section>
    </section>
    <section className="output"><div className="panel-heading"><span>03</span><h2>Respuesta</h2></div><pre className={error ? 'error' : ''}>{error || (result ? JSON.stringify(result, null, 2) : 'Todavía no hay respuestas.')}</pre></section>
  </main>
}
export default App
