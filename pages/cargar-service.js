// Pantalla para cargar y editar services (queda protegida por el login normal de la app).
// Misma estética visual que /service (la pública que ve el cliente).
// Ruta: /cargar-service
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

const LOGO = 'https://gepusjdevpaxxkrgzyeb.supabase.co/storage/v1/object/public/assets/logo-difiore.png'
const norm = s => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
const pretty = p => (p.length === 7 ? `${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5)}` : p.length === 6 ? `${p.slice(0, 3)} ${p.slice(3)}` : p)
const formatNum = v => { const n = (v || '').toString().replace(/\D/g, ''); return n.replace(/\B(?=(\d{3})+(?!\d))/g, '.') }
const parseNum = v => (v || '').toString().replace(/\./g, '')
const fechaAR = f => (f ? new Date(f + 'T12:00:00').toLocaleDateString('es-AR') : '—')

const vacio = {
  id: null, patente: '', fecha: new Date().toISOString().slice(0, 10), km: '',
  aceite: '', filtro_aceite: '', filtro_aire: '', aditivo: '', filtro_combustible: '',
  engrase: false, caja: false, diferencial: false,
  proximo_km: '', correa_km: '', correa_proximo_km: '', observaciones: ''
}

export default function CargarService() {
  const [vista, setVista] = useState('lista') // 'lista' | 'form'
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [form, setForm] = useState(vacio)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => { cargarServicios() }, [])

  async function cargarServicios() {
    setCargando(true)
    const { data } = await supabase.from('services').select('*').order('fecha', { ascending: false }).order('created_at', { ascending: false }).limit(200)
    setServicios(data || [])
    setCargando(false)
  }

  function set(campo, valor) { setForm(f => ({ ...f, [campo]: valor })) }

  function nuevoForm() {
    setForm(vacio); setEditando(false); setMsg(null); setVista('form')
  }

  function abrirEditar(s) {
    setForm({
      id: s.id, patente: pretty(norm(s.patente)), fecha: s.fecha || new Date().toISOString().slice(0, 10),
      km: s.km != null ? formatNum(String(s.km)) : '',
      aceite: s.aceite || '', filtro_aceite: s.filtro_aceite || '', filtro_aire: s.filtro_aire || '',
      aditivo: s.aditivo || '', filtro_combustible: s.filtro_combustible || '',
      engrase: !!s.engrase, caja: !!s.caja, diferencial: !!s.diferencial,
      proximo_km: s.proximo_km != null ? formatNum(String(s.proximo_km)) : '',
      correa_km: s.correa_km != null ? formatNum(String(s.correa_km)) : '',
      correa_proximo_km: s.correa_proximo_km != null ? formatNum(String(s.correa_proximo_km)) : '',
      observaciones: s.observaciones || ''
    })
    setEditando(true); setMsg(null); setVista('form')
  }

  async function guardar(e) {
    e.preventDefault()
    setMsg(null)
    const patente = norm(form.patente)
    if (patente.length < 6) { setMsg({ tipo: 'error', texto: 'La patente no parece completa.' }); return }
    if (!parseNum(form.km)) { setMsg({ tipo: 'error', texto: 'Ingresá los km del service.' }); return }

    setGuardando(true)
    const payload = {
      patente,
      fecha: form.fecha,
      km: Number(parseNum(form.km)) || null,
      aceite: form.aceite || null,
      filtro_aceite: form.filtro_aceite || null,
      filtro_aire: form.filtro_aire || null,
      aditivo: form.aditivo || null,
      filtro_combustible: form.filtro_combustible || null,
      engrase: form.engrase,
      caja: form.caja,
      diferencial: form.diferencial,
      proximo_km: parseNum(form.proximo_km) ? Number(parseNum(form.proximo_km)) : null,
      correa_km: parseNum(form.correa_km) ? Number(parseNum(form.correa_km)) : null,
      correa_proximo_km: parseNum(form.correa_proximo_km) ? Number(parseNum(form.correa_proximo_km)) : null,
      observaciones: form.observaciones || null,
    }
    let error
    if (editando && form.id) {
      ;({ error } = await supabase.from('services').update(payload).eq('id', form.id))
    } else {
      ;({ error } = await supabase.from('services').insert(payload))
    }
    setGuardando(false)
    if (error) { setMsg({ tipo: 'error', texto: 'No se pudo guardar: ' + error.message }); return }
    await cargarServicios()
    setVista('lista')
  }

  async function borrar(s, e) {
    e.stopPropagation()
    if (!window.confirm(`¿Borrar el service de ${pretty(norm(s.patente))} del ${fechaAR(s.fecha)}?`)) return
    const { error } = await supabase.from('services').delete().eq('id', s.id)
    if (error) { setMsg({ tipo: 'error', texto: 'No se pudo borrar: ' + error.message }); return }
    await cargarServicios()
  }

  const serviciosFiltrados = servicios.filter(s => {
    if (!busqueda.trim()) return true
    const q = busqueda.toUpperCase()
    return norm(s.patente).includes(norm(q)) || (s.aceite || '').toUpperCase().includes(q)
  })

  return (
    <>
      <Head>
        <title>Cargar service · DiFiore Performance</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Saira+Extra+Condensed:wght@800&family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap" />
      </Head>

      <div className="wm" aria-hidden="true" />
      <div className="wrap">
        <header className="mast">
          <img className="logoimg mast-logo" src={LOGO} alt="DiFiore Performance" />
          <a href="/" className="volver">← Volver a la app</a>
        </header>

        <section className="hero">
          <h1>{vista === 'lista' ? <>Services <em>cargados</em></> : <>{editando ? 'Editar' : 'Cargar'} <em>service</em></>}</h1>
          <p>{vista === 'lista' ? 'Buscá, revisá o editá cualquier service ya cargado.' : 'Completá los datos del vehículo.'}</p>
        </section>

        {vista === 'lista' && (
          <>
            <div className="row" style={{ marginBottom: 14 }}>
              <input className="search" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="BUSCAR POR PATENTE..." />
              <button className="btn" type="button" onClick={nuevoForm}>+ Nuevo</button>
            </div>

            {cargando && <div className="msg" style={{ color: 'var(--muted)' }}>Cargando…</div>}
            {!cargando && serviciosFiltrados.length === 0 && <div className="msg">No hay services cargados todavía.</div>}

            <div className="lista">
              {serviciosFiltrados.map(s => (
                <div key={s.id} className="itemLista" onClick={() => abrirEditar(s)}>
                  <div className="itemPlate">{pretty(norm(s.patente))}</div>
                  <div className="itemInfo">
                    <span>{fechaAR(s.fecha)}</span>
                    <span>{s.km != null ? formatNum(String(s.km)) + ' km' : '—'}</span>
                  </div>
                  <div className="itemAcciones">
                    <span className="itemEditar">Editar →</span>
                    <button className="itemBorrar" type="button" onClick={e => borrar(s, e)}>Borrar</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {vista === 'form' && (
          <form onSubmit={guardar}>
            <div className="sticker">
              <div className="head">
                <span className="headLabel">Patente</span>
                <input className="plateInput" value={form.patente} onChange={e => set('patente', pretty(norm(e.target.value)).slice(0, 9))} placeholder="AB 123 CD" maxLength={9} spellCheck={false} />
                <input className="dateInput" type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
              </div>

              <div className="sheet">
                <div className="row2">
                  <Campo label="Km actual *"><input inputMode="numeric" value={form.km} onChange={e => set('km', formatNum(e.target.value))} placeholder="85.000" /></Campo>
                  <Campo label="Próximo cambio (km)"><input inputMode="numeric" value={form.proximo_km} onChange={e => set('proximo_km', formatNum(e.target.value))} placeholder="90.000" /></Campo>
                </div>
                <div className="row2">
                  <Campo label="Aceite"><input value={form.aceite} onChange={e => set('aceite', e.target.value)} placeholder="10W40 SINTÉTICO" /></Campo>
                  <Campo label="Filtro de aceite"><input value={form.filtro_aceite} onChange={e => set('filtro_aceite', e.target.value)} placeholder="ORIGINAL" /></Campo>
                </div>
                <div className="row2">
                  <Campo label="Filtro de aire"><input value={form.filtro_aire} onChange={e => set('filtro_aire', e.target.value)} placeholder="ORIGINAL" /></Campo>
                  <Campo label="Filtro de combustible"><input value={form.filtro_combustible} onChange={e => set('filtro_combustible', e.target.value)} placeholder="ORIGINAL" /></Campo>
                </div>
                <Campo label="Aditivo"><input value={form.aditivo} onChange={e => set('aditivo', e.target.value)} placeholder="SÍ / NO / MARCA" /></Campo>

                <div className="checks">
                  <Check label="Engrase" val={form.engrase} onChange={v => set('engrase', v)} />
                  <Check label="Caja" val={form.caja} onChange={v => set('caja', v)} />
                  <Check label="Diferencial" val={form.diferencial} onChange={v => set('diferencial', v)} />
                </div>
              </div>

              <div className="belt">
                <h3>Correa de distribución (opcional)</h3>
                <div className="row2">
                  <Campo label="Hecha a los km"><input inputMode="numeric" value={form.correa_km} onChange={e => set('correa_km', formatNum(e.target.value))} placeholder="60.000" /></Campo>
                  <Campo label="Próximo cambio (km)"><input inputMode="numeric" value={form.correa_proximo_km} onChange={e => set('correa_proximo_km', formatNum(e.target.value))} placeholder="160.000" /></Campo>
                </div>
                <Campo label="Observaciones (si no aplica correa)"><textarea value={form.observaciones} onChange={e => set('observaciones', e.target.value)} placeholder="EJ: NO APLICA A ESTE MOTOR" /></Campo>
              </div>
            </div>

            {msg && <div className={'msg ' + msg.tipo}>{msg.texto}</div>}

            <div className="row" style={{ marginTop: 16 }}>
              <button className="btn secundario" type="button" onClick={() => setVista('lista')}>Cancelar</button>
              <button className="btn" type="submit" disabled={guardando}>{guardando ? 'Guardando…' : (editando ? 'Guardar cambios' : 'Guardar service')}</button>
            </div>
          </form>
        )}

        <footer className="foot">
          Di Fiore Mecánica · Malvinas 2084, Mar del Plata · Panel interno — no visible para clientes
        </footer>
      </div>

      <style jsx global>{`
        :root{--bg:#0b0d12;--bg2:#12151d;--panel:#171b25;--line:#262b38;--line2:#343b4b;--text:#eef1f7;--muted:#9aa3b8;--dim:#6b7488;
          --blue:#1b4cff;--blue2:#2fa8ff;--blue-ink:#0a2a9c;--sticker:#2fa8ff;--paper:#f7f8fb;--paper-ink:#0e1118;--paper-line:#c9d0dd;--ok:#2ecc71;--bad:#ff4d4f}
        html,body{background:var(--bg)!important;color:var(--text);font-family:Barlow,system-ui,sans-serif}
        body{padding:0 16px 48px;min-height:100vh;background-image:radial-gradient(circle at 1px 1px,#1c2130 1px,transparent 0)!important;background-size:22px 22px!important}
        .wm{position:fixed;inset:0;pointer-events:none;z-index:0;background:url('https://gepusjdevpaxxkrgzyeb.supabase.co/storage/v1/object/public/assets/logo-difiore.png') no-repeat center 58%/min(120vw,900px) auto;opacity:.045}
        .wrap{position:relative;z-index:1;max-width:560px;margin:0 auto}
        .mast{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 0 14px;border-bottom:1px solid var(--line)}
        .logoimg{display:block;height:auto;max-width:100%}.mast-logo{width:min(220px,52vw)}
        .volver{font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);text-decoration:none;white-space:nowrap}
        .volver:hover{color:var(--blue2)}
        .hero{padding:26px 0 16px}
        .hero h1{font-family:"Saira Extra Condensed",Impact,sans-serif;font-weight:800;font-size:38px;line-height:.95;margin:0 0 8px;text-transform:uppercase}
        .hero h1 em{font-style:italic;color:var(--blue2)}
        .hero p{margin:0;color:var(--muted);font-size:14.5px;max-width:44ch;line-height:1.45}
        .row{display:flex;gap:10px}
        .search{flex:1;border:1px solid var(--line2);border-radius:8px;background:var(--panel);color:var(--text);padding:10px 12px;font-family:Barlow,sans-serif;font-size:14px;text-transform:uppercase;outline:none}
        .search:focus{border-color:var(--blue2)}
        .lista{display:flex;flex-direction:column;gap:8px}
        .itemLista{display:flex;align-items:center;gap:12px;background:var(--panel);border:1px solid var(--line2);border-radius:8px;padding:12px 14px;cursor:pointer}
        .itemLista:hover{border-color:var(--blue2)}
        .itemPlate{font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:18px;letter-spacing:.06em;min-width:120px}
        .itemInfo{display:flex;flex-direction:column;gap:2px;font-size:12.5px;color:var(--muted);flex:1}
        .itemEditar{font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:var(--blue2);white-space:nowrap}
        .itemAcciones{display:flex;align-items:center;gap:10px}
        .itemBorrar{border:1px solid rgba(255,77,79,.35);background:rgba(255,77,79,.08);color:var(--bad);cursor:pointer;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:5px 10px;border-radius:6px;white-space:nowrap}
        .itemBorrar:hover{background:rgba(255,77,79,.18);border-color:rgba(255,77,79,.55)}
        .sticker{background:var(--sticker);border-radius:10px;padding:10px;color:var(--paper-ink);box-shadow:0 14px 34px rgba(0,0,0,.5)}
        .sticker .head{background:#0d1018;border-radius:6px;padding:10px 14px;display:flex;align-items:center;gap:10px}
        .headLabel{font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#fff;opacity:.7}
        .plateInput{flex:1;border:0;outline:0;background:transparent;color:#fff;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:22px;letter-spacing:.1em;text-transform:uppercase}
        .plateInput::placeholder{color:#5b6478}
        .dateInput{border:0;outline:0;background:#1b2030;color:#fff;border-radius:6px;padding:6px 8px;font-family:"Barlow Condensed",sans-serif;font-size:13px}
        .sheet{background:var(--paper);border-radius:6px;margin-top:8px;padding:12px;border:2px solid #0d1018}
        .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .field{margin-bottom:10px}
        .field label{display:block;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#4a5568;margin-bottom:4px}
        .field input,.field textarea{width:100%;border:1px solid var(--paper-line);border-radius:6px;padding:8px 10px;font-family:Barlow,sans-serif;font-size:14px;font-weight:500;color:var(--paper-ink);background:#fff;box-sizing:border-box;text-transform:uppercase}
        .field textarea{min-height:56px;resize:vertical}
        .field input:focus,.field textarea:focus{outline:2px solid var(--blue2);outline-offset:1px}
        .checks{display:flex;gap:16px;flex-wrap:wrap;margin-top:4px;padding-top:8px;border-top:1px solid var(--paper-line)}
        .checkItem{display:flex;align-items:center;gap:6px;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:var(--paper-ink)}
        .checkItem input{width:16px;height:16px}
        .belt{margin-top:10px;background:var(--paper);border:2px solid #0d1018;border-radius:6px;padding:12px}
        .belt h3{margin:0 0 10px;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:16px;letter-spacing:.05em;text-transform:uppercase;color:var(--paper-ink)}
        .msg{margin-top:16px;padding:14px 16px;border-radius:8px;border:1px solid var(--line2);background:var(--panel);font-size:15px;line-height:1.45}
        .msg.ok{border-color:rgba(46,204,113,.4);background:rgba(46,204,113,.1);color:var(--ok)}
        .msg.error{border-color:rgba(255,77,79,.4);background:rgba(255,77,79,.1);color:var(--bad)}
        .btn{flex:1;border:0;border-radius:8px;padding:12px 18px;cursor:pointer;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:16px;letter-spacing:.06em;text-transform:uppercase;background:var(--blue);color:#fff}
        .btn:hover{filter:brightness(1.12)}.btn:disabled{opacity:.6;cursor:wait}
        .btn.secundario{background:var(--panel);border:1px solid var(--line2);color:var(--text)}
        .foot{margin-top:28px;padding-top:14px;border-top:1px solid var(--line);color:var(--dim);font-size:12.5px;line-height:1.5;text-align:center}
        @media (max-width:420px){.hero h1{font-size:30px}.row2{grid-template-columns:1fr}}
      `}</style>
    </>
  )
}

function Campo({ label, children }) {
  return <div className="field"><label>{label}</label>{children}</div>
}
function Check({ label, val, onChange }) {
  return (
    <label className="checkItem">
      <input type="checkbox" checked={val} onChange={e => onChange(e.target.checked)} />
      {label}
    </label>
  )
}
