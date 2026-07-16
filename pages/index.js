import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getMarca } from '../lib/marcas'
import styles from '../styles/App.module.css'

export default function Home() {
  const [seccion, setSeccion] = useState('dashboard')
  const [tallerVista, setTallerVista] = useState(null)
  const [clientes, setClientes] = useState([])
  const [trabajos, setTrabajos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [form, setForm] = useState({
    nombre: '', telefono: '', email: '',
    marca_modelo: '', patente: '', anio: '', kilometraje: '', color: '',
    motivo: '', estado: 'Diagnóstico', mecanico: '', taller: 'Malvinas 2084',
    llego_en_grua: false, fecha_ingreso_manual: ''
  })
  const [fotoNuevo, setFotoNuevo] = useState([])
  const [clienteDetalle, setClienteDetalle] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [modalSalida, setModalSalida] = useState(null)
  const [observacionFinal, setObservacionFinal] = useState('')
  const [modalEditar, setModalEditar] = useState(null)
  const [formEditar, setFormEditar] = useState({})
  const [fotos, setFotos] = useState([])
  const [fotosTrabajo, setFotosTrabajo] = useState({})
  const [historial, setHistorial] = useState([])
  const [repuestos, setRepuestos] = useState([])
  const [modalActualizar, setModalActualizar] = useState(null)
  const [modalRepuesto, setModalRepuesto] = useState(null)
  const [modalFotos, setModalFotos] = useState(null)
  const [modalFotosData, setModalFotosData] = useState([])
  const [formRepuesto, setFormRepuesto] = useState({ nombre: '', valor: '', lugar: '', fecha: new Date().toISOString().split('T')[0] })
  const [formActualizar, setFormActualizar] = useState({ tipo: 'estado', descripcion: '', taller_nuevo: 'Malvinas 3906' })
  const [subiendo, setSubiendo] = useState(false)
  const fileRef = useRef()
  const fileNuevoRef = useRef()
  const fileFotosRef = useRef()

  useEffect(() => { cargarDatos() }, [])

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
    return data || []
  }

  async function cargarFotosModal(trabajoId) {
    const { data, error } = await supabase.from('fotos').select('*').eq('trabajo_id', trabajoId).order('created_at', { ascending: false })
    if (!error) setModalFotosData(data || [])
    return data || []
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
    if (uploadError) { console.error('Upload error:', uploadError); return null }
    const { data } = supabase.storage.from('fotos-vehiculos').getPublicUrl(nombre)
    return data.publicUrl
  }

  async function guardarCliente(e) {
    e.preventDefault()
    const { data: cliente, error: errCliente } = await supabase
      .from('clientes').insert({ nombre: form.nombre, telefono: form.telefono, email: form.email })
      .select().single()
    if (errCliente) { setMensaje('Error al guardar cliente'); return }

    const { data: vehiculo, error: errVehiculo } = await supabase
      .from('vehiculos').insert({ cliente_id: cliente.id, marca_modelo: form.marca_modelo, patente: form.patente, anio: form.anio, kilometraje: form.kilometraje, color: form.color })
      .select().single()
    if (errVehiculo) { setMensaje('Error al guardar vehículo'); return }

    const fechaIngreso = form.fecha_ingreso_manual ? new Date(form.fecha_ingreso_manual).toISOString() : new Date().toISOString()

    const { data: trabajo } = await supabase.from('trabajos').insert({
      vehiculo_id: vehiculo.id, motivo: form.motivo,
      estado: form.estado, mecanico: form.mecanico, taller: form.taller,
      llego_en_grua: form.llego_en_grua, fecha_ingreso: fechaIngreso
    }).select().single()

    if (fotoNuevo.length > 0 && trabajo) {
      for (const f of fotoNuevo) {
        const url = await subirFotoStorage(f, trabajo.id)
        if (url) await supabase.from('fotos').insert({ trabajo_id: trabajo.id, url })
      }
    }

    await agregarHistorial(trabajo.id, 'ingreso', `Ingresó al taller ${form.taller} ${form.llego_en_grua ? '(en grúa)' : '(andando)'}. Motivo: ${form.motivo}`)

    setMensaje('✓ Cliente registrado correctamente')
    setForm({ nombre: '', telefono: '', email: '', marca_modelo: '', patente: '', anio: '', kilometraje: '', color: '', motivo: '', estado: 'Diagnóstico', mecanico: '', taller: 'Malvinas 2084', llego_en_grua: false, fecha_ingreso_manual: '' })
    setFotoNuevo([])
    cargarDatos()
    setTimeout(() => { setMensaje(''); setSeccion('clientes') }, 1500)
  }

  async function registrarSalida() {
    await supabase.from('trabajos').update({
      estado: 'Salio', fecha_salida: new Date().toISOString(), observacion_final: observacionFinal
    }).eq('id', modalSalida.id)
    await agregarHistorial(modalSalida.id, 'salida', `Vehículo retirado. ${observacionFinal ? 'Obs: ' + observacionFinal : ''}`)
    setModalSalida(null)
    setObservacionFinal('')
    if (clienteDetalle?.id === modalSalida.id) { setSeccion('clientes'); setClienteDetalle(null) }
    cargarDatos()
  }

  async function borrarCliente(trabajo) {
    if (!confirm(`¿Borrar a ${trabajo.vehiculos?.clientes?.nombre}? Esta acción no se puede deshacer.`)) return
    await supabase.from('historial').delete().eq('trabajo_id', trabajo.id)
    await supabase.from('actualizaciones').delete().eq('trabajo_id', trabajo.id)
    await supabase.from('repuestos').delete().eq('trabajo_id', trabajo.id)
    await supabase.from('fotos').delete().eq('trabajo_id', trabajo.id)
    await supabase.from('trabajos').delete().eq('id', trabajo.id)
    await supabase.from('vehiculos').delete().eq('id', trabajo.vehiculos?.id)
    await supabase.from('clientes').delete().eq('id', trabajo.vehiculos?.clientes?.id)
    setSeccion('clientes')
    setClienteDetalle(null)
    cargarDatos()
  }

  async function guardarEdicion() {
    const tallerAnterior = formEditar.taller_anterior
    const tallerNuevo = formEditar.taller
    await supabase.from('clientes').update({ nombre: formEditar.nombre, telefono: formEditar.telefono, email: formEditar.email }).eq('id', formEditar.cliente_id)
    await supabase.from('vehiculos').update({ marca_modelo: formEditar.marca_modelo, patente: formEditar.patente, anio: formEditar.anio, kilometraje: formEditar.kilometraje, color: formEditar.color }).eq('id', formEditar.vehiculo_id)
    await supabase.from('trabajos').update({ motivo: formEditar.motivo, estado: formEditar.estado, mecanico: formEditar.mecanico, taller: formEditar.taller }).eq('id', formEditar.trabajo_id)
    if (tallerAnterior !== tallerNuevo) {
      await agregarHistorial(formEditar.trabajo_id, 'movimiento', `Movido de ${tallerAnterior} a ${tallerNuevo}`)
    }
    setModalEditar(null)
    cargarDatos()
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
    } else if (tipo === 'prueba') {
      descripcion = `En prueba. ${descripcion}`
    }
    await supabase.from('actualizaciones').insert({ trabajo_id: t.id, tipo, descripcion })
    setModalActualizar(null)
    setFormActualizar({ tipo: 'estado', descripcion: '', taller_nuevo: 'Malvinas 3906' })
    cargarDatos()
    if (clienteDetalle?.id === t.id) {
      await cargarHistorial(t.id)
      await cargarRepuestos(t.id)
    }
  }

  async function guardarRepuesto() {
    const trabajoId = modalRepuesto.id
    await supabase.from('repuestos').insert({
      trabajo_id: trabajoId,
      nombre: formRepuesto.nombre,
      valor: parseFloat(formRepuesto.valor) || 0,
      lugar: formRepuesto.lugar,
      fecha: formRepuesto.fecha
    })
    setModalRepuesto(null)
    setFormRepuesto({ nombre: '', valor: '', lugar: '', fecha: new Date().toISOString().split('T')[0] })
    await cargarRepuestos(trabajoId)
    if (clienteDetalle?.id === trabajoId) {
      await cargarRepuestos(trabajoId)
    }
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
    setSubiendo(false)
    e.target.value = ''
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
    setSubiendo(false)
    e.target.value = ''
  }

  async function borrarFoto(foto) {
    await supabase.from('fotos').delete().eq('id', foto.id)
    await cargarFotos(clienteDetalle.id)
  }

  function verDetalle(trabajo) {
    setClienteDetalle(trabajo)
    setSeccion('detalle')
    cargarFotos(trabajo.id)
    cargarHistorial(trabajo.id)
    cargarRepuestos(trabajo.id)
  }

  function abrirEditar(trabajo) {
    setFormEditar({
      trabajo_id: trabajo.id, cliente_id: trabajo.vehiculos?.clientes?.id, vehiculo_id: trabajo.vehiculos?.id,
      nombre: trabajo.vehiculos?.clientes?.nombre, telefono: trabajo.vehiculos?.clientes?.telefono, email: trabajo.vehiculos?.clientes?.email,
      marca_modelo: trabajo.vehiculos?.marca_modelo, patente: trabajo.vehiculos?.patente, anio: trabajo.vehiculos?.anio, kilometraje: trabajo.vehiculos?.kilometraje, color: trabajo.vehiculos?.color,
      motivo: trabajo.motivo, estado: trabajo.estado, mecanico: trabajo.mecanico, taller: trabajo.taller, taller_anterior: trabajo.taller,
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

  const trabajosActivos = trabajos.filter(t => t.estado !== 'Salio')

  const conteoMarcas = trabajosActivos.reduce((acc, t) => {
    const marca = getMarca(t.vehiculos?.marca_modelo)
    acc[marca] = (acc[marca] || 0) + 1
    return acc
  }, {})

  const trabajosFiltrados = trabajos
    .filter(t => {
      const q = busqueda.toLowerCase()
      return (
        t.vehiculos?.clientes?.nombre?.toLowerCase().includes(q) ||
        t.vehiculos?.patente?.toLowerCase().includes(q) ||
        t.vehiculos?.marca_modelo?.toLowerCase().includes(q)
      )
    })
    .sort((b, a) => new Date(b.fecha_ingreso) - new Date(a.fecha_ingreso))

  const totalFiltrados = trabajosFiltrados.length

  const stats = {
    total: clientes.length,
    enTaller: trabajosActivos.length,
    listos: trabajos.filter(t => t.estado === 'Listo').length,
    salidos: trabajos.filter(t => t.estado === 'Salio').length,
  }

  const tipoHistorial = { ingreso: '🟢', salida: '🔴', movimiento: '🔵', reingreso: '🟡', estado: '⚪', prueba: '🟠' }
  const trabajosTaller = tallerVista ? trabajos.filter(t => t.taller === tallerVista && t.estado !== 'Salio').sort((a,b) => new Date(a.fecha_ingreso) - new Date(b.fecha_ingreso)) : []

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
                <div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Email</label><input value={formEditar.email||''} onChange={e => setFormEditar({...formEditar, email: e.target.value})}/></div>
              </div>
              <div className={styles.cardTitle}>DATOS DEL VEHÍCULO</div>
              <div className={styles.formGrid} style={{marginBottom:'1rem'}}>
                <div className={styles.formGroup}><label>Modelo</label><input value={formEditar.marca_modelo||''} onChange={e => setFormEditar({...formEditar, marca_modelo: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Patente</label><input value={formEditar.patente||''} onChange={e => setFormEditar({...formEditar, patente: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Año</label><input value={formEditar.anio||''} onChange={e => setFormEditar({...formEditar, anio: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Km</label><input value={formEditar.kilometraje||''} onChange={e => setFormEditar({...formEditar, kilometraje: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Color</label><input value={formEditar.color||''} onChange={e => setFormEditar({...formEditar, color: e.target.value})} placeholder="Ej: Blanco, Negro..."/></div>
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
            <div className={styles.modalTitle}>🟢 Actualización</div>
            <div className={styles.modalSub}><b>{modalActualizar.vehiculos?.marca_modelo}</b> — {modalActualizar.vehiculos?.clientes?.nombre}</div>
            <div style={{marginTop:'1rem',display:'flex',flexDirection:'column',gap:'10px'}}>
              <div className={styles.formGroup}>
                <label>Tipo de actualización</label>
                <select value={formActualizar.tipo} onChange={e => setFormActualizar({...formActualizar, tipo: e.target.value})}>
                  <option value="estado">📋 Actualización de estado</option>
                  <option value="prueba">🔧 En prueba</option>
                  <option value="taller">🔄 Cambio de taller</option>
                </select>
              </div>
              {formActualizar.tipo === 'taller' && (
                <div className={styles.formGroup}>
                  <label>Mover a</label>
                  <select value={formActualizar.taller_nuevo} onChange={e => setFormActualizar({...formActualizar, taller_nuevo: e.target.value})}>
                    <option>Malvinas 2084</option><option>Malvinas 3906</option>
                  </select>
                </div>
              )}
              <div className={styles.formGroup}>
                <label>Descripción</label>
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
      {modalRepuesto && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>🔩 Agregar repuesto</div>
            <div className={styles.modalSub}><b>{modalRepuesto.vehiculos?.marca_modelo}</b> — {modalRepuesto.vehiculos?.clientes?.nombre}</div>
            <div style={{marginTop:'1rem',display:'flex',flexDirection:'column',gap:'10px'}}>
              <div className={styles.formGroup}><label>Repuesto *</label><input value={formRepuesto.nombre} onChange={e => setFormRepuesto({...formRepuesto, nombre: e.target.value})} placeholder="Ej: Filtro de aceite, correa..."/></div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}><label>Valor ($)</label><input type="number" value={formRepuesto.valor} onChange={e => setFormRepuesto({...formRepuesto, valor: e.target.value})} placeholder="0"/></div>
                <div className={styles.formGroup}><label>Fecha</label><input type="date" value={formRepuesto.fecha} onChange={e => setFormRepuesto({...formRepuesto, fecha: e.target.value})}/></div>
              </div>
              <div className={styles.formGroup}><label>Lugar de compra</label><input value={formRepuesto.lugar} onChange={e => setFormRepuesto({...formRepuesto, lugar: e.target.value})} placeholder="Ej: Casa del repuesto, MercadoLibre..."/></div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btn} onClick={() => setModalRepuesto(null)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={guardarRepuesto}>Agregar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FOTOS */}
      {modalFotos && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{width:'560px',maxHeight:'85vh',overflowY:'auto'}}>
            <div className={styles.modalTitle}>📷 Fotos del vehículo</div>
            <div className={styles.modalSub}><b>{modalFotos.vehiculos?.marca_modelo}</b> — {modalFotos.vehiculos?.clientes?.nombre}</div>
            <input type="file" accept="image/*" multiple ref={fileFotosRef} style={{display:'none'}} onChange={subirFotosModal}/>
            <button className={styles.btnPrimary} style={{marginTop:'1rem',marginBottom:'1rem'}} onClick={() => fileFotosRef.current.click()}>
              {subiendo ? 'Subiendo...' : '+ Agregar fotos'}
            </button>
            <div className={styles.fotoGrid}>
              {modalFotosData.map(f => (
                <div key={f.id} className={styles.fotoItem}>
                  <img src={f.url} alt="foto" className={styles.fotoImg}/>
                  <button className={styles.fotoBorrar} onClick={() => borrarFotoModal(f)}>✕</button>
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

      <div className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logoMain}>D<span className={styles.logoI}>I</span> FIORE</div>
          <div className={styles.logoLine}></div>
          <div className={styles.logoSub}>Performance</div>
        </div>
        {[
          { id: 'dashboard', label: '▦ Dashboard' },
          { id: 'clientes', label: '👥 Clientes' },
          { id: 'nuevo', label: '＋ Nuevo cliente' },
        ].map(item => (
          <button key={item.id} className={`${styles.navItem} ${seccion === item.id ? styles.navActive : ''}`} onClick={() => { setSeccion(item.id); setTallerVista(null) }}>
            {item.label}
          </button>
        ))}
        <div className={styles.navBottom}>
          <div className={styles.navTaller}>Difiore Performance · MdP</div>
        </div>
      </div>

      <div className={styles.main}>

        {/* DASHBOARD */}
        {seccion === 'dashboard' && !tallerVista && (
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>Dashboard</h1>
              <button className={styles.btnPrimary} onClick={cargarDatos}>↻ Actualizar</button>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.stats}>
              <div className={styles.stat}><div className={styles.statN}>{stats.total}</div><div className={styles.statL}>Clientes totales</div></div>
              <div className={styles.stat}><div className={styles.statN}>{stats.enTaller}</div><div className={styles.statL}>En taller</div></div>
              <div className={styles.stat}><div className={styles.statN}>{stats.listos}</div><div className={styles.statL}>Listos</div></div>
              <div className={styles.stat}><div className={styles.statN}>{stats.salidos}</div><div className={styles.statL}>Salidos</div></div>
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
                          <div key={estado} style={{display:'flex',justifyContent:'space-between',fontSize:'12px',padding:'3px 0',borderBottom:'1px solid #2D3748'}}>
                            <span style={{color:'#64748B'}}>{estado}</span>
                            <span style={{color:'#F1F5F9',fontWeight:'600'}}>{n}</span>
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
              <div className={styles.cardTitle}>🚗 MARCAS EN TALLER</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:'8px'}}>
                {Object.entries(conteoMarcas).sort((a,b) => b[1]-a[1]).map(([marca, n]) => (
                  <div key={marca} style={{background:'#212840',borderRadius:'6px',padding:'10px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:'13px',color:'#94A3B8'}}>{marca}</span>
                    <span style={{fontSize:'18px',fontWeight:'700',color:'#F1F5F9'}}>{n}</span>
                  </div>
                ))}
                {Object.keys(conteoMarcas).length === 0 && <div style={{color:'#64748B',fontSize:'13px'}}>Sin autos en taller</div>}
              </div>
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
                <thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Color</th><th>Estado</th><th>Mecánico</th><th>Ingreso</th><th>Acciones</th></tr></thead>
                <tbody>
                  {trabajosTaller.map((t,i) => (
                    <tr key={t.id}>
                      <td style={{color:'#64748B'}}>{i+1}</td>
                      <td onClick={() => verDetalle(t)}><b>{t.vehiculos?.marca_modelo}</b></td>
                      <td onClick={() => verDetalle(t)}>{t.vehiculos?.clientes?.nombre}</td>
                      <td onClick={() => verDetalle(t)}>{t.vehiculos?.patente}</td>
                      <td onClick={() => verDetalle(t)} style={{color:'#94A3B8'}}>{t.vehiculos?.color || '—'}</td>
                      <td onClick={() => verDetalle(t)}><span className={badgeClass(t.estado)}>{t.estado}</span></td>
                      <td onClick={() => verDetalle(t)}>{t.mecanico || '—'}</td>
                      <td onClick={() => verDetalle(t)} style={{fontSize:'12px',color:'#64748B'}}>{new Date(t.fecha_ingreso).toLocaleDateString('es-AR')}</td>
                      <td style={{display:'flex',gap:'5px',cursor:'default'}}>
                        <button className={styles.btnSuccess} style={{fontSize:'11px',padding:'4px 8px'}} onClick={() => { setModalActualizar(t); setFormActualizar({tipo:'estado',descripcion:'',taller_nuevo:'Malvinas 3906'}) }}>✓</button>
                        {t.estado !== 'Salio' && <button className={styles.btnDangerSolid} style={{fontSize:'11px',padding:'4px 8px'}} onClick={() => setModalSalida(t)}>Salida</button>}
                        <button className={styles.btnEdit} onClick={() => abrirEditar(t)}>✏️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CLIENTES */}
        {seccion === 'clientes' && (
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>Clientes</h1>
              <button className={styles.btnPrimary} onClick={() => setSeccion('nuevo')}>+ Nuevo cliente</button>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.searchBar}>
              <input type="text" placeholder="Buscar por nombre, patente o vehículo..." value={busqueda} onChange={e => setBusqueda(e.target.value)}/>
            </div>
            <div className={styles.tblWrap}>
              {loading ? <p className={styles.loading}>Cargando...</p> : (
                <table className={styles.table}>
                  <thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Color</th><th>Estado</th><th>Taller</th><th>Ingreso</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {trabajosFiltrados.map((t,i) => (
                      <tr key={t.id}>
                        <td style={{color:'#64748B',width:'40px'}}>{totalFiltrados - i}</td>
                        <td onClick={() => verDetalle(t)}><b>{t.vehiculos?.marca_modelo}</b></td>
                        <td onClick={() => verDetalle(t)}>{t.vehiculos?.clientes?.nombre}</td>
                        <td onClick={() => verDetalle(t)}>{t.vehiculos?.patente}</td>
                        <td onClick={() => verDetalle(t)} style={{color:'#94A3B8'}}>{t.vehiculos?.color || '—'}</td>
                        <td onClick={() => verDetalle(t)}><span className={badgeClass(t.estado)}>{t.estado}</span></td>
                        <td onClick={() => verDetalle(t)}>{t.taller}</td>
                        <td onClick={() => verDetalle(t)} style={{fontSize:'12px',color:'#64748B'}}>{new Date(t.fecha_ingreso).toLocaleDateString('es-AR')}</td>
                        <td style={{display:'flex',gap:'5px',cursor:'default'}}>
                          <button className={styles.btnSuccess} style={{fontSize:'11px',padding:'4px 8px'}} onClick={() => { setModalActualizar(t); setFormActualizar({tipo:'estado',descripcion:'',taller_nuevo:'Malvinas 3906'}) }}>Actualizar</button>
                          <button className={styles.btnRepuesto} style={{fontSize:'11px',padding:'4px 8px'}} onClick={() => setModalRepuesto(t)}>🔩</button>
                          <button className={styles.btnEdit} style={{fontSize:'11px',padding:'4px 8px'}} onClick={async () => { await cargarFotosModal(t.id); setModalFotos(t) }}>📷</button>
                          {t.estado !== 'Salio' && <button className={styles.btnDangerSolid} style={{fontSize:'11px',padding:'4px 8px'}} onClick={() => setModalSalida(t)}>Salida</button>}
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

        {/* NUEVO CLIENTE */}
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
                  <div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="juan@email.com"/></div>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardTitle}>DATOS DEL VEHÍCULO</div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}><label>Marca y modelo *</label><input required value={form.marca_modelo} onChange={e => setForm({...form, marca_modelo: e.target.value})} placeholder="VW Amarok V6"/></div>
                  <div className={styles.formGroup}><label>Patente</label><input value={form.patente} onChange={e => setForm({...form, patente: e.target.value})} placeholder="AB 123 CD"/></div>
                  <div className={styles.formGroup}><label>Año</label><input value={form.anio} onChange={e => setForm({...form, anio: e.target.value})} placeholder="2022"/></div>
                  <div className={styles.formGroup}><label>Kilometraje</label><input value={form.kilometraje} onChange={e => setForm({...form, kilometraje: e.target.value})} placeholder="85.000 km"/></div>
                  <div className={styles.formGroup}><label>Color</label><input value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="Ej: Blanco, Negro, Gris..."/></div>
                  <div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Motivo de ingreso</label><textarea value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} placeholder="Describí el problema o trabajo a realizar..."/></div>
                  <div className={styles.formGroup}><label>Fecha de ingreso</label><input type="datetime-local" value={form.fecha_ingreso_manual} onChange={e => setForm({...form, fecha_ingreso_manual: e.target.value})}/></div>
                  <div className={styles.formGroup}><label>Llegó en</label>
                    <select value={form.llego_en_grua ? 'grua' : 'andando'} onChange={e => setForm({...form, llego_en_grua: e.target.value === 'grua'})}>
                      <option value="andando">🚗 Andando</option>
                      <option value="grua">🚛 En grúa</option>
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
                <div className={styles.cardTitle}>📷 FOTOS DEL VEHÍCULO</div>
                <input type="file" accept="image/*" multiple ref={fileNuevoRef} style={{display:'none'}} onChange={e => setFotoNuevo(Array.from(e.target.files))}/>
                <button type="button" className={styles.btnPrimary} onClick={() => fileNuevoRef.current.click()}>
                  {fotoNuevo.length > 0 ? `✓ ${fotoNuevo.length} foto(s) seleccionada(s)` : '+ Seleccionar fotos'}
                </button>
                {fotoNuevo.length > 0 && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginTop:'10px'}}>
                    {fotoNuevo.map((f,i) => (
                      <div key={i} style={{position:'relative'}}>
                        <img src={URL.createObjectURL(f)} alt="preview" style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',borderRadius:'6px'}}/>
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

        {/* DETALLE */}
        {seccion === 'detalle' && clienteDetalle && (
          <div>
            <div className={styles.topBar}>
              <button className={styles.btn} onClick={() => setSeccion('clientes')}>← Volver</button>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                <button className={styles.btnSuccess} onClick={() => { setModalActualizar(clienteDetalle); setFormActualizar({tipo:'estado',descripcion:'',taller_nuevo:'Malvinas 3906'}) }}>🟢 Actualización</button>
                <button className={styles.btnRepuesto} onClick={() => setModalRepuesto(clienteDetalle)}>🔩 Repuesto</button>
                <button className={styles.btnPrimary} onClick={() => abrirEditar(clienteDetalle)}>✏️ Editar</button>
                {clienteDetalle.estado !== 'Salio' && <button className={styles.btnDangerSolid} onClick={() => setModalSalida(clienteDetalle)}>🚗 Salida</button>}
                <button className={styles.btnDanger} onClick={() => borrarCliente(clienteDetalle)}>🗑️ Borrar</button>
              </div>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.detailHeader}>
              <div className={styles.detailAvatar}>{clienteDetalle.vehiculos?.clientes?.nombre?.charAt(0)}</div>
              <div style={{flex:1}}>
                <div className={styles.detailNombre}>{clienteDetalle.vehiculos?.clientes?.nombre}</div>
                <div className={styles.detailSub}>{clienteDetalle.vehiculos?.clientes?.telefono} {clienteDetalle.llego_en_grua ? '· 🚛 Llegó en grúa' : '· 🚗 Llegó andando'}</div>
              </div>
              <span className={badgeClass(clienteDetalle.estado)}>{clienteDetalle.estado}</span>
            </div>
            <div className={styles.detGrid}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>VEHÍCULO</div>
                {[
                  ['Modelo', clienteDetalle.vehiculos?.marca_modelo],
                  ['Patente', clienteDetalle.vehiculos?.patente],
                  ['Color', clienteDetalle.vehiculos?.color],
                  ['Año', clienteDetalle.vehiculos?.anio],
                  ['Km', clienteDetalle.vehiculos?.kilometraje],
                  ['Mecánico', clienteDetalle.mecanico],
                  ['Taller', clienteDetalle.taller]
                ].map(([k,v]) => (
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
              <div className={styles.cardTitle}>🔩 REPUESTOS</div>
              {repuestos.length === 0 && <div style={{color:'#64748B',fontSize:'13px'}}>Sin repuestos registrados</div>}
              {repuestos.length > 0 && (
                <table className={styles.table} style={{marginTop:'8px'}}>
                  <thead><tr><th>Repuesto</th><th>Valor</th><th>Lugar</th><th>Fecha</th></tr></thead>
                  <tbody>
                    {repuestos.map(r => (
                      <tr key={r.id}>
                        <td>{r.nombre}</td>
                        <td>${Number(r.valor).toLocaleString('es-AR')}</td>
                        <td>{r.lugar || '—'}</td>
                        <td style={{fontSize:'12px',color:'#64748B'}}>{new Date(r.fecha).toLocaleDateString('es-AR')}</td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{fontWeight:'700',color:'#F1F5F9'}}>Total</td>
                      <td style={{fontWeight:'700',color:'#16A34A'}}>${repuestos.reduce((a,r) => a + Number(r.valor), 0).toLocaleString('es-AR')}</td>
                      <td colSpan="2"></td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>📋 HISTORIAL</div>
              {historial.length === 0 && <div style={{color:'#64748B',fontSize:'13px'}}>Sin historial todavía</div>}
              {historial.map(h => (
                <div key={h.id} className={styles.histItem}>
                  <span className={styles.histIcon}>{tipoHistorial[h.tipo] || '⚪'}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'13px',color:'#F1F5F9'}}>{h.descripcion}</div>
                    <div style={{fontSize:'11px',color:'#64748B',marginTop:'2px'}}>{new Date(h.fecha).toLocaleString('es-AR')}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>📷 FOTOS DEL VEHÍCULO</div>
              <input type="file" accept="image/*" multiple ref={fileRef} style={{display:'none'}} onChange={subirFoto}/>
              <button className={styles.btnPrimary} onClick={() => fileRef.current.click()} style={{marginBottom:'1rem'}}>
                {subiendo ? 'Subiendo...' : '+ Agregar fotos'}
              </button>
              <div className={styles.fotoGrid}>
                {fotos.map(f => (
                  <div key={f.id} className={styles.fotoItem}>
                    <img src={f.url} alt="foto" className={styles.fotoImg}/>
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
