import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { pesos, fechaAR, hoyAR, linkWhatsapp, estadoVenta } from '../../lib/formato'
import { subirComprobante, borrarComprobante } from '../../lib/comprobantes'
import { ClienteModal, VentaModal, PagoModal } from '../../components/Modales'

const ESTADO_TEXTO = { 'PAGANDO': 'Pagando · no se entrega', 'PARA ENTREGAR': 'Pagado · para entregar', 'ENTREGADO': 'Entregado' }
const claseEstado = e => 'tag e-' + e.toLowerCase().replace(' ', '-')

export default function FichaCliente() {
  const router = useRouter()
  const { id } = router.query
  const [cliente, setCliente] = useState(null)
  const [ventas, setVentas] = useState([])
  const [pagos, setPagos] = useState([])
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // { tipo: 'editar' | 'venta' | 'pago', venta? }
  const [subiendo, setSubiendo] = useState(null)
  const archivoRef = useRef()
  const pagoParaComprobante = useRef(null)

  async function cargar() {
    const [c, v, p] = await Promise.all([
      supabase.from('herr_clientes').select('*').eq('id', id).single(),
      supabase.from('herr_ventas').select('*').eq('cliente_id', id).order('fecha', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('herr_pagos').select('*').eq('cliente_id', id).order('fecha').order('created_at'),
    ])
    if (c.error) { setError('No se encontró el cliente'); return }
    setCliente(c.data); setVentas(v.data || []); setPagos(p.data || [])
  }
  useEffect(() => { if (id) cargar() }, [id])

  if (error) return <div className="card vacio">{error}</div>
  if (!cliente) return <div className="card vacio">Cargando…</div>

  const hoy = hoyAR()
  const lista = ventas.map(v => {
    const pv = pagos.filter(p => p.venta_id === v.id)
    return { venta: v, pagos: pv, estado: estadoVenta(v, pv, hoy) }
  })
  // Primero lo que está pendiente (pagando o para entregar), después lo entregado.
  lista.sort((a, b) => (a.estado.estado === 'ENTREGADO') - (b.estado.estado === 'ENTREGADO'))
  const saldo = lista.reduce((t, x) => t + Math.max(0, x.estado.saldo), 0)
  const paraEntregar = lista.filter(x => x.estado.estado === 'PARA ENTREGAR').length
  const atrasada = lista.find(x => x.estado.plan?.atrasada)

  async function entregar(v, deshacer) {
    if (!deshacer && !confirm('¿Confirmás que se le entregó la mercadería?')) return
    const { error } = await supabase.from('herr_ventas').update({ entregado_el: deshacer ? null : hoy }).eq('id', v.id)
    if (error) { alert('No se pudo guardar: ' + error.message); return }
    cargar()
  }
  async function borrarPago(p) {
    if (!confirm(`¿Borrar el pago de ${pesos(p.monto)} del ${fechaAR(p.fecha)}?`)) return
    const { error } = await supabase.from('herr_pagos').delete().eq('id', p.id)
    if (error) { alert('No se pudo borrar: ' + error.message); return }
    await borrarComprobante(p.comprobante_path)
    cargar()
  }
  async function borrarVenta(x) {
    if (!confirm(`¿Borrar la venta de ${pesos(x.venta.total)} con sus ${x.pagos.length} pago(s)? No se puede deshacer.`)) return
    const { error } = await supabase.from('herr_ventas').delete().eq('id', x.venta.id)
    if (error) { alert('No se pudo borrar: ' + error.message); return }
    for (const p of x.pagos) await borrarComprobante(p.comprobante_path)
    cargar()
  }
  async function borrarCliente() {
    if (!confirm(`¿Borrar a ${cliente.nombre} con TODAS sus ventas y pagos? No se puede deshacer.`)) return
    const { error } = await supabase.from('herr_clientes').delete().eq('id', cliente.id)
    if (error) { alert('No se pudo borrar: ' + error.message); return }
    for (const p of pagos) await borrarComprobante(p.comprobante_path)
    router.push('/')
  }

  // Comprobante agregado después de cargar el pago
  function elegirComprobante(p) { pagoParaComprobante.current = p; archivoRef.current.click() }
  async function adjuntarComprobante(file) {
    const p = pagoParaComprobante.current
    if (!file || !p) return
    setSubiendo(p.id)
    try {
      const { url, path } = await subirComprobante(file, cliente.id)
      const { error } = await supabase.from('herr_pagos').update({ comprobante_url: url, comprobante_path: path }).eq('id', p.id)
      if (error) throw error
      await cargar()
    } catch (e) { alert('No se pudo subir el comprobante: ' + e.message) }
    setSubiendo(null)
  }

  let textoWa = `Hola ${cliente.nombre}! Te paso el saldo de tu cuenta en Esteban Herramientas: ${pesos(saldo)}.`
  if (atrasada) textoWa += ` Tenés la cuota ${atrasada.estado.plan.proxima.numero} vencida desde el ${fechaAR(atrasada.estado.plan.proxima.fecha)}.`
  textoWa += ' Cualquier cosa avisame. Gracias!'
  const wa = saldo > 0 && linkWhatsapp(cliente.telefono, textoWa)

  return (
    <>
      <input ref={archivoRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
        onChange={e => { adjuntarComprobante(e.target.files[0]); e.target.value = '' }} />

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
              {saldo > 0 ? 'Debe' : 'Saldo'}
            </div>
            <div className={'marca ' + (saldo > 0 ? 'debe' : 'ok')} style={{ fontSize: 38, fontStyle: 'italic' }}>{saldo > 0 ? pesos(saldo) : 'Al día'}</div>
            {paraEntregar > 0 && <div className="ok" style={{ fontSize: 13, fontWeight: 700 }}>{paraEntregar} venta{paraEntregar > 1 ? 's' : ''} para entregar</div>}
          </div>
        </div>
        <div className="acciones" style={{ marginTop: 14 }}>
          <button className="btn" onClick={() => setModal({ tipo: 'venta' })}>+ Nueva venta</button>
          {wa && <a className="btn sec" href={wa} target="_blank" rel="noreferrer">Mandar saldo por WhatsApp</a>}
          <button className="btn sec" onClick={() => setModal({ tipo: 'editar' })}>Editar datos</button>
        </div>
      </div>

      <div className="card">
        <div className="titulo">Ventas</div>
        {!lista.length && <div className="vacio">Sin ventas todavía. Cargá la primera con "+ Nueva venta".</div>}
        {lista.map(x => {
          const { venta: v, estado: e } = x
          const pct = Math.min(100, Math.round((e.pagado / e.total) * 100)) || 0
          return (
            <div key={v.id} className={'venta' + (e.estado === 'ENTREGADO' ? ' entregada' : '')}>
              <div className="venta-cab">
                <div>
                  <b>{fechaAR(v.fecha)}</b>{' '}
                  <span className="tag forma">{v.forma_pago}{v.cuotas ? ` · ${v.cuotas} cuota${v.cuotas > 1 ? 's' : ''}` : ''}</span>{' '}
                  <span className={claseEstado(e.estado)}>{ESTADO_TEXTO[e.estado]}</span>
                  {e.plan?.atrasada && <> <span className="tag atraso">Cuota vencida hace {e.plan.diasAtraso} día{e.plan.diasAtraso > 1 ? 's' : ''}</span></>}
                </div>
                <b style={{ fontSize: 18 }}>{pesos(e.total)}</b>
              </div>

              {(v.items || []).map((it, i) => (
                <div key={i} style={{ fontSize: 14 }}>{it.cantidad !== 1 && `${it.cantidad} × `}{it.detalle || 'Sin detalle'} <span className="tenue" style={{ whiteSpace: 'nowrap' }}>{pesos(it.precio * it.cantidad)}</span></div>
              ))}
              {v.recargo > 0 && <div className="tenue" style={{ fontSize: 13 }}>Incluye {Number(v.recargo)}% de recargo</div>}
              {v.notas && <div className="tenue" style={{ fontSize: 13 }}>{v.notas}</div>}

              <div className={'barra' + (e.saldo <= 0 ? ' completa' : '')}><div style={{ width: pct + '%' }} /></div>
              <div className="cifras">
                <span>Pagó <b className="ok">{pesos(e.pagado)}</b></span>
                {e.saldo > 0 && <span>Falta <b className="debe">{pesos(e.saldo)}</b></span>}
                {e.plan && <span className="tenue">Cuotas pagas {e.plan.pagadas}/{e.plan.cuotas} de {pesos(v.monto_cuota)} ({v.frecuencia.toLowerCase()})</span>}
                {e.plan?.proxima && <span className={e.plan.atrasada ? 'debe' : 'tenue'}>Cuota {e.plan.proxima.numero} vence el {fechaAR(e.plan.proxima.fecha)}</span>}
                {v.entregado_el && <span className="tenue">Entregado el {fechaAR(v.entregado_el)}</span>}
              </div>

              {x.pagos.length > 0 && (
                <div className="pagos-venta">
                  {x.pagos.map(p => (
                    <div key={p.id} className="pago-fila">
                      {p.comprobante_url ? (
                        <a href={p.comprobante_url} target="_blank" rel="noreferrer" title="Ver comprobante">
                          {/\.pdf$/i.test(p.comprobante_path || '') ? <span className="tag pago">PDF</span> : <img src={p.comprobante_url} alt="Comprobante" className="miniatura" />}
                        </a>
                      ) : (
                        <button className="btn sec chico" onClick={() => elegirComprobante(p)} disabled={subiendo === p.id} title="Subir comprobante">
                          {subiendo === p.id ? '…' : '📷'}
                        </button>
                      )}
                      <div className="crece">
                        <div><b>{pesos(p.monto)}</b> <span className="tag pago">{p.medio}</span></div>
                        <div className="tenue" style={{ fontSize: 13 }}>{fechaAR(p.fecha)}{p.notas ? ' · ' + p.notas : ''}</div>
                      </div>
                      <button className="btn peligro chico" onClick={() => borrarPago(p)} title="Borrar pago">×</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="acciones" style={{ marginTop: 12 }}>
                {e.saldo > 0 && <button className="btn verde chico" onClick={() => setModal({ tipo: 'pago', venta: v, estado: e })}>+ Registrar pago</button>}
                {e.estado === 'PARA ENTREGAR' && <button className="btn chico" onClick={() => entregar(v)}>Marcar entregado</button>}
                {e.estado === 'PAGANDO' && <span className="tenue" style={{ fontSize: 13 }}>Se entrega cuando termine de pagar.</span>}
                {e.estado === 'ENTREGADO' && <button className="btn sec chico" onClick={() => entregar(v, true)}>Deshacer entrega</button>}
                <span style={{ flex: 1 }} />
                <button className="btn peligro chico" onClick={() => borrarVenta(x)}>Borrar venta</button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ textAlign: 'right' }}><button className="btn peligro chico" onClick={borrarCliente}>Borrar cliente</button></div>

      {modal?.tipo === 'editar' && <ClienteModal cliente={cliente} onCerrar={() => setModal(null)} onGuardado={c => { setCliente(c); setModal(null) }} />}
      {modal?.tipo === 'venta' && <VentaModal cliente={cliente} onCerrar={() => setModal(null)} onGuardado={() => { setModal(null); cargar() }} />}
      {modal?.tipo === 'pago' && <PagoModal cliente={cliente} venta={modal.venta} estado={modal.estado} onCerrar={() => setModal(null)} onGuardado={() => { setModal(null); cargar() }} />}
    </>
  )
}
