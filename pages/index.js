import { useEffect, useState, useMemo, useRef } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabase';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const fmt = (n) => '$ ' + Math.round(n || 0).toLocaleString('es-AR');
const fmtSigned = (n) => (n < 0 ? '-$ ' : '$ ') + Math.abs(Math.round(n || 0)).toLocaleString('es-AR');
const fmtUsd = (n) => (n < 0 ? '-' : '') + 'U$D ' + Math.abs(Math.round(n || 0)).toLocaleString('es-AR');

const PALETA_CATEGORIAS = ['#5B7C99', '#6E8B5A', '#A67C3D', '#8A5C6E', '#5C7A6E', '#9B6B3B', '#6B5B8A', '#7A8A3B'];
function colorCategoria(nombre) {
  if (!nombre) return '#999';
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  return PALETA_CATEGORIAS[Math.abs(hash) % PALETA_CATEGORIAS.length];
}

export default function Home() {
  const [rol, setRol] = useState(undefined); // undefined = todavía no chequeamos, null = sin acceso, 'oficina' | 'gerente'
  const [claveInput, setClaveInput] = useState('');
  const [claveError, setClaveError] = useState('');

  useEffect(() => {
    const guardado = typeof window !== 'undefined' ? localStorage.getItem('caja_rol') : null;
    setRol(guardado === 'oficina' || guardado === 'gerente' ? guardado : null);
  }, []);

  function entrar() {
    if (claveInput === 'oficina2084') {
      localStorage.setItem('caja_rol', 'oficina');
      setRol('oficina');
    } else if (claveInput === 'gerente2084') {
      localStorage.setItem('caja_rol', 'gerente');
      setRol('gerente');
    } else {
      setClaveError('Contraseña incorrecta');
    }
  }

  function salir() {
    localStorage.removeItem('caja_rol');
    setRol(null);
    setClaveInput('');
  }

  const soloLectura = rol === 'gerente';

  const [categorias, setCategorias] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [usuario, setUsuario] = useState('');
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('caja_usuario') : null;
    if (saved) setUsuario(saved);
  }, []);
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    descripcion: '',
    categoria_id: '',
    tipo: 'ingreso',
    forma_pago: 'efectivo',
    monto: '',
    esNota: false,
    costoRepuesto: '',
  });

  useEffect(() => {
    cargarTodo();

    // si el otro usuario carga, edita o borra un movimiento, esto se actualiza solo (sin recargar toda la pantalla)
    const canal = supabase
      .channel('oficina-movimientos-caja')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movimientos_caja' }, () => {
        refrescarSilencioso();
      })
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, []);

  useEffect(() => {
    function onBeforeUnload(e) {
      if (formOpen && (form.descripcion.trim() || form.monto)) {
        e.preventDefault();
        e.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [formOpen, form]);

  useEffect(() => {
    function onKeyN(e) {
      const enCampo = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (!enCampo && (e.key === 'n' || e.key === 'N') && !soloLectura) {
        setFormOpen((v) => !v);
      }
    }
    window.addEventListener('keydown', onKeyN);
    return () => window.removeEventListener('keydown', onKeyN);
  }, [soloLectura]);

  async function cargarTodo() {
    setLoading(true);
    const { data: cats } = await supabase
      .from('categorias_caja')
      .select('*')
      .eq('activa', true)
      .order('nombre');
    const { data: movs } = await supabase
      .from('movimientos_caja')
      .select('*, categorias_caja(nombre)')
      .order('fecha', { ascending: true });
    setCategorias(cats || []);
    setMovimientos(movs || []);
    setLoading(false);
  }

  async function refrescarSilencioso() {
    const { data: movs } = await supabase
      .from('movimientos_caja')
      .select('*, categorias_caja(nombre)')
      .order('fecha', { ascending: true });
    if (movs) setMovimientos(movs);
  }

  // los ajustes de "Saldo inicial" cuentan para los totales, pero no se listan como movimientos
  const movimientosVisibles = movimientos.filter((m) => m.categorias_caja?.nombre !== 'Saldo inicial');

  // agrupar por mes, orden descendente para mostrar (solo lo visible)
  const grupos = useMemo(() => {
    const asc = [...movimientosVisibles].sort((a, b) => {
      const diffFecha = new Date(a.fecha) - new Date(b.fecha);
      if (diffFecha !== 0) return diffFecha;
      return new Date(a.created_at) - new Date(b.created_at);
    });
    const map = new Map();
    asc.forEach((m) => {
      const key = m.fecha.slice(0, 7); // YYYY-MM
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    });
    return [...map.entries()];
  }, [movimientosVisibles]);

  const [mesFiltro, setMesFiltro] = useState(new Date().toISOString().slice(0, 7));
  const gruposFiltrados = mesFiltro === 'todos' ? grupos : grupos.filter(([k]) => k === mesFiltro);

  const [busqueda, setBusqueda] = useState('');
  const gruposBuscados = busqueda.trim() === '' ? gruposFiltrados : gruposFiltrados
    .map(([key, filas]) => [key, filas.filter((f) =>
      (f.descripcion || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (f.categorias_caja?.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (f.usuario || '').toLowerCase().includes(busqueda.toLowerCase())
    )])
    .filter(([, filas]) => filas.length > 0);

  const [ordenCol, setOrdenCol] = useState(null); // 'monto' | 'categoria' | null (orden cronológico normal)
  const [ordenDir, setOrdenDir] = useState('asc');
  function pedirOrden(col) {
    if (ordenCol === col) setOrdenDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setOrdenCol(col); setOrdenDir('asc'); }
  }
  const gruposOrdenados = !ordenCol ? gruposBuscados : gruposBuscados.map(([key, filas]) => {
    const copia = [...filas].sort((a, b) => {
      let va, vb;
      if (ordenCol === 'monto') { va = Number(a.monto); vb = Number(b.monto); }
      else { va = a.categorias_caja?.nombre || ''; vb = b.categorias_caja?.nombre || ''; }
      if (va < vb) return ordenDir === 'asc' ? -1 : 1;
      if (va > vb) return ordenDir === 'asc' ? 1 : -1;
      return 0;
    });
    return [key, copia];
  });

  // totales de entrada/salida del mes elegido (o todo) — incluyen los ajustes de saldo inicial
  const filasDelMes = mesFiltro === 'todos' ? movimientos : movimientos.filter((m) => m.fecha.slice(0, 7) === mesFiltro);
  const vistaEntradaP = filasDelMes.filter(f => f.tipo === 'ingreso' && f.forma_pago !== 'dolares').reduce((s, f) => s + Number(f.monto), 0);
  const vistaSalidaP = filasDelMes.filter(f => f.tipo === 'egreso' && f.forma_pago !== 'dolares').reduce((s, f) => s + Number(f.monto), 0);
  const vistaEntradaU = filasDelMes.filter(f => f.tipo === 'ingreso' && f.forma_pago === 'dolares').reduce((s, f) => s + Number(f.monto), 0);
  const vistaSalidaU = filasDelMes.filter(f => f.tipo === 'egreso' && f.forma_pago === 'dolares').reduce((s, f) => s + Number(f.monto), 0);

  const hoyKey = new Date().toISOString().slice(0, 10);
  const filasHoy = movimientos.filter((m) => m.fecha.slice(0, 10) === hoyKey);
  const hoyEntradaP = filasHoy.filter(f => f.tipo === 'ingreso' && f.forma_pago !== 'dolares').reduce((s, f) => s + Number(f.monto), 0);
  const hoySalidaP = filasHoy.filter(f => f.tipo === 'egreso' && f.forma_pago !== 'dolares').reduce((s, f) => s + Number(f.monto), 0);

  const totalesPorCategoria = useMemo(() => {
    const acc = {};
    movimientosVisibles.forEach((m) => {
      if (m.tipo === 'egreso') {
        const nombre = m.categorias_caja?.nombre || 'Sin categoría';
        acc[nombre] = (acc[nombre] || 0) + Number(m.monto);
      }
    });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [movimientosVisibles]);
  const maxCat = Math.max(1, ...totalesPorCategoria.map(([, v]) => v));

  const entradasPorCategoria = useMemo(() => {
    const acc = {};
    movimientosVisibles.forEach((m) => {
      if (m.tipo === 'ingreso') {
        const nombre = m.categorias_caja?.nombre || 'Sin categoría';
        acc[nombre] = (acc[nombre] || 0) + Number(m.monto);
      }
    });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [movimientosVisibles]);
  const maxCatIn = Math.max(1, ...entradasPorCategoria.map(([, v]) => v));

  const [statsOpen, setStatsOpen] = useState(false);
  const [ultimoInsertadoId, setUltimoInsertadoId] = useState(null);
  const cantidadMovimientos = movimientosVisibles.length;
  const promedioMovimiento = cantidadMovimientos ? movimientosVisibles.reduce((s, m) => s + Number(m.monto), 0) / cantidadMovimientos : 0;

  function totalPorForma(formaPago, excluirCategoriaId) {
    return movimientos
      .filter((m) => m.forma_pago === formaPago && m.categoria_id !== excluirCategoriaId)
      .reduce((s, m) => s + (m.tipo === 'ingreso' ? 1 : -1) * Number(m.monto), 0);
  }

  const categoriaGananciaRepuestos = categorias.find((c) => c.tipo === 'ingreso' && c.nombre.toUpperCase().includes('GANANCIA'));
  const idGanancia = categoriaGananciaRepuestos?.id;
  const teoricoGananciaRepuestos = idGanancia
    ? movimientos.filter((m) => m.categoria_id === idGanancia).reduce((s, m) => s + Number(m.monto), 0)
    : 0;

  const teoricoEfectivo = totalPorForma('efectivo', idGanancia);
  const teoricoDolares = totalPorForma('dolares', idGanancia);

  const [cierreOpen, setCierreOpen] = useState(false);
  const [historialOpen, setHistorialOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  const [nuevaCatTipo, setNuevaCatTipo] = useState('egreso');

  async function agregarCategoria() {
    if (!nuevaCatNombre.trim()) return;
    const { data, error } = await supabase.from('categorias_caja')
      .insert({ nombre: nuevaCatNombre.trim(), tipo: nuevaCatTipo, activa: true })
      .select();
    if (error) { alert('No se pudo crear la categoría: ' + error.message); return; }
    setCategorias((prev) => [...prev, ...data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setNuevaCatNombre('');
  }

  async function toggleCategoriaActiva(cat) {
    const { error } = await supabase.from('categorias_caja').update({ activa: !cat.activa }).eq('id', cat.id);
    if (error) { alert('No se pudo actualizar: ' + error.message); return; }
    if (cat.activa) {
      // se desactiva: la sacamos de la lista visible (no se borra de la base)
      setCategorias((prev) => prev.filter((c) => c.id !== cat.id));
    }
  }
  const [historial, setHistorial] = useState([]);
  async function abrirHistorial() {
    const abrir = !historialOpen;
    setHistorialOpen(abrir);
    if (abrir) {
      const { data } = await supabase.from('cierres_caja').select('*').order('fecha', { ascending: false });
      setHistorial(data || []);
    }
  }
  const [efectivoReal, setEfectivoReal] = useState('');
  const [dolaresReal, setDolaresReal] = useState('');
  const [gananciaRepuestoReal, setGananciaRepuestoReal] = useState('');
  const [cierreObs, setCierreObs] = useState('');
  const [cierreGuardado, setCierreGuardado] = useState(null);

  const diferenciaEfectivo = efectivoReal === '' ? null : Number(efectivoReal.replace(/\D/g, '')) - teoricoEfectivo;

  async function guardarCierre() {
    if (efectivoReal === '') { alert('Ingresá el efectivo real contado.'); return; }
    if (!usuario.trim()) { alert('Ingresá tu nombre de usuario arriba, en el formulario de asientos.'); return; }
    const hoyStr = new Date().toISOString().slice(0, 10);
    const { data: existentes } = await supabase.from('cierres_caja').select('id').eq('fecha', hoyStr);
    if (existentes && existentes.length > 0) {
      if (!confirm(`Ya hay ${existentes.length} cierre(s) guardado(s) para hoy. ¿Guardar otro de todas formas?`)) return;
    }
    const notaGanancia = gananciaRepuestoReal !== ''
      ? `Ganancia repuestos — teórico: ${fmt(teoricoGananciaRepuestos)}, real: ${fmt(Number(gananciaRepuestoReal.replace(/\D/g, '')))}, diferencia: ${fmtSigned(Number(gananciaRepuestoReal.replace(/\D/g, '')) - teoricoGananciaRepuestos)}.`
      : '';
    const payload = {
      fecha: hoyStr,
      efectivo_teorico: teoricoEfectivo,
      efectivo_real: Number(efectivoReal.replace(/\D/g, '')),
      diferencia: Number(efectivoReal.replace(/\D/g, '')) - teoricoEfectivo,
      transferencia: 0,
      dolares: dolaresReal === '' ? teoricoDolares : Number(dolaresReal.replace(/\D/g, '')),
      observaciones: [cierreObs, notaGanancia].filter(Boolean).join(' — ') || null,
      usuario,
    };
    const { data, error } = await supabase.from('cierres_caja').insert(payload).select();
    if (error) { alert('No se pudo guardar el cierre: ' + error.message); return; }
    setCierreGuardado(data[0]);
    setEfectivoReal('');
    setDolaresReal('');
    setGananciaRepuestoReal('');
    setCierreObs('');
  }

  function actualizarCampoLocal(id, field, value) {
    setMovimientos((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }

  async function actualizarCampo(id, field, value) {
    setMovimientos((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
    const { error } = await supabase.from('movimientos_caja').update({ [field]: value }).eq('id', id);
    if (error) { alert('No se pudo guardar: ' + error.message); cargarTodo(); }
  }

  const [modoOscuro, setModoOscuro] = useState(false);
  useEffect(() => {
    const guardado = typeof window !== 'undefined' ? localStorage.getItem('caja_modo_oscuro') : null;
    if (guardado === '1') setModoOscuro(true);
  }, []);
  function toggleModoOscuro() {
    setModoOscuro((v) => {
      localStorage.setItem('caja_modo_oscuro', !v ? '1' : '0');
      return !v;
    });
  }

  const [deshacerInfo, setDeshacerInfo] = useState(null);
  const deshacerTimeoutRef = useRef(null);

  function repetirMovimiento(f) {
    setForm({
      fecha: new Date().toISOString().slice(0, 10),
      descripcion: f.descripcion || '',
      categoria_id: f.categoria_id || '',
      tipo: f.tipo,
      forma_pago: f.forma_pago,
      monto: f.monto ? Number(f.monto).toLocaleString('es-AR') : '',
      esNota: false,
    });
    setFormOpen(true);
  }

  async function borrarFila(f) {
    if (!confirm(`¿Borrar "${f.descripcion}" por ${fmt(f.monto)}?`)) return;
    const { error } = await supabase.from('movimientos_caja').delete().eq('id', f.id);
    if (error) { alert('No se pudo borrar: ' + error.message); return; }
    setMovimientos((prev) => prev.filter((m) => m.id !== f.id));

    clearTimeout(deshacerTimeoutRef.current);
    setDeshacerInfo(f);
    deshacerTimeoutRef.current = setTimeout(() => setDeshacerInfo(null), 5000);
  }

  async function deshacerBorrado() {
    if (!deshacerInfo) return;
    const { id, categorias_caja, ...resto } = deshacerInfo;
    const { data, error } = await supabase.from('movimientos_caja').insert(resto).select('*, categorias_caja(nombre)');
    if (error) { alert('No se pudo deshacer: ' + error.message); return; }
    setMovimientos((prev) => [...prev, ...data]);
    setDeshacerInfo(null);
    clearTimeout(deshacerTimeoutRef.current);
  }

  async function guardarNuevo() {
    if (!form.descripcion.trim() || !usuario.trim() || (!form.esNota && (!form.monto || !form.categoria_id))) {
      alert('Completá descripción, usuario, y (si no es una nota) categoría y monto.');
      return;
    }
    const diasDiferencia = (new Date(form.fecha) - new Date()) / (1000 * 60 * 60 * 24);
    if (diasDiferencia > 1) {
      if (!confirm(`La fecha ${form.fecha} es futura. ¿Seguro que es correcta?`)) return;
    } else if (diasDiferencia < -60) {
      if (!confirm(`La fecha ${form.fecha} es de hace más de dos meses. ¿Seguro que es correcta?`)) return;
    }

    const montoNumerico = form.esNota ? 0 : parseFloat(String(form.monto).replace(/\D/g, ''));

    const categoriaSeleccionada = categorias.find((c) => c.id === form.categoria_id);
    const esRepuestoIngreso = !form.esNota && form.tipo === 'ingreso' && categoriaSeleccionada?.nombre.toUpperCase().includes('REPUESTO');
    const costoRepuesto = parseFloat(String(form.costoRepuesto).replace(/\D/g, '')) || 0;
    const gananciaRepuesto = esRepuestoIngreso && costoRepuesto > 0 && costoRepuesto < montoNumerico ? montoNumerico - costoRepuesto : 0;

    let categoriaGananciaId = null;
    if (gananciaRepuesto > 0) {
      const catGanancia = categorias.find((c) => c.tipo === 'ingreso' && c.nombre.toUpperCase().includes('GANANCIA'));
      if (!catGanancia) {
        alert('No encontré una categoría "Ganancia Repuestos" (de tipo Entrada) para separar la ganancia. Creála en "Categorías" y volvé a guardar.');
        return;
      }
      categoriaGananciaId = catGanancia.id;
    }

    localStorage.setItem('caja_usuario', usuario);
    const payloads = [{
      fecha: form.fecha,
      descripcion: form.descripcion.trim(),
      categoria_id: form.esNota ? null : form.categoria_id,
      tipo: form.tipo,
      forma_pago: form.forma_pago,
      monto: gananciaRepuesto > 0 ? costoRepuesto : montoNumerico,
      usuario,
    }];
    if (gananciaRepuesto > 0) {
      payloads.push({
        fecha: form.fecha,
        descripcion: `Ganancia repuesto — ${form.descripcion.trim()}`,
        categoria_id: categoriaGananciaId,
        tipo: 'ingreso',
        forma_pago: form.forma_pago,
        monto: gananciaRepuesto,
        usuario,
      });
    }
    const { data, error } = await supabase.from('movimientos_caja').insert(payloads).select('*, categorias_caja(nombre)');
    if (error) { alert('No se pudo guardar: ' + error.message); return; }
    setMovimientos((prev) => [...prev, ...data]);
    setForm({ ...form, descripcion: '', monto: '', esNota: false, costoRepuesto: '' }); // mantiene categoría/tipo/moneda para el siguiente asiento
    if (data && data[0]) {
      setUltimoInsertadoId(data[0].id);
      setTimeout(() => setUltimoInsertadoId(null), 3000);
    }
  }

  async function descargarRespaldo() {
    const { data: movs } = await supabase.from('movimientos_caja').select('*, categorias_caja(nombre, tipo)').order('fecha', { ascending: true });
    const { data: cats } = await supabase.from('categorias_caja').select('*');
    const { data: cierres } = await supabase.from('cierres_caja').select('*').order('fecha', { ascending: false });
    const respaldo = {
      generado: new Date().toISOString(),
      movimientos: movs || [],
      categorias: cats || [],
      cierres: cierres || [],
    };
    const blob = new Blob([JSON.stringify(respaldo, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respaldo-caja-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportarCSV() {
    const filas = gruposOrdenados.flatMap(([, fs]) => fs);
    const encabezado = ['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Moneda', 'Monto', 'Usuario'];
    const lineas = filas.map((f) => [
      f.fecha.slice(0, 10),
      `"${(f.descripcion || '').replace(/"/g, '""')}"`,
      f.categorias_caja?.nombre || '',
      f.tipo === 'ingreso' ? 'Entrada' : 'Salida',
      f.forma_pago,
      f.monto,
      f.usuario || '',
    ].join(';'));
    const csv = [encabezado.join(';'), ...lineas].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caja-${mesFiltro === 'todos' ? 'todos' : mesFiltro}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function maskMiles(value) {
    const digits = value.replace(/\D/g, '');
    return digits ? Number(digits).toLocaleString('es-AR') : '';
  }

  const categoriasFiltradas = categorias.filter((c) => c.tipo === form.tipo);
  const categoriaSeleccionadaNombre = categorias.find((c) => c.id === form.categoria_id)?.nombre || '';
  const esRepuestoForm = form.tipo === 'ingreso' && !form.esNota && categoriaSeleccionadaNombre.toUpperCase().includes('REPUESTO');

  if (rol === undefined) return null; // chequeando localStorage, evita parpadeo

  if (rol === null) {
    return (
      <div className={`caja-wrap gate-wrap ${modoOscuro ? "oscuro" : ""}`}>
        <Head>
          <title>Caja</title>
          <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath d='M24 4L44 16H4L24 4Z' stroke='%23182620' stroke-width='3' stroke-linejoin='round' fill='none'/%3E%3Crect x='8' y='20' width='4' height='18' stroke='%23182620' stroke-width='3'/%3E%3Crect x='22' y='20' width='4' height='18' stroke='%23182620' stroke-width='3'/%3E%3Crect x='36' y='20' width='4' height='18' stroke='%23182620' stroke-width='3'/%3E%3Cline x1='4' y1='42' x2='44' y2='42' stroke='%23182620' stroke-width='3'/%3E%3C/svg%3E" />
        </Head>
        <style>{css}</style>
        <div className="gate-box">
          <svg className="bank-logo" viewBox="0 0 48 48" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4L44 16H4L24 4Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
            <rect x="8" y="20" width="4" height="18" stroke="currentColor" strokeWidth="2.5"/>
            <rect x="22" y="20" width="4" height="18" stroke="currentColor" strokeWidth="2.5"/>
            <rect x="36" y="20" width="4" height="18" stroke="currentColor" strokeWidth="2.5"/>
            <line x1="4" y1="42" x2="44" y2="42" stroke="currentColor" strokeWidth="2.5"/>
          </svg>
          <h1>Caja</h1>
          <input
            type="password"
            className="gate-input"
            placeholder="Contraseña"
            value={claveInput}
            onChange={(e) => { setClaveInput(e.target.value); setClaveError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') entrar(); }}
            autoFocus
          />
          <button className="new-entry gate-btn" onClick={entrar}>Entrar</button>
          {claveError && <div className="gate-error">{claveError}</div>}
        </div>
      </div>
    );
  }

  if (loading) return <div style={{ padding: 40, fontFamily: 'monospace' }}>Cargando caja…</div>;

  return (
    <div className={`caja-wrap ${modoOscuro ? "oscuro" : ""}`}>
      <Head>
        <title>Caja</title>
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath d='M24 4L44 16H4L24 4Z' stroke='%23182620' stroke-width='3' stroke-linejoin='round' fill='none'/%3E%3Crect x='8' y='20' width='4' height='18' stroke='%23182620' stroke-width='3'/%3E%3Crect x='22' y='20' width='4' height='18' stroke='%23182620' stroke-width='3'/%3E%3Crect x='36' y='20' width='4' height='18' stroke='%23182620' stroke-width='3'/%3E%3Cline x1='4' y1='42' x2='44' y2='42' stroke='%23182620' stroke-width='3'/%3E%3C/svg%3E" />
      </Head>
      <style>{css}</style>

      {teoricoEfectivo < 0 && (
        <div className="alerta-negativo">
          ⚠ El efectivo está en negativo ({fmtSigned(teoricoEfectivo)}) — revisá si falta cargar algún ingreso o si hay un monto mal puesto.
        </div>
      )}

      <div className="watermark">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4L44 16H4L24 4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          <rect x="8" y="20" width="4" height="18" stroke="currentColor" strokeWidth="1.2"/>
          <rect x="22" y="20" width="4" height="18" stroke="currentColor" strokeWidth="1.2"/>
          <rect x="36" y="20" width="4" height="18" stroke="currentColor" strokeWidth="1.2"/>
          <line x1="4" y1="42" x2="44" y2="42" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      </div>

      <div className="masthead">
        <div className="brand">
          <svg className="bank-logo" viewBox="0 0 48 48" width="34" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4L44 16H4L24 4Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
            <rect x="8" y="20" width="4" height="18" stroke="currentColor" strokeWidth="2.5"/>
            <rect x="22" y="20" width="4" height="18" stroke="currentColor" strokeWidth="2.5"/>
            <rect x="36" y="20" width="4" height="18" stroke="currentColor" strokeWidth="2.5"/>
            <line x1="4" y1="42" x2="44" y2="42" stroke="currentColor" strokeWidth="2.5"/>
          </svg>
          <div>
            <div className="eyebrow">Registro contable · Taller</div>
            <h1>Caja</h1>
          </div>
        </div>
        <div className="masthead-right">
          <div className="fecha">
            {new Date().toLocaleDateString('es-AR')}
            <button className="logout-link" onClick={toggleModoOscuro}>{modoOscuro ? '☀ Claro' : '🌙 Oscuro'}</button>
            <button className="logout-link" onClick={salir}>Salir ({rol})</button>
          </div>
          <div className="mini-totales">
            <div className="mini-fila">
              <span className="mini-badge entrada">▲ ENTRADAS {fmt(vistaEntradaP)}{vistaEntradaU ? ` / ${fmtUsd(vistaEntradaU)}` : ''}</span>
              <span className="mini-badge salida">▼ SALIDAS {fmt(vistaSalidaP)}{vistaSalidaU ? ` / ${fmtUsd(vistaSalidaU)}` : ''}</span>
            </div>
            <div className="mini-fila">
              <span className="mini-badge hoy">HOY +{fmt(hoyEntradaP)} / -{fmt(hoySalidaP)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats">
        <div className={`stat saldo ${teoricoEfectivo < 0 ? 'negativo' : ''}`}>
          <div className="label">Efectivo</div>
          <div className="value">{fmt(teoricoEfectivo)}</div>
        </div>
        <div className="stat usd">
          <div className="label">Dólares</div>
          <div className="value">{fmtUsd(teoricoDolares)}</div>
        </div>
        <div className="stat transf">
          <div className="label">Ganancia Repuestos (aparte)</div>
          <div className="value">{fmt(teoricoGananciaRepuestos)}</div>
        </div>
      </div>

      <div className="addbar">
        <h2>Movimientos</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="mes-select" value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)}>
            <option value="todos">Todos los meses</option>
            {grupos.map(([key]) => {
              const [y, m] = key.split('-');
              return <option key={key} value={key}>{MESES[parseInt(m, 10) - 1]} {y}</option>;
            })}
          </select>
          <input
            type="text"
            className="busqueda-input"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button className="new-entry secondary" onClick={exportarCSV}>Exportar</button>
          <button className="new-entry secondary" onClick={() => setStatsOpen((v) => !v)}>Estadísticas</button>
          {!soloLectura && <button className="new-entry secondary" onClick={descargarRespaldo}>Respaldo</button>}
          {!soloLectura && (
            <>
              <button className="new-entry secondary" onClick={abrirHistorial}>Historial de cierres</button>
              <button className="new-entry secondary" onClick={() => setCatsOpen((v) => !v)}>Categorías</button>
              <button className="new-entry secondary" onClick={() => setCierreOpen((v) => !v)}>Cerrar caja</button>
              <button className="new-entry" onClick={() => setFormOpen((v) => !v)}>+ Nuevo asiento</button>
            </>
          )}
        </div>
      </div>

      {!soloLectura && cierreOpen && (
        <div className="cierre-panel">
          <h3>Cierre de caja — {new Date().toLocaleDateString('es-AR')}</h3>
          <div className="cierre-grid">
            <div className="cierre-col">
              <div className="cierre-label">Efectivo teórico</div>
              <div className="cierre-valor">{fmt(teoricoEfectivo)}</div>
              <label>Efectivo real (contado)</label>
              <input type="text" inputMode="numeric" value={efectivoReal}
                onChange={(e) => setEfectivoReal(maskMiles(e.target.value))} placeholder="0" />
              {diferenciaEfectivo !== null && (
                <div className={`cierre-diff ${diferenciaEfectivo === 0 ? '' : diferenciaEfectivo > 0 ? 'pos' : 'neg'}`}>
                  Diferencia: {fmtSigned(diferenciaEfectivo)}
                </div>
              )}
            </div>
            <div className="cierre-col">
              <div className="cierre-label">Dólares teórico</div>
              <div className="cierre-valor">{fmtUsd(teoricoDolares)}</div>
              <label>Dólares real (contado)</label>
              <input type="text" inputMode="numeric" value={dolaresReal}
                onChange={(e) => setDolaresReal(maskMiles(e.target.value))} placeholder="opcional" />
            </div>
            <div className="cierre-col">
              <div className="cierre-label">Ganancia Repuestos (debería haber)</div>
              <div className="cierre-valor">{fmt(teoricoGananciaRepuestos)}</div>
              <label>Ganancia repuestos real</label>
              <input type="text" inputMode="numeric" value={gananciaRepuestoReal}
                onChange={(e) => setGananciaRepuestoReal(maskMiles(e.target.value))} placeholder="opcional" />
            </div>
          </div>
          <label>Observaciones</label>
          <input type="text" value={cierreObs} onChange={(e) => setCierreObs(e.target.value)} placeholder="Opcional" style={{ width: '100%', marginBottom: 12 }} />
          <button className="new-entry" onClick={guardarCierre}>Guardar cierre</button>
          {cierreGuardado && <div className="sello-cerrado">CERRADO</div>}
        </div>
      )}

      {!soloLectura && historialOpen && (
        <div className="cierre-panel">
          <h3>Historial de cierres</h3>
          {historial.length === 0 && <div className="empty" style={{ padding: 20 }}>Todavía no hay cierres guardados.</div>}
          {historial.length > 0 && (
            <table className="historial-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th className="num">Efectivo teórico</th>
                  <th className="num">Efectivo real</th>
                  <th className="num">Diferencia</th>
                  <th className="num">Dólares</th>
                  <th>Usuario</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((c) => (
                  <tr key={c.id}>
                    <td>{c.fecha}</td>
                    <td className="num">{fmt(c.efectivo_teorico)}</td>
                    <td className="num">{fmt(c.efectivo_real)}</td>
                    <td className={`num ${c.diferencia === 0 ? '' : c.diferencia > 0 ? 'entrada' : 'salida'}`}>{fmtSigned(c.diferencia)}</td>
                    <td className="num">{fmtUsd(c.dolares)}</td>
                    <td>{c.usuario}</td>
                    <td>{c.observaciones || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {statsOpen && (
        <div className="cierre-panel">
          <h3>Estadísticas</h3>
          <div className="stats-resumen">
            <div className="stats-resumen-item"><span className="label">Movimientos cargados</span><span className="value">{cantidadMovimientos}</span></div>
            <div className="stats-resumen-item"><span className="label">Monto promedio</span><span className="value">{fmt(promedioMovimiento)}</span></div>
          </div>
          <div className="stats-cols">
            <div>
              <h4>Salidas por categoría</h4>
              {totalesPorCategoria.length === 0 && <div className="cat-row"><span className="name">Sin salidas cargadas</span></div>}
              {totalesPorCategoria.map(([cat, amt]) => (
                <div className="cat-block" key={cat}>
                  <div className="cat-row"><span className="name">{cat}</span><span className="amt">{fmt(amt)}</span></div>
                  <div className="cat-bar"><span style={{ width: `${(amt / maxCat) * 100}%`, background: colorCategoria(cat) }}></span></div>
                </div>
              ))}
            </div>
            <div>
              <h4>Entradas por categoría</h4>
              {entradasPorCategoria.length === 0 && <div className="cat-row"><span className="name">Sin entradas cargadas</span></div>}
              {entradasPorCategoria.map(([cat, amt]) => (
                <div className="cat-block" key={cat}>
                  <div className="cat-row"><span className="name">{cat}</span><span className="amt">{fmt(amt)}</span></div>
                  <div className="cat-bar"><span style={{ width: `${(amt / maxCatIn) * 100}%`, background: colorCategoria(cat) }}></span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!soloLectura && catsOpen && (
        <div className="cierre-panel">
          <h3>Categorías</h3>
          <div className="cat-manage-list">
            {categorias.map((c) => (
              <div className="cat-manage-row" key={c.id}>
                <span className={`cat-manage-tipo ${c.tipo}`}>{c.tipo === 'ingreso' ? 'Entrada' : 'Salida'}</span>
                <span className="cat-manage-nombre">{c.nombre}</span>
                <button className="cat-manage-off" onClick={() => toggleCategoriaActiva(c)}>Desactivar</button>
              </div>
            ))}
          </div>
          <div className="cat-manage-add">
            <input type="text" value={nuevaCatNombre} onChange={(e) => setNuevaCatNombre(e.target.value)} placeholder="Nombre de categoría" />
            <select value={nuevaCatTipo} onChange={(e) => setNuevaCatTipo(e.target.value)}>
              <option value="ingreso">Entrada</option>
              <option value="egreso">Salida</option>
            </select>
            <button className="new-entry" onClick={agregarCategoria}>Agregar</button>
          </div>
        </div>
      )}

      {!soloLectura && formOpen && (
      <>
        <div className="form-row" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); guardarNuevo(); } }}>
          <div>
            <label>Fecha</label>
            <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
          </div>
          <div>
            <label>Descripción</label>
            <input type="text" value={form.descripcion} placeholder="Ej: Compra repuestos Amarok"
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div>
            <label>Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value, categoria_id: '' })}>
              <option value="ingreso">Entrada</option>
              <option value="egreso">Salida</option>
            </select>
          </div>
          <div>
            <label>Moneda</label>
            <select value={form.forma_pago} onChange={(e) => setForm({ ...form, forma_pago: e.target.value })}>
              <option value="efectivo">Efectivo</option>
              <option value="dolares">Dólares</option>
            </select>
          </div>
          <div>
            <label>Categoría</label>
            <select value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })} disabled={form.esNota}>
              <option value="">—</option>
              {categoriasFiltradas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label>Monto</label>
            <input type="text" inputMode="numeric" value={form.monto} disabled={form.esNota}
              onChange={(e) => setForm({ ...form, monto: maskMiles(e.target.value) })} placeholder="0" />
          </div>
          <div>
            <label className="nota-check-label">
              <input type="checkbox" checked={form.esNota} onChange={(e) => setForm({ ...form, esNota: e.target.checked })} />
              {' '}Nota (sin monto)
            </label>
          </div>
          <div>
            <label>Usuario</label>
            <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Tu nombre" />
          </div>
          <div className="actions">
            <button onClick={guardarNuevo}>Guardar</button>
          </div>
        </div>
        {esRepuestoForm && (
          <div className="iibb-grid">
            <div>
              <label>Costo real del repuesto</label>
              <input type="text" inputMode="numeric" value={form.costoRepuesto}
                onChange={(e) => setForm({ ...form, costoRepuesto: maskMiles(e.target.value) })}
                placeholder="Lo que te salió a vos" />
            </div>
            <div className="iibb-preview">
              <span className="label">Ganancia repuesto (se guarda aparte)</span>
              <span className="valor" style={{ color: 'var(--green)' }}>
                {fmt(Math.max(0, (parseFloat(String(form.monto).replace(/\D/g, '')) || 0) - (parseFloat(String(form.costoRepuesto).replace(/\D/g, '')) || 0)))}
              </span>
            </div>
          </div>
        )}
      </>
      )}

      <div className="layout">
        <div className="ledger">
          <table>
            <thead>
              <tr>
                <th style={{ width: 80 }}>Fecha</th>
                <th>Descripción</th>
                <th style={{ width: 120 }} className="th-ordenable" onClick={() => pedirOrden('categoria')}>
                  Categoría{ordenCol === 'categoria' ? (ordenDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th style={{ width: 80 }}>Tipo</th>
                <th style={{ width: 90 }}>Moneda</th>
                <th className="num th-ordenable" style={{ width: 110 }} onClick={() => pedirOrden('monto')}>
                  Monto{ordenCol === 'monto' ? (ordenDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th style={{ width: 100 }}>Usuario</th>
                <th style={{ width: 24 }}></th>
              </tr>
            </thead>
            <tbody>
              {gruposOrdenados.length === 0 && (
                <tr><td colSpan={8} className="empty">Sin movimientos todavía — cargá el primero con "Nuevo asiento".</td></tr>
              )}
              {gruposOrdenados.map(([mesKey, filas]) => {
                const [y, m] = mesKey.split('-');
                return (
                  <FragmentGroup key={mesKey}
                    mesLabel={`${MESES[parseInt(m, 10) - 1]} ${y}`}
                    filas={filas}
                    categorias={categorias}
                    onUpdate={actualizarCampo}
                    onLocalUpdate={actualizarCampoLocal}
                    onDelete={borrarFila}
                    onRepetir={repetirMovimiento}
                    maskMiles={maskMiles}
                    soloLectura={soloLectura}
                    ultimoInsertadoId={ultimoInsertadoId}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {deshacerInfo && (
        <div className="deshacer-toast">
          <span>Se borró "{deshacerInfo.descripcion}"</span>
          <button onClick={deshacerBorrado}>Deshacer</button>
        </div>
      )}
    </div>
  );
}

function FragmentGroup({ mesLabel, filas, categorias, onUpdate, onLocalUpdate, onDelete, onRepetir, maskMiles, soloLectura, ultimoInsertadoId }) {
  return (
    <>
      <tr className="month-header"><td colSpan={8}>{mesLabel}</td></tr>
      {filas.map((f) => (
        <tr key={f.id} className={`fila-${f.tipo} ${f.id === ultimoInsertadoId ? 'fila-nueva' : ''} ${Number(f.monto) === 0 ? 'fila-nota' : ''}`}>
          {soloLectura ? (
            <>
              <td data-label="Fecha">{f.fecha.slice(8,10)}/{f.fecha.slice(5,7)}</td>
              <td className="desc" data-label="Descripción">{f.descripcion}</td>
              <td className="cat" data-label="Categoría"><span className="cat-pill" style={{ borderLeft: `3px solid ${colorCategoria(categorias.find(c => c.id === f.categoria_id)?.nombre)}` }}>{categorias.find(c => c.id === f.categoria_id)?.nombre || '—'}</span></td>
              <td data-label="Tipo">{f.tipo === 'ingreso' ? 'Entrada' : 'Salida'}</td>
              <td data-label="Moneda">{f.forma_pago === 'dolares' ? <span className="moneda-usd">U$D Dólares</span> : f.forma_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}</td>
              <td className={`num ${f.tipo === 'ingreso' ? 'entrada' : 'salida'}`} data-label="Monto">{Number(f.monto).toLocaleString('es-AR')}</td>
              <td className="usuario" data-label="Usuario">{f.usuario}</td>
              <td></td>
            </>
          ) : (
            <>
              <td data-label="Fecha"><input type="date" className="cell-input" value={f.fecha.slice(0,10)} onChange={(e) => onUpdate(f.id, 'fecha', e.target.value)} /></td>
              <td className="desc" data-label="Descripción"><input type="text" className="cell-input" value={f.descripcion || ''}
                onChange={(e) => onLocalUpdate(f.id, 'descripcion', e.target.value)}
                onBlur={(e) => onUpdate(f.id, 'descripcion', e.target.value)} /></td>
              <td className="cat" data-label="Categoría">
                <select className="cell-input" value={f.categoria_id || ''} onChange={(e) => onUpdate(f.id, 'categoria_id', e.target.value)}>
                  {categorias.filter(c => c.tipo === f.tipo).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </td>
              <td data-label="Tipo">
                <select className="cell-input" value={f.tipo} onChange={(e) => onUpdate(f.id, 'tipo', e.target.value)}>
                  <option value="ingreso">Entrada</option>
                  <option value="egreso">Salida</option>
                </select>
              </td>
              <td data-label="Moneda" className={f.forma_pago === 'dolares' ? 'moneda-usd-cell' : ''}>
                <select className="cell-input" value={f.forma_pago} onChange={(e) => onUpdate(f.id, 'forma_pago', e.target.value)}>
                  <option value="efectivo">Efectivo</option>
                  <option value="dolares">Dólares</option>
                </select>
              </td>
              <td className={`num ${f.tipo === 'ingreso' ? 'entrada' : 'salida'}`} data-label="Monto">
                <input type="text" inputMode="numeric" className="cell-input"
                  value={Number(f.monto).toLocaleString('es-AR')}
                  onChange={(e) => onLocalUpdate(f.id, 'monto', parseFloat(maskMiles(e.target.value).replace(/\D/g,'')) || 0)}
                  onBlur={() => onUpdate(f.id, 'monto', f.monto)} />
              </td>
              <td className="usuario" data-label="Usuario"><input type="text" className="cell-input" value={f.usuario || ''}
                onChange={(e) => onLocalUpdate(f.id, 'usuario', e.target.value)}
                onBlur={(e) => onUpdate(f.id, 'usuario', e.target.value)} /></td>
              <td className="del">
                <button className="btn-repetir" title="Repetir este movimiento hoy" onClick={() => onRepetir(f)}>⟳</button>
                <button onClick={() => onDelete(f)}>×</button>
              </td>
            </>
          )}
        </tr>
      ))}
    </>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
.caja-wrap{ --ink:#182620; --ink-soft:#4b564f; --paper:#EDEAE0; --paper-2:#E4E0D2; --paper-3:#dcd6c3; --rule:#c9c2ac; --margin:#9B3B30; --brass:#A67C3D; --green:#2E6B4F; --red:#9B3B30; --gold:#8a6c2f;
  max-width:1440px; margin:0 auto; padding:40px 32px 80px; color:var(--ink); font-family:'IBM Plex Sans',sans-serif;
  background-color:var(--paper); position:relative;
  background-image:
    repeating-linear-gradient(90deg, rgba(24,38,32,0.012) 0px, rgba(24,38,32,0.012) 1px, transparent 1px, transparent 3px),
    repeating-linear-gradient(0deg, rgba(24,38,32,0.012) 0px, rgba(24,38,32,0.012) 1px, transparent 1px, transparent 3px);
}
.caja-wrap .watermark{
  position:absolute; top:120px; left:50%; transform:translateX(-50%);
  width:520px; height:520px; color:var(--ink); opacity:.035; pointer-events:none; z-index:0;
}
.caja-wrap .watermark svg{ width:100%; height:100%; }
.caja-wrap > *:not(.watermark){ position:relative; z-index:1; }
.caja-wrap .num, .caja-wrap td.num, .caja-wrap .value{ font-variant-numeric: tabular-nums; }
.caja-wrap.oscuro{
  --ink:#F4F1E8; --ink-soft:#B5AFA0; --paper:#0E1613; --paper-2:#182420; --paper-3:#22302A;
  --rule:#4A5B4E; --margin:#E08876; --brass:#E3C179; --green:#8FDBAE; --red:#F09A8D; --gold:#E8CC8C;
  background-image:
    repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px);
}
.caja-wrap.oscuro tbody td, .caja-wrap.oscuro thead th{ border-color:var(--rule); }
.caja-wrap.oscuro .cell-input:focus{ background:#050b08; }
.caja-wrap.oscuro .form-row input, .caja-wrap.oscuro .form-row select,
.caja-wrap.oscuro .cierre-col input, .caja-wrap.oscuro .cat-manage-add input, .caja-wrap.oscuro .cat-manage-add select,
.caja-wrap.oscuro .busqueda-input, .caja-wrap.oscuro select.mes-select{ background:var(--paper); color:var(--ink); }
.caja-wrap .masthead{ display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid var(--ink); padding-bottom:18px; margin-bottom:6px; }
.caja-wrap .alerta-negativo{ background:var(--red); color:var(--paper); font-family:'IBM Plex Sans',sans-serif; font-size:13px; font-weight:600; padding:12px 18px; margin-bottom:18px; border-radius:2px; }
.caja-wrap .brand{ display:flex; align-items:center; gap:12px; }
.caja-wrap .bank-logo{ color:var(--ink); flex-shrink:0; }
.caja-wrap .masthead-right{ display:flex; flex-direction:column; align-items:flex-end; gap:10px; }
.caja-wrap .mini-totales{
  display:flex; flex-direction:column; gap:6px;
  background:#111; padding:8px 14px; border-radius:6px; width:fit-content;
}
.caja-wrap .mini-fila{ display:flex; flex-wrap:wrap; align-items:center; gap:12px; }
.caja-wrap .mini-badge{
  font-family:'IBM Plex Mono',monospace; font-size:14px; font-weight:700;
  letter-spacing:.02em; white-space:nowrap; background:none; padding:0;
}
.caja-wrap .mini-badge.entrada{ color:#6FCF97; }
.caja-wrap .mini-badge.salida{ color:#E58A82; }
.caja-wrap .mini-badge.hoy{ color:#D9BE7E; }

@keyframes panelIn{
  from{ opacity:0; transform: translateY(-6px); }
  to{ opacity:1; transform: translateY(0); }
}
.caja-wrap .eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-soft); margin-bottom:6px; }
.caja-wrap h1{ font-family:'Spectral',serif; font-weight:600; font-size:32px; margin:0; }
.caja-wrap .fecha{ font-family:'IBM Plex Mono',monospace; font-size:12.5px; color:var(--ink-soft); display:flex; align-items:center; gap:8px; }
.caja-wrap .logout-link{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; text-transform:uppercase; background:none; border:none; color:var(--ink-soft); text-decoration:underline; cursor:pointer; padding:0; }
.caja-wrap.gate-wrap{ min-height:100vh; display:flex; align-items:center; justify-content:center; max-width:none; }
.caja-wrap .gate-box{ display:flex; flex-direction:column; align-items:center; gap:14px; background:var(--paper-2); border:1px solid var(--rule); padding:40px 48px; }
.caja-wrap .gate-box .bank-logo{ color:var(--ink); }
.caja-wrap .gate-box h1{ font-family:'Spectral',serif; font-size:26px; margin:0 0 6px; }
.caja-wrap .gate-input{ width:220px; font-size:14px; padding:10px 12px; border:1px solid var(--rule); background:var(--paper); text-align:center; }
.caja-wrap .gate-btn{ width:220px; }
.caja-wrap .gate-error{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:var(--red); }
.caja-wrap .stats{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:1px; background:var(--ink); margin:22px 0 26px; border:1px solid var(--ink); }
.caja-wrap .stat{ background:var(--paper); padding:16px 18px; }
.caja-wrap .stat .label{ font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.09em; text-transform:uppercase; color:var(--ink-soft); margin-bottom:7px; }
.caja-wrap .stat .value{ font-family:'IBM Plex Mono',monospace; font-weight:600; font-size:26px; }
.caja-wrap .stat.usd .value{ color:var(--gold); }
.caja-wrap .stat.negativo{ background:var(--red-bg, #f2e4e1); }
.caja-wrap .stat.negativo .value{ color:var(--red); }
.caja-wrap .stat.transf .value{ color:var(--brass); }
.caja-wrap .addbar{ display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
.caja-wrap .addbar h2{ font-family:'Spectral',serif; font-size:18px; margin:0; }
.caja-wrap button.new-entry{ font-family:'IBM Plex Mono',monospace; font-size:12.5px; background:var(--ink); color:var(--paper); border:none; padding:10px 16px; cursor:pointer; transition: transform .08s ease, background .12s ease; }
.caja-wrap button.new-entry:active{ transform: scale(.96); background:var(--brass); }
.caja-wrap button:not(.new-entry){ transition: transform .08s ease, color .12s ease; }
.caja-wrap button:not(.new-entry):active{ transform: scale(.9); }
.caja-wrap button.new-entry.secondary{ background:transparent; color:var(--ink); border:1px solid var(--ink); }
.caja-wrap select.mes-select{ font-family:'IBM Plex Mono',monospace; font-size:12px; padding:9px 10px; border:1px solid var(--ink); background:var(--paper); color:var(--ink); }
.caja-wrap .busqueda-input{ font-family:'IBM Plex Sans',sans-serif; font-size:12.5px; padding:9px 10px; border:1px solid var(--rule); background:var(--paper); color:var(--ink); width:160px; }
.caja-wrap .cierre-panel{ background:var(--paper-2); border:1px solid var(--rule); padding:18px 20px; margin-bottom:18px; animation: panelIn .16s ease-out; }
.caja-wrap .cierre-panel h3{ font-family:'Spectral',serif; font-size:15px; margin:0 0 14px; }
.caja-wrap .cierre-grid{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; margin-bottom:14px; }
.caja-wrap .cierre-col label{ display:block; font-family:'IBM Plex Mono',monospace; font-size:9.5px; text-transform:uppercase; color:var(--ink-soft); margin:8px 0 4px; }
.caja-wrap .cierre-col input{ width:100%; font-size:13.5px; padding:7px 8px; border:1px solid var(--rule); background:var(--paper); }
.caja-wrap .cierre-label{ font-family:'IBM Plex Mono',monospace; font-size:10px; text-transform:uppercase; color:var(--ink-soft); }
.caja-wrap .cierre-valor{ font-family:'IBM Plex Mono',monospace; font-size:20px; font-weight:600; margin:4px 0 6px; }
.caja-wrap .cierre-diff{ font-family:'IBM Plex Mono',monospace; font-size:12px; font-weight:600; margin-top:6px; }
.caja-wrap .cierre-diff.pos{ color:var(--green); }
.caja-wrap .cierre-diff.neg{ color:var(--red); }
.caja-wrap .cierre-ok{ margin-top:10px; font-family:'IBM Plex Mono',monospace; color:var(--green); font-size:12px; }
.caja-wrap .sello-cerrado{
  display:inline-block; margin-top:14px; padding:8px 22px;
  border:3px solid var(--margin); color:var(--margin);
  font-family:'IBM Plex Mono',monospace; font-weight:700; font-size:18px; letter-spacing:.12em;
  transform:rotate(-7deg); border-radius:4px; opacity:.85;
  animation: selloIn .3s cubic-bezier(.34,1.56,.64,1);
}
@keyframes selloIn{
  from{ opacity:0; transform:rotate(-7deg) scale(2.2); }
  to{ opacity:.85; transform:rotate(-7deg) scale(1); }
}
.caja-wrap .historial-table{ width:100%; border-collapse:collapse; font-family:'IBM Plex Mono',monospace; font-size:11.5px; }
.caja-wrap .historial-table th{ text-align:left; font-size:9.5px; text-transform:uppercase; color:var(--ink-soft); padding:8px 10px; border-bottom:2px solid var(--ink); }
.caja-wrap .historial-table th.num, .caja-wrap .historial-table td.num{ text-align:right; }
.caja-wrap .historial-table td{ padding:8px 10px; border-bottom:1px solid var(--rule); }
.caja-wrap .historial-table td.entrada{ color:var(--green); font-weight:600; }
.caja-wrap .historial-table td.salida{ color:var(--red); font-weight:600; }
.caja-wrap .cat-manage-list{ margin-bottom:16px; }
.caja-wrap .cat-manage-row{ display:flex; align-items:center; gap:10px; padding:7px 0; border-bottom:1px solid var(--rule); }
.caja-wrap .cat-manage-tipo{ font-family:'IBM Plex Mono',monospace; font-size:10px; text-transform:uppercase; padding:2px 7px; border-radius:2px; width:60px; text-align:center; }
.caja-wrap .cat-manage-tipo.ingreso{ background:var(--green); color:var(--paper); }
.caja-wrap .cat-manage-tipo.egreso{ background:var(--red); color:var(--paper); }
.caja-wrap .cat-manage-nombre{ flex:1; font-family:'IBM Plex Sans',sans-serif; font-size:13px; }
.caja-wrap .cat-manage-off{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; background:none; border:1px solid var(--rule); color:var(--ink-soft); padding:4px 8px; cursor:pointer; }
.caja-wrap .cat-manage-off:hover{ border-color:var(--red); color:var(--red); }
.caja-wrap .cat-manage-add{ display:flex; gap:8px; }
.caja-wrap .cat-manage-add input{ flex:1; padding:8px 10px; border:1px solid var(--rule); background:var(--paper); }
.caja-wrap .cat-manage-add select{ padding:8px 10px; border:1px solid var(--rule); background:var(--paper); }
.caja-wrap .form-row{ display:grid; grid-template-columns:100px 1.2fr 90px 90px 130px 90px 130px 90px 90px; gap:9px; background:var(--paper-2); border:1px solid var(--rule); padding:14px; margin-bottom:18px; animation: panelIn .16s ease-out; }
.caja-wrap .form-row label{ display:block; font-family:'IBM Plex Mono',monospace; font-size:9.5px; text-transform:uppercase; color:var(--ink-soft); margin-bottom:5px; }
.caja-wrap .form-row input, .caja-wrap .form-row select{ width:100%; font-size:13.5px; padding:7px 8px; border:1px solid var(--rule); background:var(--paper); }
.caja-wrap .form-row .actions{ display:flex; align-items:flex-end; }
.caja-wrap .form-row .actions button{ width:100%; font-family:'IBM Plex Mono',monospace; padding:7px 4px; border:1px solid var(--ink); background:var(--ink); color:var(--paper); cursor:pointer; }
.caja-wrap .nota-check-label{ display:flex; align-items:center; gap:6px; font-size:11.5px; color:var(--ink-soft); cursor:pointer; margin-top:18px; }
.caja-wrap .iibb-grid{
  display:grid; grid-template-columns:160px 1fr; gap:16px; align-items:end;
  background:var(--paper-3); border:1px dashed var(--margin); padding:12px 14px; margin:-10px 0 18px;
}
.caja-wrap .iibb-grid label{ display:block; font-family:'IBM Plex Mono',monospace; font-size:9.5px; text-transform:uppercase; color:var(--ink-soft); margin-bottom:5px; }
.caja-wrap .iibb-grid input{ width:100%; padding:7px 8px; border:1px solid var(--rule); background:var(--paper); }
.caja-wrap .iibb-preview{ display:flex; align-items:baseline; gap:10px; }
.caja-wrap .iibb-preview .label{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; text-transform:uppercase; color:var(--ink-soft); }
.caja-wrap .iibb-preview .valor{ font-family:'IBM Plex Mono',monospace; font-size:18px; font-weight:700; color:var(--red); }
.caja-wrap tbody tr.fila-ingreso{ border-left:3px solid var(--green); }
.caja-wrap tbody tr.fila-egreso{ border-left:3px solid var(--red); }
.caja-wrap tbody tr.fila-nota{ border-left:3px solid var(--rule); font-style:italic; opacity:.85; }
.caja-wrap tbody tr.fila-nota .desc{ font-style:italic; }
.caja-wrap tbody tr.fila-nueva{ animation: filaNueva 3s ease-out; }
@keyframes filaNueva{
  0%{ background: #fdf0b8; }
  100%{ background: transparent; }
}
.caja-wrap .layout{ display:grid; grid-template-columns:1fr; gap:22px; align-items:start; }
.caja-wrap .ledger{ border:1px solid var(--ink); background:var(--paper); overflow-x:auto; }
.caja-wrap table{ width:100%; table-layout:fixed; border-collapse:collapse; font-family:'IBM Plex Mono',monospace; font-size:12.5px; }
.caja-wrap thead th{ text-align:left; font-size:9.5px; letter-spacing:.09em; text-transform:uppercase; color:var(--ink-soft); padding:10px 12px; border-bottom:2px solid var(--ink); border-right:1px solid var(--rule); background:var(--paper-2); }
.caja-wrap thead th.num{ text-align:right; }
.caja-wrap tbody td{ padding:9px 12px; border-bottom:1px solid var(--ink-soft); border-right:1px solid var(--rule); vertical-align:top; }
.caja-wrap tbody tr:hover{ background:var(--paper-2); }
.caja-wrap td.num{ text-align:right; }
.caja-wrap td.num.entrada .cell-input{ color:var(--green); font-weight:600; }
.caja-wrap td.num.salida .cell-input{ color:var(--red); font-weight:600; }
.caja-wrap td.del{ text-align:center; width:24px; }
.caja-wrap td.del button{ background:none; border:none; color:var(--rule); cursor:pointer; font-size:15px; }
.caja-wrap td.del button:hover{ color:var(--red); }
.caja-wrap .cell-input{ width:100%; border:1px solid transparent; background:transparent; color:inherit; font:inherit; padding:2px 3px; }
.caja-wrap .cell-input:hover{ background:var(--paper-3); }
.caja-wrap .cell-input:focus{ background:#fff; border:1px solid var(--brass); outline:none; }
.caja-wrap .num .cell-input{ text-align:right; }
.caja-wrap tr.month-header td{ background:var(--ink); color:var(--paper); font-family:'Spectral',serif; font-weight:600; font-size:13px; padding:8px 14px; }
.caja-wrap .empty{ padding:40px 20px; text-align:center; color:var(--ink-soft); font-family:'Spectral',serif; font-style:italic; }
.caja-wrap .side-panel{ border:1px solid var(--ink); background:var(--paper); padding:16px 18px 18px; }
.caja-wrap .side-panel h3{ font-family:'Spectral',serif; font-size:14.5px; margin:0 0 12px; padding-bottom:8px; border-bottom:1px solid var(--rule); }
.caja-wrap .cat-row{ display:flex; justify-content:space-between; font-family:'IBM Plex Mono',monospace; font-size:11.5px; margin-bottom:9px; }
.caja-wrap .cat-row .name{ color:var(--ink-soft); font-family:'IBM Plex Sans',sans-serif; font-size:11.5px; }
.caja-wrap .cat-bar{ height:3px; background:var(--paper-3); margin-top:3px; position:relative; overflow:hidden; }
.caja-wrap .cat-bar span{ position:absolute; left:0; top:0; bottom:0; background:var(--brass); }
.caja-wrap .moneda-usd{ color:var(--gold); font-weight:600; }
.caja-wrap .moneda-usd::before{ content:"💵 "; }
.caja-wrap .moneda-usd-cell{ box-shadow: inset 3px 0 0 var(--gold); }
.caja-wrap .th-ordenable{ cursor:pointer; user-select:none; }
.caja-wrap .th-ordenable:hover{ color:var(--ink); }
.caja-wrap .btn-repetir{ background:none; border:none; color:var(--rule); cursor:pointer; font-size:14px; margin-right:6px; }
.caja-wrap .btn-repetir:hover{ color:var(--brass); }
.caja-wrap .deshacer-toast{
  position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
  background:var(--ink); color:var(--paper); padding:12px 18px; border-radius:4px;
  display:flex; align-items:center; gap:16px; font-family:'IBM Plex Sans',sans-serif; font-size:13px;
  box-shadow:0 8px 24px rgba(0,0,0,.3); z-index:100; animation: panelIn .16s ease-out;
}
.caja-wrap .deshacer-toast button{
  font-family:'IBM Plex Mono',monospace; font-size:12px; font-weight:700; background:var(--brass); color:var(--ink);
  border:none; padding:6px 12px; cursor:pointer; border-radius:2px;
}
.caja-wrap .stats-resumen{ display:flex; gap:24px; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid var(--rule); }
.caja-wrap .stats-resumen-item{ display:flex; flex-direction:column; gap:4px; }
.caja-wrap .stats-resumen-item .label{ font-family:'IBM Plex Mono',monospace; font-size:10px; text-transform:uppercase; color:var(--ink-soft); }
.caja-wrap .stats-resumen-item .value{ font-family:'IBM Plex Mono',monospace; font-size:20px; font-weight:600; }
.caja-wrap .stats-cols{ display:grid; grid-template-columns:1fr 1fr; gap:28px; position:relative; }
.caja-wrap .stats-cols::before{
  content:""; position:absolute; top:0; bottom:0; left:50%; width:2px;
  background:repeating-linear-gradient(0deg, var(--margin) 0px, var(--margin) 6px, transparent 6px, transparent 12px);
  transform:translateX(-1px);
}
.caja-wrap .stats-cols h4{ font-family:'Spectral',serif; font-size:13px; margin:0 0 12px; }

@media (max-width: 780px){
  .caja-wrap .stats-cols{ grid-template-columns:1fr; gap:20px; }
  .caja-wrap{ padding:20px 14px 60px; }
  .caja-wrap .layout{ grid-template-columns:1fr; }
  .caja-wrap .masthead{ flex-direction:column; align-items:flex-start; gap:14px; }
  .caja-wrap .masthead-right{ align-items:flex-start; width:100%; }
  .caja-wrap .mini-totales{ align-items:flex-start; }
  .caja-wrap .stats{ grid-template-columns:1fr; }
  .caja-wrap .addbar{ flex-wrap:wrap; gap:10px; }
  .caja-wrap .addbar > div{ flex-wrap:wrap; }
  .caja-wrap .form-row{ grid-template-columns:1fr 1fr; }
  .caja-wrap .cierre-grid{ grid-template-columns:1fr; }

  .caja-wrap .ledger{ overflow-x:visible; border:none; background:none; }
  .caja-wrap table{ table-layout:auto; }
  .caja-wrap thead{ display:none; }
  .caja-wrap tbody tr{
    display:block;
    background:var(--paper);
    border:1px solid var(--ink);
    margin-bottom:12px;
    padding:10px 12px;
  }
  .caja-wrap tbody tr.month-header{ border:none; background:none; padding:0; margin:18px 0 8px; }
  .caja-wrap tr.month-header td{ display:block; padding:0; }
  .caja-wrap tbody td{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:10px;
    padding:6px 0;
    border:none;
    border-bottom:1px dashed var(--rule);
  }
  .caja-wrap tbody td:last-child{ border-bottom:none; }
  .caja-wrap tbody td[data-label]::before{
    content: attr(data-label);
    font-family:'IBM Plex Mono',monospace;
    font-size:9.5px;
    text-transform:uppercase;
    letter-spacing:.06em;
    color:var(--ink-soft);
    flex-shrink:0;
  }
  .caja-wrap tbody td .cell-input, .caja-wrap tbody td select.cell-input{ text-align:right; }
  .caja-wrap td.del{ justify-content:flex-end; }
  .caja-wrap td.del::before{ display:none; }
}
`;
