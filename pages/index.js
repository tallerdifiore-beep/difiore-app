import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getMarca } from '../lib/marcas'
import styles from '../styles/App.module.css'

const LOGO_URL = 'https://gepusjdevpaxxkrgzyeb.supabase.co/storage/v1/object/public/assets/ChatGPT%20Image%2017%20jul%202026,%2015_11_05.png'

const IgIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
const FbIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
const WaIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
const MapIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C7.802 0 4 3.403 4 7.602 4 11.8 7.469 16.812 12 24c4.531-7.188 8-12.2 8-16.398C20 3.402 16.199 0 12 0zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/></svg>

function formatNum(val) {
  if (!val && val !== 0) return ''
  const n = val.toString().replace(/\D/g,'')
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function parseNum(val) {
  return val.toString().replace(/\./g,'')
}

export default function Home({ rol, cerrarSesion }) {
  const admin = rol === 'admin'

  const [seccion, setSeccion] = useState('dashboard')
  const [tallerVista, setTallerVista] = useState(null)
  const [vistaStats, setVistaStats] = useState(null)
  const [vistaMarca, setVistaMarca] = useState(null)
  const [verEntregados, setVerEntregados] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [clientes, setClientes] = useState([])
  const [trabajos, setTrabajos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [dolarBlue, setDolarBlue] = useState(null)
  const [mesInforme, setMesInforme] = useState(new Date().toISOString().slice(0,7))

  const [form, setForm] = useState({
    nombre: '', telefono: '', email: '',
    marca_modelo: '', patente: '', anio: '', kilometraje: '', color: '',
    motivo: '', estado: 'Diagnóstico', mecanico: '', taller: 'Malvinas 2084',
    llego_en_grua: false, tiene_seguro: false, fecha_ingreso_manual: ''
  })
  const [fotoNuevo, setFotoNuevo] = useState([])
  const [clienteDetalle, setClienteDetalle] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [modalSalida, setModalSalida] = useState(null)
  const [observacionFinal, setObservacionFinal] = useState('')
  const [modalReingreso, setModalReingreso] = useState(null)
  const [formReingreso, setFormReingreso] = useState({ motivo: '', mecanico: '', taller: 'Malvinas 2084', estado: 'Diagnóstico', llego_en_grua: false, fecha_ingreso_manual: '' })
  const [modalEditar, setModalEditar] = useState(null)
  const [formEditar, setFormEditar] = useState({})
  const [fotos, setFotos] = useState([])
  const [historial, setHistorial] = useState([])
  const [repuestos, setRepuestos] = useState([])
  const [modalActualizar, setModalActualizar] = useState(null)
  const [modalRepuesto, setModalRepuesto] = useState(null)
  const [modalEditarRepuesto, setModalEditarRepuesto] = useState(null)
  const [formEditarRepuesto, setFormEditarRepuesto] = useState({ nombre: '', valor: '', lugar: '', fecha: '' })
  const [modalFotos, setModalFotos] = useState(null)
  const [modalFotosData, setModalFotosData] = useState([])
  const [fotoZoom, setFotoZoom] = useState(null)
  const [modalWsp, setModalWsp] = useState(null)
  const [msgWsp, setMsgWsp] = useState('')
  const [formRepuesto, setFormRepuesto] = useState({ nombre: '', valor: '', lugar: '', fecha: new Date().toISOString().split('T')[0] })
  const [formActualizar, setFormActualizar] = useState({ tipo: 'estado', descripcion: '', taller_nuevo: 'Malvinas 3906' })
  const [subiendo, setSubiendo] = useState(false)

  const [presupuesto, setPresupuesto] = useState({
    numero: '001-00001', fecha: new Date().toISOString().split('T')[0],
    cliente: '', vehiculo: '', telefono: '',
    items: [{ descripcion: '', precio_unitario: '', total: '', es_mano_obra: false }],
    notas: '', moneda_mano_obra: 'ARS'
  })

  const [recibo, setRecibo] = useState({
    numero: '001-00001', fecha: new Date().toISOString().split('T')[0],
    cliente: '', vehiculo: '', patente: '', telefono: '',
    concepto: '', monto: '', moneda: 'ARS', forma_pago: 'Efectivo', observaciones: ''
  })

  const fileRef = useRef()
  const fileNuevoRef = useRef()
  const fileFotosRef = useRef()

  useEffect(() => { cargarDatos() }, [])

  useEffect(() => {
    async function fetchDolar() {
      try {
        const res = await fetch('https://dolarapi.com/v1/dolares/blue')
        const data = await res.json()
        setDolarBlue({ compra: data.compra, venta: data.venta })
      } catch (e) { setDolarBlue(null) }
    }
    fetchDolar()
  }, [])

  async function cargarDatos() {
    setLoading(true)
    const { data: clientesData } = await supabase.from('clientes').select('*').order('created_at', { ascending: false })
    const { data: trabajosData } = await supabase.from('trabajos').select('*, vehiculos(*, clientes(*))').order('fecha_ingreso', { ascending: true })
    setClientes(clientesData || [])
    setTrabajos(trabajosData || [])
    setLoading(false)
  }

  async function cargarFotos(trabajoId) {
    const { data, error } = await supabase.from('fotos').select('*').eq('trabajo_id', trabajoId).order('created_at', { ascending: false })
    if (!error) setFotos(data || [])
  }

  async function cargarFotosModal(trabajoId) {
    const { data, error } = await supabase.from('fotos').select('*').eq('trabajo_id', trabajoId).order('created_at', { ascending: false })
    if (!error) setModalFotosData(data || [])
  }

  async function cargarHistorial(trabajoId) {
    const { data: h1 } = await supabase.from('historial').select('*').eq('trabajo_id', trabajoId)
    const { data: h2 } = await supabase.from('actualizaciones').select('*').eq('trabajo_id', trabajoId)
    const todo = [...(h1||[]), ...(h2||[])].sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
    setHistorial(todo)
  }

  async function cargarRepuestos(trabajoId) {
    const { data } = await supabase.from('repuestos').select('*').eq('trabajo_id', trabajoId).order('fecha', { ascending: false })
    setRepuestos(data || [])
  }

  async function agregarHistorial(trabajoId, tipo, descripcion) {
    await supabase.from('historial').insert({ trabajo_id: trabajoId, tipo, descripcion })
  }

  async function subirFotoStorage(file, trabajoId) {
    const ext = file.name.split('.').pop()
    const nombre = `${trabajoId}/${Date.now()}_${Math.random().toString(36).substr(2,9)}.${ext}`
    const { error: uploadError } = await supabase.storage.from('fotos-vehiculos').upload(nombre, file, { upsert: true })
    if (uploadError) return null
    const { data } = supabase.storage.from('fotos-vehiculos').getPublicUrl(nombre)
    return data.publicUrl
  }

  function formatPeso(valor) { return Number(valor).toLocaleString('es-AR') }

  function calcularTotalesPresupuesto() {
    let totalPesos = 0, totalUSD = 0
    presupuesto.items.forEach(item => {
      if (!item.total) return
      const val = parseFloat(parseNum(item.total)) || 0
      if (item.es_mano_obra && presupuesto.moneda_mano_obra === 'USD') {
        totalUSD += val
        if (dolarBlue) totalPesos += val * dolarBlue.venta
      } else {
        totalPesos += val
      }
    })
    return { totalPesos, totalUSD }
  }

  function enviarPresupuestoWsp() {
    let tel = presupuesto.telefono?.replace(/\D/g,'')
    if (!tel) { alert('Ingresá el teléfono del cliente para enviar por WhatsApp'); return }
    if (!tel.startsWith('54')) tel = '54' + tel
    const { totalPesos, totalUSD } = calcularTotalesPresupuesto()
    const usandoUSD = presupuesto.moneda_mano_obra === 'USD'
    let msg = `*PRESUPUESTO N° ${presupuesto.numero} — DiFiore Performance*\n`
    msg += `Fecha: ${new Date(presupuesto.fecha + 'T12:00:00').toLocaleDateString('es-AR')}\n\n`
    msg += `*Cliente:* ${presupuesto.cliente || '—'}\n`
    msg += `*Vehículo:* ${presupuesto.vehiculo || '—'}\n\n`
    msg += `*Detalle:*\n`
    presupuesto.items.filter(i => i.descripcion).forEach(item => {
      const simbolo = item.es_mano_obra ? (usandoUSD ? 'USS' : '$') : '$'
      msg += `• ${item.descripcion}${item.total ? `: ${simbolo} ${item.total}` : ''}\n`
    })
    if (usandoUSD && totalUSD > 0) msg += `\n*Mano de obra:* USS ${formatPeso(totalUSD)}`
    msg += `\n*Total repuestos:* $${formatPeso(presupuesto.items.filter(i => !i.es_mano_obra && i.total).reduce((a,i) => a + (parseFloat(parseNum(i.total)) || 0), 0))}`
    if (usandoUSD && dolarBlue && totalUSD > 0) msg += `\n*Total estimado en pesos:* $${formatPeso(Math.round(totalPesos))}`
    if (presupuesto.notas) msg += `\n\n${presupuesto.notas.split('\n').filter(n => n.trim()).map(n => `✅ ${n}`).join('\n')}`
    msg += `\n\n_Di Fiore Performance — Malvinas 2084, MdP_`
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  function enviarReciboWsp() {
    let tel = recibo.telefono?.replace(/\D/g,'')
    if (!tel) { alert('Ingresá el teléfono del cliente para enviar por WhatsApp'); return }
    if (!tel.startsWith('54')) tel = '54' + tel
    const esUSD = recibo.moneda === 'USD'
    const montoEnPesos = esUSD && dolarBlue ? parseFloat(parseNum(recibo.monto)) * dolarBlue.venta : null
    let msg = `*RECIBO N° ${recibo.numero} — DiFiore Performance*\n`
    msg += `Fecha: ${new Date(recibo.fecha + 'T12:00:00').toLocaleDateString('es-AR')}\n\n`
    msg += `*Cliente:* ${recibo.cliente || '—'}\n`
    msg += `*Vehículo:* ${recibo.vehiculo || '—'} | Patente: ${recibo.patente || '—'}\n`
    msg += `*Forma de pago:* ${recibo.forma_pago}\n\n`
    msg += `*Monto recibido:* ${esUSD ? 'USS' : '$'} ${recibo.monto ? formatPeso(parseFloat(parseNum(recibo.monto))) : '0'}`
    if (esUSD && montoEnPesos) msg += ` (≈ $${formatPeso(Math.round(montoEnPesos))})`
    msg += `\n\n*Concepto:* ${recibo.concepto || '—'}`
    if (recibo.observaciones) msg += `\n\n*Observaciones:* ${recibo.observaciones}`
    msg += `\n\n_Di Fiore Performance — Malvinas 2084, MdP_`
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  function imprimirPresupuesto() {
    const { totalPesos, totalUSD } = calcularTotalesPresupuesto()
    const usandoUSD = presupuesto.moneda_mano_obra === 'USD'
    const manoObra = presupuesto.items.find(i => i.es_mano_obra)
    const totalRepuestos = presupuesto.items.filter(i => !i.es_mano_obra && i.total).reduce((a,i) => a + (parseFloat(parseNum(i.total)) || 0), 0)

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Presupuesto</title>
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:Arial,sans-serif; font-size:12px; color:#000; padding:30px; max-width:750px; margin:0 auto; }
.header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
.header-logo img { width:160px; }
.header-info { text-align:right; }
.header-info h1 { font-size:28px; font-weight:900; color:#1a56db; letter-spacing:2px; margin-bottom:4px; }
.header-info p { font-size:11px; color:#555; margin-bottom:2px; }
.divider { height:3px; background:linear-gradient(to right,#1a56db,#93c5fd); margin-bottom:20px; border-radius:2px; }
.cliente-box { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; padding:12px; border:1px solid #e0e0e0; border-radius:6px; }
.cliente-box label { font-size:9px; font-weight:700; color:#1a56db; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:3px; }
.cliente-box span { font-size:14px; font-weight:700; color:#1a1a1a; }
table { width:100%; border-collapse:collapse; margin-bottom:20px; }
thead th { background:#1a56db; color:#fff; padding:10px 12px; text-align:left; font-size:11px; font-weight:700; }
thead th:nth-child(2),thead th:nth-child(3) { text-align:right; }
tbody td { padding:10px 12px; border-bottom:1px solid #f0f0f0; font-size:12px; vertical-align:top; }
tbody td:nth-child(2),tbody td:nth-child(3) { text-align:right; font-weight:600; }
tbody tr:nth-child(even) { background:#f8faff; }
.footer-box { display:flex; justify-content:space-between; align-items:flex-start; margin-top:16px; }
.notas { flex:1; padding-right:30px; }
.notas p { font-size:11px; color:#444; display:flex; gap:6px; margin-bottom:6px; }
.totales { min-width:240px; border:1px solid #e0e0e0; border-radius:8px; overflow:hidden; }
.total-row { display:flex; justify-content:space-between; padding:8px 14px; font-size:12px; border-bottom:1px solid #f0f0f0; }
.total-row:last-child { border:none; }
.total-row.highlight { background:#1a56db; color:#fff; font-size:15px; font-weight:900; }
.total-row.highlight2 { background:#0f3fa3; color:#fff; font-size:15px; font-weight:900; }
.total-row.sub { background:#f8faff; font-size:11px; color:#555; }
.dolar-info { font-size:9px; color:#888; text-align:right; margin-top:4px; padding-right:4px; }
.bottom { margin-top:24px; border-top:2px solid #1a56db; padding-top:10px; text-align:center; font-size:10px; color:#1a56db; font-weight:600; }
@media print { body { padding:15px; } }
</style></head><body>
<div class="header">
  <div class="header-logo"><img src="${LOGO_URL}" alt="DiFiore"/></div>
  <div class="header-info">
    <h1>PRESUPUESTO</h1>
    <p>N° ${presupuesto.numero}</p>
    <p>Fecha: ${new Date(presupuesto.fecha + 'T12:00:00').toLocaleDateString('es-AR')}</p>
    <p>Malvinas 2084 — Mar del Plata 7600</p>
  </div>
</div>
<div class="divider"></div>
<div class="cliente-box">
  <div><label>Cliente</label><span>${presupuesto.cliente || '—'}</span></div>
  <div><label>Vehículo</label><span>${presupuesto.vehiculo || '—'}</span></div>
</div>
<table>
  <thead><tr><th style="width:50%">DESCRIPCIÓN</th><th style="width:25%">PRECIO UNITARIO</th><th style="width:25%">TOTAL</th></tr></thead>
  <tbody>
    ${presupuesto.items.filter(i => i.descripcion).map(item => {
      const simbolo = item.es_mano_obra ? (usandoUSD ? 'USS' : '$') : '$'
      return `<tr><td>${item.descripcion}</td><td>${item.precio_unitario ? `${simbolo} ${item.precio_unitario}` : ''}</td><td>${item.total ? `${simbolo} ${item.total}` : ''}</td></tr>`
    }).join('')}
  </tbody>
</table>
<div class="footer-box">
  <div class="notas">
    ${presupuesto.notas ? presupuesto.notas.split('\n').filter(n => n.trim()).map(n => `<p>✅ ${n}</p>`).join('') : ''}
  </div>
  <div>
    <div class="totales">
      ${usandoUSD && manoObra ? `<div class="total-row sub"><span>Mano de obra</span><span>USS ${manoObra.total}</span></div><div class="total-row sub"><span>Repuestos</span><span>$ ${formatPeso(totalRepuestos)}</span></div>` : ''}
      ${usandoUSD && dolarBlue ? `<div class="total-row highlight"><span>Total en pesos</span><span>$ ${formatPeso(Math.round(totalPesos))}</span></div><div class="total-row highlight2"><span>Total en USD</span><span>USS ${manoObra?.total || 0}</span></div>` : `<div class="total-row highlight"><span>TOTAL</span><span>$ ${formatPeso(Math.round(totalPesos))}</span></div>`}
    </div>
    ${usandoUSD && dolarBlue ? `<div class="dolar-info">Dólar blue venta: $${formatPeso(dolarBlue.venta)}</div>` : ''}
  </div>
</div>
<div class="bottom">Di Fiore Performance — Malvinas 2084, Mar del Plata 7600 — ¡Gracias por confiar en nosotros!</div>
<script>window.onload=()=>{window.print()}<\/script>
</body></html>`
    const w = window.open('','_blank','width=820,height=1000')
    w.document.write(html); w.document.close()
  }

  function imprimirRecibo() {
    const esUSD = recibo.moneda === 'USD'
    const montoNum = parseFloat(parseNum(recibo.monto)) || 0
    const montoEnPesos = esUSD && dolarBlue ? montoNum * dolarBlue.venta : null

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Recibo</title>
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:Arial,sans-serif; font-size:12px; color:#000; padding:30px; max-width:750px; margin:0 auto; }
.header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; border-bottom:3px solid #1a56db; padding-bottom:16px; }
.header-logo img { width:160px; }
.header-info { text-align:right; }
.header-info h1 { font-size:28px; font-weight:900; color:#1a56db; letter-spacing:2px; margin-bottom:4px; }
.header-info p { font-size:11px; color:#555; margin-bottom:2px; }
.datos { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; padding:16px; border:1px solid #e0e0e0; border-radius:8px; background:#f8faff; }
.dato label { font-size:9px; font-weight:700; color:#1a56db; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:3px; }
.dato span { font-size:13px; font-weight:600; color:#1a1a1a; }
.monto-box { background:#1a56db; color:#fff; border-radius:8px; padding:20px; text-align:center; margin:20px 0; }
.monto-box label { font-size:11px; letter-spacing:2px; opacity:.8; display:block; margin-bottom:6px; }
.monto-box .monto { font-size:32px; font-weight:900; }
.monto-box .monto-sub { font-size:13px; opacity:.8; margin-top:4px; }
.concepto-box { border:1px solid #e0e0e0; border-radius:8px; padding:16px; margin-bottom:20px; }
.concepto-box label { font-size:9px; font-weight:700; color:#1a56db; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:8px; }
.concepto-box p { font-size:14px; color:#1a1a1a; line-height:1.6; }
.firma-box { display:flex; justify-content:space-between; margin-top:30px; padding-top:16px; border-top:1px solid #e0e0e0; }
.firma { text-align:center; }
.firma-line { border-bottom:1px solid #000; width:180px; margin:0 auto 8px; }
.firma span { font-size:10px; color:#555; }
.bottom { margin-top:24px; border-top:2px solid #1a56db; padding-top:10px; text-align:center; font-size:10px; color:#1a56db; font-weight:600; }
@media print { body { padding:15px; } }
</style></head><body>
<div class="header">
  <div class="header-logo"><img src="${LOGO_URL}" alt="DiFiore"/></div>
  <div class="header-info"><h1>RECIBO</h1><p>N° ${recibo.numero}</p><p>Fecha: ${new Date(recibo.fecha + 'T12:00:00').toLocaleDateString('es-AR')}</p><p>Malvinas 2084 — Mar del Plata 7600</p></div>
</div>
<div class="datos">
  <div class="dato"><label>Cliente</label><span>${recibo.cliente || '—'}</span></div>
  <div class="dato"><label>Vehículo</label><span>${recibo.vehiculo || '—'}</span></div>
  <div class="dato"><label>Patente</label><span>${recibo.patente || '—'}</span></div>
  <div class="dato"><label>Forma de pago</label><span>${recibo.forma_pago}</span></div>
</div>
<div class="monto-box">
  <label>MONTO RECIBIDO</label>
  <div class="monto">${esUSD ? 'USS' : '$'} ${montoNum ? formatPeso(montoNum) : '0'}</div>
  ${esUSD && montoEnPesos ? `<div class="monto-sub">≈ $${formatPeso(Math.round(montoEnPesos))} (Dólar blue $${formatPeso(dolarBlue.venta)})</div>` : ''}
</div>
<div class="concepto-box"><label>Concepto</label><p>${recibo.concepto || '—'}</p></div>
${recibo.observaciones ? `<div class="concepto-box"><label>Observaciones</label><p>${recibo.observaciones}</p></div>` : ''}
<div class="firma-box">
  <div class="firma"><div class="firma-line"></div><span>Firma del cliente</span></div>
  <div class="firma"><div class="firma-line"></div><span>DiFiore Performance</span></div>
</div>
<div class="bottom">Di Fiore Performance — Malvinas 2084, Mar del Plata 7600 — ¡Gracias por confiar en nosotros!</div>
<script>window.onload=()=>{window.print()}<\/script>
</body></html>`
    const w = window.open('','_blank','width=820,height=900')
    w.document.write(html); w.document.close()
  }

  function imprimirOrdenConObservaciones(trabajo, obs) {
    const c = trabajo.vehiculos?.clientes
    const v = trabajo.vehiculos
    const fecha = (f) => f ? new Date(f).toLocaleDateString('es-AR') : '___/___/______'
    const nroCliente = trabajo.numero_cliente || '—'

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Orden de Servicio</title>
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:Arial,sans-serif; font-size:11px; color:#000; padding:12px; max-width:720px; margin:0 auto; }
.header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; border-bottom:2px solid #000; padding-bottom:6px; }
.header-logo { width:130px; } .header-logo img { width:100%; }
.header-center { text-align:center; flex:1; }
.header-center h1 { font-size:15px; font-weight:900; letter-spacing:1px; margin-bottom:2px; }
.header-center .brand { font-size:12px; font-weight:900; color:#1a56db; letter-spacing:2px; }
.header-center .sub { font-size:8px; letter-spacing:3px; color:#555; }
.folio { text-align:right; font-size:9px; font-weight:bold; }
.folio-num { font-size:20px; font-weight:900; border-bottom:2px solid #000; display:inline-block; min-width:60px; text-align:center; }
.body { display:grid; grid-template-columns:1fr 1fr; gap:0 16px; margin:8px 0; }
.field { margin-bottom:5px; }
.field label { font-size:9px; color:#444; display:block; }
.field .val { border-bottom:1px solid #000; min-height:15px; font-size:11px; font-weight:600; padding:1px 0; }
.section-title { background:#222; color:#fff; text-align:center; font-weight:bold; font-size:10px; padding:3px; margin:6px 0 4px; letter-spacing:1px; }
.motivo-text { font-size:13px; font-weight:500; border-bottom:1px solid #000; padding:4px; line-height:1.6; min-height:20px; }
.grua-seg { display:flex; gap:16px; margin-bottom:4px; }
.grua-item { display:flex; gap:8px; align-items:center; font-size:10px; }
.checkbox { display:inline-flex; align-items:center; gap:4px; }
.box { width:11px; height:11px; border:1.5px solid #000; display:inline-block; vertical-align:middle; text-align:center; line-height:11px; font-size:9px; font-weight:bold; }
.acepto { text-align:center; margin-top:8px; font-size:10px; letter-spacing:2px; }
.acepto-line { display:flex; justify-content:center; align-items:center; gap:20px; margin-top:5px; }
.firma { border-bottom:1px solid #000; width:150px; }
.obs-box { margin-top:10px; border-top:2px solid #000; padding-top:8px; }
.obs-title { font-size:11px; font-weight:900; letter-spacing:1px; margin-bottom:8px; text-align:center; background:#222; color:#fff; padding:4px; }
.obs-text { font-size:12px; line-height:1.7; padding:8px; border:1px solid #ddd; border-radius:4px; background:#f9f9f9; min-height:60px; }
.footer { margin-top:8px; border-top:1px solid #ccc; padding-top:5px; display:flex; gap:10px; align-items:center; flex-wrap:wrap; font-size:9px; color:#444; }
.footer-icon { display:flex; align-items:center; gap:4px; text-decoration:none; color:#444; }
@media print { body { padding:6px; } }
</style></head><body>
<div class="header">
  <div class="header-logo"><img src="${LOGO_URL}" alt="DiFiore"/></div>
  <div class="header-center">
    <h1>ORDEN DE SERVICIO</h1>
    <div class="brand">DiFiore<span style="color:#333">Performance</span></div>
    <div class="sub">MECÁNICA AUTOMOTRIZ · MAR DEL PLATA</div>
  </div>
  <div class="folio">N° CLIENTE<br><span class="folio-num">${nroCliente}</span></div>
</div>
<div class="body">
  <div>
    <div class="field"><label>Marca / Modelo:</label><div class="val">${v?.marca_modelo || ''}</div></div>
    <div class="field"><label>Color:</label><div class="val">${v?.color || ''}</div></div>
    <div class="field"><label>Kilometraje:</label><div class="val">${v?.kilometraje || ''}</div></div>
    <div class="field"><label>Patente:</label><div class="val">${v?.patente || ''}</div></div>
    <div class="grua-seg">
      <div class="grua-item"><span>Grúa:</span>
        <span class="checkbox"><span class="box">${trabajo.llego_en_grua ? '✓' : ''}</span> Sí</span>
        <span class="checkbox"><span class="box">${!trabajo.llego_en_grua ? '✓' : ''}</span> No</span>
      </div>
      <div class="grua-item"><span>Seguro:</span>
        <span class="checkbox"><span class="box">${trabajo.tiene_seguro ? '✓' : ''}</span> Sí</span>
        <span class="checkbox"><span class="box">${!trabajo.tiene_seguro ? '✓' : ''}</span> No</span>
      </div>
    </div>
  </div>
  <div>
    <div style="font-weight:900;margin-bottom:5px;font-size:10px;">DATOS DEL CLIENTE</div>
    <div class="field"><label>Ingreso:</label><div class="val">${fecha(trabajo.fecha_ingreso)}</div></div>
    <div class="field"><label>Salida:</label><div class="val">${fecha(trabajo.fecha_salida)}</div></div>
    <div class="field"><label>Nombre:</label><div class="val">${c?.nombre || ''}</div></div>
    <div class="field"><label>Teléfono:</label><div class="val">${c?.telefono || ''}</div></div>
    <div class="field"><label>Email:</label><div class="val">${c?.email || ''}</div></div>
  </div>
</div>
<div class="section-title">TRABAJO REALIZADO</div>
<div class="motivo-text">${trabajo.motivo || ''}</div>
<div class="acepto"><div class="acepto-line"><div class="firma"></div><span style="font-weight:900;letter-spacing:3px;">RECIBÍ CONFORME</span><div class="firma"></div></div></div>
<div class="obs-box">
  <div class="obs-title">OBSERVACIONES FINALES</div>
  <div class="obs-text">${obs || '—'}</div>
</div>
<div class="footer">
  <a class="footer-icon" href="https://maps.google.com/maps?ftid=0x9584d9005992c969:0x872bb0a9e0f1a2f1"><svg width="12" height="12" viewBox="0 0 24 24" fill="#EA4335"><path d="M12 0C7.802 0 4 3.403 4 7.602 4 11.8 7.469 16.812 12 24c4.531-7.188 8-12.2 8-16.398C20 3.402 16.199 0 12 0zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/></svg>Malvinas 2084, MdP</a>
  <a class="footer-icon" href="tel:+542235299700"><svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>223 529-9700</a>
  <a class="footer-icon" href="https://www.instagram.com/di_fiore_mecanica/"><svg width="12" height="12" viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>@di_fiore_mecanica</a>
  <a class="footer-icon" href="https://www.facebook.com/share/19VHZRovXq/"><svg width="12" height="12" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>di_fiore_mecanica</a>
</div>
<script>window.onload=()=>{window.print()}<\/script>
</body></html>`
    const w = window.open('','_blank','width=820,height=1000')
    w.document.write(html); w.document.close()
  }

  function imprimirOrden(trabajo) {
    const c = trabajo.vehiculos?.clientes
    const v = trabajo.vehiculos
    const fecha = (f) => f ? new Date(f).toLocaleDateString('es-AR') : '___/___/______'
    const nroCliente = trabajo.numero_cliente || '—'

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Orden de Servicio</title>
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:Arial,sans-serif; font-size:11px; color:#000; padding:12px; max-width:720px; margin:0 auto; }
.header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; border-bottom:2px solid #000; padding-bottom:6px; }
.header-logo { width:130px; } .header-logo img { width:100%; }
.header-center { text-align:center; flex:1; }
.header-center h1 { font-size:15px; font-weight:900; letter-spacing:1px; margin-bottom:2px; }
.header-center .brand { font-size:12px; font-weight:900; color:#1a56db; letter-spacing:2px; }
.header-center .sub { font-size:8px; letter-spacing:3px; color:#555; }
.folio { text-align:right; font-size:9px; font-weight:bold; }
.folio-num { font-size:20px; font-weight:900; border-bottom:2px solid #000; display:inline-block; min-width:60px; text-align:center; }
.body { display:grid; grid-template-columns:1fr 1fr; gap:0 16px; margin:8px 0; }
.field { margin-bottom:5px; }
.field label { font-size:9px; color:#444; display:block; }
.field .val { border-bottom:1px solid #000; min-height:15px; font-size:11px; font-weight:600; padding:1px 0; }
.section-title { background:#222; color:#fff; text-align:center; font-weight:bold; font-size:10px; padding:3px; margin:6px 0 4px; letter-spacing:1px; }
.motivo-text { font-size:13px; font-weight:500; border-bottom:1px solid #000; padding:4px; line-height:1.6; min-height:20px; }
.grua-seg { display:flex; gap:16px; margin-bottom:4px; }
.grua-item { display:flex; gap:8px; align-items:center; font-size:10px; }
.checkbox { display:inline-flex; align-items:center; gap:4px; }
.box { width:11px; height:11px; border:1.5px solid #000; display:inline-block; vertical-align:middle; text-align:center; line-height:11px; font-size:9px; font-weight:bold; }
.acepto { text-align:center; margin-top:8px; font-size:10px; letter-spacing:2px; }
.acepto-line { display:flex; justify-content:center; align-items:center; gap:20px; margin-top:5px; }
.firma { border-bottom:1px solid #000; width:150px; }
.tc { margin-top:8px; border-top:2px solid #000; padding-top:6px; }
.tc-title { font-size:11px; font-weight:900; letter-spacing:1px; margin-bottom:6px; text-align:center; background:#222; color:#fff; padding:4px; }
.tc-grid { display:grid; grid-template-columns:1fr 1fr; gap:5px 16px; }
.tc-item { font-size:9.5px; line-height:1.5; margin-bottom:5px; }
.tc-item b { display:block; font-size:9.5px; text-transform:uppercase; margin-bottom:1px; }
.footer { margin-top:8px; border-top:1px solid #ccc; padding-top:5px; display:flex; gap:10px; align-items:center; flex-wrap:wrap; font-size:9px; color:#444; }
.footer-icon { display:flex; align-items:center; gap:4px; text-decoration:none; color:#444; }
@media print { body { padding:6px; } }
</style></head><body>
<div class="header">
  <div class="header-logo"><img src="${LOGO_URL}" alt="DiFiore"/></div>
  <div class="header-center">
    <h1>ORDEN DE SERVICIO</h1>
    <div class="brand">DiFiore<span style="color:#333">Performance</span></div>
    <div class="sub">MECÁNICA AUTOMOTRIZ · MAR DEL PLATA</div>
  </div>
  <div class="folio">N° CLIENTE<br><span class="folio-num">${nroCliente}</span></div>
</div>
<div class="body">
  <div>
    <div class="field"><label>Marca / Modelo:</label><div class="val">${v?.marca_modelo || ''}</div></div>
    <div class="field"><label>Color:</label><div class="val">${v?.color || ''}</div></div>
    <div class="field"><label>Kilometraje:</label><div class="val">${v?.kilometraje || ''}</div></div>
    <div class="field"><label>Patente:</label><div class="val">${v?.patente || ''}</div></div>
    <div class="grua-seg">
      <div class="grua-item"><span>Grúa:</span>
        <span class="checkbox"><span class="box">${trabajo.llego_en_grua ? '✓' : ''}</span> Sí</span>
        <span class="checkbox"><span class="box">${!trabajo.llego_en_grua ? '✓' : ''}</span> No</span>
      </div>
      <div class="grua-item"><span>Seguro:</span>
        <span class="checkbox"><span class="box">${trabajo.tiene_seguro ? '✓' : ''}</span> Sí</span>
        <span class="checkbox"><span class="box">${!trabajo.tiene_seguro ? '✓' : ''}</span> No</span>
      </div>
    </div>
  </div>
  <div>
    <div style="font-weight:900;margin-bottom:5px;font-size:10px;">DATOS DEL CLIENTE</div>
    <div class="field"><label>Ingreso:</label><div class="val">${fecha(trabajo.fecha_ingreso)}</div></div>
    <div class="field"><label>Salida estimada:</label><div class="val">${fecha(trabajo.fecha_salida)}</div></div>
    <div class="field"><label>Nombre:</label><div class="val">${c?.nombre || ''}</div></div>
    <div class="field"><label>Teléfono:</label><div class="val">${c?.telefono || ''}</div></div>
    <div class="field"><label>Email:</label><div class="val">${c?.email || ''}</div></div>
  </div>
</div>
<div class="section-title">TRABAJO A REALIZAR / DESCRIPCIÓN DEL PROBLEMA</div>
<div class="motivo-text">${trabajo.motivo || ''}</div>
<div class="acepto"><div class="acepto-line"><div class="firma"></div><span style="font-weight:900;letter-spacing:3px;">A C E P T O</span><div class="firma"></div></div></div>
<div class="tc">
  <div class="tc-title">TÉRMINOS Y CONDICIONES — DI FIORE MECÁNICA</div>
  <div class="tc-grid">
    <div class="tc-item"><b>1. Ingreso al taller</b>Al ingresar el vehículo, el cliente deberá abonar $100.000 correspondientes al diagnóstico inicial (*). En caso de aceptar el trabajo, el valor del diagnóstico se descuenta de la mano de obra.</div>
    <div class="tc-item"><b>2. Diagnóstico</b>El diagnóstico es para que los profesionales tengan un panorama del problema. El taller no está obligado a enviar reportes periódicos; al final se entregará un informe detallado del trabajo realizado.</div>
    <div class="tc-item"><b>3. Presupuesto y aceptación</b>Una vez realizado el diagnóstico se enviará el detalle de repuestos y mano de obra. Si el cliente acepta, contará con 48hs hábiles para entregar el importe y dar inicio a la reparación.</div>
    <div class="tc-item"><b>4. Vencimiento / Cochera</b>Si pasadas las 48hs hábiles no se realizó el pago, se cobrará cochera a $8.000/día. Las mismas condiciones aplican una vez notificada la finalización del trabajo.</div>
    <div class="tc-item"><b>5. Pertenencias</b>El cliente deberá retirar todas las pertenencias personales. Di Fiore Mecánica no se responsabiliza por objetos personales en el interior del vehículo.</div>
    <div class="tc-item"><b>6. Plazos de pago</b>El plazo máximo para abonar el total del trabajo es el día del retiro del vehículo.</div>
    <div class="tc-item"><b>7. Garantía (30 días desde la entrega)</b>El taller proveerá materiales, repuestos y trabajos tercerizados. La garantía es sobre el trabajo en el vehículo y NO incluye traslados. NO TRABAJAMOS DE OTRA MANERA.</div>
    <div class="tc-item"><b>8. Entrega</b>El cliente podrá retirar su vehículo hasta las 17hs con previa coordinación.</div>
  </div>
  <div style="display:flex;gap:30px;margin-top:8px;font-size:9px;">
    <div>Fecha: ___________________</div>
    <div>Patente: ___________________</div>
    <div style="flex:1;text-align:right;">Firma y aclaración: ___________________</div>
  </div>
</div>
<div class="footer">
  <a class="footer-icon" href="https://maps.google.com/maps?ftid=0x9584d9005992c969:0x872bb0a9e0f1a2f1"><svg width="12" height="12" viewBox="0 0 24 24" fill="#EA4335"><path d="M12 0C7.802 0 4 3.403 4 7.602 4 11.8 7.469 16.812 12 24c4.531-7.188 8-12.2 8-16.398C20 3.402 16.199 0 12 0zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/></svg>Malvinas Argentinas 2084, MdP</a>
  <a class="footer-icon" href="tel:+542235299700"><svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>223 529-9700</a>
  <a class="footer-icon" href="https://www.instagram.com/di_fiore_mecanica/"><svg width="12" height="12" viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>@di_fiore_mecanica</a>
  <a class="footer-icon" href="https://www.facebook.com/share/19VHZRovXq/"><svg width="12" height="12" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>di_fiore_mecanica</a>
</div>
<script>window.onload=()=>{window.print()}<\/script>
</body></html>`
    const w = window.open('','_blank','width=820,height=1000')
    w.document.write(html); w.document.close()
  }

  function imprimirRepuestos(trabajo, lista) {
    const c = trabajo.vehiculos?.clientes
    const v = trabajo.vehiculos
    const total = lista.reduce((a,r) => a + Number(r.valor), 0)
    const nroCliente = trabajo.numero_cliente || '—'
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Historial de Repuestos</title>
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:Arial,sans-serif; font-size:11px; color:#000; padding:15px; max-width:720px; margin:0 auto; }
.header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; border-bottom:2px solid #000; padding-bottom:8px; }
.header-logo { width:140px; } .header-logo img { width:100%; }
.header-center { text-align:center; flex:1; }
.header-center h1 { font-size:16px; font-weight:900; letter-spacing:1px; margin-bottom:2px; }
.header-center .brand { font-size:13px; font-weight:900; color:#1a56db; letter-spacing:2px; }
.header-center .sub { font-size:8px; letter-spacing:3px; color:#555; }
.folio { text-align:right; font-size:9px; font-weight:bold; }
.folio-num { font-size:22px; font-weight:900; border-bottom:2px solid #000; display:inline-block; min-width:60px; text-align:center; }
.info { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin:10px 0; padding:8px; border:1px solid #ddd; border-radius:4px; background:#f9f9f9; }
.info-item label { font-size:9px; color:#555; display:block; font-weight:bold; text-transform:uppercase; }
.info-item span { font-size:12px; font-weight:700; }
table { width:100%; border-collapse:collapse; margin-bottom:12px; }
thead th { background:#222; color:#fff; padding:7px 10px; text-align:left; font-size:10px; font-weight:bold; }
tbody td { padding:7px 10px; border-bottom:1px solid #ddd; font-size:11px; }
tbody tr:nth-child(even) { background:#f9f9f9; }
.total-row td { font-weight:900; background:#e8f4e8; font-size:13px; border-top:2px solid #000; }
.footer { margin-top:10px; border-top:1px solid #ccc; padding-top:6px; display:flex; gap:12px; align-items:center; flex-wrap:wrap; font-size:9px; color:#444; }
.footer-icon { display:flex; align-items:center; gap:4px; text-decoration:none; color:#444; }
</style></head><body>
<div class="header">
  <div class="header-logo"><img src="${LOGO_URL}" alt="DiFiore"/></div>
  <div class="header-center"><h1>HISTORIAL DE REPUESTOS</h1><div class="brand">DiFiore<span style="color:#333">Performance</span></div><div class="sub">MECÁNICA AUTOMOTRIZ · MAR DEL PLATA</div></div>
  <div class="folio">N° CLIENTE<br><span class="folio-num">${nroCliente}</span></div>
</div>
<div class="info">
  <div class="info-item"><label>Cliente</label><span>${c?.nombre||'—'}</span></div>
  <div class="info-item"><label>Teléfono</label><span>${c?.telefono||'—'}</span></div>
  <div class="info-item"><label>Email</label><span>${c?.email||'—'}</span></div>
  <div class="info-item"><label>Vehículo</label><span>${v?.marca_modelo||'—'}</span></div>
  <div class="info-item"><label>Patente</label><span>${v?.patente||'—'}</span></div>
  <div class="info-item"><label>Color</label><span>${v?.color||'—'}</span></div>
</div>
<table>
  <thead><tr><th>#</th><th>Repuesto</th><th>Valor</th><th>Lugar</th><th>Fecha</th></tr></thead>
  <tbody>
    ${lista.map((r,i) => `<tr><td>${i+1}</td><td>${r.nombre}</td><td>$${Number(r.valor).toLocaleString('es-AR')}</td><td>${r.lugar||'—'}</td><td>${new Date(r.fecha).toLocaleDateString('es-AR')}</td></tr>`).join('')}
    <tr class="total-row"><td colspan="2">TOTAL</td><td>$${total.toLocaleString('es-AR')}</td><td colspan="2"></td></tr>
  </tbody>
</table>
<div class="footer">
  <a class="footer-icon" href="https://maps.google.com/maps?ftid=0x9584d9005992c969:0x872bb0a9e0f1a2f1"><svg width="12" height="12" viewBox="0 0 24 24" fill="#EA4335"><path d="M12 0C7.802 0 4 3.403 4 7.602 4 11.8 7.469 16.812 12 24c4.531-7.188 8-12.2 8-16.398C20 3.402 16.199 0 12 0zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/></svg>Malvinas 2084, MdP</a>
  <a class="footer-icon" href="tel:+542235299700"><svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>223 529-9700</a>
  <a class="footer-icon" href="https://www.instagram.com/di_fiore_mecanica/"><svg width="12" height="12" viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>@di_fiore_mecanica</a>
  <a class="footer-icon" href="https://www.facebook.com/share/19VHZRovXq/"><svg width="12" height="12" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>di_fiore_mecanica</a>
</div>
<script>window.onload=()=>{window.print()}<\/script>
</body></html>`
    const w = window.open('','_blank','width=820,height=900')
    w.document.write(html); w.document.close()
  }

  function abrirWsp(trabajo) {
    const tel = trabajo.vehiculos?.clientes?.telefono?.replace(/\D/g,'')
    const nombre = trabajo.vehiculos?.clientes?.nombre
    const vehiculo = trabajo.vehiculos?.marca_modelo
    const patente = trabajo.vehiculos?.patente
    setMsgWsp(`Hola ${nombre}! Te contactamos desde DiFiore Performance con novedades sobre tu ${vehiculo} (${patente}).`)
    setModalWsp({ trabajo, tel })
  }

  function enviarWsp() {
    if (!modalWsp) return
    const trabajo = modalWsp.trabajo
    const nombre = trabajo.vehiculos?.clientes?.nombre || ''
    const vehiculo = trabajo.vehiculos?.marca_modelo || ''
    const patente = trabajo.vehiculos?.patente || ''
    let tel = modalWsp.tel || ''
    if (!tel.startsWith('54')) tel = '54' + tel
    const msgConDatos = msgWsp + `\n\n_Datos:_\n• Cliente: ${nombre}\n• Vehículo: ${vehiculo}\n• Patente: ${patente}`
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msgConDatos)}`, '_blank')
    setModalWsp(null)
  }

  async function registrarReingreso() {
    const trabajo = modalReingreso
    const fechaIngreso = formReingreso.fecha_ingreso_manual ? new Date(formReingreso.fecha_ingreso_manual).toISOString() : new Date().toISOString()
    const { data: nuevoTrabajo } = await supabase.from('trabajos').insert({
      vehiculo_id: trabajo.vehiculos?.id, motivo: formReingreso.motivo, estado: formReingreso.estado,
      mecanico: formReingreso.mecanico, taller: formReingreso.taller, llego_en_grua: formReingreso.llego_en_grua,
      tiene_seguro: trabajo.tiene_seguro, fecha_ingreso: fechaIngreso
    }).select('*, vehiculos(*, clientes(*))').single()
    if (nuevoTrabajo) {
      await agregarHistorial(nuevoTrabajo.id, 'reingreso', `Reingreso al taller ${formReingreso.taller}. Motivo: ${formReingreso.motivo}`)
      await agregarHistorial(nuevoTrabajo.id, 'estado', `Historial anterior: el vehículo ya había ingresado previamente al taller (trabajo N° ${trabajo.id.slice(0,8)}).`)
    }
    setModalReingreso(null)
    setFormReingreso({ motivo: '', mecanico: '', taller: 'Malvinas 2084', estado: 'Diagnóstico', llego_en_grua: false, fecha_ingreso_manual: '' })
    cargarDatos()
    setVerEntregados(false)
  }

  async function guardarCliente(e) {
    e.preventDefault()
    const { data: cliente, error: errCliente } = await supabase.from('clientes').insert({ nombre: form.nombre, telefono: form.telefono, email: form.email }).select().single()
    if (errCliente) { setMensaje('Error al guardar cliente'); return }
    const { data: vehiculo, error: errVehiculo } = await supabase.from('vehiculos').insert({ cliente_id: cliente.id, marca_modelo: form.marca_modelo, patente: form.patente, anio: form.anio, kilometraje: form.kilometraje, color: form.color }).select().single()
    if (errVehiculo) { setMensaje('Error al guardar vehículo'); return }
    const fechaIngreso = form.fecha_ingreso_manual ? new Date(form.fecha_ingreso_manual).toISOString() : new Date().toISOString()
    const { data: trabajo } = await supabase.from('trabajos').insert({
      vehiculo_id: vehiculo.id, motivo: form.motivo, estado: form.estado, mecanico: form.mecanico,
      taller: form.taller, llego_en_grua: form.llego_en_grua, tiene_seguro: form.tiene_seguro, fecha_ingreso: fechaIngreso
    }).select('*, vehiculos(*, clientes(*))').single()
    if (fotoNuevo.length > 0 && trabajo) {
      for (const f of fotoNuevo) {
        const url = await subirFotoStorage(f, trabajo.id)
        if (url) await supabase.from('fotos').insert({ trabajo_id: trabajo.id, url })
      }
    }
    await agregarHistorial(trabajo.id, 'ingreso', `Ingresó al taller ${form.taller} ${form.llego_en_grua ? '(en grúa)' : '(andando)'}. Seguro: ${form.tiene_seguro ? 'Sí' : 'No'}. Motivo: ${form.motivo}`)
    setForm({ nombre: '', telefono: '', email: '', marca_modelo: '', patente: '', anio: '', kilometraje: '', color: '', motivo: '', estado: 'Diagnóstico', mecanico: '', taller: 'Malvinas 2084', llego_en_grua: false, tiene_seguro: false, fecha_ingreso_manual: '' })
    setFotoNuevo([])
    cargarDatos()
    if (trabajo?.vehiculos?.clientes?.telefono) {
      const tel = trabajo.vehiculos.clientes.telefono.replace(/\D/g,'')
      setModalWsp({ trabajo, tel })
      setMsgWsp(`Hola ${trabajo.vehiculos.clientes.nombre}! Te contactamos desde DiFiore Performance. Tu ${trabajo.vehiculos.marca_modelo} (${trabajo.vehiculos.patente}) ingresó al taller. Ante cualquier consulta estamos a tu disposición.`)
    } else { setSeccion('clientes') }
  }

  async function registrarSalida() {
    await supabase.from('trabajos').update({ estado: 'Salio', fecha_salida: new Date().toISOString(), observacion_final: observacionFinal }).eq('id', modalSalida.id)
    await agregarHistorial(modalSalida.id, 'salida', `Vehículo retirado. ${observacionFinal ? 'Obs: ' + observacionFinal : ''}`)
    const trabajoActualizado = { ...modalSalida, estado: 'Salio', fecha_salida: new Date().toISOString(), observacion_final: observacionFinal }
    setModalSalida(null)
    setObservacionFinal('')
    if (clienteDetalle?.id === trabajoActualizado.id) { setSeccion('clientes'); setClienteDetalle(null) }
    cargarDatos()
    if (observacionFinal && window.confirm('¿Querés imprimir la orden con las observaciones finales?')) {
      imprimirOrdenConObservaciones(trabajoActualizado, observacionFinal)
    }
  }

  async function borrarCliente(trabajo) {
    if (!confirm(`¿Borrar a ${trabajo.vehiculos?.clientes?.nombre}?`)) return
    await supabase.from('historial').delete().eq('trabajo_id', trabajo.id)
    await supabase.from('actualizaciones').delete().eq('trabajo_id', trabajo.id)
    await supabase.from('repuestos').delete().eq('trabajo_id', trabajo.id)
    await supabase.from('fotos').delete().eq('trabajo_id', trabajo.id)
    await supabase.from('trabajos').delete().eq('id', trabajo.id)
    await supabase.from('vehiculos').delete().eq('id', trabajo.vehiculos?.id)
    await supabase.from('clientes').delete().eq('id', trabajo.vehiculos?.clientes?.id)
    setSeccion('clientes'); setClienteDetalle(null); cargarDatos()
  }

  async function guardarEdicion() {
    const tallerAnterior = formEditar.taller_anterior
    const tallerNuevo = formEditar.taller
    await supabase.from('clientes').update({ nombre: formEditar.nombre, telefono: formEditar.telefono, email: formEditar.email }).eq('id', formEditar.cliente_id)
    await supabase.from('vehiculos').update({ marca_modelo: formEditar.marca_modelo, patente: formEditar.patente, anio: formEditar.anio, kilometraje: formEditar.kilometraje, color: formEditar.color }).eq('id', formEditar.vehiculo_id)
    await supabase.from('trabajos').update({ motivo: formEditar.motivo, estado: formEditar.estado, mecanico: formEditar.mecanico, taller: formEditar.taller, llego_en_grua: formEditar.llego_en_grua, tiene_seguro: formEditar.tiene_seguro }).eq('id', formEditar.trabajo_id)
    if (tallerAnterior !== tallerNuevo) await agregarHistorial(formEditar.trabajo_id, 'movimiento', `Movido de ${tallerAnterior} a ${tallerNuevo}`)
    setModalEditar(null); cargarDatos()
    if (clienteDetalle) cargarHistorial(formEditar.trabajo_id)
  }

  async function guardarActualizacion() {
    const t = modalActualizar
    let descripcion = formActualizar.descripcion
    let tipo = formActualizar.tipo
    if (tipo === 'taller') {
      await supabase.from('trabajos').update({ taller: formActualizar.taller_nuevo }).eq('id', t.id)
      descripcion = `Movido a ${formActualizar.taller_nuevo}. ${descripcion}`
      tipo = 'movimiento'
    } else if (tipo === 'prueba') { descripcion = `En prueba. ${descripcion}` }
    await supabase.from('actualizaciones').insert({ trabajo_id: t.id, tipo, descripcion })
    setModalActualizar(null)
    setFormActualizar({ tipo: 'estado', descripcion: '', taller_nuevo: 'Malvinas 3906' })
    cargarDatos()
    if (clienteDetalle?.id === t.id) { await cargarHistorial(t.id); await cargarRepuestos(t.id) }
  }

  async function guardarRepuesto() {
    const trabajoId = modalRepuesto.id
    await supabase.from('repuestos').insert({ trabajo_id: trabajoId, nombre: formRepuesto.nombre, valor: parseFloat(parseNum(formRepuesto.valor)) || 0, lugar: formRepuesto.lugar, fecha: formRepuesto.fecha })
    setModalRepuesto(null)
    setFormRepuesto({ nombre: '', valor: '', lugar: '', fecha: new Date().toISOString().split('T')[0] })
    await cargarRepuestos(trabajoId)
  }

  async function guardarEdicionRepuesto() {
    await supabase.from('repuestos').update({ nombre: formEditarRepuesto.nombre, valor: parseFloat(parseNum(formEditarRepuesto.valor)) || 0, lugar: formEditarRepuesto.lugar, fecha: formEditarRepuesto.fecha }).eq('id', formEditarRepuesto.id)
    setModalEditarRepuesto(null)
    await cargarRepuestos(clienteDetalle.id)
  }

  async function borrarRepuesto(repuesto) {
    if (!confirm(`¿Borrar repuesto "${repuesto.nombre}"?`)) return
    await supabase.from('repuestos').delete().eq('id', repuesto.id)
    await cargarRepuestos(clienteDetalle.id)
  }

  async function subirFotosModal(e) {
    const files = Array.from(e.target.files)
    if (!files.length || !modalFotos) return
    setSubiendo(true)
    for (const file of files) {
      const url = await subirFotoStorage(file, modalFotos.id)
      if (url) await supabase.from('fotos').insert({ trabajo_id: modalFotos.id, url })
    }
    await cargarFotosModal(modalFotos.id)
    setSubiendo(false); e.target.value = ''
  }

  async function borrarFotoModal(foto) {
    await supabase.from('fotos').delete().eq('id', foto.id)
    await cargarFotosModal(modalFotos.id)
  }

  async function subirFoto(e) {
    const files = Array.from(e.target.files)
    if (!files.length || !clienteDetalle) return
    setSubiendo(true)
    for (const file of files) {
      const url = await subirFotoStorage(file, clienteDetalle.id)
      if (url) await supabase.from('fotos').insert({ trabajo_id: clienteDetalle.id, url })
    }
    await cargarFotos(clienteDetalle.id)
    setSubiendo(false); e.target.value = ''
  }

  async function borrarFoto(foto) {
    await supabase.from('fotos').delete().eq('id', foto.id)
    await cargarFotos(clienteDetalle.id)
  }

  function verDetalle(trabajo) {
    setClienteDetalle(trabajo); setSeccion('detalle'); setSidebarOpen(false)
    cargarFotos(trabajo.id); cargarHistorial(trabajo.id); cargarRepuestos(trabajo.id)
  }

  function abrirEditar(trabajo) {
    setFormEditar({
      trabajo_id: trabajo.id, cliente_id: trabajo.vehiculos?.clientes?.id, vehiculo_id: trabajo.vehiculos?.id,
      nombre: trabajo.vehiculos?.clientes?.nombre, telefono: trabajo.vehiculos?.clientes?.telefono, email: trabajo.vehiculos?.clientes?.email,
      marca_modelo: trabajo.vehiculos?.marca_modelo, patente: trabajo.vehiculos?.patente, anio: trabajo.vehiculos?.anio, kilometraje: trabajo.vehiculos?.kilometraje, color: trabajo.vehiculos?.color,
      motivo: trabajo.motivo, estado: trabajo.estado, mecanico: trabajo.mecanico, taller: trabajo.taller, taller_anterior: trabajo.taller,
      llego_en_grua: trabajo.llego_en_grua || false, tiene_seguro: trabajo.tiene_seguro || false,
    })
    setModalEditar(true)
  }

  function badgeClass(estado) {
    if (estado === 'Listo') return styles.badgeGreen
    if (estado === 'En proceso') return styles.badgeAmber
    if (estado === 'En espera') return styles.badgeBlue
    if (estado === 'Desarmando') return styles.badgeRed
    if (estado === 'Salio') return styles.badgeGray
    return styles.badgeGray
  }

  // INFORME MENSUAL
  function generarInforme() {
    const [anio, mes] = mesInforme.split('-').map(Number)
    const inicio = new Date(anio, mes - 1, 1)
    const fin = new Date(anio, mes, 0, 23, 59, 59)
    const ingresados = trabajos.filter(t => { const d = new Date(t.fecha_ingreso); return d >= inicio && d <= fin })
    const salidos = trabajos.filter(t => { if (!t.fecha_salida) return false; const d = new Date(t.fecha_salida); return d >= inicio && d <= fin })
    const marcasCount = {}
    ingresados.forEach(t => { const m = getMarca(t.vehiculos?.marca_modelo); marcasCount[m] = (marcasCount[m]||0)+1 })
    const marcaTop = Object.entries(marcasCount).sort((a,b)=>b[1]-a[1])[0]
    const nombreMes = new Date(anio, mes-1, 1).toLocaleDateString('es-AR', {month:'long',year:'numeric'})
    return { ingresados, salidos, marcaTop, marcasCount, nombreMes, anio, mes }
  }

  function imprimirInforme() {
    const { ingresados, salidos, marcaTop, marcasCount, nombreMes } = generarInforme()
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Informe Mensual</title>
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:Arial,sans-serif; font-size:12px; color:#000; padding:30px; max-width:750px; margin:0 auto; }
.header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; border-bottom:3px solid #1a56db; padding-bottom:16px; }
.header-logo img { width:160px; }
.header-info { text-align:right; }
.header-info h1 { font-size:22px; font-weight:900; color:#1a56db; margin-bottom:4px; }
.header-info p { font-size:11px; color:#555; }
.stats { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
.stat-box { border:2px solid #1a56db; border-radius:10px; padding:16px; text-align:center; }
.stat-box .num { font-size:36px; font-weight:900; color:#1a56db; }
.stat-box .lbl { font-size:10px; color:#555; text-transform:uppercase; letter-spacing:.5px; margin-top:4px; }
.section { margin-bottom:20px; }
.section-title { background:#222; color:#fff; font-weight:bold; font-size:11px; padding:6px 12px; margin-bottom:8px; letter-spacing:1px; }
table { width:100%; border-collapse:collapse; }
thead th { background:#f0f0f0; padding:8px 10px; text-align:left; font-size:10px; font-weight:700; border-bottom:2px solid #ccc; }
tbody td { padding:8px 10px; border-bottom:1px solid #eee; font-size:11px; }
tbody tr:nth-child(even) { background:#f9f9f9; }
.marcas { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.marca-item { border:1px solid #e0e0e0; border-radius:6px; padding:10px; display:flex; justify-content:space-between; align-items:center; }
.marca-item span { font-size:13px; color:#555; }
.marca-item b { font-size:18px; color:#1a56db; }
.bottom { margin-top:24px; border-top:2px solid #1a56db; padding-top:10px; text-align:center; font-size:10px; color:#1a56db; font-weight:600; }
@media print { body { padding:15px; } }
</style></head><body>
<div class="header">
  <div class="header-logo"><img src="${LOGO_URL}" alt="DiFiore"/></div>
  <div class="header-info">
    <h1>INFORME MENSUAL</h1>
    <p style="font-size:14px;font-weight:700;color:#333;margin-bottom:4px">${nombreMes.toUpperCase()}</p>
    <p>Generado: ${new Date().toLocaleDateString('es-AR')}</p>
    <p>Malvinas 2084 — Mar del Plata</p>
  </div>
</div>
<div class="stats">
  <div class="stat-box"><div class="num">${ingresados.length}</div><div class="lbl">Vehículos ingresados</div></div>
  <div class="stat-box"><div class="num">${salidos.length}</div><div class="lbl">Vehículos entregados</div></div>
  <div class="stat-box" style="border-color:#16A34A"><div class="num" style="color:#16A34A">${marcaTop ? marcaTop[0] : '—'}</div><div class="lbl">Marca más frecuente${marcaTop ? ` (${marcaTop[1]})` : ''}</div></div>
</div>
<div class="section">
  <div class="section-title">VEHÍCULOS INGRESADOS (${ingresados.length})</div>
  <table>
    <thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Taller</th><th>Ingreso</th></tr></thead>
    <tbody>
      ${ingresados.map((t,i) => `<tr><td>${i+1}</td><td>${t.vehiculos?.marca_modelo||'—'}</td><td>${t.vehiculos?.clientes?.nombre||'—'}</td><td>${t.vehiculos?.patente||'—'}</td><td>${t.taller||'—'}</td><td>${new Date(t.fecha_ingreso).toLocaleDateString('es-AR')}</td></tr>`).join('')}
      ${ingresados.length === 0 ? '<tr><td colspan="6" style="text-align:center;color:#999;padding:16px">Sin ingresos este mes</td></tr>' : ''}
    </tbody>
  </table>
</div>
<div class="section">
  <div class="section-title">VEHÍCULOS ENTREGADOS (${salidos.length})</div>
  <table>
    <thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Taller</th><th>Entrega</th></tr></thead>
    <tbody>
      ${salidos.map((t,i) => `<tr><td>${i+1}</td><td>${t.vehiculos?.marca_modelo||'—'}</td><td>${t.vehiculos?.clientes?.nombre||'—'}</td><td>${t.vehiculos?.patente||'—'}</td><td>${t.taller||'—'}</td><td>${new Date(t.fecha_salida).toLocaleDateString('es-AR')}</td></tr>`).join('')}
      ${salidos.length === 0 ? '<tr><td colspan="6" style="text-align:center;color:#999;padding:16px">Sin entregas este mes</td></tr>' : ''}
    </tbody>
  </table>
</div>
<div class="section">
  <div class="section-title">MARCAS ATENDIDAS</div>
  <div class="marcas">
    ${Object.entries(marcasCount).sort((a,b)=>b[1]-a[1]).map(([marca,n]) => `<div class="marca-item"><span>${marca}</span><b>${n}</b></div>`).join('')}
    ${Object.keys(marcasCount).length === 0 ? '<p style="color:#999;font-size:12px;padding:8px">Sin datos</p>' : ''}
  </div>
</div>
<div class="bottom">Di Fiore Performance — Malvinas 2084, Mar del Plata 7600</div>
<script>window.onload=()=>{window.print()}<\/script>
</body></html>`
    const w = window.open('','_blank','width=820,height=1000')
    w.document.write(html); w.document.close()
  }

  const trabajosActivos = trabajos.filter(t => t.estado !== 'Salio')
  const trabajosEntregados = trabajos.filter(t => t.estado === 'Salio').sort((a,b) => new Date(b.fecha_salida||b.fecha_ingreso) - new Date(a.fecha_salida||a.fecha_ingreso))
  const conteoMarcas = trabajosActivos.reduce((acc, t) => {
    const marca = getMarca(t.vehiculos?.marca_modelo)
    acc[marca] = (acc[marca] || 0) + 1
    return acc
  }, {})
  const trabajosFiltrados = trabajos.filter(t => t.estado !== 'Salio').filter(t => {
    const q = busqueda.toLowerCase()
    return t.vehiculos?.clientes?.nombre?.toLowerCase().includes(q) || t.vehiculos?.patente?.toLowerCase().includes(q) || t.vehiculos?.marca_modelo?.toLowerCase().includes(q)
  }).sort((a, b) => new Date(b.fecha_ingreso) - new Date(a.fecha_ingreso))
  const totalFiltrados = trabajosFiltrados.length
  const stats = { total: clientes.length, enTaller: trabajosActivos.length, listos: trabajos.filter(t => t.estado === 'Listo').length, salidos: trabajosEntregados.length }
  const listaVistaStats = {
    enTaller: trabajos.filter(t => t.estado !== 'Salio').sort((a,b) => new Date(b.fecha_ingreso) - new Date(a.fecha_ingreso)),
    listos: trabajos.filter(t => t.estado === 'Listo').sort((a,b) => new Date(b.fecha_ingreso) - new Date(a.fecha_ingreso)),
    salidos: trabajosEntregados,
  }
  const titulosVistaStats = { enTaller: 'Autos en taller', listos: 'Listos para entregar', salidos: 'Vehículos entregados' }
  const tipoHistorial = { ingreso: '🟢', salida: '🔴', movimiento: '🔵', reingreso: '🟡', estado: '⚪', prueba: '🟠' }
  const trabajosTaller = tallerVista ? trabajos.filter(t => t.taller === tallerVista && t.estado !== 'Salio').sort((a,b) => new Date(a.fecha_ingreso) - new Date(b.fecha_ingreso)) : []
  const trabajosDeMarca = vistaMarca ? trabajosActivos.filter(t => getMarca(t.vehiculos?.marca_modelo) === vistaMarca) : []
  const { totalPesos, totalUSD } = calcularTotalesPresupuesto()
  const navLinks = [
    { color:'#E1306C', icon:<IgIcon/>, href:'https://www.instagram.com/di_fiore_mecanica/', label:'@di_fiore_mecanica' },
    { color:'#1877F2', icon:<FbIcon/>, href:'https://www.facebook.com/share/19VHZRovXq/?mibextid=wwXIfr', label:'di_fiore_mecanica' },
    { color:'#25D366', icon:<WaIcon/>, href:'tel:+542235299700', label:'223 529-9700' },
    { color:'#EA4335', icon:<MapIcon/>, href:'https://maps.google.com/maps?ftid=0x9584d9005992c969:0x872bb0a9e0f1a2f1', label:'Malvinas 2084, MdP' },
  ]

  return (
    <div className={styles.app}>
      <button className={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
      {sidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)}/>}

      {fotoZoom && (
        <div className={styles.modalOverlay} onClick={() => setFotoZoom(null)} style={{cursor:'zoom-out'}}>
          <img src={fotoZoom} alt="zoom" style={{maxWidth:'90vw',maxHeight:'90vh',objectFit:'contain',borderRadius:'8px'}}/>
        </div>
      )}

      {/* MODAL WSP */}
      {modalWsp && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>💬 Enviar WhatsApp</div>
            <div className={styles.modalSub}>{modalWsp.trabajo?.vehiculos?.clientes?.nombre} · {modalWsp.trabajo?.vehiculos?.clientes?.telefono}</div>
            <div className={styles.formGroup} style={{marginTop:'1rem'}}>
              <label>Mensaje</label>
              <textarea value={msgWsp} onChange={e => setMsgWsp(e.target.value)} style={{minHeight:'100px'}}/>
            </div>
            <div style={{fontSize:'11px',color:'#718096',marginTop:'6px'}}>Se enviará también nombre, vehículo y patente para agendar el contacto.</div>
            <div className={styles.modalActions}>
              <button className={styles.btn} onClick={() => { setModalWsp(null); setSeccion('clientes') }}>Cancelar</button>
              <button style={{padding:'8px 16px',borderRadius:'6px',fontSize:'13px',cursor:'pointer',background:'#25D366',color:'#fff',border:'none',fontFamily:'inherit',fontWeight:'600'}} onClick={enviarWsp}>Enviar WhatsApp</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REINGRESO */}
      {modalReingreso && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>🔄 Registrar reingreso</div>
            <div className={styles.modalSub}><b>{modalReingreso.vehiculos?.marca_modelo}</b> — {modalReingreso.vehiculos?.clientes?.nombre}</div>
            <div style={{fontSize:'11px',color:'#2563EB',background:'#EFF6FF',padding:'8px 12px',borderRadius:'6px',marginTop:'8px'}}>ℹ️ El historial anterior del vehículo se conserva.</div>
            <div style={{marginTop:'1rem',display:'flex',flexDirection:'column',gap:'10px'}}>
              <div className={styles.formGroup}><label>Motivo</label><textarea value={formReingreso.motivo} onChange={e => setFormReingreso({...formReingreso, motivo: e.target.value})} placeholder="Describí el problema..."/></div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}><label>Mecánico</label><input value={formReingreso.mecanico} onChange={e => setFormReingreso({...formReingreso, mecanico: e.target.value})} placeholder="Agus D."/></div>
                <div className={styles.formGroup}><label>Estado</label>
                  <select value={formReingreso.estado} onChange={e => setFormReingreso({...formReingreso, estado: e.target.value})}>
                    <option>Diagnóstico</option><option>En proceso</option><option>En espera</option><option>Desarmando</option><option>Listo</option>
                  </select>
                </div>
                <div className={styles.formGroup}><label>Taller</label>
                  <select value={formReingreso.taller} onChange={e => setFormReingreso({...formReingreso, taller: e.target.value})}>
                    <option>Malvinas 2084</option><option>Malvinas 3906</option>
                  </select>
                </div>
                <div className={styles.formGroup}><label>Llegó en</label>
                  <select value={formReingreso.llego_en_grua ? 'grua' : 'andando'} onChange={e => setFormReingreso({...formReingreso, llego_en_grua: e.target.value === 'grua'})}>
                    <option value="andando">Andando</option><option value="grua">En grúa</option>
                  </select>
                </div>
                <div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Fecha de ingreso</label><input type="datetime-local" value={formReingreso.fecha_ingreso_manual} onChange={e => setFormReingreso({...formReingreso, fecha_ingreso_manual: e.target.value})}/></div>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btn} onClick={() => setModalReingreso(null)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={registrarReingreso}>Registrar reingreso</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SALIDA */}
      {modalSalida && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>Registrar salida</div>
            <div className={styles.modalSub}><b>{modalSalida.vehiculos?.marca_modelo}</b> — {modalSalida.vehiculos?.clientes?.nombre}</div>
            <div className={styles.formGroup} style={{marginTop:'1rem'}}>
              <label>Observación final</label>
              <textarea value={observacionFinal} onChange={e => setObservacionFinal(e.target.value)} placeholder="Trabajo realizado, recomendaciones, etc..."/>
            </div>
            <div className={styles.modalDate}>Fecha y hora: {new Date().toLocaleString('es-AR')}</div>
            <div className={styles.modalActions}>
              <button className={styles.btn} onClick={() => setModalSalida(null)}>Cancelar</button>
              <button className={styles.btnDangerSolid} onClick={registrarSalida}>Confirmar salida</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {modalEditar && admin && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{width:'100%',maxWidth:'520px',maxHeight:'80vh',overflowY:'auto'}}>
            <div className={styles.modalTitle}>Editar cliente</div>
            <div style={{marginTop:'1rem'}}>
              <div className={styles.cardTitle}>Datos del cliente</div>
              <div className={styles.formGrid} style={{marginBottom:'1rem'}}>
                <div className={styles.formGroup}><label>Nombre</label><input value={formEditar.nombre||''} onChange={e => setFormEditar({...formEditar, nombre: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Teléfono</label><input value={formEditar.telefono||''} onChange={e => setFormEditar({...formEditar, telefono: e.target.value})}/></div>
                <div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Email</label><input value={formEditar.email||''} onChange={e => setFormEditar({...formEditar, email: e.target.value})}/></div>
              </div>
              <div className={styles.cardTitle}>Datos del vehículo</div>
              <div className={styles.formGrid} style={{marginBottom:'1rem'}}>
                <div className={styles.formGroup}><label>Modelo</label><input value={formEditar.marca_modelo||''} onChange={e => setFormEditar({...formEditar, marca_modelo: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Patente</label><input value={formEditar.patente||''} onChange={e => setFormEditar({...formEditar, patente: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Año</label><input value={formEditar.anio||''} onChange={e => setFormEditar({...formEditar, anio: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Km</label><input value={formEditar.kilometraje||''} onChange={e => setFormEditar({...formEditar, kilometraje: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Color</label><input value={formEditar.color||''} onChange={e => setFormEditar({...formEditar, color: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Llegó en grúa</label>
                  <select value={formEditar.llego_en_grua ? 'si' : 'no'} onChange={e => setFormEditar({...formEditar, llego_en_grua: e.target.value === 'si'})}>
                    <option value="no">No — Andando</option><option value="si">Sí — En grúa</option>
                  </select>
                </div>
                <div className={styles.formGroup}><label>Tiene seguro</label>
                  <select value={formEditar.tiene_seguro ? 'si' : 'no'} onChange={e => setFormEditar({...formEditar, tiene_seguro: e.target.value === 'si'})}>
                    <option value="no">No</option><option value="si">Sí</option>
                  </select>
                </div>
                <div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Motivo</label><textarea value={formEditar.motivo||''} onChange={e => setFormEditar({...formEditar, motivo: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Mecánico</label><input value={formEditar.mecanico||''} onChange={e => setFormEditar({...formEditar, mecanico: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Estado</label>
                  <select value={formEditar.estado||''} onChange={e => setFormEditar({...formEditar, estado: e.target.value})}>
                    <option>Diagnóstico</option><option>En proceso</option><option>En espera</option><option>Desarmando</option><option>Listo</option><option>Salio</option>
                  </select>
                </div>
                <div className={styles.formGroup}><label>Taller</label>
                  <select value={formEditar.taller||''} onChange={e => setFormEditar({...formEditar, taller: e.target.value})}>
                    <option>Malvinas 2084</option><option>Malvinas 3906</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btn} onClick={() => setModalEditar(null)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={guardarEdicion}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ACTUALIZAR */}
      {modalActualizar && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>Registrar actualización</div>
            <div className={styles.modalSub}><b>{modalActualizar.vehiculos?.marca_modelo}</b> — {modalActualizar.vehiculos?.clientes?.nombre}</div>
            <div style={{marginTop:'1rem',display:'flex',flexDirection:'column',gap:'10px'}}>
              <div className={styles.formGroup}><label>Tipo</label>
                <select value={formActualizar.tipo} onChange={e => setFormActualizar({...formActualizar, tipo: e.target.value})}>
                  <option value="estado">Actualización de estado</option>
                  <option value="prueba">En prueba</option>
                  <option value="taller">Cambio de taller</option>
                </select>
              </div>
              {formActualizar.tipo === 'taller' && (
                <div className={styles.formGroup}><label>Mover a</label>
                  <select value={formActualizar.taller_nuevo} onChange={e => setFormActualizar({...formActualizar, taller_nuevo: e.target.value})}>
                    <option>Malvinas 2084</option><option>Malvinas 3906</option>
                  </select>
                </div>
              )}
              <div className={styles.formGroup}><label>Descripción</label>
                <textarea value={formActualizar.descripcion} onChange={e => setFormActualizar({...formActualizar, descripcion: e.target.value})} placeholder="Detallá la actualización..."/>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btn} onClick={() => setModalActualizar(null)}>Cancelar</button>
              <button className={styles.btnSuccess} onClick={guardarActualizacion}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REPUESTO */}
      {modalRepuesto && admin && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>Agregar repuesto</div>
            <div className={styles.modalSub}><b>{modalRepuesto.vehiculos?.marca_modelo}</b> — {modalRepuesto.vehiculos?.clientes?.nombre}</div>
            <div style={{marginTop:'1rem',display:'flex',flexDirection:'column',gap:'10px'}}>
              <div className={styles.formGroup}><label>Repuesto *</label><input value={formRepuesto.nombre} onChange={e => setFormRepuesto({...formRepuesto, nombre: e.target.value})} placeholder="Ej: Filtro de aceite..."/></div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}><label>Valor ($)</label><input value={formRepuesto.valor} onChange={e => setFormRepuesto({...formRepuesto, valor: formatNum(e.target.value)})} placeholder="0"/></div>
                <div className={styles.formGroup}><label>Fecha</label><input type="date" value={formRepuesto.fecha} onChange={e => setFormRepuesto({...formRepuesto, fecha: e.target.value})}/></div>
              </div>
              <div className={styles.formGroup}><label>Lugar</label><input value={formRepuesto.lugar} onChange={e => setFormRepuesto({...formRepuesto, lugar: e.target.value})} placeholder="Ej: Casa del repuesto..."/></div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btn} onClick={() => setModalRepuesto(null)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={guardarRepuesto}>Agregar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR REPUESTO */}
      {modalEditarRepuesto && admin && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>Editar repuesto</div>
            <div style={{marginTop:'1rem',display:'flex',flexDirection:'column',gap:'10px'}}>
              <div className={styles.formGroup}><label>Repuesto</label><input value={formEditarRepuesto.nombre} onChange={e => setFormEditarRepuesto({...formEditarRepuesto, nombre: e.target.value})}/></div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}><label>Valor ($)</label><input value={formEditarRepuesto.valor} onChange={e => setFormEditarRepuesto({...formEditarRepuesto, valor: formatNum(e.target.value)})}/></div>
                <div className={styles.formGroup}><label>Fecha</label><input type="date" value={formEditarRepuesto.fecha} onChange={e => setFormEditarRepuesto({...formEditarRepuesto, fecha: e.target.value})}/></div>
              </div>
              <div className={styles.formGroup}><label>Lugar</label><input value={formEditarRepuesto.lugar||''} onChange={e => setFormEditarRepuesto({...formEditarRepuesto, lugar: e.target.value})}/></div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btn} onClick={() => setModalEditarRepuesto(null)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={guardarEdicionRepuesto}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FOTOS */}
      {modalFotos && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{width:'100%',maxWidth:'560px',maxHeight:'85vh',overflowY:'auto'}}>
            <div className={styles.modalTitle}>Fotos del vehículo</div>
            <div className={styles.modalSub}><b>{modalFotos.vehiculos?.marca_modelo}</b> — {modalFotos.vehiculos?.clientes?.nombre}</div>
            <input type="file" accept="image/*" multiple ref={fileFotosRef} style={{display:'none'}} onChange={subirFotosModal}/>
            {admin && <button className={styles.btnPrimary} style={{marginTop:'1rem',marginBottom:'1rem'}} onClick={() => fileFotosRef.current.click()}>{subiendo ? 'Subiendo...' : '+ Agregar fotos'}</button>}
            <div className={styles.fotoGrid}>
              {modalFotosData.map(f => (
                <div key={f.id} className={styles.fotoItem}>
                  <img src={f.url} alt="foto" className={styles.fotoImg} onClick={() => setFotoZoom(f.url)} style={{cursor:'zoom-in'}}/>
                  {admin && <button className={styles.fotoBorrar} onClick={() => borrarFotoModal(f)}>✕</button>}
                </div>
              ))}
              {modalFotosData.length === 0 && <div className={styles.fotoVacio}>No hay fotos todavía</div>}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btn} onClick={() => { setModalFotos(null); setModalFotosData([]) }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoArea}>
          <img src={LOGO_URL} alt="DiFiore Performance" style={{width:'100%',maxWidth:'180px',marginBottom:'8px'}}/>
        </div>
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'clientes', label: 'Clientes' },
          ...(admin ? [
            { id: 'nuevo', label: 'Nuevo cliente' },
            { id: 'presupuesto', label: 'Presupuesto' },
            { id: 'recibo', label: 'Recibo' },
            { id: 'informe', label: 'Informe mensual' },
          ] : []),
        ].map(item => (
          <button key={item.id} className={`${styles.navItem} ${seccion === item.id ? styles.navActive : ''}`} onClick={() => { setSeccion(item.id); setTallerVista(null); setVistaStats(null); setVistaMarca(null); setVerEntregados(false); setSidebarOpen(false) }}>
            {item.label}
          </button>
        ))}
        <div className={styles.navBottom}>
          <div style={{display:'flex',flexDirection:'column',gap:'4px',padding:'4px 0'}}>
            {navLinks.map((l,i) => (
              <a key={i} href={l.href} target="_blank" rel="noreferrer" style={{color:'#94A3B8',textDecoration:'none',fontSize:'12px',display:'flex',alignItems:'center',gap:'8px',padding:'6px 8px',borderRadius:'6px'}}>
                <span style={{color:l.color}}>{l.icon}</span>{l.label}
              </a>
            ))}
          </div>
          <div style={{padding:'8px 0',borderTop:'1px solid #2D3748',marginTop:'8px'}}>
            <div style={{fontSize:'11px',color:'#64748B',marginBottom:'8px',padding:'0 8px'}}>{admin ? '👑 Admin' : '👷 Empleado'}</div>
            <button onClick={cerrarSesion} style={{width:'100%',padding:'8px',borderRadius:'6px',background:'#DC2626',color:'#fff',border:'none',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <div className={styles.main}>

        {/* DASHBOARD */}
        {seccion === 'dashboard' && !tallerVista && !vistaStats && !vistaMarca && (
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>Dashboard</h1>
              <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                {dolarBlue && (
                  <div style={{fontSize:'12px',color:'#718096',background:'#F7FAFC',padding:'6px 12px',borderRadius:'6px',border:'1px solid #E2E8F0',display:'flex',gap:'10px'}}>
                    <span>💵 Compra: <b>${formatPeso(dolarBlue.compra)}</b></span>
                    <span>|</span>
                    <span>Venta: <b>${formatPeso(dolarBlue.venta)}</b></span>
                  </div>
                )}
                <button className={styles.btnPrimary} onClick={cargarDatos}>↻ Actualizar</button>
              </div>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.stats}>
              <div className={styles.stat} style={{cursor:'default'}}><div className={styles.statN}>{stats.total}</div><div className={styles.statL}>Clientes totales</div></div>
              <div className={styles.stat} style={{cursor:'pointer'}} onClick={() => setVistaStats('enTaller')}><div className={styles.statN}>{stats.enTaller}</div><div className={styles.statL}>En taller →</div></div>
              <div className={styles.stat} style={{cursor:'pointer'}} onClick={() => setVistaStats('listos')}><div className={styles.statN}>{stats.listos}</div><div className={styles.statL}>Listos →</div></div>
              <div className={styles.stat} style={{cursor:'pointer'}} onClick={() => setVistaStats('salidos')}><div className={styles.statN}>{stats.salidos}</div><div className={styles.statL}>Entregados →</div></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
              {['Malvinas 2084','Malvinas 3906'].map(taller => {
                const t = trabajos.filter(x => x.taller === taller && x.estado !== 'Salio')
                return (
                  <div key={taller} className={styles.tallerCard} onClick={() => setTallerVista(taller)}>
                    <div className={styles.tallerNombre}>{taller}</div>
                    <div className={styles.tallerN}>{t.length} <span>autos</span></div>
                    <div style={{marginTop:'10px'}}>
                      {['Diagnóstico','En proceso','En espera','Desarmando','Listo'].map(estado => {
                        const n = t.filter(x => x.estado === estado).length
                        return n > 0 ? (
                          <div key={estado} style={{display:'flex',justifyContent:'space-between',fontSize:'12px',padding:'4px 0',borderBottom:'1px solid #EDF2F7'}}>
                            <span style={{color:'#718096'}}>{estado}</span>
                            <span style={{color:'#2D3748',fontWeight:'600'}}>{n}</span>
                          </div>
                        ) : null
                      })}
                    </div>
                    <div className={styles.tallerBtn}>Ver detalle →</div>
                  </div>
                )
              })}
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Marcas en taller</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:'8px'}}>
                {Object.entries(conteoMarcas).sort((a,b) => b[1]-a[1]).map(([marca, n]) => (
                  <div key={marca} onClick={() => setVistaMarca(marca)} style={{background:'#F7FAFC',borderRadius:'8px',padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',border:'1px solid #E2E8F0',cursor:'pointer'}}
                    onMouseOver={e=>{e.currentTarget.style.borderColor='#2563EB';e.currentTarget.style.background='#EBF5FF'}}
                    onMouseOut={e=>{e.currentTarget.style.borderColor='#E2E8F0';e.currentTarget.style.background='#F7FAFC'}}>
                    <span style={{fontSize:'13px',color:'#4A5568',fontWeight:'500'}}>{marca}</span>
                    <span style={{fontSize:'20px',fontWeight:'700',color:'#2563EB'}}>{n}</span>
                  </div>
                ))}
                {Object.keys(conteoMarcas).length === 0 && <div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin autos en taller</div>}
              </div>
            </div>
          </div>
        )}

        {/* VISTA MARCA */}
        {seccion === 'dashboard' && !tallerVista && !vistaStats && vistaMarca && (
          <div>
            <div className={styles.topBar}>
              <button className={styles.btn} onClick={() => setVistaMarca(null)}>← Volver</button>
              <h1 className={styles.pageTitle}>{vistaMarca} en taller</h1>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.tblWrap}>
              <table className={styles.table}>
                <thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Estado</th><th>Taller</th><th>Ingreso</th></tr></thead>
                <tbody>
                  {trabajosDeMarca.map((t,i) => (
                    <tr key={t.id} onClick={() => verDetalle(t)}>
                      <td style={{color:'#A0AEC0'}}>{i+1}</td>
                      <td><b>{t.vehiculos?.marca_modelo}</b></td>
                      <td>{t.vehiculos?.clientes?.nombre}</td>
                      <td>{t.vehiculos?.patente}</td>
                      <td><span className={badgeClass(t.estado)}>{t.estado}</span></td>
                      <td>{t.taller}</td>
                      <td style={{fontSize:'12px',color:'#718096'}}>{new Date(t.fecha_ingreso).toLocaleDateString('es-AR')}</td>
                    </tr>
                  ))}
                  {trabajosDeMarca.length === 0 && <tr><td colSpan="7" style={{textAlign:'center',color:'#A0AEC0',padding:'2rem'}}>Sin resultados</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA STATS */}
        {seccion === 'dashboard' && !tallerVista && vistaStats && (
          <div>
            <div className={styles.topBar}>
              <button className={styles.btn} onClick={() => setVistaStats(null)}>← Volver</button>
              <h1 className={styles.pageTitle}>{titulosVistaStats[vistaStats]}</h1>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.tblWrap}>
              <table className={styles.table}>
                <thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Estado</th><th>Taller</th><th>Ingreso</th></tr></thead>
                <tbody>
                  {listaVistaStats[vistaStats].map((t,i) => (
                    <tr key={t.id} onClick={() => verDetalle(t)}>
                      <td style={{color:'#A0AEC0'}}>{i+1}</td>
                      <td><b>{t.vehiculos?.marca_modelo}</b></td>
                      <td>{t.vehiculos?.clientes?.nombre}</td>
                      <td>{t.vehiculos?.patente}</td>
                      <td><span className={badgeClass(t.estado)}>{t.estado}</span></td>
                      <td>{t.taller}</td>
                      <td style={{fontSize:'12px',color:'#718096'}}>{new Date(t.fecha_ingreso).toLocaleDateString('es-AR')}</td>
                    </tr>
                  ))}
                  {listaVistaStats[vistaStats].length === 0 && <tr><td colSpan="7" style={{textAlign:'center',color:'#A0AEC0',padding:'2rem'}}>Sin resultados</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA TALLER */}
        {seccion === 'dashboard' && tallerVista && (
          <div>
            <div className={styles.topBar}>
              <button className={styles.btn} onClick={() => setTallerVista(null)}>← Volver</button>
              <h1 className={styles.pageTitle}>{tallerVista}</h1>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.tblWrap}>
              <table className={styles.table}>
                <thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Estado</th><th>Mecánico</th><th>Ingreso</th>{admin && <th>Acciones</th>}</tr></thead>
                <tbody>
                  {trabajosTaller.map((t,i) => (
                    <tr key={t.id}>
                      <td style={{color:'#A0AEC0'}}>{i+1}</td>
                      <td onClick={() => verDetalle(t)}><b>{t.vehiculos?.marca_modelo}</b></td>
                      <td onClick={() => verDetalle(t)}>{t.vehiculos?.clientes?.nombre}</td>
                      <td onClick={() => verDetalle(t)}>{t.vehiculos?.patente}</td>
                      <td onClick={() => verDetalle(t)}><span className={badgeClass(t.estado)}>{t.estado}</span></td>
                      <td onClick={() => verDetalle(t)}>{t.mecanico || '—'}</td>
                      <td onClick={() => verDetalle(t)} style={{fontSize:'12px',color:'#718096'}}>{new Date(t.fecha_ingreso).toLocaleDateString('es-AR')}</td>
                      {admin && <td style={{display:'flex',gap:'5px',cursor:'default'}}>
                        <button className={styles.btnSuccess} style={{fontSize:'11px',padding:'4px 8px'}} onClick={() => { setModalActualizar(t); setFormActualizar({tipo:'estado',descripcion:'',taller_nuevo:'Malvinas 3906'}) }}>✓</button>
                        {t.estado !== 'Salio' && <button className={styles.btnDangerSolid} style={{fontSize:'11px',padding:'4px 8px'}} onClick={() => setModalSalida(t)}>Salida</button>}
                        <button className={styles.btnEdit} onClick={() => abrirEditar(t)}>✏️</button>
                      </td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CLIENTES */}
        {seccion === 'clientes' && !verEntregados && (
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>Clientes</h1>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                {admin && <button style={{padding:'8px 16px',borderRadius:'6px',fontSize:'13px',cursor:'pointer',background:'#EA580C',color:'#fff',border:'none',fontFamily:'inherit',fontWeight:'600'}} onClick={() => setVerEntregados(true)}>Vehículos entregados ({trabajosEntregados.length})</button>}
                {admin && <button className={styles.btnPrimary} onClick={() => setSeccion('nuevo')}>+ Nuevo cliente</button>}
              </div>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.searchBar}>
              <input type="text" placeholder="Buscar por nombre, patente o vehículo..." value={busqueda} onChange={e => setBusqueda(e.target.value)}/>
            </div>
            <div className={styles.tblWrap}>
              {loading ? <p className={styles.loading}>Cargando...</p> : (
                <table className={styles.table}>
                  <thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Estado</th><th>Taller</th><th>Ingreso</th>{admin && <th>Acciones</th>}</tr></thead>
                  <tbody>
                    {trabajosFiltrados.map((t,i) => (
                      <tr key={t.id}>
                        <td style={{color:'#A0AEC0',width:'40px'}}>{totalFiltrados - i}</td>
                        <td onClick={() => verDetalle(t)}><b>{t.vehiculos?.marca_modelo}</b></td>
                        <td onClick={() => verDetalle(t)}>{t.vehiculos?.clientes?.nombre}</td>
                        <td onClick={() => verDetalle(t)}>{t.vehiculos?.patente}</td>
                        <td onClick={() => verDetalle(t)}><span className={badgeClass(t.estado)}>{t.estado}</span></td>
                        <td onClick={() => verDetalle(t)}>{t.taller}</td>
                        <td onClick={() => verDetalle(t)} style={{fontSize:'12px',color:'#718096'}}>{new Date(t.fecha_ingreso).toLocaleDateString('es-AR')}</td>
                        {admin && <td style={{display:'flex',gap:'5px',cursor:'default',flexWrap:'wrap'}}>
                          <button className={styles.btnSuccess} style={{fontSize:'11px',padding:'4px 8px'}} onClick={() => { setModalActualizar(t); setFormActualizar({tipo:'estado',descripcion:'',taller_nuevo:'Malvinas 3906'}) }}>Actualizar</button>
                          <button className={styles.btnRepuesto} style={{fontSize:'11px',padding:'4px 8px'}} onClick={() => setModalRepuesto(t)}>🔩</button>
                          <button className={styles.btnEdit} style={{fontSize:'11px',padding:'4px 8px'}} onClick={async () => { await cargarFotosModal(t.id); setModalFotos(t) }}>📷</button>
                          <button style={{fontSize:'11px',padding:'4px 8px',background:'#DCFCE7',color:'#16A34A',border:'1px solid #86EFAC',borderRadius:'6px',cursor:'pointer',fontFamily:'inherit'}} onClick={() => abrirWsp(t)}>💬</button>
                          {t.estado !== 'Salio' && <button className={styles.btnDangerSolid} style={{fontSize:'11px',padding:'4px 8px'}} onClick={() => setModalSalida(t)}>Salida</button>}
                          <button className={styles.btnEdit} onClick={() => abrirEditar(t)}>✏️</button>
                          <button className={styles.btnDelete} onClick={() => borrarCliente(t)}>🗑️</button>
                        </td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* VEHÍCULOS ENTREGADOS */}
        {seccion === 'clientes' && verEntregados && admin && (
          <div>
            <div className={styles.topBar}>
              <button className={styles.btn} onClick={() => setVerEntregados(false)}>← Volver</button>
              <h1 className={styles.pageTitle}>Vehículos entregados ({trabajosEntregados.length})</h1>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.tblWrap}>
              <table className={styles.table}>
                <thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Taller</th><th>Entregado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {trabajosEntregados.map((t,i) => (
                    <tr key={t.id}>
                      <td style={{color:'#A0AEC0'}}>{i+1}</td>
                      <td onClick={() => verDetalle(t)}><b>{t.vehiculos?.marca_modelo}</b></td>
                      <td onClick={() => verDetalle(t)}>{t.vehiculos?.clientes?.nombre}</td>
                      <td onClick={() => verDetalle(t)}>{t.vehiculos?.patente}</td>
                      <td onClick={() => verDetalle(t)}>{t.taller}</td>
                      <td onClick={() => verDetalle(t)} style={{fontSize:'12px',color:'#718096'}}>{t.fecha_salida ? new Date(t.fecha_salida).toLocaleDateString('es-AR') : '—'}</td>
                      <td style={{display:'flex',gap:'5px',cursor:'default'}}>
                        <button className={styles.btnPrimary} style={{fontSize:'11px',padding:'4px 8px'}} onClick={() => { setModalReingreso(t); setFormReingreso({ motivo: '', mecanico: t.mecanico||'', taller: t.taller||'Malvinas 2084', estado: 'Diagnóstico', llego_en_grua: false, fecha_ingreso_manual: '' }) }}>🔄 Reingreso</button>
                        <button style={{fontSize:'11px',padding:'4px 8px',background:'#DCFCE7',color:'#16A34A',border:'1px solid #86EFAC',borderRadius:'6px',cursor:'pointer',fontFamily:'inherit'}} onClick={() => abrirWsp(t)}>💬</button>
                        <button className={styles.btnEdit} onClick={() => abrirEditar(t)}>✏️</button>
                        <button className={styles.btnDelete} onClick={() => borrarCliente(t)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {trabajosEntregados.length === 0 && <tr><td colSpan="7" style={{textAlign:'center',color:'#A0AEC0',padding:'2rem'}}>Sin vehículos entregados todavía</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NUEVO CLIENTE */}
        {seccion === 'nuevo' && admin && (
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>Nuevo cliente</h1>
              <button className={styles.btn} onClick={() => setSeccion('clientes')}>Cancelar</button>
            </div>
            <div className={styles.divider}></div>
            {mensaje && <div className={styles.mensaje}>{mensaje}</div>}
            <form onSubmit={guardarCliente}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Datos del cliente</div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}><label>Nombre y apellido *</label><input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Juan García"/></div>
                  <div className={styles.formGroup}><label>Teléfono</label><input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="223 000-0000"/></div>
                  <div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="juan@email.com"/></div>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Datos del vehículo</div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}><label>Marca y modelo *</label><input required value={form.marca_modelo} onChange={e => setForm({...form, marca_modelo: e.target.value})} placeholder="VW Amarok V6"/></div>
                  <div className={styles.formGroup}><label>Patente</label><input value={form.patente} onChange={e => setForm({...form, patente: e.target.value})} placeholder="AB 123 CD"/></div>
                  <div className={styles.formGroup}><label>Año</label><input value={form.anio} onChange={e => setForm({...form, anio: e.target.value})} placeholder="2022"/></div>
                  <div className={styles.formGroup}><label>Kilometraje</label><input value={form.kilometraje} onChange={e => setForm({...form, kilometraje: e.target.value})} placeholder="85.000 km"/></div>
                  <div className={styles.formGroup}><label>Color</label><input value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="Ej: Blanco, Negro..."/></div>
                  <div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Motivo de ingreso</label><textarea value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} placeholder="Describí el problema..."/></div>
                  <div className={styles.formGroup}><label>Fecha de ingreso</label><input type="datetime-local" value={form.fecha_ingreso_manual} onChange={e => setForm({...form, fecha_ingreso_manual: e.target.value})}/></div>
                  <div className={styles.formGroup}><label>Llegó en</label>
                    <select value={form.llego_en_grua ? 'grua' : 'andando'} onChange={e => setForm({...form, llego_en_grua: e.target.value === 'grua'})}>
                      <option value="andando">Andando</option><option value="grua">En grúa</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}><label>Tiene seguro</label>
                    <select value={form.tiene_seguro ? 'si' : 'no'} onChange={e => setForm({...form, tiene_seguro: e.target.value === 'si'})}>
                      <option value="no">No</option><option value="si">Sí</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}><label>Mecánico</label><input value={form.mecanico} onChange={e => setForm({...form, mecanico: e.target.value})} placeholder="Agus D."/></div>
                  <div className={styles.formGroup}><label>Estado</label>
                    <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                      <option>Diagnóstico</option><option>En proceso</option><option>En espera</option><option>Desarmando</option><option>Listo</option>
                    </select>
                  </div>
                  <div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Taller</label>
                    <select value={form.taller} onChange={e => setForm({...form, taller: e.target.value})}>
                      <option>Malvinas 2084</option><option>Malvinas 3906</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Fotos del vehículo</div>
                <input type="file" accept="image/*" multiple ref={fileNuevoRef} style={{display:'none'}} onChange={e => setFotoNuevo(Array.from(e.target.files))}/>
                <button type="button" className={styles.btnPrimary} onClick={() => fileNuevoRef.current.click()}>
                  {fotoNuevo.length > 0 ? `✓ ${fotoNuevo.length} foto(s)` : '+ Seleccionar fotos'}
                </button>
                {fotoNuevo.length > 0 && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginTop:'12px'}}>
                    {fotoNuevo.map((f,i) => (
                      <div key={i} style={{position:'relative'}}>
                        <img src={URL.createObjectURL(f)} alt="preview" style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',borderRadius:'8px'}}/>
                        <button type="button" className={styles.fotoBorrar} onClick={() => setFotoNuevo(fotoNuevo.filter((_,j) => j !== i))}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.btn} onClick={() => setSeccion('clientes')}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary}>Registrar cliente</button>
              </div>
            </form>
          </div>
        )}

        {/* PRESUPUESTO */}
        {seccion === 'presupuesto' && admin && (
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>Nuevo presupuesto</h1>
              <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                {dolarBlue && <span style={{fontSize:'12px',color:'#718096',background:'#F7FAFC',padding:'6px 12px',borderRadius:'6px',border:'1px solid #E2E8F0'}}>💵 Venta: ${formatPeso(dolarBlue.venta)} | Compra: ${formatPeso(dolarBlue.compra)}</span>}
                <button style={{padding:'8px 16px',borderRadius:'6px',fontSize:'13px',cursor:'pointer',background:'#25D366',color:'#fff',border:'none',fontFamily:'inherit',fontWeight:'600'}} onClick={enviarPresupuestoWsp}>💬 WhatsApp</button>
                <button className={styles.btnPrimary} onClick={imprimirPresupuesto}>🖨️ Imprimir</button>
              </div>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Datos generales</div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}><label>N° de presupuesto</label><input value={presupuesto.numero} onChange={e => setPresupuesto({...presupuesto, numero: e.target.value})} placeholder="001-00001"/></div>
                <div className={styles.formGroup}><label>Fecha</label><input type="date" value={presupuesto.fecha} onChange={e => setPresupuesto({...presupuesto, fecha: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Cliente</label><input value={presupuesto.cliente} onChange={e => setPresupuesto({...presupuesto, cliente: e.target.value})} placeholder="Nombre del cliente"/></div>
                <div className={styles.formGroup}><label>Vehículo</label><input value={presupuesto.vehiculo} onChange={e => setPresupuesto({...presupuesto, vehiculo: e.target.value})} placeholder="Ej: Volkswagen Amarok V6"/></div>
                <div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Teléfono (para WhatsApp)</label><input value={presupuesto.telefono} onChange={e => setPresupuesto({...presupuesto, telefono: e.target.value})} placeholder="223 000-0000"/></div>
              </div>
            </div>
            <div className={styles.card}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                <div className={styles.cardTitle} style={{margin:0}}>Ítems del presupuesto</div>
                <button className={styles.btnPrimary} style={{fontSize:'12px',padding:'6px 12px'}} onClick={() => setPresupuesto({...presupuesto, items: [...presupuesto.items, { descripcion: '', precio_unitario: '', total: '', es_mano_obra: false }]})}>+ Agregar ítem</button>
              </div>
              <div style={{marginBottom:'12px',padding:'10px 14px',background:'#EFF6FF',borderRadius:'8px',border:'1px solid #BFDBFE',display:'flex',alignItems:'center',gap:'20px'}}>
                <span style={{fontSize:'12px',color:'#2563EB',fontWeight:'600'}}>Moneda mano de obra:</span>
                <label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',cursor:'pointer'}}>
                  <input type="radio" value="ARS" checked={presupuesto.moneda_mano_obra === 'ARS'} onChange={e => setPresupuesto({...presupuesto, moneda_mano_obra: e.target.value})}/> $ Pesos
                </label>
                <label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',cursor:'pointer'}}>
                  <input type="radio" value="USD" checked={presupuesto.moneda_mano_obra === 'USD'} onChange={e => setPresupuesto({...presupuesto, moneda_mano_obra: e.target.value})}/> USS Dólar
                </label>
                {presupuesto.moneda_mano_obra === 'USD' && dolarBlue && <span style={{fontSize:'11px',color:'#718096'}}>Blue venta: ${formatPeso(dolarBlue.venta)}</span>}
              </div>
              {presupuesto.items.map((item, idx) => (
                <div key={idx} style={{background:'#F7FAFC',border:'1px solid #E2E8F0',borderRadius:'8px',padding:'12px',marginBottom:'10px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                      <span style={{fontSize:'12px',fontWeight:'600',color:'#718096'}}>Ítem {idx + 1}</span>
                      <label style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'12px',cursor:'pointer',color:'#2563EB',fontWeight:'500'}}>
                        <input type="checkbox" checked={item.es_mano_obra} onChange={e => {
                          const items = [...presupuesto.items]
                          items[idx] = {...items[idx], es_mano_obra: e.target.checked}
                          setPresupuesto({...presupuesto, items})
                        }}/> Es mano de obra
                      </label>
                    </div>
                    {presupuesto.items.length > 1 && <button style={{background:'none',border:'none',color:'#DC2626',cursor:'pointer',fontSize:'18px',lineHeight:1}} onClick={() => setPresupuesto({...presupuesto, items: presupuesto.items.filter((_,i) => i !== idx)})}>✕</button>}
                  </div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup} style={{gridColumn:'1/-1'}}>
                      <label>Descripción</label>
                      <input value={item.descripcion} onChange={e => {
                        const items = [...presupuesto.items]
                        items[idx] = {...items[idx], descripcion: e.target.value}
                        setPresupuesto({...presupuesto, items})
                      }} placeholder={item.es_mano_obra ? 'Ej: Reparación de motor | Cambio de distribución...' : 'Ej: Kit de distribución Alemán'}/>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Precio unitario {item.es_mano_obra ? `(${presupuesto.moneda_mano_obra === 'USD' ? 'USS' : '$'})` : '(opcional)'}</label>
                      <input value={item.precio_unitario} onChange={e => {
                        const items = [...presupuesto.items]
                        items[idx] = {...items[idx], precio_unitario: formatNum(e.target.value)}
                        setPresupuesto({...presupuesto, items})
                      }} placeholder="0"/>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Total {item.es_mano_obra ? `(${presupuesto.moneda_mano_obra === 'USD' ? 'USS' : '$'})` : '($)'}</label>
                      <input value={item.total} onChange={e => {
                        const items = [...presupuesto.items]
                        items[idx] = {...items[idx], total: formatNum(e.target.value)}
                        setPresupuesto({...presupuesto, items})
                      }} placeholder="0"/>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{background:'#F0FDF4',border:'1px solid #86EFAC',borderRadius:'8px',padding:'12px 16px',marginTop:'8px'}}>
                <div style={{fontSize:'11px',color:'#16A34A',fontWeight:'700',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'.5px'}}>Resumen</div>
                <div style={{display:'flex',gap:'24px',flexWrap:'wrap'}}>
                  {presupuesto.moneda_mano_obra === 'USD' && totalUSD > 0 && <div style={{fontSize:'13px',color:'#2D3748'}}><span style={{color:'#718096'}}>Mano de obra: </span><b>USS {formatPeso(totalUSD)}</b></div>}
                  <div style={{fontSize:'13px',color:'#2D3748'}}><span style={{color:'#718096'}}>Repuestos: </span><b>${formatPeso(presupuesto.items.filter(i => !i.es_mano_obra && i.total).reduce((a,i) => a + (parseFloat(parseNum(i.total)) || 0), 0))}</b></div>
                  {presupuesto.moneda_mano_obra === 'USD' && dolarBlue && totalUSD > 0 && <div style={{fontSize:'13px',color:'#16A34A',fontWeight:'700'}}>Total estimado: ${formatPeso(Math.round(totalPesos))}</div>}
                  {presupuesto.moneda_mano_obra === 'ARS' && <div style={{fontSize:'13px',color:'#16A34A',fontWeight:'700'}}>Total: ${formatPeso(Math.round(totalPesos))}</div>}
                </div>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Notas / Observaciones</div>
              <div className={styles.formGroup}>
                <label>Una por línea (aparecerán con ✅)</label>
                <textarea value={presupuesto.notas} onChange={e => setPresupuesto({...presupuesto, notas: e.target.value})} placeholder={'Kit de distribución de origen Alemán.\nRepuestos originales. Trabajo garantizado.'} style={{minHeight:'80px'}}/>
              </div>
            </div>
            <div className={styles.formActions}>
              <button className={styles.btn} onClick={() => setPresupuesto({ numero: '001-00001', fecha: new Date().toISOString().split('T')[0], cliente: '', vehiculo: '', telefono: '', items: [{ descripcion: '', precio_unitario: '', total: '', es_mano_obra: false }], notas: '', moneda_mano_obra: 'ARS' })}>Limpiar</button>
              <button style={{padding:'8px 16px',borderRadius:'6px',fontSize:'13px',cursor:'pointer',background:'#25D366',color:'#fff',border:'none',fontFamily:'inherit',fontWeight:'600'}} onClick={enviarPresupuestoWsp}>💬 Enviar por WhatsApp</button>
              <button className={styles.btnPrimary} onClick={imprimirPresupuesto}>🖨️ Imprimir presupuesto</button>
            </div>
          </div>
        )}

        {/* RECIBO */}
        {seccion === 'recibo' && admin && (
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>Nuevo recibo</h1>
              <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                {dolarBlue && <span style={{fontSize:'12px',color:'#718096',background:'#F7FAFC',padding:'6px 12px',borderRadius:'6px',border:'1px solid #E2E8F0'}}>💵 Venta: ${formatPeso(dolarBlue.venta)}</span>}
                <button style={{padding:'8px 16px',borderRadius:'6px',fontSize:'13px',cursor:'pointer',background:'#25D366',color:'#fff',border:'none',fontFamily:'inherit',fontWeight:'600'}} onClick={enviarReciboWsp}>💬 WhatsApp</button>
                <button className={styles.btnPrimary} onClick={imprimirRecibo}>🖨️ Imprimir</button>
              </div>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Datos del recibo</div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}><label>N° de recibo</label><input value={recibo.numero} onChange={e => setRecibo({...recibo, numero: e.target.value})} placeholder="001-00001"/></div>
                <div className={styles.formGroup}><label>Fecha</label><input type="date" value={recibo.fecha} onChange={e => setRecibo({...recibo, fecha: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Cliente</label><input value={recibo.cliente} onChange={e => setRecibo({...recibo, cliente: e.target.value})} placeholder="Nombre del cliente"/></div>
                <div className={styles.formGroup}><label>Vehículo</label><input value={recibo.vehiculo} onChange={e => setRecibo({...recibo, vehiculo: e.target.value})} placeholder="Ej: VW Amarok V6"/></div>
                <div className={styles.formGroup}><label>Patente</label><input value={recibo.patente} onChange={e => setRecibo({...recibo, patente: e.target.value})} placeholder="AB 123 CD"/></div>
                <div className={styles.formGroup}><label>Teléfono (para WhatsApp)</label><input value={recibo.telefono} onChange={e => setRecibo({...recibo, telefono: e.target.value})} placeholder="223 000-0000"/></div>
                <div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Forma de pago</label>
                  <select value={recibo.forma_pago} onChange={e => setRecibo({...recibo, forma_pago: e.target.value})}>
                    <option>Efectivo</option><option>Transferencia</option><option>Tarjeta de débito</option><option>Tarjeta de crédito</option><option>Cheque</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Monto</div>
              <div style={{marginBottom:'12px',padding:'10px 14px',background:'#EFF6FF',borderRadius:'8px',border:'1px solid #BFDBFE',display:'flex',alignItems:'center',gap:'20px'}}>
                <span style={{fontSize:'12px',color:'#2563EB',fontWeight:'600'}}>Moneda:</span>
                <label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',cursor:'pointer'}}>
                  <input type="radio" value="ARS" checked={recibo.moneda === 'ARS'} onChange={e => setRecibo({...recibo, moneda: e.target.value})}/> $ Pesos
                </label>
                <label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',cursor:'pointer'}}>
                  <input type="radio" value="USD" checked={recibo.moneda === 'USD'} onChange={e => setRecibo({...recibo, moneda: e.target.value})}/> USS Dólar
                </label>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Monto ({recibo.moneda === 'USD' ? 'USS' : '$'})</label>
                  <input value={recibo.monto} onChange={e => setRecibo({...recibo, monto: formatNum(e.target.value)})} placeholder="0"/>
                </div>
                {recibo.moneda === 'USD' && dolarBlue && recibo.monto && (
                  <div className={styles.formGroup}>
                    <label>Equivalente en pesos (blue venta)</label>
                    <input readOnly value={`$${formatPeso(Math.round(parseFloat(parseNum(recibo.monto)) * dolarBlue.venta))}`} style={{background:'#F0FDF4',color:'#16A34A',fontWeight:'700'}}/>
                  </div>
                )}
              </div>
              <div className={styles.formGroup} style={{marginTop:'10px'}}><label>Concepto</label><textarea value={recibo.concepto} onChange={e => setRecibo({...recibo, concepto: e.target.value})} placeholder="Ej: Pago total por reparación de motor..." style={{minHeight:'70px'}}/></div>
              <div className={styles.formGroup} style={{marginTop:'10px'}}><label>Observaciones (opcional)</label><textarea value={recibo.observaciones} onChange={e => setRecibo({...recibo, observaciones: e.target.value})} placeholder="Notas adicionales..." style={{minHeight:'50px'}}/></div>
            </div>
            <div className={styles.formActions}>
              <button className={styles.btn} onClick={() => setRecibo({ numero: '001-00001', fecha: new Date().toISOString().split('T')[0], cliente: '', vehiculo: '', patente: '', telefono: '', concepto: '', monto: '', moneda: 'ARS', forma_pago: 'Efectivo', observaciones: '' })}>Limpiar</button>
              <button style={{padding:'8px 16px',borderRadius:'6px',fontSize:'13px',cursor:'pointer',background:'#25D366',color:'#fff',border:'none',fontFamily:'inherit',fontWeight:'600'}} onClick={enviarReciboWsp}>💬 Enviar por WhatsApp</button>
              <button className={styles.btnPrimary} onClick={imprimirRecibo}>🖨️ Imprimir recibo</button>
            </div>
          </div>
        )}

        {/* INFORME MENSUAL */}
        {seccion === 'informe' && admin && (
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>Informe mensual</h1>
              <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                <input type="month" value={mesInforme} onChange={e => setMesInforme(e.target.value)} style={{padding:'8px 12px',borderRadius:'6px',border:'1px solid #CBD5E0',fontSize:'13px',fontFamily:'inherit'}}/>
                <button className={styles.btnPrimary} onClick={imprimirInforme}>🖨️ Imprimir informe</button>
              </div>
            </div>
            <div className={styles.divider}></div>
            {(() => {
              const { ingresados, salidos, marcaTop, marcasCount, nombreMes } = generarInforme()
              return (
                <div>
                  <div style={{marginBottom:'12px',fontSize:'14px',fontWeight:'600',color:'#718096',textTransform:'capitalize'}}>{nombreMes}</div>
                  <div className={styles.stats} style={{marginBottom:'1.5rem'}}>
                    <div className={styles.stat} style={{cursor:'default'}}><div className={styles.statN}>{ingresados.length}</div><div className={styles.statL}>Ingresados</div></div>
                    <div className={styles.stat} style={{cursor:'default'}}><div className={styles.statN}>{salidos.length}</div><div className={styles.statL}>Entregados</div></div>
                    <div className={styles.stat} style={{cursor:'default',borderColor:'#16A34A'}}><div className={styles.statN} style={{fontSize:'18px',color:'#16A34A'}}>{marcaTop ? marcaTop[0] : '—'}</div><div className={styles.statL}>Marca más frecuente{marcaTop ? ` (${marcaTop[1]})` : ''}</div></div>
                    <div className={styles.stat} style={{cursor:'default'}}><div className={styles.statN} style={{fontSize:'16px'}}>{Object.keys(marcasCount).length}</div><div className={styles.statL}>Marcas distintas</div></div>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>Vehículos ingresados ({ingresados.length})</div>
                    {ingresados.length === 0 ? <div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin ingresos este mes</div> : (
                      <table className={styles.table}>
                        <thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Taller</th><th>Ingreso</th></tr></thead>
                        <tbody>
                          {ingresados.map((t,i) => (
                            <tr key={t.id} onClick={() => verDetalle(t)}>
                              <td style={{color:'#A0AEC0'}}>{i+1}</td>
                              <td><b>{t.vehiculos?.marca_modelo}</b></td>
                              <td>{t.vehiculos?.clientes?.nombre}</td>
                              <td>{t.vehiculos?.patente}</td>
                              <td>{t.taller}</td>
                              <td style={{fontSize:'12px',color:'#718096'}}>{new Date(t.fecha_ingreso).toLocaleDateString('es-AR')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>Vehículos entregados ({salidos.length})</div>
                    {salidos.length === 0 ? <div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin entregas este mes</div> : (
                      <table className={styles.table}>
                        <thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Taller</th><th>Entrega</th></tr></thead>
                        <tbody>
                          {salidos.map((t,i) => (
                            <tr key={t.id} onClick={() => verDetalle(t)}>
                              <td style={{color:'#A0AEC0'}}>{i+1}</td>
                              <td><b>{t.vehiculos?.marca_modelo}</b></td>
                              <td>{t.vehiculos?.clientes?.nombre}</td>
                              <td>{t.vehiculos?.patente}</td>
                              <td>{t.taller}</td>
                              <td style={{fontSize:'12px',color:'#718096'}}>{new Date(t.fecha_salida).toLocaleDateString('es-AR')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>Marcas atendidas</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:'8px'}}>
                      {Object.entries(marcasCount).sort((a,b)=>b[1]-a[1]).map(([marca,n]) => (
                        <div key={marca} style={{background:'#F7FAFC',borderRadius:'8px',padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',border:'1px solid #E2E8F0'}}>
                          <span style={{fontSize:'13px',color:'#4A5568',fontWeight:'500'}}>{marca}</span>
                          <span style={{fontSize:'20px',fontWeight:'700',color:'#2563EB'}}>{n}</span>
                        </div>
                      ))}
                      {Object.keys(marcasCount).length === 0 && <div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin datos este mes</div>}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* DETALLE */}
        {seccion === 'detalle' && clienteDetalle && (
          <div>
            <div className={styles.topBar}>
              <button className={styles.btn} onClick={() => setSeccion('clientes')}>← Volver</button>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                {admin && <button className={styles.btn} onClick={() => imprimirOrden(clienteDetalle)}>🖨️ Imprimir</button>}
                {admin && <button className={styles.btnSuccess} onClick={() => { setModalActualizar(clienteDetalle); setFormActualizar({tipo:'estado',descripcion:'',taller_nuevo:'Malvinas 3906'}) }}>Actualización</button>}
                {admin && <button className={styles.btnRepuesto} onClick={() => setModalRepuesto(clienteDetalle)}>🔩 Repuesto</button>}
                {admin && <button style={{padding:'8px 16px',borderRadius:'6px',fontSize:'13px',cursor:'pointer',background:'#DCFCE7',color:'#16A34A',border:'1px solid #86EFAC',fontFamily:'inherit',fontWeight:'500'}} onClick={() => abrirWsp(clienteDetalle)}>💬 WhatsApp</button>}
                {admin && <button className={styles.btnPrimary} onClick={() => abrirEditar(clienteDetalle)}>✏️ Editar</button>}
                {admin && clienteDetalle.estado !== 'Salio' && <button className={styles.btnDangerSolid} onClick={() => setModalSalida(clienteDetalle)}>Registrar salida</button>}
                {admin && clienteDetalle.estado === 'Salio' && <button className={styles.btnPrimary} onClick={() => { setModalReingreso(clienteDetalle); setFormReingreso({ motivo: '', mecanico: clienteDetalle.mecanico||'', taller: clienteDetalle.taller||'Malvinas 2084', estado: 'Diagnóstico', llego_en_grua: false, fecha_ingreso_manual: '' }) }}>🔄 Reingreso</button>}
                {admin && <button className={styles.btnDanger} onClick={() => borrarCliente(clienteDetalle)}>🗑️ Borrar</button>}
              </div>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.detailHeader}>
              <div className={styles.detailAvatar}>{clienteDetalle.vehiculos?.clientes?.nombre?.charAt(0)}</div>
              <div style={{flex:1}}>
                <div className={styles.detailNombre}>{clienteDetalle.vehiculos?.clientes?.nombre}</div>
                <div className={styles.detailSub}>{clienteDetalle.vehiculos?.clientes?.telefono} · {clienteDetalle.llego_en_grua ? 'Llegó en grúa' : 'Llegó andando'} · {clienteDetalle.tiene_seguro ? '🛡️ Con seguro' : 'Sin seguro'} · N° {clienteDetalle.numero_cliente || '—'}</div>
              </div>
              <span className={badgeClass(clienteDetalle.estado)}>{clienteDetalle.estado}</span>
            </div>
            <div className={styles.detGrid}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Vehículo</div>
                {[
                  ['Modelo', clienteDetalle.vehiculos?.marca_modelo],
                  ['Patente', clienteDetalle.vehiculos?.patente],
                  ['Color', clienteDetalle.vehiculos?.color],
                  ['Año', clienteDetalle.vehiculos?.anio],
                  ['Km', clienteDetalle.vehiculos?.kilometraje],
                  ['Mecánico', clienteDetalle.mecanico],
                  ['Taller', clienteDetalle.taller],
                  ['Seguro', clienteDetalle.tiene_seguro ? 'Sí' : 'No'],
                ].map(([k,v]) => (
                  <div key={k} className={styles.detRow}><span className={styles.detLabel}>{k}</span><span className={styles.detVal}>{v || '—'}</span></div>
                ))}
              </div>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Trabajo</div>
                <p className={styles.detText}>{clienteDetalle.motivo || 'Sin descripción'}</p>
                <div className={styles.detFecha}>Ingresó: {new Date(clienteDetalle.fecha_ingreso).toLocaleDateString('es-AR')}</div>
                {clienteDetalle.fecha_salida && <div className={styles.detFecha}>Salió: {new Date(clienteDetalle.fecha_salida).toLocaleDateString('es-AR')}</div>}
                {clienteDetalle.observacion_final && <div className={styles.detText} style={{marginTop:'8px'}}><b>Obs. final:</b> {clienteDetalle.observacion_final}</div>}
              </div>
            </div>

            <div className={styles.card}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                <div className={styles.cardTitle} style={{margin:0}}>Repuestos</div>
                {admin && repuestos.length > 0 && <button className={styles.btn} style={{fontSize:'12px',padding:'4px 10px'}} onClick={() => imprimirRepuestos(clienteDetalle, repuestos)}>🖨️ Imprimir</button>}
              </div>
              {repuestos.length === 0 && <div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin repuestos registrados</div>}
              {repuestos.length > 0 && (
                <table className={styles.table}>
                  <thead><tr><th>Repuesto</th><th>Valor</th><th>Lugar</th><th>Fecha</th>{admin && <th></th>}</tr></thead>
                  <tbody>
                    {repuestos.map(r => (
                      <tr key={r.id}>
                        <td>{r.nombre}</td>
                        <td>${formatPeso(r.valor)}</td>
                        <td>{r.lugar || '—'}</td>
                        <td style={{fontSize:'12px',color:'#718096'}}>{new Date(r.fecha).toLocaleDateString('es-AR')}</td>
                        {admin && <td style={{display:'flex',gap:'4px',cursor:'default'}}>
                          <button className={styles.btnEdit} style={{fontSize:'11px',padding:'3px 7px'}} onClick={() => { setFormEditarRepuesto({id:r.id,nombre:r.nombre,valor:formatNum(r.valor.toString()),lugar:r.lugar||'',fecha:r.fecha}); setModalEditarRepuesto(true) }}>✏️</button>
                          <button className={styles.btnDelete} style={{fontSize:'11px',padding:'3px 7px'}} onClick={() => borrarRepuesto(r)}>🗑️</button>
                        </td>}
                      </tr>
                    ))}
                    <tr>
                      <td style={{fontWeight:'700',color:'#2D3748'}}>Total</td>
                      <td style={{fontWeight:'700',color:'#16A34A'}}>${formatPeso(repuestos.reduce((a,r) => a + Number(r.valor), 0))}</td>
                      <td colSpan={admin ? 3 : 2}></td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Historial</div>
              {historial.length === 0 && <div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin historial todavía</div>}
              {historial.map(h => (
                <div key={h.id} className={styles.histItem}>
                  <span className={styles.histIcon}>{tipoHistorial[h.tipo] || '⚪'}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'13px',color:'#2D3748'}}>{h.descripcion}</div>
                    <div style={{fontSize:'11px',color:'#718096',marginTop:'2px'}}>{new Date(h.fecha).toLocaleString('es-AR')}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Fotos del vehículo</div>
              <input type="file" accept="image/*" multiple ref={fileRef} style={{display:'none'}} onChange={subirFoto}/>
              {admin && <button className={styles.btnPrimary} onClick={() => fileRef.current.click()} style={{marginBottom:'1rem'}}>{subiendo ? 'Subiendo...' : '+ Agregar fotos'}</button>}
              <div className={styles.fotoGrid}>
                {fotos.map(f => (
                  <div key={f.id} className={styles.fotoItem}>
                    <img src={f.url} alt="foto" className={styles.fotoImg} onClick={() => setFotoZoom(f.url)} style={{cursor:'zoom-in'}}/>
                    {admin && <button className={styles.fotoBorrar} onClick={() => borrarFoto(f)}>✕</button>}
                  </div>
                ))}
                {fotos.length === 0 && <div className={styles.fotoVacio}>No hay fotos todavía</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
