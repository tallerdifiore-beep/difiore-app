// Pantalla para cargar un service nuevo (queda protegida por el login normal de la app).
// Ruta: /cargar-service
import { useState } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

const norm = s => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
// mayúsculas, sin caracteres raros y con espacio automático: ABC 123 (patente vieja) o AB 123 CD (patente nueva)
function formatPatente(val) {
  const p = norm(val).slice(0, 7)
  return p.length === 7 ? `${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5)}` : p.length === 6 ? `${p.slice(0, 3)} ${p.slice(3)}` : p
}

const vacio = {
  patente: '', fecha: new Date().toISOString().slice(0, 10), km: '',
  aceite: '', filtro_aceite: '', filtro_aire: '', aditivo: '', filtro_combustible: '',
  engrase: false, caja: false, diferencial: false,
  proximo_km: '', correa_km: '', correa_proximo_km: '', observaciones: ''
}

export default function CargarService() {
  const [form, setForm] = useState(vacio)
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState(null) // { tipo: 'ok'|'error', texto }

  function set(campo, valor) { setForm(f => ({ ...f, [campo]: valor })) }

  async function guardar(e) {
    e.preventDefault()
    setMsg(null)
    const patente = norm(form.patente)
    if (patente.length < 6) { setMsg({ tipo: 'error', texto: 'La patente no parece completa.' }); return }
    if (!form.km) { setMsg({ tipo: 'error', texto: 'Ingresá los km del service.' }); return }

    setGuardando(true)
    const payload = {
      patente,
      fecha: form.fecha,
      km: Number(form.km) || null,
      aceite: form.aceite || null,
      filtro_aceite: form.filtro_aceite || null,
      filtro_aire: form.filtro_aire || null,
      aditivo: form.aditivo || null,
      filtro_combustible: form.filtro_combustible || null,
      engrase: form.engrase,
      caja: form.caja,
      diferencial: form.diferencial,
      proximo_km: form.proximo_km ? Number(form.proximo_km) : null,
      correa_km: form.correa_km ? Number(form.correa_km) : null,
      correa_proximo_km: form.correa_proximo_km ? Number(form.correa_proximo_km) : null,
      observaciones: form.observaciones || null,
    }
    const { error } = await supabase.from('services').insert(payload)
    setGuardando(false)
    if (error) { setMsg({ tipo: 'error', texto: 'No se pudo guardar: ' + error.message }); return }
    setMsg({ tipo: 'ok', texto: `Service guardado para ${patente}. Ya está disponible en /service.` })
    setForm(vacio)
  }

  return (
    <>
      <Head><title>Cargar service · DiFiore</title></Head>
      <div style={S.page}>
        <div style={S.card}>
          <h1 style={S.h1}>Cargar service</h1>
          <p style={S.sub}>Se guarda en la tabla que consulta la página pública /service.</p>

          <form onSubmit={guardar}>
            <div style={S.row2}>
              <Campo label="Patente *">
                <input style={S.input} value={form.patente} onChange={e => set('patente', formatPatente(e.target.value))} placeholder="AB 123 CD" />
              </Campo>
              <Campo label="Fecha">
                <input style={S.input} type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
              </Campo>
            </div>

            <div style={S.row2}>
              <Campo label="Km actual *">
                <input style={S.input} inputMode="numeric" value={form.km} onChange={e => set('km', e.target.value.replace(/\D/g, ''))} placeholder="85000" />
              </Campo>
              <Campo label="Próximo cambio a los km">
                <input style={S.input} inputMode="numeric" value={form.proximo_km} onChange={e => set('proximo_km', e.target.value.replace(/\D/g, ''))} placeholder="90000" />
              </Campo>
            </div>

            <div style={S.row2}>
              <Campo label="Aceite"><input style={S.input} value={form.aceite} onChange={e => set('aceite', e.target.value)} placeholder="10W40 sintético" /></Campo>
              <Campo label="Filtro de aceite"><input style={S.input} value={form.filtro_aceite} onChange={e => set('filtro_aceite', e.target.value)} placeholder="Original" /></Campo>
            </div>

            <div style={S.row2}>
              <Campo label="Filtro de aire"><input style={S.input} value={form.filtro_aire} onChange={e => set('filtro_aire', e.target.value)} placeholder="Original" /></Campo>
              <Campo label="Filtro de combustible"><input style={S.input} value={form.filtro_combustible} onChange={e => set('filtro_combustible', e.target.value)} placeholder="Original" /></Campo>
            </div>

            <Campo label="Aditivo"><input style={S.input} value={form.aditivo} onChange={e => set('aditivo', e.target.value)} placeholder="Sí / No / marca" /></Campo>

            <div style={S.checks}>
              <Check label="Engrase" val={form.engrase} onChange={v => set('engrase', v)} />
              <Check label="Caja" val={form.caja} onChange={v => set('caja', v)} />
              <Check label="Diferencial" val={form.diferencial} onChange={v => set('diferencial', v)} />
            </div>

            <h2 style={S.h2}>Correa de distribución (opcional)</h2>
            <div style={S.row2}>
              <Campo label="Hecha a los km"><input style={S.input} inputMode="numeric" value={form.correa_km} onChange={e => set('correa_km', e.target.value.replace(/\D/g, ''))} placeholder="60000" /></Campo>
              <Campo label="Próximo cambio a los km"><input style={S.input} inputMode="numeric" value={form.correa_proximo_km} onChange={e => set('correa_proximo_km', e.target.value.replace(/\D/g, ''))} placeholder="160000" /></Campo>
            </div>
            <Campo label="Observaciones (si no hay dato de correa)">
              <textarea style={{ ...S.input, minHeight: 60 }} value={form.observaciones} onChange={e => set('observaciones', e.target.value)} placeholder="Ej: No aplica a este motor" />
            </Campo>

            {msg && <div style={msg.tipo === 'ok' ? S.ok : S.error}>{msg.texto}</div>}

            <button type="submit" disabled={guardando} style={S.btn}>{guardando ? 'Guardando…' : 'Guardar service'}</button>
          </form>
        </div>
      </div>
    </>
  )
}

function Campo({ label, children }) {
  return <div style={S.campo}><label style={S.label}>{label}</label>{children}</div>
}
function Check({ label, val, onChange }) {
  return (
    <label style={S.checkLabel}>
      <input type="checkbox" checked={val} onChange={e => onChange(e.target.checked)} style={{ width: 16, height: 16 }} />
      {label}
    </label>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#0F1117', padding: '24px 16px', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' },
  card: { maxWidth: 560, margin: '0 auto', background: '#1A1A2E', border: '1px solid #2D3748', borderRadius: 16, padding: '2rem' },
  h1: { color: '#F1F5F9', margin: '0 0 4px', fontSize: 22, fontWeight: 700 },
  h2: { color: '#94A3B8', margin: '18px 0 8px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '.08em' },
  sub: { color: '#64748B', fontSize: 13, margin: '0 0 20px' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  campo: { marginBottom: 12 },
  label: { display: 'block', fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600, marginBottom: 6 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #2D3748', background: '#0F1117', color: '#F1F5F9', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  checks: { display: 'flex', gap: 18, margin: '4px 0 8px' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 6, color: '#F1F5F9', fontSize: 13 },
  ok: { background: 'rgba(46,204,113,.1)', border: '1px solid rgba(46,204,113,.4)', color: '#2ecc71', padding: '10px 12px', borderRadius: 8, fontSize: 13, margin: '10px 0' },
  error: { background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.4)', color: '#F87171', padding: '10px 12px', borderRadius: 8, fontSize: 13, margin: '10px 0' },
  btn: { width: '100%', marginTop: 8, padding: '12px', borderRadius: 8, background: '#2563EB', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
}
