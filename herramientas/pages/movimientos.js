import { useState, useEffect } from 'react'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabase'
import { pesos, fechaAR, hoyAR, MEDIOS_PAGO } from '../lib/formato'

function primeroDelMes() { return hoyAR().slice(0, 8) + '01' }

export default function Movimientos() {
  const [desde, setDesde] = useState(primeroDelMes())
  const [hasta, setHasta] = useState(hoyAR())
  const [tipo, setTipo] = useState('todos')
  const [movs, setMovs] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  async function cargar() {
    setCargando(true)
    const [v, p] = await Promise.all([
      supabase.from('herr_ventas').select('*, herr_clientes(id, nombre)').gte('fecha', desde).lte('fecha', hasta),
      supabase.from('herr_pagos').select('*, herr_clientes(id, nombre)').gte('fecha', desde).lte('fecha', hasta),
    ])
    const err = v.error || p.error
    setError(err ? 'No se pudieron cargar los movimientos: ' + err.message : '')
    setMovs([
      ...(v.data || []).map(x => ({ ...x, tipo: 'venta', importe: Number(x.total) })),
      ...(p.data || []).map(x => ({ ...x, tipo: 'pago', importe: Number(x.monto) })),
    ].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.created_at.localeCompare(a.created_at)))
    setCargando(false)
  }
  useEffect(() => { if (desde && hasta) cargar() }, [desde, hasta])

  const visibles = movs.filter(m => tipo === 'todos' || m.tipo === tipo)
  const totalVentas = movs.filter(m => m.tipo === 'venta').reduce((t, m) => t + m.importe, 0)
  const totalPagos = movs.filter(m => m.tipo === 'pago').reduce((t, m) => t + m.importe, 0)
  const porMedio = MEDIOS_PAGO.map(medio => ({
    medio, total: movs.filter(m => m.tipo === 'pago' && m.medio === medio).reduce((t, m) => t + m.importe, 0),
  })).filter(x => x.total > 0)

  const detalle = m => m.tipo === 'venta'
    ? (m.items || []).map(it => (it.cantidad !== 1 ? `${it.cantidad} x ` : '') + it.detalle).join(', ')
    : m.medio

  function exportar() {
    const filas = visibles.map(m => ({
      Fecha: fechaAR(m.fecha), Tipo: m.tipo === 'venta' ? 'VENTA' : 'PAGO', Cliente: m.herr_clientes?.nombre || '',
      Detalle: detalle(m), Notas: m.notas || '', Importe: m.importe,
    }))
    const hoja = XLSX.utils.json_to_sheet(filas)
    hoja['!cols'] = [{ wch: 11 }, { wch: 7 }, { wch: 28 }, { wch: 45 }, { wch: 25 }, { wch: 12 }]
    const libro = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro, hoja, 'Movimientos')
    XLSX.writeFile(libro, `movimientos_${desde}_a_${hasta}.xlsx`)
  }

  return (
    <>
      <div className="card">
        <div className="fila" style={{ alignItems: 'end' }}>
          <div><label className="lbl">Desde</label><input type="date" value={desde} onChange={e => setDesde(e.target.value)} /></div>
          <div><label className="lbl">Hasta</label><input type="date" value={hasta} onChange={e => setHasta(e.target.value)} /></div>
          <div><label className="lbl">Mostrar</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="todos">Ventas y pagos</option><option value="venta">Solo ventas</option><option value="pago">Solo pagos</option>
            </select>
          </div>
          <div><button className="btn sec" style={{ width: '100%' }} onClick={exportar} disabled={!visibles.length}>Descargar Excel</button></div>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi"><div className="lbl">Vendido en el período</div><div className="val">{pesos(totalVentas)}</div></div>
        <div className="kpi"><div className="lbl">Cobrado en el período</div><div className="val ok">{pesos(totalPagos)}</div></div>
        {porMedio.map(x => <div className="kpi" key={x.medio}><div className="lbl">Cobrado · {x.medio}</div><div className="val" style={{ fontSize: 24 }}>{pesos(x.total)}</div></div>)}
      </div>

      <div className="card">
        {error && <div className="error">{error}</div>}
        {cargando ? <div className="vacio">Cargando…</div> : !visibles.length ? <div className="vacio">No hay movimientos en estas fechas.</div> : (
          <div className="scroll">
            <table className="tabla">
              <thead><tr><th>Fecha</th><th>Cliente</th><th>Detalle</th><th className="num">Importe</th></tr></thead>
              <tbody>
                {visibles.map(m => (
                  <tr key={m.tipo + m.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{fechaAR(m.fecha)}</td>
                    <td><Link href={`/cliente/${m.cliente_id}`}><b>{m.herr_clientes?.nombre}</b></Link></td>
                    <td><span className={'tag ' + m.tipo}>{m.tipo === 'venta' ? 'Venta' : 'Pago'}</span> {detalle(m)}{m.notas && <span className="tenue"> · {m.notas}</span>}</td>
                    <td className={'num ' + (m.tipo === 'pago' ? 'ok' : '')}>{pesos(m.importe)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
