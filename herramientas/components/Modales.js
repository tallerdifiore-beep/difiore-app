import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { formatNum, parseNum, pesos, hoyAR, fechaAR, fechaCuota, MEDIOS_PAGO, FORMAS_PAGO, FRECUENCIAS } from '../lib/formato'
import { subirComprobante } from '../lib/comprobantes'

function Modal({ titulo, onCerrar, children }) {
  return (
    <div className="modal-fondo" onMouseDown={e => { if (e.target === e.currentTarget) onCerrar() }}>
      <div className="modal">
        <h2>{titulo}</h2>
        {children}
      </div>
    </div>
  )
}

export function ClienteModal({ cliente, onCerrar, onGuardado }) {
  const [f, setF] = useState({
    nombre: cliente?.nombre || '', telefono: cliente?.telefono || '', documento: cliente?.documento || '',
    direccion: cliente?.direccion || '', notas: cliente?.notas || '',
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const set = k => e => setF({ ...f, [k]: e.target.value })

  async function guardar(e) {
    e.preventDefault()
    if (!f.nombre.trim()) { setError('Poné el nombre del cliente'); return }
    setGuardando(true); setError('')
    const datos = { ...f, nombre: f.nombre.trim() }
    const { data, error } = cliente
      ? await supabase.from('herr_clientes').update(datos).eq('id', cliente.id).select().single()
      : await supabase.from('herr_clientes').insert(datos).select().single()
    setGuardando(false)
    if (error) { setError('No se pudo guardar: ' + error.message); return }
    onGuardado(data)
  }

  return (
    <Modal titulo={cliente ? 'Editar cliente' : 'Nuevo cliente'} onCerrar={onCerrar}>
      <form onSubmit={guardar}>
        <div className="fila"><div><label className="lbl">Nombre / Razón social *</label><input value={f.nombre} onChange={set('nombre')} autoFocus /></div></div>
        <div className="fila">
          <div><label className="lbl">Teléfono</label><input value={f.telefono} onChange={set('telefono')} inputMode="tel" placeholder="223 529-9700" /></div>
          <div><label className="lbl">DNI / CUIT</label><input value={f.documento} onChange={set('documento')} /></div>
        </div>
        <div className="fila"><div><label className="lbl">Dirección</label><input value={f.direccion} onChange={set('direccion')} /></div></div>
        <div className="fila"><div><label className="lbl">Notas</label><textarea rows={2} value={f.notas} onChange={set('notas')} /></div></div>
        {error && <div className="error">{error}</div>}
        <div className="acciones" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn sec" onClick={onCerrar}>Cancelar</button>
          <button className="btn" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  )
}

// Botón para sacar o elegir la foto del comprobante (en el celular ofrece cámara o galería).
export function ComprobanteInput({ archivo, onChange }) {
  const ref = useRef()
  const preview = archivo && archivo.type.startsWith('image/') ? URL.createObjectURL(archivo) : null
  return (
    <div>
      <input ref={ref} type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
        onChange={e => { onChange(e.target.files[0] || null); e.target.value = '' }} />
      {archivo ? (
        <div className="acciones">
          {preview ? <img src={preview} alt="" className="miniatura" /> : <span className="tag pago">PDF</span>}
          <span className="tenue" style={{ fontSize: 13 }}>Comprobante cargado</span>
          <button type="button" className="btn sec chico" onClick={() => onChange(null)}>Quitar</button>
        </div>
      ) : (
        <button type="button" className="btn sec" onClick={() => ref.current.click()}>📷 Foto del comprobante</button>
      )}
    </div>
  )
}

function Opciones({ opciones, valor, onChange }) {
  return (
    <div className="opciones">
      {opciones.map(o => (
        <button type="button" key={o} className={o === valor ? 'activa' : ''} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  )
}

const itemVacio = () => ({ detalle: '', cantidad: '1', precio: '' })
const CUOTAS_TARJETA = [1, 3, 6, 9, 12, 18, 24]

// Primera cuota por defecto: una semana, quince días o un mes después de la compra.
function primeraCuotaDefault(fecha, frecuencia) { return fechaCuota(fecha, frecuencia, 1) }

async function registrarPago({ cliente, ventaId, fecha, monto, medio, archivo, notas }) {
  let comp = {}
  if (archivo) {
    try { comp = await subirComprobante(archivo, cliente.id) }
    catch (e) { return 'No se pudo subir la foto del comprobante: ' + e.message }
  }
  const { error } = await supabase.from('herr_pagos').insert({
    cliente_id: cliente.id, venta_id: ventaId, fecha, monto, medio, notas: notas || null,
    comprobante_url: comp.url || null, comprobante_path: comp.path || null,
  })
  return error ? 'No se pudo guardar el pago: ' + error.message : null
}

export function VentaModal({ cliente, onCerrar, onGuardado }) {
  const [fecha, setFecha] = useState(hoyAR())
  const [items, setItems] = useState([itemVacio()])
  const [forma, setForma] = useState('EFECTIVO')
  const [recargo, setRecargo] = useState('')
  const [cuotasTarjeta, setCuotasTarjeta] = useState(3)
  // Plan personal
  const [cuotasPlan, setCuotasPlan] = useState('4')
  const [frecuencia, setFrecuencia] = useState('MENSUAL')
  const [primera, setPrimera] = useState(primeraCuotaDefault(hoyAR(), 'MENSUAL'))
  // Lo que paga en el momento (todo, una parte o el anticipo del plan)
  const [pagaAhora, setPagaAhora] = useState(null) // null = el total
  const [medioAnticipo, setMedioAnticipo] = useState('EFECTIVO')
  const [archivo, setArchivo] = useState(null)
  const [seLlevaAhora, setSeLlevaAhora] = useState(true)
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const esPlan = forma === 'PLAN PERSONAL'
  const esTarjeta = forma === 'TARJETA EN CUOTAS'
  const subtotal = items.reduce((t, i) => t + (parseFloat(i.cantidad) || 0) * parseNum(i.precio), 0)
  const pctRecargo = (esPlan || esTarjeta) ? (parseFloat((recargo || '').replace(',', '.')) || 0) : 0
  const total = Math.round(subtotal * (1 + pctRecargo / 100))
  // En tarjeta se cobra todo con el posnet; en efectivo/transferencia por defecto todo;
  // en el plan, lo que deje de anticipo (por defecto nada).
  const pago = esTarjeta ? total : pagaAhora === null ? (esPlan ? 0 : total) : parseNum(pagaAhora)
  const medioPago = esTarjeta ? 'TARJETA' : esPlan ? medioAnticipo : forma
  const nCuotas = parseInt(cuotasPlan, 10) || 0
  const montoCuota = esPlan && nCuotas > 0 ? Math.ceil((total - pago) / nCuotas) : null
  const quedaPagado = total > 0 && pago >= total

  const setItem = (idx, k, v) => setItems(items.map((it, i) => (i === idx ? { ...it, [k]: v } : it)))
  function cambiarForma(f) { setForma(f); setPagaAhora(null) }
  function cambiarFrecuencia(f) { setFrecuencia(f); setPrimera(primeraCuotaDefault(fecha, f)) }

  async function guardar(e) {
    e.preventDefault()
    const limpios = items
      .filter(i => i.detalle.trim() || parseNum(i.precio))
      .map(i => ({ detalle: i.detalle.trim(), cantidad: parseFloat(i.cantidad) || 1, precio: parseNum(i.precio) }))
    if (!limpios.length || total <= 0) { setError('Cargá al menos una herramienta con su precio'); return }
    if (pago > total) { setError('Lo que paga no puede ser mayor al total'); return }
    if (esPlan && (nCuotas < 1 || pago >= total)) { setError('Para el plan poné cuántas cuotas y un anticipo menor al total'); return }
    if (esPlan && !primera) { setError('Poné la fecha de la primera cuota'); return }
    setGuardando(true); setError('')
    const { data: venta, error } = await supabase.from('herr_ventas').insert({
      cliente_id: cliente.id, fecha, items: limpios, total, notas: notas.trim() || null, forma_pago: forma,
      cuotas: esTarjeta ? cuotasTarjeta : esPlan ? nCuotas : null,
      recargo: pctRecargo || null,
      anticipo: esPlan ? pago : null,
      monto_cuota: montoCuota, frecuencia: esPlan ? frecuencia : null, primera_cuota: esPlan ? primera : null,
      entregado_el: quedaPagado && seLlevaAhora ? fecha : null,
    }).select().single()
    if (error) { setGuardando(false); setError('No se pudo guardar: ' + error.message); return }
    if (pago > 0) {
      const err = await registrarPago({ cliente, ventaId: venta.id, fecha, monto: pago, medio: medioPago, archivo, notas: esPlan ? 'ANTICIPO' : esTarjeta ? `${cuotasTarjeta} CUOTAS` : '' })
      if (err) { setGuardando(false); setError('La venta se guardó, pero: ' + err + '. Cargá el pago desde la ficha.'); return }
    }
    setGuardando(false)
    onGuardado()
  }

  return (
    <Modal titulo={`Venta · ${cliente.nombre}`} onCerrar={onCerrar}>
      <form onSubmit={guardar}>
        <div className="fila"><div><label className="lbl">Fecha</label><input type="date" value={fecha} onChange={e => { setFecha(e.target.value); if (e.target.value) setPrimera(primeraCuotaDefault(e.target.value, frecuencia)) }} /></div></div>
        <label className="lbl">Qué se lleva</label>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 46px 96px 30px', gap: 6, marginBottom: 6 }}>
            <input value={it.detalle} onChange={e => setItem(i, 'detalle', e.target.value)} placeholder="Ej: Amoladora Makita 115mm" />
            <input value={it.cantidad} onChange={e => setItem(i, 'cantidad', e.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" title="Cantidad" />
            <input value={formatNum(it.precio)} onChange={e => setItem(i, 'precio', e.target.value)} inputMode="numeric" placeholder="Precio $" />
            <button type="button" className="btn sec chico" onClick={() => setItems(items.length > 1 ? items.filter((_, j) => j !== i) : [itemVacio()])} title="Quitar">×</button>
          </div>
        ))}
        <button type="button" className="btn sec chico" onClick={() => setItems([...items, itemVacio()])} style={{ marginBottom: 14 }}>+ Agregar otra</button>

        <label className="lbl">Forma de pago</label>
        <Opciones opciones={FORMAS_PAGO} valor={forma} onChange={cambiarForma} />

        {(esTarjeta || esPlan) && (
          <div className="fila">
            {esTarjeta && (
              <div><label className="lbl">Cuotas de la tarjeta</label>
                <select value={cuotasTarjeta} onChange={e => setCuotasTarjeta(Number(e.target.value))}>
                  {CUOTAS_TARJETA.map(c => <option key={c} value={c}>{c === 1 ? '1 pago' : `${c} cuotas`}</option>)}
                </select>
              </div>
            )}
            <div><label className="lbl">Recargo % (opcional)</label><input value={recargo} onChange={e => setRecargo(e.target.value.replace(/[^\d.,]/g, ''))} inputMode="decimal" placeholder="0" /></div>
          </div>
        )}

        <div className="total-venta">
          {pctRecargo > 0 && <div className="tenue" style={{ fontSize: 13 }}>{pesos(subtotal)} + {pctRecargo}% de recargo</div>}
          Total: {pesos(total)}
          {esTarjeta && cuotasTarjeta > 1 && total > 0 && <div className="tenue" style={{ fontSize: 13 }}>{cuotasTarjeta} cuotas de {pesos(total / cuotasTarjeta)} en la tarjeta</div>}
        </div>

        {esPlan && (
          <>
            <div className="fila">
              <div><label className="lbl">Cantidad de cuotas</label><input value={cuotasPlan} onChange={e => setCuotasPlan(e.target.value.replace(/\D/g, ''))} inputMode="numeric" /></div>
              <div><label className="lbl">Primera cuota vence</label><input type="date" value={primera} onChange={e => setPrimera(e.target.value)} /></div>
            </div>
            <div style={{ marginBottom: 10 }}><Opciones opciones={FRECUENCIAS} valor={frecuencia} onChange={cambiarFrecuencia} /></div>
          </>
        )}

        {!esTarjeta && (
          <div className="fila">
            <div><label className="lbl">{esPlan ? 'Anticipo (opcional)' : 'Paga ahora'}</label>
              <input value={formatNum(esPlan || pagaAhora !== null ? (pagaAhora ?? '') : total)} onChange={e => setPagaAhora(e.target.value)} inputMode="numeric" placeholder="$ 0" /></div>
            {esPlan && <div><label className="lbl">Medio del anticipo</label><select value={medioAnticipo} onChange={e => setMedioAnticipo(e.target.value)}>{MEDIOS_PAGO.map(m => <option key={m}>{m}</option>)}</select></div>}
          </div>
        )}

        {esPlan && montoCuota > 0 && primera && (
          <div className="aviso">
            {nCuotas} cuota{nCuotas > 1 ? 's' : ''} {frecuencia.toLowerCase()}{nCuotas > 1 ? 'es' : ''} de <b>{pesos(montoCuota)}</b>.
            {' '}La primera vence el {fechaAR(primera)} y la última el {fechaAR(fechaCuota(primera, frecuencia, nCuotas - 1))}.
          </div>
        )}

        {pago > 0 && (
          <div style={{ marginBottom: 12 }}>
            <label className="lbl">Comprobante {esTarjeta ? '(cupón del posnet)' : medioPago === 'TRANSFERENCIA' ? '(transferencia)' : '(opcional)'}</label>
            <ComprobanteInput archivo={archivo} onChange={setArchivo} />
          </div>
        )}

        {total > 0 && (quedaPagado ? (
          <label className="aviso ok-fondo" style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" checked={seLlevaAhora} onChange={e => setSeLlevaAhora(e.target.checked)} style={{ width: 'auto' }} />
            Queda pagado. Se lleva la mercadería ahora.
          </label>
        ) : (
          <div className="aviso debe-fondo">Falta pagar <b>{pesos(total - pago)}</b>. La mercadería se entrega cuando termine de pagar.</div>
        ))}

        <div className="fila"><div><label className="lbl">Notas</label><input value={notas} onChange={e => setNotas(e.target.value)} /></div></div>
        {error && <div className="error">{error}</div>}
        <div className="acciones" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn sec" onClick={onCerrar}>Cancelar</button>
          <button className="btn" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar venta'}</button>
        </div>
      </form>
    </Modal>
  )
}

// Pago a cuenta de una venta (una cuota del plan, o lo que falte).
export function PagoModal({ cliente, venta, estado, onCerrar, onGuardado }) {
  const sugerido = venta.forma_pago === 'PLAN PERSONAL' && venta.monto_cuota ? Math.min(Number(venta.monto_cuota), estado.saldo) : estado.saldo
  const [fecha, setFecha] = useState(hoyAR())
  const [monto, setMonto] = useState(String(Math.round(sugerido)))
  const [medio, setMedio] = useState('EFECTIVO')
  const [archivo, setArchivo] = useState(null)
  const [notas, setNotas] = useState(estado.plan?.proxima ? `CUOTA ${estado.plan.proxima.numero} DE ${estado.plan.cuotas}` : '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const m = parseNum(monto)
  const queda = estado.saldo - m

  async function guardar(e) {
    e.preventDefault()
    if (m <= 0) { setError('Poné el monto que pagó'); return }
    if (m > estado.saldo) { setError(`Solo falta pagar ${pesos(estado.saldo)}`); return }
    setGuardando(true); setError('')
    const err = await registrarPago({ cliente, ventaId: venta.id, fecha, monto: m, medio, archivo, notas: notas.trim() })
    setGuardando(false)
    if (err) { setError(err); return }
    onGuardado()
  }

  return (
    <Modal titulo={`Pago · ${cliente.nombre}`} onCerrar={onCerrar}>
      <form onSubmit={guardar}>
        <div className="tenue" style={{ marginBottom: 12 }}>
          Falta pagar <b className="debe">{pesos(estado.saldo)}</b> de la venta del {fechaAR(venta.fecha)}{' '}
          {m !== estado.saldo && <button type="button" className="btn sec chico" onClick={() => setMonto(String(Math.round(estado.saldo)))}>Paga todo</button>}
        </div>
        <div className="fila">
          <div><label className="lbl">Monto *</label><input value={formatNum(monto)} onChange={e => setMonto(e.target.value)} inputMode="numeric" placeholder="$ 0" autoFocus /></div>
          <div><label className="lbl">Fecha</label><input type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></div>
        </div>
        <label className="lbl">Medio</label>
        <Opciones opciones={MEDIOS_PAGO} valor={medio} onChange={setMedio} />
        <div style={{ marginBottom: 12 }}>
          <label className="lbl">Comprobante</label>
          <ComprobanteInput archivo={archivo} onChange={setArchivo} />
        </div>
        <div className="fila"><div><label className="lbl">Notas</label><input value={notas} onChange={e => setNotas(e.target.value)} /></div></div>
        {m > 0 && m <= estado.saldo && (queda > 0
          ? <div className="aviso">Después de este pago falta <b>{pesos(queda)}</b>.</div>
          : <div className="aviso ok-fondo">Con este pago queda todo pagado. Ya se le puede entregar la mercadería.</div>)}
        {error && <div className="error">{error}</div>}
        <div className="acciones" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn sec" onClick={onCerrar}>Cancelar</button>
          <button className="btn verde" disabled={guardando}>{guardando ? 'Guardando…' : 'Registrar pago'}</button>
        </div>
      </form>
    </Modal>
  )
}
