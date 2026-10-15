import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { pesos, fechaAR, hoyAR, calcularSaldos, estadoVenta, diasEntre } from '../lib/formato'
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
      supabase.from('herr_ventas').select('*'),
      supabase.from('herr_pagos').select('cliente_id, venta_id, fecha, monto'),
    ])
    const err = c.error || v.error || p.error
    if (err) setError('No se pudieron cargar los datos: ' + err.message)
    setClientes(c.data || []); setVentas(v.data || []); setPagos(p.data || [])
    setCargando(false)
  }
  useEffect(() => { cargar() }, [])

  const saldos = useMemo(() => calcularSaldos(ventas, pagos), [ventas, pagos])
  const hoy = hoyAR()
  const mes = hoy.slice(0, 7)
  const nombre = Object.fromEntries(clientes.map(c => [c.id, c.nombre]))
  const estados = useMemo(() => ventas.map(v => ({ venta: v, ...estadoVenta(v, pagos.filter(p => p.venta_id === v.id), hoy) })), [ventas, pagos, hoy])
  const totalDeuda = Object.values(saldos).reduce((t, s) => t + Math.max(0, s.saldo), 0)
  const cobradoMes = pagos.filter(p => p.fecha.startsWith(mes)).reduce((t, p) => t + Number(p.monto), 0)
  const paraEntregar = estados.filter(e => e.estado === 'PARA ENTREGAR')
  const vencidas = estados.filter(e => e.plan?.atrasada).sort((a, b) => b.plan.diasAtraso - a.plan.diasAtraso)
  // Cuotas que vencen de hoy a 7 días (sin contar las ya vencidas)
  const proximas = estados
    .filter(e => e.plan?.proxima && !e.plan.atrasada && diasEntre(hoy, e.plan.proxima.fecha) <= 7)
    .sort((a, b) => a.plan.proxima.fecha.localeCompare(b.plan.proxima.fecha))

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
        <div className="kpi"><div className="lbl">Cobrado este mes</div><div className="val ok">{pesos(cobradoMes)}</div></div>
        <div className="kpi"><div className="lbl">Para entregar</div><div className="val">{paraEntregar.length}</div></div>
        <div className="kpi"><div className="lbl">Cuotas vencidas</div><div className={'val ' + (vencidas.length ? 'debe' : '')}>{vencidas.length}</div></div>
      </div>

      {(vencidas.length > 0 || paraEntregar.length > 0 || proximas.length > 0) && (
        <div className="card lista-avisos">
          {vencidas.length > 0 && <div className="titulo debe">Cuotas vencidas</div>}
          {vencidas.map(e => (
            <Link key={e.venta.id} href={`/cliente/${e.venta.cliente_id}`}>
              <span><b>{nombre[e.venta.cliente_id]}</b> <span className="tenue">· cuota {e.plan.proxima.numero}/{e.plan.cuotas}, venció el {fechaAR(e.plan.proxima.fecha)}</span></span>
              <span className="debe" style={{ whiteSpace: 'nowrap' }}>{e.plan.diasAtraso} día{e.plan.diasAtraso > 1 ? 's' : ''}</span>
            </Link>
          ))}
          {proximas.length > 0 && <div className="titulo" style={{ marginTop: vencidas.length ? 16 : 0 }}>Vencen esta semana</div>}
          {proximas.map(e => (
            <Link key={e.venta.id} href={`/cliente/${e.venta.cliente_id}`}>
              <span><b>{nombre[e.venta.cliente_id]}</b> <span className="tenue">· cuota {e.plan.proxima.numero}/{e.plan.cuotas} de {pesos(e.venta.monto_cuota)}</span></span>
              <span style={{ whiteSpace: 'nowrap' }}>{e.plan.proxima.fecha === hoy ? 'Hoy' : fechaAR(e.plan.proxima.fecha)}</span>
            </Link>
          ))}
          {paraEntregar.length > 0 && <div className="titulo ok" style={{ marginTop: vencidas.length || proximas.length ? 16 : 0 }}>Pagado completo · para entregar</div>}
          {paraEntregar.map(e => (
            <Link key={e.venta.id} href={`/cliente/${e.venta.cliente_id}`}>
              <span><b>{nombre[e.venta.cliente_id]}</b> <span className="tenue">· {(e.venta.items || []).map(i => i.detalle).join(', ')}</span></span>
              <span className="ok" style={{ whiteSpace: 'nowrap' }}>{pesos(e.total)}</span>
            </Link>
          ))}
        </div>
      )}

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
