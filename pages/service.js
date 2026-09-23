// Página pública: el cliente escanea el QR, escribe la patente y ve su último service.
// Ruta: /service  (no requiere login — ver Component.publica en _app.js)
import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

const WA = '5492235299700'
const LOGO = 'https://gepusjdevpaxxkrgzyeb.supabase.co/storage/v1/object/public/assets/logo-difiore.png'
const fmt = n => (n == null ? '—' : Number(n).toLocaleString('es-AR'))
const norm = s => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
const pretty = p => (p.length === 7 ? `${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5)}` : p.length === 6 ? `${p.slice(0, 3)} ${p.slice(3)}` : p)
// Si el usuario borra justo el espacio que puso el formateo automático, sin esto se repone
// solo y hay que apretar borrar dos veces para sacar la letra de al lado.
function formatPatente(val, valorAnterior, cursorPos) {
  let base = val
  if (valorAnterior !== undefined && cursorPos !== undefined && val.length === valorAnterior.length - 1) {
    const borrado = valorAnterior[cursorPos]
    if (borrado && !/[A-Z0-9]/i.test(borrado)) base = valorAnterior.slice(0, cursorPos - 1) + valorAnterior.slice(cursorPos + 1)
  }
  return pretty(norm(base).slice(0, 7))
}
// Mientras el navegador está componiendo un caracter (teclados de celular con
// autocorrección/predictivo, IME) dejamos pasar el valor tal cual, sin reformatear — hacerlo
// a mitad de la composición mezclaba las letras. El formato final se aplica al terminar.
function patenteHandlers(valorAnterior, setter) {
  return {
    onChange: e => { if (e.nativeEvent.isComposing) { setter(e.target.value); return } setter(formatPatente(e.target.value, valorAnterior, e.target.selectionStart)) },
    onCompositionEnd: e => setter(formatPatente(e.target.value, valorAnterior, e.target.selectionStart))
  }
}
const fecha = f => (f ? new Date(f + 'T12:00:00').toLocaleDateString('es-AR') : '—')

export default function Service() {
  const [patente, setPatente] = useState('')
  const [msg, setMsg] = useState('')
  const [cargando, setCargando] = useState(false)
  const [srv, setSrv] = useState(null)
  const [veh, setVeh] = useState(null)
  const [kmHoy, setKmHoy] = useState('')
  const [cantServices, setCantServices] = useState(0)
  const resRef = useRef(null)

  // Si el QR viene con ?p=PATENTE la busca sola
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('p')
    if (p) { setPatente(pretty(norm(p))); buscar(norm(p)) }
  }, [])

  async function buscar(pRaw) {
    const p = norm(pRaw ?? patente)
    setMsg(''); setSrv(null); setVeh(null); setKmHoy(''); setCantServices(0)
    if (p.length < 6) { setMsg('Escribí la patente completa (por ejemplo AB 123 CD o ABC 123).'); return }
    setCargando(true)
    const { data: rows, error } = await supabase.from('services').select('*').eq('patente_norm', p).order('fecha', { ascending: false }).order('created_at', { ascending: false }).limit(1)
    setCargando(false)
    if (error) { setMsg('No pudimos consultar ahora. Probá de nuevo en un momento.'); return }
    const s = (rows || [])[0]
    if (!s) { setMsg(`No encontramos ningún service registrado para ${pretty(p)}. Si ya te atendimos, escribinos por WhatsApp y lo cargamos.`); return }
    setSrv(s)
    const { data: vs } = await supabase.from('vehiculos').select('marca_modelo, patente').eq('patente_norm', p).limit(1)
    setVeh((vs || [])[0] || null)
    // Sistema de fidelidad: cada 5 services de esta patente, el 5° tiene 50% off.
    const { count } = await supabase.from('services').select('id', { count: 'exact', head: true }).eq('patente_norm', p)
    setCantServices(count || 0)
    setTimeout(() => resRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  // Estimación con los km actuales
  const hoy = parseInt((kmHoy || '').replace(/\D/g, ''), 10)
  const items = []
  if (srv && hoy) {
    if (srv.proximo_km) items.push({ n: 'Aceite y filtros', desde: srv.km || 0, hasta: srv.proximo_km })
    if (srv.correa_km != null && srv.correa_proximo_km) items.push({ n: 'Correa de distribución', desde: srv.correa_km, hasta: srv.correa_proximo_km })
  }
  const calc = items.map(it => {
    const falta = it.hasta - hoy
    const pct = Math.min(100, Math.max(0, ((hoy - it.desde) / Math.max(1, it.hasta - it.desde)) * 100))
    return { ...it, falta, pct, cls: falta < 0 ? 'bad' : falta <= 1500 ? 'warn' : 'ok' }
  })
  const peor = calc.some(c => c.cls === 'bad') ? 'bad' : calc.some(c => c.cls === 'warn') ? 'warn' : 'ok'
  const estadoTxt = !hoy ? (srv ? 'Último service ' + fecha(srv.fecha) : '') : peor === 'bad' ? 'Service vencido' : peor === 'warn' ? 'Service próximo' : 'Al día'

  // Fidelidad: cada 5 services de la patente, el 5° (10°, 15°...) tiene 50% off.
  const enCiclo = cantServices % 5
  const ultimoConDescuento = cantServices > 0 && enCiclo === 0
  const faltanParaDescuento = enCiclo === 0 ? 5 : 5 - enCiclo
  const hayCorrea = srv && srv.correa_km != null
  const waHref = `https://wa.me/${WA}?text=${encodeURIComponent(`Hola! Quiero pedir turno para el service de mi ${veh?.marca_modelo || 'auto'} (${pretty(norm(patente))}).`)}`

  return (
    <>
      <Head>
        <title>Mi service · DiFiore Performance</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Saira+Extra+Condensed:wght@800&family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap" />
      </Head>

      <div className="wm" aria-hidden="true" />
      <div className="wrap">
        <header className="mast">
          <img className="logoimg mast-logo" src={LOGO} alt="DiFiore Performance" />
          <div className="tag">Control de<br />service</div>
        </header>

        <section className="hero">
          <h1>¿Cuándo le toca <em>el próximo service</em> a tu auto?</h1>
          <p>Escribí la patente y te mostramos el último service que le hicimos en el taller y cuándo es el próximo cambio.</p>

          <form onSubmit={e => { e.preventDefault(); buscar() }} autoComplete="off">
            <div className="plate">
              <div className="band"><span>República Argentina</span><span>Patente</span></div>
              <input id="patente" value={patente} {...patenteHandlers(patente, setPatente)}
                maxLength={9} placeholder="AB 123 CD" aria-label="Patente del vehículo" spellCheck={false} inputMode="text" />
            </div>
            <div className="hint">No hace falta poner el espacio, se agrega solo</div>
            <div className="row">
              <button className="btn" type="submit" disabled={cargando}>{cargando ? 'Buscando…' : 'Ver mi service'}</button>
            </div>
          </form>
          {msg && <div className="msg" role="status">{msg}</div>}
        </section>

        {srv && (
          <section className="result" ref={resRef}>
            <div className="veh">
              <h2><small>{pretty(norm(srv.patente))}</small><span>{veh?.marca_modelo || 'Tu vehículo'}</span></h2>
              <span className={'status ' + (hoy ? peor : 'ok')}><i />{estadoTxt}</span>
            </div>

            {cantServices > 0 && (
              <div className={'loyalty' + (ultimoConDescuento ? ' win' : '')}>
                {ultimoConDescuento ? (
                  <>
                    <div className="loyaltyBadge">-50%</div>
                    <div className="loyaltyText"><b>¡Felicitaciones!</b> Este service (N°{cantServices}) tiene 50% de descuento por fidelidad a esta patente.</div>
                  </>
                ) : (
                  <>
                    <div className="loyaltyDots">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={'dot' + (i < enCiclo ? ' on' : '')} />)}</div>
                    <div className="loyaltyText">Llevás <b>{cantServices}</b> {cantServices === 1 ? 'service' : 'services'} con nosotros. Te faltan <b>{faltanParaDescuento}</b> para tu 50% de descuento.</div>
                  </>
                )}
              </div>
            )}

            <div className="sticker">
              <div className="head">
                <img className="logoimg stk-logo" src={LOGO} alt="" />
                <div className="date">Fecha <b>{fecha(srv.fecha)}</b></div>
              </div>
              <div className="sheet">
                <table>
                  <tbody>
                    <tr><th>Km.</th><td className="km">{fmt(srv.km)} km</td></tr>
                    <tr><th>Aceite</th><td>{srv.aceite || '—'}</td></tr>
                    <tr><th>Filtro aceite</th><td>{srv.filtro_aceite || '—'}</td></tr>
                    <tr><th>Filtro aire</th><td>{srv.filtro_aire || '—'}</td></tr>
                    <tr><th>Aditivo</th><td>{srv.aditivo || '—'}</td></tr>
                    <tr><th>F. combustible</th><td>{srv.filtro_combustible || '—'}</td></tr>
                  </tbody>
                </table>
                <div className="checks">
                  <span><i>{srv.engrase ? '✕' : ''}</i>Engrase</span>
                  <span><i>{srv.caja ? '✕' : ''}</i>Caja</span>
                  <span><i>{srv.diferencial ? '✕' : ''}</i>Diferencial</span>
                </div>
              </div>
              <div className="next">
                <div className="lab">Próximo<br />cambio a los</div>
                <div className="box"><b>{fmt(srv.proximo_km)}</b><small>KM.</small></div>
              </div>
              <div className="belt">
                <h3>Cambio correa distribución</h3>
                <div className="lab">Hecho a los</div>
                <div className={'box' + (hayCorrea ? '' : ' empty')}><b>{hayCorrea ? fmt(srv.correa_km) : (srv.observaciones || 'Sin registro')}</b>{hayCorrea && <small>KM.</small>}</div>
                <div className="lab">Próximo cambio a los</div>
                <div className={'box' + (hayCorrea ? '' : ' empty')}><b>{hayCorrea ? fmt(srv.correa_proximo_km) : '—'}</b>{hayCorrea && <small>KM.</small>}</div>
              </div>
            </div>

            <div className="est">
              <label htmlFor="kmhoy">¿Cuántos km tiene hoy tu auto?</label>
              <div className="in"><input id="kmhoy" inputMode="numeric" placeholder="ej. 88500" value={kmHoy} onChange={e => setKmHoy(e.target.value)} /><span className="unit">KM</span></div>
              {calc.length > 0 && (
                <div className="bars">
                  {calc.map(c => (
                    <div className={'bar ' + c.cls} key={c.n}>
                      <div className="t"><b>{c.n}</b><span>{c.falta < 0 ? `Vencido hace ${fmt(-c.falta)} km` : `Faltan ${fmt(c.falta)} km`}</span></div>
                      <div className="tr"><div className="fi" style={{ width: c.pct + '%' }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cta">
              <a className="wa" href={waHref} target="_blank" rel="noopener noreferrer">Pedir turno por WhatsApp</a>
              <a href="https://share.google/4JYpNeyxcJchPClhp" target="_blank" rel="noopener noreferrer">Cómo llegar</a>
            </div>
          </section>
        )}

        <footer className="foot">
          Di Fiore Mecánica · Malvinas 2084, Mar del Plata · Lunes a viernes de 08:00 a 18:00<br />
          Atendemos solo con turno · Garantía de 30 días o 15.000 km en reparaciones
        </footer>
      </div>

      <style jsx global>{`
        :root{--bg:#0b0d12;--bg2:#12151d;--panel:#171b25;--line:#262b38;--line2:#343b4b;--text:#eef1f7;--muted:#9aa3b8;--dim:#6b7488;
          --blue:#1b4cff;--blue2:#2fa8ff;--blue-ink:#0a2a9c;--sticker:#2fa8ff;--paper:#f7f8fb;--paper-ink:#0e1118;--paper-line:#c9d0dd;--ok:#2ecc71;--warn:#f5b700;--bad:#ff4d4f}
        html,body{background:var(--bg)!important;color:var(--text);font-family:Barlow,system-ui,sans-serif}
        body{padding:0 16px 48px;min-height:100vh;background-image:radial-gradient(circle at 1px 1px,#1c2130 1px,transparent 0)!important;background-size:22px 22px!important}
        .wm{position:fixed;inset:0;pointer-events:none;z-index:0;background:url('https://gepusjdevpaxxkrgzyeb.supabase.co/storage/v1/object/public/assets/logo-difiore.png') no-repeat center 58%/min(120vw,900px) auto;opacity:.045}
        .wrap{position:relative;z-index:1;max-width:560px;margin:0 auto}
        .mast{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 0 14px;border-bottom:1px solid var(--line)}
        .logoimg{display:block;height:auto;max-width:100%}.mast-logo{width:min(250px,58vw)}.stk-logo{width:min(190px,50vw)}
        .tag{font-family:"Barlow Condensed",sans-serif;font-weight:600;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);text-align:right;line-height:1.25}
        .hero{padding:28px 0 10px}
        .hero h1{font-family:"Saira Extra Condensed",Impact,sans-serif;font-weight:800;font-size:44px;line-height:.95;margin:0 0 10px;text-wrap:balance;text-transform:uppercase}
        .hero h1 em{font-style:italic;color:var(--blue2)}
        .hero p{margin:0;color:var(--muted);font-size:15.5px;max-width:42ch;line-height:1.45}
        form{margin-top:20px}
        .plate{display:flex;flex-direction:column;border:3px solid #0d1018;border-radius:10px;overflow:hidden;background:var(--paper);box-shadow:0 12px 30px rgba(0,0,0,.45),inset 0 0 0 2px #fff}
        .plate .band{background:var(--blue-ink);color:#fff;display:flex;justify-content:space-between;padding:6px 14px;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:11px;letter-spacing:.22em;text-transform:uppercase}
        .plate input{border:0;outline:0;background:transparent;width:100%;padding:12px 14px 10px;text-align:center;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:48px;letter-spacing:.14em;text-transform:uppercase;color:var(--paper-ink)}
        .plate input::placeholder{color:#b8c0cf}
        .plate input:focus-visible{box-shadow:inset 0 0 0 3px var(--blue2)}
        .hint{font-size:12px;color:var(--dim);margin-top:8px;padding:0 4px;text-align:center}
        .row{display:flex;gap:10px;margin-top:12px}
        .btn{flex:1;border:0;border-radius:8px;padding:14px 18px;cursor:pointer;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:19px;letter-spacing:.08em;text-transform:uppercase;background:var(--blue);color:#fff}
        .btn:hover{filter:brightness(1.12)}.btn:disabled{opacity:.6;cursor:wait}
        .msg{margin-top:16px;padding:14px 16px;border-radius:8px;border:1px solid var(--line2);background:var(--panel);font-size:15px;line-height:1.45}
        .result{margin-top:26px}
        .veh{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:12px}
        .veh h2{margin:0;font-family:"Saira Extra Condensed",Impact,sans-serif;font-weight:800;font-size:34px;line-height:.95;text-transform:uppercase}
        .veh h2 small{display:block;font-family:"Barlow Condensed",sans-serif;font-weight:600;font-size:13px;letter-spacing:.2em;color:var(--muted);margin-bottom:4px}
        .status{display:inline-flex;align-items:center;gap:8px;padding:7px 12px;border-radius:999px;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:14px;letter-spacing:.1em;text-transform:uppercase;border:1px solid}
        .status i{width:9px;height:9px;border-radius:50%;background:currentColor;display:inline-block}
        .status.ok{color:var(--ok);border-color:rgba(46,204,113,.45);background:rgba(46,204,113,.1)}
        .status.warn{color:var(--warn);border-color:rgba(245,183,0,.45);background:rgba(245,183,0,.1)}
        .status.bad{color:var(--bad);border-color:rgba(255,77,79,.45);background:rgba(255,77,79,.1)}
        .loyalty{display:flex;align-items:center;gap:12px;margin-bottom:14px;padding:12px 14px;border-radius:10px;background:rgba(47,168,255,.08);border:1px solid rgba(47,168,255,.35)}
        .loyalty.win{background:rgba(46,204,113,.12);border-color:rgba(46,204,113,.45)}
        .loyaltyBadge{flex-shrink:0;width:46px;height:46px;border-radius:50%;background:var(--ok);color:#06210f;display:flex;align-items:center;justify-content:center;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:13px;letter-spacing:.02em}
        .loyaltyDots{display:flex;gap:5px;flex-shrink:0}
        .loyaltyDots .dot{width:10px;height:10px;border-radius:50%;background:var(--line2);border:1px solid var(--line2)}
        .loyaltyDots .dot.on{background:var(--blue2);border-color:var(--blue2)}
        .loyaltyText{font-family:Barlow,sans-serif;font-size:13.5px;color:var(--muted);line-height:1.4}
        .loyaltyText b{color:var(--text)}
        .sticker{background:var(--sticker);border-radius:10px;padding:10px;color:var(--paper-ink);box-shadow:0 14px 34px rgba(0,0,0,.5)}
        .sticker .head{background:#0d1018;border-radius:6px;padding:10px 14px 9px;display:flex;justify-content:space-between;align-items:center}
        .sticker .head .date{font-family:"Barlow Condensed",sans-serif;color:#fff;font-size:13px;letter-spacing:.14em;text-transform:uppercase;text-align:right;line-height:1.2}
        .sticker .head .date b{display:block;font-size:20px;letter-spacing:.06em}
        .sheet{background:var(--paper);border-radius:6px;margin-top:8px;overflow:hidden;border:2px solid #0d1018}
        .sheet table{width:100%;border-collapse:collapse;font-family:"Barlow Condensed",sans-serif;font-size:17px}
        .sheet th,.sheet td{padding:7px 11px;border-bottom:1px solid var(--paper-line);text-align:left;vertical-align:middle}
        .sheet th{width:44%;font-weight:700;text-transform:uppercase;letter-spacing:.05em;border-right:1px solid var(--paper-line)}
        .sheet td{font-family:Barlow,sans-serif;font-size:15px;font-weight:500}
        .sheet td.km{font-family:"Barlow Condensed",sans-serif;font-size:19px;font-weight:700}
        .sheet .checks{display:flex;gap:14px;flex-wrap:wrap;padding:9px 11px;font-family:"Barlow Condensed",sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.05em;font-size:16px}
        .sheet .checks span{display:inline-flex;align-items:center;gap:6px}
        .sheet .checks i{width:18px;height:18px;border:2px solid #0d1018;display:inline-grid;place-items:center;font-style:normal;font-size:14px;line-height:1;background:#fff}
        .next{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:12px;margin-top:10px;padding:0 4px}
        .next .lab,.belt .lab{font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:13px;letter-spacing:.1em;text-transform:uppercase;line-height:1.15;color:#083058}
        .next .box,.belt .box{background:var(--paper);border:3px solid #0d1018;border-radius:6px;padding:8px 12px;display:flex;justify-content:space-between;align-items:baseline;gap:8px}
        .next .box b{font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:30px;line-height:1}
        .next .box small,.belt .box small{font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:15px;letter-spacing:.08em}
        .belt{margin-top:10px;background:var(--paper);border:3px solid #0d1018;border-radius:6px;padding:10px 12px}
        .belt h3{margin:0 0 8px;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:20px;letter-spacing:.05em;text-transform:uppercase;text-align:center;line-height:1.1}
        .belt .box{padding:6px 12px;border-radius:4px}
        .belt .box b{font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:26px;line-height:1}
        .belt .box.empty b{color:#6b7488;font-size:15px;font-family:Barlow,sans-serif;font-weight:500}
        .belt .lab{font-size:12px;letter-spacing:.12em;color:#4a5568;margin:8px 0 4px}
        .est{margin-top:18px;background:var(--panel);border:1px solid var(--line2);border-radius:10px;padding:14px 16px}
        .est label{display:block;font-family:"Barlow Condensed",sans-serif;font-weight:600;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
        .est .in{display:flex;gap:10px;align-items:center}
        .est input{flex:1;min-width:0;background:var(--bg2);border:1px solid var(--line2);border-radius:8px;color:var(--text);padding:10px 12px;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:24px;letter-spacing:.04em;outline:none}
        .est input:focus{border-color:var(--blue2)}
        .est .unit{font-family:"Barlow Condensed",sans-serif;font-weight:700;color:var(--muted);letter-spacing:.1em}
        .bars{margin-top:14px;display:grid;gap:12px}
        .bar .t{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-size:14px;margin-bottom:6px}
        .bar .t b{font-family:"Barlow Condensed",sans-serif;font-size:16px;letter-spacing:.06em;text-transform:uppercase}
        .bar .t span{color:var(--muted)}
        .bar .tr{height:8px;background:var(--bg2);border:1px solid var(--line);border-radius:999px;overflow:hidden}
        .bar .fi{height:100%;border-radius:999px;background:var(--blue2);transition:width .4s ease}
        .bar.warn .fi{background:var(--warn)}.bar.bad .fi{background:var(--bad)}
        .cta{margin-top:18px;display:flex;gap:10px;flex-wrap:wrap}
        .cta a{flex:1;min-width:150px;text-decoration:none;text-align:center;border-radius:8px;padding:13px 16px;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:18px;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:var(--blue)}
        .cta a.wa{background:#1e9e4a}
        .foot{margin-top:28px;padding-top:14px;border-top:1px solid var(--line);color:var(--dim);font-size:12.5px;line-height:1.5;text-align:center}
        @media (max-width:420px){.hero h1{font-size:38px}.plate input{font-size:40px}}
      `}</style>
    </>
  )
}

// Marca la página como pública: _app.js no le pide contraseña
Service.publica = true
