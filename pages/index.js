import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import styles from '../styles/App.module.css'

export default function Home() {
  const [seccion, setSeccion] = useState('dashboard')
  const [clientes, setClientes] = useState([])
  const [trabajos, setTrabajos] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    nombre: '', telefono: '', email: '', dni: '',
    marca_modelo: '', patente: '', anio: '', kilometraje: '',
    motivo: '', estado: 'Diagnóstico', mecanico: '', taller: 'Malvinas 2084'
  })
  const [clienteDetalle, setClienteDetalle] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [modalSalida, setModalSalida] = useState(null)
  const [observacionFinal, setObservacionFinal] = useState('')
  const [modalEditar, setModalEditar] = useState(null)
  const [formEditar, setFormEditar] = useState({})
  const [fotos, setFotos] = useState([])
  const [subiendo, setSubiendo] = useState(false)
  const fileRef = useRef()

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    setLoading(true)
    const { data: clientesData } = await supabase.from('clientes').select('*').order('created_at', { ascending: false })
    const { data: trabajosData } = await supabase.from('trabajos').select('*, vehiculos(*, clientes(*))').order('fecha_ingreso', { ascending: false })
    setClientes(clientesData || [])
    setTrabajos(trabajosData || [])
    setLoading(false)
  }

  async function cargarFotos(trabajoId) {
    const { data } = await supabase.from('fotos').select('*').eq('trabajo_id', trabajoId).order('created_at', { ascending: false })
    setFotos(data || [])
  }

  async function guardarCliente(e) {
    e.preventDefault()
    const { data: cliente, error: errCliente } = await supabase
      .from('clientes').insert({ nombre: form.nombre, telefono: form.telefono, email: form.email, dni: form.dni })
      .select().single()
    if (errCliente) { setMensaje('Error al guardar cliente'); return }

    const { data: vehiculo, error: errVehiculo } = await supabase
      .from('vehiculos').insert({ cliente_id: cliente.id, marca_modelo: form.marca_modelo, patente: form.patente, anio: form.anio, kilometraje: form.kilometraje })
      .select().single()
    if (errVehiculo) { setMensaje('Error al guardar vehículo'); return }

    await supabase.from('trabajos').insert({
      vehiculo_id: vehiculo.id, motivo: form.motivo,
      estado: form.estado, mecanico: form.mecanico, taller: form.taller
    })

    setMensaje('✓ Cliente registrado correctamente')
    setForm({ nombre: '', telefono: '', email: '', dni: '', marca_modelo: '', patente: '', anio: '', kilometraje: '', motivo: '', estado: 'Diagnóstico', mecanico: '', taller: 'Malvinas 2084' })
    cargarDatos()
    setTimeout(() => { setMensaje(''); setSeccion('clientes') }, 1500)
  }

  async function registrarSalida() {
    await supabase.from('trabajos').update({
      estado: 'Salio',
      fecha_salida: new Date().toISOString(),
      observacion_final: observacionFinal
    }).eq('id', modalSalida.id)
    setModalSalida(null)
    setObservacionFinal('')
    if (clienteDetalle?.id === modalSalida.id) {
      setSeccion('dashboard')
      setClienteDetalle(null)
    }
    cargarDatos()
  }

  async function borrarCliente(trabajo) {
    if (!confirm(`¿Borrar a ${trabajo.vehiculos?.clientes?.nombre}? Esta acción no se puede deshacer.`)) return
    await supabase.from('trabajos').delete().eq('id', trabajo.id)
    await supabase.from('vehiculos').delete().eq('id', trabajo.vehiculos?.id)
    await supabase.from('clientes').delete().eq('id', trabajo.vehiculos?.clientes?.id)
    setSeccion('dashboard')
    setClienteDetalle(null)
    cargarDatos()
  }

  async function guardarEdicion() {
    await supabase.from('clientes').update({
      nombre: formEditar.nombre,
      telefono: formEditar.telefono,
      email: formEditar.email,
      dni: formEditar.dni
    }).eq('id', formEditar.cliente_id)

    await supabase.from('vehiculos').update({
      marca_modelo: formEditar.marca_modelo,
      patente: formEditar.patente,
      anio: formEditar.anio,
      kilometraje: formEditar.kilometraje
    }).eq('id', formEditar.vehiculo_id)

    await supabase.from('trabajos').update({
      motivo: formEditar.motivo,
      estado: formEditar.estado,
      mecanico: formEditar.mecanico,
      taller: formEditar.taller
    }).eq('id', formEditar.trabajo_id)

    setModalEditar(null)
    cargarDatos()
  }

  async function subirFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setSubiendo(true)
    const nombre = `${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from('fotos-vehiculos').upload(nombre, file)
    if (!error) {
      const { data: urlData } = supabase.storage.from('fotos-vehiculos').getPublicUrl(nombre)
      await supabase.from('fotos').insert({ trabajo_id: clienteDetalle.id, url: urlData.publicUrl })
      cargarFotos(clienteDetalle.id)
    }
    setSubiendo(false)
  }

  async function borrarFoto(foto) {
    await supabase.from('fotos').delete().eq('id', foto.id)
    cargarFotos(clienteDetalle.id)
  }

  function verDetalle(trabajo) {
    setClienteDetalle(trabajo)
    setSeccion('detalle')
    cargarFotos(trabajo.id)
  }

  function abrirEditar(trabajo) {
    setFormEditar({
      trabajo_id: trabajo.id,
      cliente_id: trabajo.vehiculos?.clientes?.id,
      vehiculo_id: trabajo.vehiculos?.id,
      nombre: trabajo.vehiculos?.clientes?.nombre,
      telefono: trabajo.vehiculos?.clientes?.telefono,
      email: trabajo.vehiculos?.clientes?.email,
      dni: trabajo.vehiculos?.clientes?.dni,
      marca_modelo: trabajo.vehiculos?.marca_modelo,
      patente: trabajo.vehiculos?.patente,
      anio: trabajo.vehiculos?.anio,
      kilometraje: trabajo.vehiculos?.kilometraje,
      motivo: trabajo.motivo,
      estado: trabajo.estado,
      mecanico: trabajo.mecanico,
      taller: trabajo.taller,
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

  const stats = {
    total: clientes.length,
    enTaller: trabajos.filter(t => t.estado !== 'Salio').length,
    listos: trabajos.filter(t => t.estado === 'Listo').length,
    diagnostico: trabajos.filter(t => t.estado === 'Diagnóstico').length,
  }

  return (
    <div className={styles.app}>

      {/* MODAL SALIDA */}
      {modalSalida && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>🚗 Registrar salida</div>
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
      {modalEditar && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{width:'520px',maxHeight:'80vh',overflowY:'auto'}}>
            <div className={styles.modalTitle}>✏️ Editar cliente</div>
            <div style={{marginTop:'1rem'}}>
              <div className={styles.cardTitle}>DATOS DEL CLIENTE</div>
              <div className={styles.formGrid} style={{marginBottom:'1rem'}}>
                <div className={styles.formGroup}><label>Nombre</label><input value={formEditar.nombre||''} onChange={e => setFormEditar({...formEditar, nombre: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Teléfono</label><input value={formEditar.telefono||''} onChange={e => setFormEditar({...formEditar, telefono: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Email</label><input value={formEditar.email||''} onChange={e => setFormEditar({...formEditar, email: e.target.value})}/></div>
                <div className={styles.formGroup}><label>DNI</label><input value={formEditar.dni||''} onChange={e => setFormEditar({...formEditar, dni: e.target.value})}/></div>
              </div>
              <div className={styles.cardTitle}>DATOS DEL VEHÍCULO</div>
              <div className={styles.formGrid} style={{marginBottom:'1rem'}}>
                <div className={styles.formGroup}><label>Modelo</label><input value={formEditar.marca_modelo||''} onChange={e => setFormEditar({...formEditar, marca_modelo: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Patente</label><input value={formEditar.patente||''} onChange={e => setFormEditar({...formEditar, patente: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Año</label><input value={formEditar.anio||''} onChange={e => setFormEditar({...formEditar, anio: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Km</label><input value={formEditar.kilometraje||''} onChange={e => setFormEditar({...formEditar, kilometraje: e.target.value})}/></div>
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

      <div className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logoMain}>D<span className={styles.logoI}>I</span> FIORE</div>
          <div className={styles.logoLine}></div>
          <div className={styles.logoSub}>Performance</div>
        </div>
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'clientes', label: 'Clientes' },
          { id: 'nuevo', label: 'Nuevo cliente' },
        ].map(item => (
          <button key={item.id} className={`${styles.navItem} ${seccion === item.id ? styles.navActive : ''}`} onClick={() => setSeccion(item.id)}>
            {item.label}
          </button>
        ))}
        <div className={styles.navBottom}>
          <div className={styles.navTaller}>Difiore Performance · MdP</div>
        </div>
      </div>

      <div className={styles.main}>

        {seccion === 'dashboard' && (
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>Dashboard</h1>
              <button className={styles.btnPrimary} onClick={cargarDatos}>↻ Actualizar</button>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.stats}>
              <div className={styles.stat}><div className={styles.statN}>{stats.total}</div><div className={styles.statL}>Clientes</div></div>
              <div className={styles.stat}><div className={styles.statN}>{stats.enTaller}</div><div className={styles.statL}>En taller</div></div>
              <div className={styles.stat}><div className={styles.statN}>{stats.listos}</div><div className={styles.statL}>Listos</div></div>
              <div className={styles.stat}><div className={styles.statN}>{stats.diagnostico}</div><div className={styles.statL}>Diagnóstico</div></div>
            </div>
            <div className={styles.tblWrap}>
              {loading ? <p className={styles.loading}>Cargando...</p> : (
                <table className={styles.table}>
                  <thead><tr><th>Vehículo</th><th>Cliente</th><th>Trabajo</th><th>Estado</th><th>Mecánico</th><th>Taller</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {trabajos.map(t => (
                      <tr key={t.id}>
                        <td onClick={() => verDetalle(t)}><b>{t.vehiculos?.marca_modelo}</b></td>
                        <td onClick={() => verDetalle(t)}>{t.vehiculos?.clientes?.nombre}</td>
                        <td onClick={() => verDetalle(t)}>{t.motivo?.substring(0,35)}{t.motivo?.length > 35 ? '...' : ''}</td>
                        <td onClick={() => verDetalle(t)}><span className={badgeClass(t.estado)}>{t.estado}</span></td>
                        <td onClick={() => verDetalle(t)}>{t.mecanico || '—'}</td>
                        <td onClick={() => verDetalle(t)}>{t.taller}</td>
                        <td style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                          {t.estado !== 'Salio' && (
                            <button className={styles.btnDangerSolid} style={{fontSize:'11px',padding:'4px 10px'}} onClick={() => setModalSalida(t)}>Salida</button>
                          )}
                          <button className={styles.btnEdit} onClick={() => abrirEditar(t)}>✏️</button>
                          <button className={styles.btnDelete} onClick={() => borrarCliente(t)}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {seccion === 'clientes' && (
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>Clientes</h1>
              <button className={styles.btnPrimary} onClick={() => setSeccion('nuevo')}>+ Nuevo cliente</button>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.tblWrap}>
              {loading ? <p className={styles.loading}>Cargando...</p> : (
                <table className={styles.table}>
                  <thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th><th>DNI</th></tr></thead>
                  <tbody>
                    {clientes.map(c => (
                      <tr key={c.id}>
                        <td><b>{c.nombre}</b></td>
                        <td>{c.telefono}</td>
                        <td>{c.email}</td>
                        <td>{c.dni}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {seccion === 'nuevo' && (
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>Nuevo cliente</h1>
              <button className={styles.btn} onClick={() => setSeccion('clientes')}>Cancelar</button>
            </div>
            <div className={styles.divider}></div>
            {mensaje && <div className={styles.mensaje}>{mensaje}</div>}
            <form onSubmit={guardarCliente}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>DATOS DEL CLIENTE</div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}><label>Nombre y apellido *</label><input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Juan García"/></div>
                  <div className={styles.formGroup}><label>Teléfono</label><input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="223 000-0000"/></div>
                  <div className={styles.formGroup}><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="juan@email.com"/></div>
                  <div className={styles.formGroup}><label>DNI</label><input value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} placeholder="00.000.000"/></div>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardTitle}>DATOS DEL VEHÍCULO</div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}><label>Marca y modelo *</label><input required value={form.marca_modelo} onChange={e => setForm({...form, marca_modelo: e.target.value})} placeholder="VW Amarok V6"/></div>
                  <div className={styles.formGroup}><label>Patente</label><input value={form.patente} onChange={e => setForm({...form, patente: e.target.value})} placeholder="AB 123 CD"/></div>
                  <div className={styles.formGroup}><label>Año</label><input value={form.anio} onChange={e => setForm({...form, anio: e.target.value})} placeholder="2022"/></div>
                  <div className={styles.formGroup}><label>Kilometraje</label><input value={form.kilometraje} onChange={e => setForm({...form, kilometraje: e.target.value})} placeholder="85.000 km"/></div>
                  <div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Motivo de ingreso</label><textarea value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} placeholder="Describí el problema o trabajo a realizar..."/></div>
                  <div className={styles.formGroup}><label>Mecánico</label><input value={form.mecanico} onChange={e => setForm({...form, mecanico: e.target.value})} placeholder="Agus D."/></div>
                  <div className={styles.formGroup}><label>Estado</label>
                    <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                      <option>Diagnóstico</option><option>En proceso</option><option>En espera</option><option>Desarmando</option><option>Listo</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}><label>Taller</label>
                    <select value={form.taller} onChange={e => setForm({...form, taller: e.target.value})}>
                      <option>Malvinas 2084</option><option>Malvinas 3906</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.btn} onClick={() => setSeccion('clientes')}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary}>Registrar cliente</button>
              </div>
            </form>
          </div>
        )}

        {seccion === 'detalle' && clienteDetalle && (
          <div>
            <div className={styles.topBar}>
              <button className={styles.btn} onClick={() => setSeccion('dashboard')}>← Volver</button>
              <div style={{display:'flex',gap:'8px'}}>
                <button className={styles.btnPrimary} onClick={() => abrirEditar(clienteDetalle)}>✏️ Editar</button>
                {clienteDetalle.estado !== 'Salio' && (
                  <button className={styles.btnDangerSolid} onClick={() => setModalSalida(clienteDetalle)}>🚗 Registrar salida</button>
                )}
                <button className={styles.btnDanger} onClick={() => borrarCliente(clienteDetalle)}>🗑️ Borrar</button>
              </div>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.detailHeader}>
              <div className={styles.detailAvatar}>{clienteDetalle.vehiculos?.clientes?.nombre?.charAt(0)}</div>
              <div style={{flex:1}}>
                <div className={styles.detailNombre}>{clienteDetalle.vehiculos?.clientes?.nombre}</div>
                <div className={styles.detailSub}>{clienteDetalle.vehiculos?.clientes?.telefono}</div>
              </div>
              <span className={badgeClass(clienteDetalle.estado)}>{clienteDetalle.estado}</span>
            </div>
            <div className={styles.detGrid}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>VEHÍCULO</div>
                {[['Modelo', clienteDetalle.vehiculos?.marca_modelo],['Patente', clienteDetalle.vehiculos?.patente],['Año', clienteDetalle.vehiculos?.anio],['Km', clienteDetalle.vehiculos?.kilometraje],['Mecánico', clienteDetalle.mecanico],['Taller', clienteDetalle.taller]].map(([k,v]) => (
                  <div key={k} className={styles.detRow}><span className={styles.detLabel}>{k}</span><span className={styles.detVal}>{v || '—'}</span></div>
                ))}
              </div>
              <div className={styles.card}>
                <div className={styles.cardTitle}>TRABAJO</div>
                <p className={styles.detText}>{clienteDetalle.motivo || 'Sin descripción'}</p>
                <div className={styles.detFecha}>Ingresó: {new Date(clienteDetalle.fecha_ingreso).toLocaleDateString('es-AR')}</div>
                {clienteDetalle.fecha_salida && <div className={styles.detFecha}>Salió: {new Date(clienteDetalle.fecha_salida).toLocaleDateString('es-AR')}</div>}
                {clienteDetalle.observacion_final && <div className={styles.detText} style={{marginTop:'8px'}}><b>Obs. final:</b> {clienteDetalle.observacion_final}</div>}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>FOTOS DEL VEHÍCULO</div>
              <input type="file" accept="image/*" ref={fileRef} style={{display:'none'}} onChange={subirFoto}/>
              <button className={styles.btnPrimary} onClick={() => fileRef.current.click()} style={{marginBottom:'1rem'}}>
                {subiendo ? 'Subiendo...' : '+ Agregar foto'}
              </button>
              <div className={styles.fotoGrid}>
                {fotos.map(f => (
                  <div key={f.id} className={styles.fotoItem}>
                    <img src={f.url} alt="foto vehiculo" className={styles.fotoImg}/>
                    <button className={styles.fotoBorrar} onClick={() => borrarFoto(f)}>✕</button>
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
