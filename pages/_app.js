import { useState, useEffect } from 'react'
import '../styles/globals.css'
import styles from '../styles/App.module.css'
const LOGO_URL = 'https://gepusjdevpaxxkrgzyeb.supabase.co/storage/v1/object/public/logo-difiore/logo-difiore.png'

export default function App({ Component, pageProps }) {
  const [autenticado, setAutenticado] = useState(false)
  const [rol, setRol] = useState(null)
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [mayusActivo, setMayusActivo] = useState(false)
  const [verPass, setVerPass] = useState(false)

  useEffect(() => {
    const r = sessionStorage.getItem('rol')
    if (r) { setRol(r); setAutenticado(true) }
  }, [])

  // Mayúscula automática en toda la app: se reescribe el valor del campo antes de que
  // React procese el evento, así se guarda en mayúscula sin tocar cada onChange.
  useEffect(() => {
    // Setter nativo del input/textarea (sin el "value tracker" que React le agrega a cada
    // elemento). Si reescribimos el valor con el setter normal, React no se entera del
    // cambio y en el próximo render pisa el campo con su estado viejo — eso es lo que
    // borraba o dejaba incompletos los nombres al escribir rápido.
    const setterInput = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    const setterTextarea = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set

    function esCampoDeTexto(el) {
      if (!el || el.dataset?.noUpper !== undefined) return false
      const tag = el.tagName
      if (tag === 'TEXTAREA') return true
      if (tag === 'INPUT') {
        const tipo = (el.type || 'text').toLowerCase()
        return tipo === 'text' || tipo === 'search'
      }
      return false
    }
    function aplicarMayuscula(el) {
      const mayus = el.value.toUpperCase()
      if (mayus === el.value) return
      const inicio = el.selectionStart
      const fin = el.selectionEnd
      const setter = el.tagName === 'TEXTAREA' ? setterTextarea : setterInput
      if (setter) setter.call(el, mayus); else el.value = mayus
      if (inicio !== null && fin !== null) { try { el.setSelectionRange(inicio, fin) } catch {} }
      // Avisamos a React del cambio disparando un input event nuevo: como usamos el setter
      // nativo, React lo toma como un cambio real y actualiza su estado con el valor final.
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
    function alEscribir(e) {
      const el = e.target
      if (!esCampoDeTexto(el)) return
      // Mientras el navegador está componiendo un caracter (tildes con teclado compuesto,
      // teclados de celular con autocorrección, IME) no tocamos el valor: reescribirlo a
      // mitad de la composición hace que el navegador pierda esa letra y el texto quede
      // incompleto o se borre. Se aplica la mayúscula recién cuando termina de componer.
      if (e.isComposing) return
      aplicarMayuscula(el)
    }
    function alTerminarComposicion(e) {
      const el = e.target
      if (!esCampoDeTexto(el)) return
      aplicarMayuscula(el)
    }
    document.addEventListener('input', alEscribir, true)
    document.addEventListener('compositionend', alTerminarComposicion, true)
    return () => {
      document.removeEventListener('input', alEscribir, true)
      document.removeEventListener('compositionend', alTerminarComposicion, true)
    }
  }, [])

  function revisarMayus(e) {
    if (typeof e.getModifierState === 'function') {
      setMayusActivo(e.getModifierState('CapsLock'))
    }
  }

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
      setPass('')
    }
  }

  function cerrarSesion() {
    sessionStorage.removeItem('rol')
    setRol(null)
    setAutenticado(false)
    setPass('')
  }

  // Páginas públicas (ej. /service, la del QR): no piden contraseña
  if (Component.publica) return <Component {...pageProps} />

  if (!autenticado) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Barlow',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",padding:'1rem'}}>
      <div style={{background:'#12151D',borderRadius:'16px',padding:'2.5rem',width:'100%',maxWidth:'380px',border:'2px solid #262B38',boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
        <div style={{textAlign:'center',marginBottom:'1.75rem'}}>
          <img src={LOGO_URL} alt="DiFiore" style={{width:'200px',marginBottom:'12px'}}/>
          <div style={{height:'2px',background:'linear-gradient(90deg,#1B4CFF,#2FA8FF)',opacity:.9,margin:'0 auto 12px',maxWidth:'140px'}}/>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:'12px',fontWeight:'600',color:'#6B7488',letterSpacing:'.25em',textTransform:'uppercase'}}>Sistema de gestión</div>
        </div>
        <form onSubmit={login}>
          <div style={{marginBottom:'1.1rem'}}>
            <label style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:'11px',color:'#9AA3B8',textTransform:'uppercase',letterSpacing:'.04em',fontWeight:'700',display:'block',marginBottom:'6px'}}>Contraseña</label>
            <div style={{position:'relative'}}>
              <input
                type={verPass ? 'text' : 'password'}
                data-no-upper
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={revisarMayus}
                onKeyUp={revisarMayus}
                placeholder="Ingresá tu contraseña"
                autoFocus
                style={{width:'100%',padding:'11px 70px 11px 14px',borderRadius:'8px',border:'1.5px solid #343B4B',background:'#171B25',color:'#EEF1F7',fontSize:'14px',fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}
              />
              <button
                type="button"
                onClick={() => setVerPass(v => !v)}
                style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed',sans-serif",fontSize:'11px',fontWeight:'700',letterSpacing:'.03em',textTransform:'uppercase',color:'#2FA8FF',padding:'4px'}}
                tabIndex={-1}
              >
                {verPass ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>
          {mayusActivo && <div style={{color:'#F5B700',fontSize:'12px',marginBottom:'12px',textAlign:'center'}}>Bloq Mayús activado</div>}
          {error && <div style={{color:'#FF4D4F',fontSize:'13px',marginBottom:'12px',textAlign:'center'}}>{error}</div>}
          <button type="submit" className={styles.btnPrimary} style={{width:'100%',padding:'12px'}}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
  return <Component {...pageProps} rol={rol} cerrarSesion={cerrarSesion} />
}
