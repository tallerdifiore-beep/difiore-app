import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { pesos, fechaAR, linkWhatsapp } from '../../lib/formato'
import { ClienteModal, VentaModal, PagoModal } from '../../components/Modales'

export default function FichaCliente() {
  const router = useRouter()
  const { id } = router.query
  const [cliente, setCliente] = useState(null)
  const [ventas, setVentas] = useState([])
  const [pagos, setPagos] = useState([])
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // 'editar' | 'venta' | 'pago'

  async function cargar() {
    const [c, v, p] = await Promise.all([
      supabase.from('herr_clientes').select('*').eq('id', id).single(),
      supabase.from('herr_ventas').select('*').eq('cliente_id', id),
      supabase.from('herr_pagos').select('*').eq('cliente_id', id),
    ])
    if (c.error) { setError('No se encontró el cliente'); return }
    setCliente(c.data); setVentas(v.data || []); setPagos(p.data || [])
  }
  useEffect(() => { if (id) cargar() }, [id])

  if (error) return <div className="card vacio">{error}</div>
  if (!cliente) return <div className="card vacio">Cargando…</div>

  const vendido = ventas.reduce((t, v) => t + Number(v.total), 0)
  const pagado = pagos.reduce((t, p) => t + Number(p.monto), 0)
  const saldo = vendido - pagado

  // Cuenta corriente: ventas y pagos juntos, en orden, con el saldo acumulado en cada línea.
  const movs = [
    ...ventas.map(v => ({ ...v, tipo: 'venta', importe: Number(v.total) })),
    ...pagos.map(p => ({ ...p, tipo: 'pago', importe: -Number(p.monto) })),
  ].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.created_at.localeCompare(b.created_at))
  let acumulado = 0
  for (const m of movs) { acumulado += m.importe; m.saldo = acumulado }
  movs.reverse()

  async function borrar(m) {
    if (!confirm(`¿Borrar este ${m.tipo} de ${pesos(Math.abs(m.importe))}?`)) return
    const { error } = await supabase.from(m.tipo === 'venta' ? 'herr_ventas' : 'herr_pagos').delete().eq('id', m.id)
    if (error) { alert('No se pudo borrar: ' + error.message); return }
    cargar()
  }
  async function borrarCliente() {
    if (!confirm(`¿Borrar a ${cliente.nombre} con TODAS sus ventas y pagos? No se puede deshacer.`)) return
    const { error } = await supabase.from('herr_clientes').delete().eq('id', cliente.id)
    if (error) { alert('No se pudo borrar: ' + error.message); return }
    router.push('/')
  }

  const wa = saldo > 0 && linkWhatsapp(cliente.telefono, `Hola ${cliente.nombre}! Te paso el saldo de tu cuenta: ${pesos(saldo)}. Cualquier cosa avisame. Gracias!`)

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div className="marca cromo" style={{ fontSize: 32 }}>{cliente.nombre}</div>
            <div className="tenue" style={{ marginTop: 4, lineHeight: 1.6 }}>
              {[cliente.telefono, cliente.documento, cliente.direccion].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
              {cliente.notas && <div>{cliente.notas}</div>}
            </div>
          </div>
          <div className="saldo-cliente">
            <div className="lbl" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, color: 'var(--texto3)', textTransform: 'uppercase' }}>
              {saldo > 0 ? 'Debe' : saldo < 0 ? 'Saldo a favor' : 'Saldo'}
            </div>
            <div className={'marca ' + (saldo > 0 ? 'debe' : 'ok')} style={{ fontSize: 38, fontStyle: 'italic' }}>{saldo === 0 ? 'Al día' : pesos(Math.abs(saldo))}</div>
            <div className="tenue" style={{ fontSize: 13 }}>Compró {pesos(vendido)} · Pagó {pesos(pagado)}</div>
          </div>
        </div>
        <div className="acciones" style={{ marginTop: 14 }}>
          <button className="btn" onClick={() => setModal('venta')}>+ Venta</button>
          <button className="btn verde" onClick={() => setModal('pago')}>+ Pago</button>
          {wa && <a className="btn sec" href={wa} target="_blank" rel="noreferrer">Mandar saldo por WhatsApp</a>}
          <button className="btn sec" onClick={() => setModal('editar')}>Editar datos</button>
        </div>
      </div>

      <div className="card">
        <div className="titulo">Cuenta corriente</div>
        {!movs.length ? <div className="vacio">Sin movimientos todavía.</div> : (
          <div className="scroll">
            <table className="tabla">
              <thead><tr><th>Fecha</th><th>Detalle</th><th className="num">Importe</th><th className="num ocultar-cel">Saldo</th><th></th></tr></thead>
              <tbody>
                {movs.map(m => (
                  <tr key={m.tipo + m.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{fechaAR(m.fecha)}</td>
                    <td>
                      <span className={'tag ' + m.tipo}>{m.tipo === 'venta' ? 'Venta' : m.medio}</span>{' '}
                      {m.tipo === 'venta' && (m.items || []).map((it, i) => (
                        <div key={i} style={{ fontSize: 14 }}>{it.cantidad !== 1 && `${it.cantidad} × `}{it.detalle || 'Sin detalle'} <span className="tenue" style={{ whiteSpace: 'nowrap' }}>{pesos(it.precio * it.cantidad)}</span></div>
                      ))}
                      {m.notas && <div className="tenue" style={{ fontSize: 13 }}>{m.notas}</div>}
                    </td>
                    <td className={'num ' + (m.tipo === 'venta' ? '' : 'ok')}>{m.tipo === 'venta' ? pesos(m.importe) : '− ' + pesos(-m.importe)}</td>
                    <td className={'num ocultar-cel ' + (m.saldo > 0 ? 'debe' : 'tenue')}>{pesos(m.saldo)}</td>
                    <td className="num"><button className="btn peligro chico" onClick={() => borrar(m)} title="Borrar">×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'right' }}><button className="btn peligro chico" onClick={borrarCliente}>Borrar cliente</button></div>

      {modal === 'editar' && <ClienteModal cliente={cliente} onCerrar={() => setModal(null)} onGuardado={c => { setCliente(c); setModal(null) }} />}
      {modal === 'venta' && <VentaModal cliente={cliente} onCerrar={() => setModal(null)} onGuardado={() => { setModal(null); cargar() }} />}
      {modal === 'pago' && <PagoModal cliente={cliente} saldo={saldo} onCerrar={() => setModal(null)} onGuardado={() => { setModal(null); cargar() }} />}
    </>
  )
}
