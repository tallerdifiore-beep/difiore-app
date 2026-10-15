import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import '../styles/globals.css'

// Contraseña de acceso, configurable en Vercel (variable NEXT_PUBLIC_PASS).
const PASS = process.env.NEXT_PUBLIC_PASS || 'Herramientas2084'
const NOMBRE_NEGOCIO = process.env.NEXT_PUBLIC_NOMBRE_NEGOCIO || 'Esteban Herramientas'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [autenticado, setAutenticado] = useState(false)
  const [listo, setListo] = useState(false)
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('herr_ok') === '1') setAutenticado(true)
    setListo(true)
  }, [])

  function login(e) {
    e.preventDefault()
    if (pass === PASS) {
      localStorage.setItem('herr_ok', '1')
      setAutenticado(true); setError('')
    } else {
      setError('Contraseña incorrecta'); setPass('')
    }
  }
  function salir() {
    localStorage.removeItem('herr_ok')
    setAutenticado(false)
  }

  const head = (
    <Head>
      <title>{NOMBRE_NEGOCIO} · Clientes y pagos</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#050608" />
      <link rel="icon" href="/icono.png" />
      <link rel="apple-touch-icon" href="/icono.png" />
    </Head>
  )

  if (!listo) return head

  if (!autenticado) return (
    <>
      {head}
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <form onSubmit={login} className="card" style={{ width: '100%', maxWidth: 420, padding: 28 }}>
          <img src="/logo.png" alt={NOMBRE_NEGOCIO} className="logo-grande" />
          <label className="lbl">Contraseña</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} autoFocus placeholder="Ingresá tu contraseña" />
          {error && <div className="error">{error}</div>}
          <button className="btn" style={{ width: '100%', marginTop: 14 }}>Ingresar</button>
        </form>
      </div>
    </>
  )

  const ruta = router.pathname
  return (
    <>
      {head}
      <div className="wrap">
        <div className="top">
          <Link href="/"><img src="/logo.png" alt={NOMBRE_NEGOCIO} className="logo" /></Link>
          <div className="nav">
            <Link href="/" className={ruta === '/' || ruta.startsWith('/cliente') ? 'activo' : ''}>Clientes</Link>
            <Link href="/movimientos" className={ruta === '/movimientos' ? 'activo' : ''}>Movimientos</Link>
            <button onClick={salir}>Salir</button>
          </div>
        </div>
        <Component {...pageProps} />
      </div>
    </>
  )
}
