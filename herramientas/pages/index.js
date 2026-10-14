import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { pesos, fechaAR, hoyAR, calcularSaldos } from '../lib/formato'
import { ClienteModal } from '../components/Modales'

export default function Inicio() {
  const router = useRouter()
  const [clientes, setClientes] = useState([])
  const [ventas, setVentas] = useState([])
  const [pagos, setPagos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [soloDeudores, setSoloDeudores] = useState(false)
  const [nuevo, setNuevo] = useState(false)

  async function cargar() {
    const [c, v, p] = await Promise.all([
      supabase.from('herr_clientes').select('*').order('nombre'),
      supabase.from('herr_ventas').select('cliente_id, fecha, total'),
      supabase.from('herr_pagos').select('cliente_id, fecha, monto'),
    ])
    const err = c.error || v.error || p.error
    if (err) setError('No se pudieron cargar los datos: ' + err.message)
    setClientes(c.data || []); setVentas(v.data || []); setPagos(p.data || [])
    setCargando(false)
  }
  useEffect(() => { cargar() }, [])

  const saldos = useMemo(() => calcularSaldos(ventas, pagos), [ventas, pagos])
  const mes = hoyAR().slice(0, 7)
  const totalDeuda = Object.values(saldos).reduce((t, s) => t + Math.max(0, s.saldo), 0)
  const deudores = Object.values(saldos).filter(s => s.saldo > 0).length
  const vendidoMes = ventas.filter(v => v.fecha.startsWith(mes)).reduce((t, v) => t + Number(v.total), 0)
  const cobradoMes = pagos.filter(p => p.fecha.startsWith(mes)).reduce((t, p) => t + Number(p.monto), 0)

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return clientes
      .map(c => ({ ...c, ...(saldos[c.id] || { vendido: 0, pagado: 0, saldo: 0, ultimo: null }) }))
      .filter(c => !q || [c.nombre, c.telefono, c.documento].some(x => (x || '').toLowerCase().includes(q)))
      .filter(c => !soloDeudores || c.saldo > 0)
      .sort((a, b) => (soloDeudores ? b.saldo - a.saldo : 0) || a.nombre.localeCompare(b.nombre))
  }, [clientes, saldos, busqueda, soloDeudores])

  return (
    <>
      <div className="kpis">
        <div className="kpi"><div className="lbl">Te deben en total</div><div className="val debe">{pesos(totalDeuda)}</div></div>
        <div className="kpi"><div className="lbl">Clientes con deuda</div><div className="val">{deudores}</div></div>
        <div className="kpi"><div className="lbl">Vendido este mes</div><div className="val">{pesos(vendidoMes)}</div></div>
        <div className="kpi"><div className="lbl">Cobrado este mes</div><div className="val ok">{pesos(cobradoMes)}</div></div>
      </div>

      <div className="card">
        <div className="acciones" style={{ marginBottom: 12 }}>
          <input style={{ flex: '1 1 200px', width: 'auto' }} value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre, teléfono o DNI…" />
          <button className={'btn ' + (soloDeudores ? '' : 'sec')} onClick={() => setSoloDeudores(!soloDeudores)}>Solo los que deben</button>
          <button className="btn" onClick={() => setNuevo(true)}>+ Nuevo cliente</button>
        </div>
        {error && <div className="error">{error}</div>}
        {cargando ? <div className="vacio">Cargando…</div> : !lista.length ? (
          <div className="vacio">{clientes.length ? 'No hay clientes que coincidan.' : 'Todavía no cargaste clientes. Empezá con "+ Nuevo cliente".'}</div>
        ) : (
          <div className="scroll">
            <table className="tabla">
              <thead><tr><th>Cliente</th><th className="ocultar-cel">Teléfono</th><th className="ocultar-cel">Último mov.</th><th className="num">Saldo</th></tr></thead>
              <tbody>
                {lista.map(c => (
                  <tr key={c.id} className="click" onClick={() => router.push(`/cliente/${c.id}`)}>
                    <td><b>{c.nombre}</b>{c.documento && <div className="tenue" style={{ fontSize: 13 }}>{c.documento}</div>}</td>
                    <td className="ocultar-cel">{c.telefono || '—'}</td>
                    <td className="ocultar-cel">{fechaAR(c.ultimo)}</td>
                    <td className={'num ' + (c.saldo > 0 ? 'debe' : c.saldo < 0 ? 'ok' : 'tenue')}>
                      <b>{c.saldo > 0 ? pesos(c.saldo) : c.saldo < 0 ? 'A favor ' + pesos(-c.saldo) : 'Al día'}</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {nuevo && <ClienteModal onCerrar={() => setNuevo(false)} onGuardado={c => { setNuevo(false); router.push(`/cliente/${c.id}`) }} />}
    </>
  )
}
