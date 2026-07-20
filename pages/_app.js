import { useState, useEffect } from 'react'
import '../styles/globals.css'

const LOGO_URL = 'https://gepusjdevpaxxkrgzyeb.supabase.co/storage/v1/object/public/assets/ChatGPT%20Image%2017%20jul%202026,%2015_11_05.png'

export default function App({ Component, pageProps }) {
  const [autenticado, setAutenticado] = useState(false)
  const [rol, setRol] = useState(null)
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const r = sessionStorage.getItem('rol')
    if (r) { setRol(r); setAutenticado(true) }
  }, [])

  function login(e) {
    e.preventDefault()
    if (pass === 'Oficina2084') {
      sessionStorage.setItem('rol', 'admin')
      setRol('admin'); setAutenticado(true); setError('')
    } else if (pass === 'Taller2084') {
      sessionStorage.setItem('rol', 'empleado')
      setRol('empleado'); setAutenticado(true); setError('')
    } else {
      setError('Contraseña incorrecta')
    }
  }

  function cerrarSesion() {
    sessionStorage.removeItem('rol')
    setRol(null)
    setAutenticado(false)
    setPass('')
  }

  if (!autenticado) return (
    <div style={{minHeight:'100vh',background:'#0F1117',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <div style={{background:'#1A1A2E',borderRadius:'16px',padding:'2.5rem',width:'100%',maxWidth:'380px',border:'1px solid #2D3748',boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <img src={LOGO_URL} alt="DiFiore" style={{width:'200px',marginBottom:'1rem'}}/>
          <div style={{fontSize:'12px',color:'#64748B',letterSpacing:'3px',textTransform:'uppercase'}}>Sistema de gestión</div>
        </div>
        <form onSubmit={login}>
          <div style={{marginBottom:'1rem'}}>
            <label style={{fontSize:'11px',color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.5px',fontWeight:'600',display:'block',marginBottom:'6px'}}>Contraseña</label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="Ingresá tu contraseña"
              autoFocus
              style={{width:'100%',padding:'10px 14px',borderRadius:'8px',border:'1px solid #2D3748',background:'#0F1117',color:'#F1F5F9',fontSize:'14px',fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}
            />
          </div>
          {error && <div style={{color:'#F87171',fontSize:'13px',marginBottom:'12px',textAlign:'center'}}>{error}</div>}
          <button type="submit" style={{width:'100%',padding:'11px',borderRadius:'8px',background:'#2563EB',color:'#fff',border:'none',fontSize:'14px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )

  return <Component {...pageProps} rol={rol} cerrarSesion={cerrarSesion} />
}
