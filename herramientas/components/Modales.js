import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatNum, parseNum, pesos, hoyAR, MEDIOS_PAGO } from '../lib/formato'

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

const itemVacio = () => ({ detalle: '', cantidad: '1', precio: '' })

export function VentaModal({ cliente, onCerrar, onGuardado }) {
  const [fecha, setFecha] = useState(hoyAR())
  const [items, setItems] = useState([itemVacio()])
  const [notas, setNotas] = useState('')
  // Si el cliente paga algo en el momento, se registra el pago junto con la venta.
  const [entrega, setEntrega] = useState('')
  const [medio, setMedio] = useState('EFECTIVO')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const total = items.reduce((t, i) => t + (parseFloat(i.cantidad) || 0) * parseNum(i.precio), 0)
  const setItem = (idx, k, v) => setItems(items.map((it, i) => (i === idx ? { ...it, [k]: v } : it)))

  async function guardar(e) {
    e.preventDefault()
    const limpios = items
      .filter(i => i.detalle.trim() || parseNum(i.precio))
      .map(i => ({ detalle: i.detalle.trim(), cantidad: parseFloat(i.cantidad) || 1, precio: parseNum(i.precio) }))
    if (!limpios.length || total <= 0) { setError('Cargá al menos una herramienta con su precio'); return }
    const montoEntrega = parseNum(entrega)
    if (montoEntrega > total) { setError('La entrega no puede ser mayor al total'); return }
    setGuardando(true); setError('')
    const { error } = await supabase.from('herr_ventas').insert({ cliente_id: cliente.id, fecha, items: limpios, total, notas: notas.trim() || null })
    if (!error && montoEntrega > 0) {
      const r = await supabase.from('herr_pagos').insert({ cliente_id: cliente.id, fecha, monto: montoEntrega, medio, notas: 'ENTREGA EN LA VENTA' })
      if (r.error) { setGuardando(false); setError('La venta se guardó pero el pago no: ' + r.error.message); return }
    }
    setGuardando(false)
    if (error) { setError('No se pudo guardar: ' + error.message); return }
    onGuardado()
  }

  return (
    <Modal titulo={`Venta · ${cliente.nombre}`} onCerrar={onCerrar}>
      <form onSubmit={guardar}>
        <div className="fila"><div><label className="lbl">Fecha</label><input type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></div></div>
        <label className="lbl">Qué se llevó</label>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 46px 96px 30px', gap: 6, marginBottom: 6 }}>
            <input value={it.detalle} onChange={e => setItem(i, 'detalle', e.target.value)} placeholder="Ej: Amoladora Makita 115mm" />
            <input value={it.cantidad} onChange={e => setItem(i, 'cantidad', e.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" title="Cantidad" />
            <input value={formatNum(it.precio)} onChange={e => setItem(i, 'precio', e.target.value)} inputMode="numeric" placeholder="Precio $" />
            <button type="button" className="btn sec chico" onClick={() => setItems(items.length > 1 ? items.filter((_, j) => j !== i) : [itemVacio()])} title="Quitar">×</button>
          </div>
        ))}
        <button type="button" className="btn sec chico" onClick={() => setItems([...items, itemVacio()])} style={{ marginBottom: 12 }}>+ Agregar otra</button>
        <div style={{ textAlign: 'right', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Total: {pesos(total)}</div>
        <div className="fila">
          <div><label className="lbl">Pagó en el momento (opcional)</label><input value={formatNum(entrega)} onChange={e => setEntrega(e.target.value)} inputMode="numeric" placeholder="$ 0" /></div>
          <div><label className="lbl">Medio</label><select value={medio} onChange={e => setMedio(e.target.value)}>{MEDIOS_PAGO.map(m => <option key={m}>{m}</option>)}</select></div>
        </div>
        {total > 0 && <div className="tenue" style={{ marginBottom: 10 }}>Queda debiendo: <b className={total - parseNum(entrega) > 0 ? 'debe' : 'ok'}>{pesos(total - parseNum(entrega))}</b></div>}
        <div className="fila"><div><label className="lbl">Notas</label><input value={notas} onChange={e => setNotas(e.target.value)} placeholder="Ej: paga en 3 cuotas" /></div></div>
        {error && <div className="error">{error}</div>}
        <div className="acciones" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn sec" onClick={onCerrar}>Cancelar</button>
          <button className="btn" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar venta'}</button>
        </div>
      </form>
    </Modal>
  )
}

export function PagoModal({ cliente, saldo, onCerrar, onGuardado }) {
  const [fecha, setFecha] = useState(hoyAR())
  const [monto, setMonto] = useState('')
  const [medio, setMedio] = useState('EFECTIVO')
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function guardar(e) {
    e.preventDefault()
    const m = parseNum(monto)
    if (m <= 0) { setError('Poné el monto que pagó'); return }
    setGuardando(true); setError('')
    const { error } = await supabase.from('herr_pagos').insert({ cliente_id: cliente.id, fecha, monto: m, medio, notas: notas.trim() || null })
    setGuardando(false)
    if (error) { setError('No se pudo guardar: ' + error.message); return }
    onGuardado()
  }

  return (
    <Modal titulo={`Pago · ${cliente.nombre}`} onCerrar={onCerrar}>
      <form onSubmit={guardar}>
        {saldo > 0 && (
          <div className="tenue" style={{ marginBottom: 12 }}>
            Debe <b className="debe">{pesos(saldo)}</b>{' '}
            <button type="button" className="btn sec chico" onClick={() => setMonto(String(Math.round(saldo)))}>Paga todo</button>
          </div>
        )}
        <div className="fila">
          <div><label className="lbl">Monto *</label><input value={formatNum(monto)} onChange={e => setMonto(e.target.value)} inputMode="numeric" placeholder="$ 0" autoFocus /></div>
          <div><label className="lbl">Medio</label><select value={medio} onChange={e => setMedio(e.target.value)}>{MEDIOS_PAGO.map(m => <option key={m}>{m}</option>)}</select></div>
        </div>
        <div className="fila">
          <div><label className="lbl">Fecha</label><input type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></div>
          <div><label className="lbl">Notas</label><input value={notas} onChange={e => setNotas(e.target.value)} placeholder="Ej: cuota 2 de 3" /></div>
        </div>
        {saldo > 0 && parseNum(monto) > 0 && <div className="tenue" style={{ marginBottom: 10 }}>Después de este pago queda: <b className={saldo - parseNum(monto) > 0 ? 'debe' : 'ok'}>{pesos(saldo - parseNum(monto))}</b></div>}
        {error && <div className="error">{error}</div>}
        <div className="acciones" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn sec" onClick={onCerrar}>Cancelar</button>
          <button className="btn verde" disabled={guardando}>{guardando ? 'Guardando…' : 'Registrar pago'}</button>
        </div>
      </form>
    </Modal>
  )
}
