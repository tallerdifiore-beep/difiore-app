import { useState, useEffect, useRef, useMemo, Fragment } from 'react'
import { supabase } from '../lib/supabase'
import { getMarca } from '../lib/marcas'
import styles from '../styles/App.module.css'
import * as XLSX from 'xlsx'

const LOGO_URL = 'https://gepusjdevpaxxkrgzyeb.supabase.co/storage/v1/object/public/assets/ChatGPT%20Image%2017%20jul%202026,%2015_11_05.png'

const IgIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
const FbIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
const WaIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
const MapIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C7.802 0 4 3.403 4 7.602 4 11.8 7.469 16.812 12 24c4.531-7.188 8-12.2 8-16.398C20 3.402 16.199 0 12 0zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/></svg>

function formatNum(val) {
  if (!val && val !== 0) return ''
  const n = val.toString().replace(/\D/g,'')
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
function parseNum(val) { return val.toString().replace(/\./g,'') }
// formatea el próximo número de documento a partir del último usado en la tabla numeracion
function formatNumeroDoc(ultimoUsado) { return '001-' + String((ultimoUsado||0)+1).padStart(5,'0') }
function formatNumeroFicha(ultimoUsado) { return 'C-' + String((ultimoUsado||0)+1).padStart(5,'0') }

const UMBRAL_ESTANCADOS_DEFAULT = 2
function diasDesde(fecha){ return Math.floor((new Date() - new Date(fecha)) / (1000*60*60*24)) }
// redondea a la media hora más cercana (0, 0.5, 1, 1.5...) y muestra sin decimales de más
function formatHoras(h){
  const redondeado=Math.ceil((h||0)*2)/2
  return redondeado%1===0?String(redondeado):redondeado.toFixed(1)
}

// Argentina no tiene horario de verano (siempre UTC-3), así que fijamos el offset a mano en vez de
// confiar en el huso horario configurado en cada dispositivo — así la hora sale bien sin importar
// cómo esté configurado el celu o la compu que use cada uno.
function datetimeLocalAFechaISO(str){
  if(!str) return null
  return new Date(str+':00-03:00').toISOString()
}
function fechaISOAInputLocal(iso){
  if(!iso) return ''
  const ms=new Date(iso).getTime()-3*60*60*1000
  const d=new Date(ms)
  const pad=n=>String(n).padStart(2,'0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}
function formatFechaAR(iso,conHora){
  if(!iso) return '—'
  const ms=new Date(iso).getTime()-3*60*60*1000
  const d=new Date(ms)
  const pad=n=>String(n).padStart(2,'0')
  const fecha=`${pad(d.getUTCDate())}/${pad(d.getUTCMonth()+1)}/${d.getUTCFullYear()}`
  return conHora?`${fecha} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`:fecha
}

const CATEGORIA_POR_TIPO = {
  ingreso:'Diagnóstico sin iniciar',
  diagnostico:'Diagnóstico',
  diagnostico_fin:'Esperando aprobación del cliente',
  cliente_aprobo:'Esperando pago de repuestos',
  cliente_pago:'Esperando que vayan a comprar repuestos',
  oficina_salio:'Comprando repuestos',
  repuestos_llegaron:'Esperando inicio de reparación',
  reparacion:'Reparación',
  trabajo_iniciado:'Reparación',
  service:'Service',
  esperando_retiro:'Esperando que el cliente retire el vehículo',
  repuesto_no_pactado:'Tiempo perdido por mal pedido de repuestos',
  mecanico_pide_repuestos:'Esperando repuestos',
  estado:'En proceso',
  prueba:'En prueba',
  motor:'Arreglo de motor',
  movimiento:'Cambio de taller',
  reingreso:'Reingreso',
  terceros:'Esperando a terceros',
  repuestos:'Esperando repuestos',
  aprobacion:'Esperando aprobación del cliente',
  elevador:'Esperando mecánico/elevador',
}
const CATEGORIAS_MUERTAS = ['Diagnóstico sin iniciar','Esperando a terceros','Esperando repuestos','Esperando aprobación del cliente','Esperando mecánico/elevador','Esperando pago de repuestos','Esperando que vayan a comprar repuestos','Esperando inicio de reparación','Tiempo perdido por mal pedido de repuestos','Esperando que el cliente retire el vehículo']
const CATEGORIAS_CLIENTE = ['Esperando aprobación del cliente','Esperando pago de repuestos','Esperando que el cliente retire el vehículo']
const TIPOS_ELEGIBLES_ESPERANDO_MECANICO=['ingreso','estado','elevador','repuestos_llegaron']
// dado un evento y el que le sigue, devuelve la categoría correcta (con el override de "esperando mecánico" si corresponde)
function categoriaDeEvento(eventos,i){
  const siguienteEsTrabajoIniciado=(eventos[i+1]?.tipo==='trabajo_iniciado'||eventos[i+1]?.tipo==='reparacion')&&TIPOS_ELEGIBLES_ESPERANDO_MECANICO.includes(eventos[i].tipo)
  return siguienteEsTrabajoIniciado?'Esperando mecánico/elevador':(CATEGORIA_POR_TIPO[eventos[i].tipo]||'Otro')
}

// calcula, para un trabajo, cuántas horas pasó en cada categoría, a partir del ingreso, cada actualización, y la salida (o ahora si sigue en curso)
const HORARIO_APERTURA_HORA=8, HORARIO_APERTURA_MIN=30, HORARIO_CIERRE=18
const MES_INICIO_CONTROL_TIEMPOS='2026-08' // no mirar hacia atrás de este mes en Histórico ni en Por marca
const DIAS_LABORALES=[1,2,3,4,5] // lunes a viernes (0=domingo, 6=sábado)

// separa las horas entre dos fechas en "laborales" (dentro del horario del taller) y "no laborales" (de noche o fin de semana)
function horasLaboralesEntre(inicio,fin){
  let laborales=0
  let cursor=new Date(inicio.getTime()-3*60*60*1000) // pasamos a hora Argentina para que los límites de día caigan bien
  const finAR=new Date(fin.getTime()-3*60*60*1000)
  const inicioAR=new Date(inicio.getTime()-3*60*60*1000)
  while(cursor<finAR){
    const diaSemana=cursor.getUTCDay()
    const inicioDiaLaboral=new Date(Date.UTC(cursor.getUTCFullYear(),cursor.getUTCMonth(),cursor.getUTCDate(),HORARIO_APERTURA_HORA,HORARIO_APERTURA_MIN,0))
    const finDiaLaboral=new Date(Date.UTC(cursor.getUTCFullYear(),cursor.getUTCMonth(),cursor.getUTCDate(),HORARIO_CIERRE,0,0))
    if(DIAS_LABORALES.includes(diaSemana)){
      const inicioEfectivo=cursor>inicioDiaLaboral?cursor:inicioDiaLaboral
      const finEfectivo=finAR<finDiaLaboral?finAR:finDiaLaboral
      if(inicioEfectivo<finEfectivo)laborales+=(finEfectivo-inicioEfectivo)/(1000*60*60)
    }
    cursor=new Date(Date.UTC(cursor.getUTCFullYear(),cursor.getUTCMonth(),cursor.getUTCDate()+1,0,0,0))
  }
  const totalHoras=(finAR-inicioAR)/(1000*60*60)
  return{laborales:Math.max(0,laborales),noLaborales:Math.max(0,totalHoras-laborales)}
}

function calcularTiemposTrabajo(trabajo, actualizacionesTrabajo){
  const eventos=[{tipo:'ingreso',fecha:trabajo.fecha_ingreso},...actualizacionesTrabajo]
    .filter(e=>e.fecha)
    .sort((a,b)=>new Date(a.fecha)-new Date(b.fecha))
  const fin=trabajo.fecha_salida?new Date(trabajo.fecha_salida):new Date()
  const categorias={}
  for(let i=0;i<eventos.length;i++){
    const inicio=new Date(eventos[i].fecha)
    const finSeg=i+1<eventos.length?new Date(eventos[i+1].fecha):fin
    if(finSeg<=inicio)continue
    const{laborales}=horasLaboralesEntre(inicio,finSeg)
    const cat=categoriaDeEvento(eventos,i)
    categorias[cat]=(categorias[cat]||0)+laborales
    // las horas fuera de horario simplemente no se suman a ninguna categoría — no cuentan como "motivo", solo evitan que se infle otra categoría con la noche/fin de semana
  }
  return categorias
}

// para un tipo de evento puntual (diagnostico, reparacion) con mecánico asignado, calcula cantidad y horas promedio por mecánico
// para cada actualización que tenga mecánico asignado (cualquier categoría), calcula cantidad y horas promedio por mecánico + categoría
function calcularStatsMecanicoGeneral(trabajosDelMes, actualizacionesRaw){
  const porMecanico={}
  trabajosDelMes.forEach(t=>{
    const eventos=[{tipo:'ingreso',fecha:t.fecha_ingreso},...actualizacionesRaw.filter(a=>a.trabajo_id===t.id)]
      .filter(e=>e.fecha).sort((a,b)=>new Date(a.fecha)-new Date(b.fecha))
    const fin=t.fecha_salida?new Date(t.fecha_salida):new Date()
    for(let i=0;i<eventos.length;i++){
      if(!eventos[i].mecanico)continue
      const inicio=new Date(eventos[i].fecha)
      const finSeg=i+1<eventos.length?new Date(eventos[i+1].fecha):fin
      if(finSeg<=inicio)continue
      const{laborales}=horasLaboralesEntre(inicio,finSeg)
      const cat=categoriaDeEvento(eventos,i)
      const m=eventos[i].mecanico
      if(!porMecanico[m])porMecanico[m]=[]
      porMecanico[m].push({trabajo:t,categoria:cat,horas:laborales,fecha:eventos[i].fecha})
    }
  })
  return Object.entries(porMecanico).map(([mecanico,items])=>({
    mecanico,
    cantidad:items.length,
    horasTotal:items.reduce((a,i)=>a+i.horas,0),
    items:items.sort((a,b)=>b.horas-a.horas)
  })).sort((a,b)=>a.mecanico.localeCompare(b.mecanico))
}

// calcula eficiencia/motivo principal de un mes arbitrario (para el histórico), reutilizando la misma lógica de categorización
function calcularResumenMes(trabajosVivos, actualizacionesRaw, mesStr){
  const trabajosDelMes=trabajosVivos.filter(t=>t.fecha_ingreso&&t.fecha_ingreso.slice(0,7)===mesStr&&!t.excluir_tiempos)
  const totalesPorCategoria={}
  trabajosDelMes.forEach(t=>{
    const eventos=actualizacionesRaw.filter(a=>a.trabajo_id===t.id)
    const categorias=calcularTiemposTrabajo(t,eventos)
    Object.entries(categorias).forEach(([cat,h])=>{totalesPorCategoria[cat]=(totalesPorCategoria[cat]||0)+h})
  })
  const horasMuertas=Object.entries(totalesPorCategoria).filter(([cat])=>CATEGORIAS_MUERTAS.includes(cat)).reduce((a,[,h])=>a+h,0)
  const horasTotales=Object.values(totalesPorCategoria).reduce((a,b)=>a+b,0)
  const eficiencia=horasTotales>0?Math.round(((horasTotales-horasMuertas)/horasTotales)*100):0
  const motivoGeneral=Object.entries(totalesPorCategoria).filter(([cat])=>CATEGORIAS_MUERTAS.includes(cat)).sort((a,b)=>b[1]-a[1])[0]
  return{mes:mesStr,eficiencia,motivoGeneral,horasMuertas,cantidadVehiculos:trabajosDelMes.length}
}

// calcula, por mecánico, cuántas reparaciones hizo en total y cuántas de esas terminaron en un reingreso al taller
function calcularRetrabajoPorMecanico(trabajos, actualizacionesRaw, reingresosRaw){
  const stats={}
  actualizacionesRaw.forEach(a=>{
    if((a.tipo==='reparacion'||a.tipo==='trabajo_iniciado')&&a.mecanico){
      if(!stats[a.mecanico])stats[a.mecanico]={reparaciones:new Set(),retrabajos:new Set()}
      stats[a.mecanico].reparaciones.add(a.trabajo_id)
    }
  })
  reingresosRaw.forEach(h=>{
    const trabajoNuevo=trabajos.find(t=>t.id===h.trabajo_id)
    if(!trabajoNuevo?.vehiculos?.id)return
    const anteriores=trabajos.filter(t=>t.vehiculos?.id===trabajoNuevo.vehiculos.id&&t.id!==trabajoNuevo.id&&new Date(t.fecha_ingreso)<new Date(trabajoNuevo.fecha_ingreso))
      .sort((a,b)=>new Date(b.fecha_ingreso)-new Date(a.fecha_ingreso))
    const anterior=anteriores[0]
    if(!anterior)return
    const mecanicosQueRepararon=new Set(actualizacionesRaw.filter(a=>a.trabajo_id===anterior.id&&(a.tipo==='reparacion'||a.tipo==='trabajo_iniciado')&&a.mecanico).map(a=>a.mecanico))
    mecanicosQueRepararon.forEach(m=>{
      if(!stats[m])stats[m]={reparaciones:new Set(),retrabajos:new Set()}
      stats[m].retrabajos.add(anterior.id)
    })
  })
  return Object.entries(stats).map(([mecanico,{reparaciones,retrabajos}])=>({mecanico,totalReparaciones:reparaciones.size,retrabajos:retrabajos.size})).sort((a,b)=>b.retrabajos-a.retrabajos)
}

// horas de reparación promedio por marca de vehículo, en base a todo el historial (no solo el mes seleccionado)
function calcularTiempoPorMarca(trabajosVivos, actualizacionesRaw){
  const porMarca={}
  trabajosVivos.forEach(t=>{
    const eventos=actualizacionesRaw.filter(a=>a.trabajo_id===t.id)
    const categorias=calcularTiemposTrabajo(t,eventos)
    const horasReparacion=(categorias['Reparación']||0)
    if(horasReparacion<=0)return
    const marca=getMarca(t.vehiculos?.marca_modelo)
    if(!porMarca[marca])porMarca[marca]={horas:0,cantidad:0}
    porMarca[marca].horas+=horasReparacion
    porMarca[marca].cantidad++
  })
  return Object.entries(porMarca).map(([marca,{horas,cantidad}])=>({marca,promedio:horas/cantidad,cantidad})).sort((a,b)=>b.promedio-a.promedio)
}

// máxima cantidad de vehículos distintos que un mecánico tuvo "abiertos" el mismo día calendario
function calcularCargaMaxima(items){
  const porDia={}
  items.forEach(it=>{
    if(!it.fecha)return
    const dia=new Date(it.fecha).toISOString().slice(0,10)
    if(!porDia[dia])porDia[dia]=new Set()
    porDia[dia].add(it.trabajo.id)
  })
  return Math.max(0,...Object.values(porDia).map(s=>s.size))
}

// redimensiona y comprime una foto en el navegador antes de subirla, para no llenar el storage con fotos de celular sin comprimir
function comprimirImagen(file, maxAncho=1600, calidad=0.75) {
  return new Promise((resolve) => {
    if (!file.type || !file.type.startsWith('image/')) { resolve(file); return }
    const lector = new FileReader()
    lector.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxAncho) { height = Math.round(height * (maxAncho / width)); width = maxAncho }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return }
          const nombreJpg = file.name.replace(/\.\w+$/, '') + '.jpg'
          resolve(new File([blob], nombreJpg, { type: 'image/jpeg' }))
        }, 'image/jpeg', calidad)
      }
      img.onerror = () => resolve(file)
      img.src = e.target.result
    }
    lector.onerror = () => resolve(file)
    lector.readAsDataURL(file)
  })
}

const CHECKLIST_ITEMS = [
  'BATERIA DE VEHICULO','LÍQUIDOS/FLUIDOS','RUEDAS AJUSTADAS','ENTREGA COMO FOTOS',
  'MOTOR LAVADO','LAVADO DE VEHICULO','CHEQUEADA EN CALLE','TAPA CUBRE MOTOR',
  'ELECTRO 2 VECES PROBADO','CHECK/TESTIGOS APAGADOS','INTERIOR LIMPIO','CHAPÓN',
  'ACEITE DE DIFERENCIAL Y ACEITE DE CAJA'
]

const CHECKLIST_ITEMS_INYECTORES = [
  'FOTO DE CÓDIGO DE INYECTORES CARGADA EN LA PÁGINA',
  'TANQUE LIMPIO',
  'RAMPA DE INYECTORES LIMPIA',
  'CAÑERÍA DE GASOIL Y DE INYECTORES REPARADO LIMPIA',
  'ELECTROVÁLVULAS DE BOMBA: LIMPIEZA POR ULTRASONIDO',
  'FILTRO DE GASOIL NUEVO',
  'ARANDELAS Y O-RINGS NUEVOS',
  'MARCA DEL TALLER EN LOS INYECTORES INSTALADOS',
  'GASOIL NUEVO CARGADO',
  'PURGADO DE LÍNEA DE BAJA (SCANNER O MANUAL)',
  'TORNILLOS MARCADOS (ANTI-AFLOJE)'
]

const CHECKLIST_ITEMS_POR_TIPO = { entrega: CHECKLIST_ITEMS, inyectores: CHECKLIST_ITEMS_INYECTORES }
const CHECKLIST_TITULO_POR_TIPO = { entrega: 'Checklist de Entrega', inyectores: 'Checklist de Inyectores' }

function itemsVacios(tipo){
  return CHECKLIST_ITEMS_POR_TIPO[tipo].reduce((a,k)=>({...a,[k]:{valor:'',obs:''}}),{})
}

const PROCEDIMIENTO_INYECTORES = [
  {titulo:'Sacar inyectores y diagnosticar', descripcion:'Sacar los inyectores del vehículo y llevarlos a diagnosticar.'},
  {titulo:'Foto del código de inyectores', descripcion:'Una vez reparado los inyectores, sacarle foto al código y cargarlo en la página.'},
  {titulo:'Tanque limpio', descripcion:'Dejar el tanque limpio.'},
  {titulo:'Limpieza de rampa y cañerías', descripcion:'Limpiar la rampa de inyectores, la cañería de gasoil y la de inyectores reparado.'},
  {titulo:'Electroválvulas de la bomba', descripcion:'Sacar las electroválvulas de la bomba y hacer limpieza por ultrasonido.'},
  {titulo:'Filtro de gasoil nuevo', descripcion:'Colocar filtro de gasoil nuevo.'},
  {titulo:'Arandelas y o-rings nuevos', descripcion:'Colocar siempre arandelas y o-rings nuevos.'},
  {titulo:'Marca del taller', descripcion:'Marcar con la marca del taller los inyectores que se instalaron en el vehículo.'},
  {titulo:'Gasoil nuevo y purgado', descripcion:'Colocar gasoil nuevo y realizar un purgado de la línea de baja, con escáner o manualmente.'},
  {titulo:'Marcar los tornillos', descripcion:'Marcar los tornillos para que no se pueda aflojar.'},
]

const MAX_TURNOS_POR_DIA = 4
const DIAS_SEMANA = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const footerIconsHTML = `
  <a class="footer-icon" href="https://maps.google.com/maps?ftid=0x9584d9005992c969:0x872bb0a9e0f1a2f1"><svg width="12" height="12" viewBox="0 0 24 24" fill="#EA4335"><path d="M12 0C7.802 0 4 3.403 4 7.602 4 11.8 7.469 16.812 12 24c4.531-7.188 8-12.2 8-16.398C20 3.402 16.199 0 12 0zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/></svg>Malvinas Argentinas 2084, MdP</a>
  <a class="footer-icon" href="tel:+542235299700"><svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>223 529-9700</a>
  <a class="footer-icon" href="https://www.instagram.com/di_fiore_mecanica/"><svg width="12" height="12" viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>@di_fiore_mecanica</a>
  <a class="footer-icon" href="https://www.facebook.com/share/19VHZRovXq/"><svg width="12" height="12" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>di_fiore_mecanica</a>`

const baseCSS = `
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:Arial,sans-serif; font-size:11px; color:#000; padding:12px; max-width:720px; margin:0 auto; }
.header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; border-bottom:2px solid #000; padding-bottom:6px; }
.header-logo { width:160px; } .header-logo img { width:100%; }
.header-center { text-align:center; flex:1; }
.header-center h1 { font-size:15px; font-weight:900; letter-spacing:1px; margin-bottom:2px; }
.header-center .brand { font-size:12px; font-weight:900; color:#1a56db; letter-spacing:2px; }
.folio { text-align:right; font-size:9px; font-weight:bold; }
.folio-num { font-size:20px; font-weight:900; border-bottom:2px solid #000; display:inline-block; min-width:60px; text-align:center; }
.body { display:grid; grid-template-columns:1fr 1fr; gap:0 16px; margin:8px 0; }
.field { margin-bottom:5px; }
.field label { font-size:9px; color:#444; display:block; }
.field .val { border-bottom:1px solid #000; min-height:15px; font-size:11px; font-weight:600; padding:1px 0; }
.section-title { background:#222; color:#fff; text-align:center; font-weight:bold; font-size:10px; padding:3px; margin:6px 0 0; letter-spacing:1px; }
.grua-seg { display:flex; gap:16px; margin-bottom:4px; }
.grua-item { display:flex; gap:8px; align-items:center; font-size:10px; }
.checkbox { display:inline-flex; align-items:center; gap:4px; }
.box { width:11px; height:11px; border:1.5px solid #000; display:inline-block; vertical-align:middle; text-align:center; line-height:11px; font-size:9px; font-weight:bold; }
.trabajo-box { position:relative; border:1px solid #ccc; border-top:none; }
.trabajo-lineas { position:absolute; top:0; left:0; right:0; bottom:0; display:flex; flex-direction:column; pointer-events:none; }
.trabajo-lineas div { border-bottom:1px solid #ddd; flex:1; }
.trabajo-lineas div:last-child { border-bottom:none; }
.trabajo-texto { position:relative; padding:6px 10px; font-size:13px; font-weight:500; min-height:210px; }
.trabajo-texto div { line-height:2.1; }
.acepto { text-align:center; margin-top:8px; font-size:10px; letter-spacing:2px; }
.acepto-line { display:flex; justify-content:center; align-items:center; gap:20px; margin-top:5px; }
.firma { border-bottom:1px solid #000; width:150px; }
.footer { margin-top:8px; border-top:1px solid #ccc; padding-top:5px; display:flex; gap:10px; align-items:center; flex-wrap:wrap; font-size:9px; color:#444; }
.footer-icon { display:flex; align-items:center; gap:4px; text-decoration:none; color:#444; }
@media print { body { padding:6px; } @page { margin:0.5cm; } }`

const tcHTML = `
<div class="tc">
  <div class="tc-title">TÉRMINOS Y CONDICIONES</div>
  <div class="tc-grid">
    <div class="tc-item"><b>1. Ingreso al taller</b>Al ingresar el vehículo, el cliente deberá abonar $150.000 correspondientes al diagnóstico inicial (*). En caso de aceptar el trabajo, el valor del diagnóstico se descuenta de la mano de obra.</div>
    <div class="tc-item"><b>2. Diagnóstico</b>El diagnóstico es para que los profesionales tengan un panorama del problema. El taller no está obligado a enviar reportes periódicos; al final se entregará un informe detallado del trabajo realizado.</div>
    <div class="tc-item"><b>3. Presupuesto y aceptación</b>Una vez realizado el diagnóstico se enviará el detalle de repuestos y mano de obra. Si el cliente acepta, contará con 48hs hábiles para entregar el importe y dar inicio a la reparación.</div>
    <div class="tc-item"><b>4. Vencimiento / Cochera</b>Si pasadas las 48hs hábiles no se realizó el pago, se cobrará cochera a $8.000/día. Las mismas condiciones aplican una vez notificada la finalización del trabajo.</div>
    <div class="tc-item"><b>5. Prueba de manejo</b>El cliente presta su consentimiento para que el vehículo sea probado en calle entre 10 y 100 km, a fin de realizar las pruebas correspondientes al diagnóstico o reparación.</div>
    <div class="tc-item"><b>6. Seguro vigente</b>El cliente declara entregar el vehículo con la póliza de seguro al día. Di Fiore no se responsabiliza por siniestros en caso de que el seguro no se encuentre vigente.</div>
    <div class="tc-item"><b>7. Pertenencias</b>El cliente deberá retirar todas las pertenencias personales. Di Fiore no se responsabiliza por objetos personales en el interior del vehículo.</div>
    <div class="tc-item"><b>8. Plazos de pago</b>El plazo máximo para abonar el total del trabajo es el día del retiro del vehículo.</div>
    <div class="tc-item"><b>9. Garantía (30 días desde la entrega)</b>El taller proveerá materiales, repuestos y trabajos tercerizados. La garantía es sobre el trabajo en el vehículo y NO incluye traslados. NO TRABAJAMOS DE OTRA MANERA.</div>
    <div class="tc-item"><b>10. Entrega</b>El cliente podrá retirar su vehículo hasta las 17hs con previa coordinación.</div>
  </div>
  <div style="display:flex;gap:30px;margin-top:8px;font-size:9px;">
    <div>Fecha: ___________________</div>
    <div>Patente: ___________________</div>
    <div style="flex:1;text-align:right;">Firma y aclaración: ___________________</div>
  </div>
</div>`

const autocompleteSyle={position:'absolute',top:'100%',left:0,right:0,background:'white',border:'1px solid #CBD5E0',borderRadius:'6px',zIndex:100,boxShadow:'0 4px 12px rgba(0,0,0,.1)',maxHeight:'200px',overflowY:'auto'}
const autocompleteItemStyle={padding:'8px 12px',cursor:'pointer',fontSize:'13px',borderBottom:'1px solid #F7FAFC'}

// buscador de cliente reutilizable: recibe la lista de trabajos y una función onSeleccionar(trabajo)
function BuscadorCliente({ trabajos, onSeleccionar, placeholder }) {
  const [texto, setTexto] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  function buscar(q) {
    setTexto(q)
    if (!q || q.length < 2) { setSugerencias([]); return }
    const ql = q.toLowerCase()
    setSugerencias(trabajos.filter(t=>t.vehiculos?.clientes?.nombre?.toLowerCase().includes(ql)||t.vehiculos?.patente?.toLowerCase().includes(ql)||t.vehiculos?.marca_modelo?.toLowerCase().includes(ql)).slice(0,6))
  }
  function seleccionar(t) {
    onSeleccionar(t)
    setTexto('')
    setSugerencias([])
  }
  return (
    <div style={{position:'relative'}}>
      <input value={texto} onChange={e=>buscar(e.target.value)} placeholder={placeholder||'Escribí nombre, patente o vehículo...'}/>
      {sugerencias.length>0 && <div style={autocompleteSyle}>{sugerencias.map(t=>
        <div key={t.id} style={autocompleteItemStyle} onMouseOver={e=>e.currentTarget.style.background='#F7FAFC'} onMouseOut={e=>e.currentTarget.style.background='white'} onClick={()=>seleccionar(t)}>
          <b>{t.vehiculos?.clientes?.nombre}</b> — {t.vehiculos?.marca_modelo} · {t.vehiculos?.patente}
        </div>
      )}</div>}
    </div>
  )
}

// visor de foto ampliada con zoom (scroll/pellizco) y arrastre para mover cuando está ampliada
function FotoZoomViewer({ url, onClose, styles }) {
  const [escala, setEscala] = useState(1)
  const [pos, setPos] = useState({x:0,y:0})
  const arrastrando = useRef(false)
  const ultimoPunto = useRef({x:0,y:0})
  const distanciaPellizco = useRef(null)

  function manejarWheel(e){
    e.preventDefault()
    const delta = e.deltaY < 0 ? 0.3 : -0.3
    setEscala(prev => { const n = Math.min(5, Math.max(1, prev + delta)); if(n===1) setPos({x:0,y:0}); return n })
  }
  function puntoDe(e){ return e.touches ? e.touches[0] : e }
  function distanciaEntre(t1,t2){ return Math.hypot(t1.clientX-t2.clientX, t1.clientY-t2.clientY) }

  function iniciar(e){
    if(e.touches && e.touches.length===2){
      distanciaPellizco.current = distanciaEntre(e.touches[0], e.touches[1])
      return
    }
    if(escala<=1) return
    arrastrando.current = true
    const p = puntoDe(e)
    ultimoPunto.current = {x:p.clientX, y:p.clientY}
  }
  function mover(e){
    if(e.touches && e.touches.length===2 && distanciaPellizco.current){
      const nueva = distanciaEntre(e.touches[0], e.touches[1])
      const factor = nueva / distanciaPellizco.current
      distanciaPellizco.current = nueva
      setEscala(prev => Math.min(5, Math.max(1, prev * factor)))
      return
    }
    if(!arrastrando.current) return
    const p = puntoDe(e)
    const dx = p.clientX - ultimoPunto.current.x
    const dy = p.clientY - ultimoPunto.current.y
    ultimoPunto.current = {x:p.clientX, y:p.clientY}
    setPos(prev => ({x:prev.x+dx, y:prev.y+dy}))
  }
  function terminar(){ arrastrando.current = false; distanciaPellizco.current = null }
  function dobleClick(e){
    e.stopPropagation()
    if(escala>1){ setEscala(1); setPos({x:0,y:0}) } else { setEscala(2.5) }
  }

  return (
    <div className={styles.modalOverlay} onClick={e=>{if(e.target===e.currentTarget)onClose()}} style={{cursor:escala>1?'grab':'default',touchAction:'none',overflow:'hidden'}}>
      <div style={{position:'fixed',top:'16px',right:'16px',display:'flex',gap:'8px',zIndex:10}}>
        <button onClick={e=>{e.stopPropagation();setEscala(s=>Math.max(1,s-0.5));if(escala-0.5<=1)setPos({x:0,y:0})}} style={{width:'36px',height:'36px',borderRadius:'8px',border:'none',background:'rgba(255,255,255,.9)',fontSize:'18px',cursor:'pointer',fontWeight:'700'}}>−</button>
        <button onClick={e=>{e.stopPropagation();setEscala(1);setPos({x:0,y:0})}} style={{padding:'0 12px',height:'36px',borderRadius:'8px',border:'none',background:'rgba(255,255,255,.9)',fontSize:'12px',cursor:'pointer',fontWeight:'700'}}>1:1</button>
        <button onClick={e=>{e.stopPropagation();setEscala(s=>Math.min(5,s+0.5))}} style={{width:'36px',height:'36px',borderRadius:'8px',border:'none',background:'rgba(255,255,255,.9)',fontSize:'18px',cursor:'pointer',fontWeight:'700'}}>+</button>
        <button onClick={e=>{e.stopPropagation();onClose()}} style={{width:'36px',height:'36px',borderRadius:'8px',border:'none',background:'rgba(255,255,255,.9)',fontSize:'16px',cursor:'pointer',fontWeight:'700'}}>✕</button>
      </div>
      <img
        src={url} alt="zoom" draggable={false}
        onWheel={manejarWheel} onDoubleClick={dobleClick}
        onMouseDown={iniciar} onMouseMove={mover} onMouseUp={terminar} onMouseLeave={terminar}
        onTouchStart={iniciar} onTouchMove={mover} onTouchEnd={terminar}
        style={{
          maxWidth:'90vw',maxHeight:'90vh',objectFit:'contain',borderRadius:'8px',
          transform:`scale(${escala}) translate(${pos.x/escala}px, ${pos.y/escala}px)`,
          transition:arrastrando.current?'none':'transform .15s',
          cursor:escala>1?'grab':'zoom-in',userSelect:'none'
        }}
      />
    </div>
  )
}

export default function Home({ rol, cerrarSesion }) {
  const admin = rol === 'admin'
  const [seccion, setSeccion] = useState('dashboard')
  const [tallerVista, setTallerVista] = useState(null)
  const [vistaStats, setVistaStats] = useState(null)
  const [vistaMarca, setVistaMarca] = useState(null)
  const [verEntregados, setVerEntregados] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [clientes, setClientes] = useState([])
  const [trabajos, setTrabajos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [busquedaEntregados, setBusquedaEntregados] = useState('')
  const [limiteClientes, setLimiteClientes] = useState(40)
  const [limiteChecklists, setLimiteChecklists] = useState(40)
  const [busquedaChecklist, setBusquedaChecklist] = useState('')
  const [numeracion, setNumeracion] = useState({presupuesto:0, recibo:0, cliente:0})
  const [presupuestos, setPresupuestos] = useState([])
  const [presupuestosDetalle, setPresupuestosDetalle] = useState([])
  const [reingresosRaw, setReingresosRaw] = useState([])
  const [actualizacionesRaw, setActualizacionesRaw] = useState([])
  const [checklistsDetalle, setChecklistsDetalle] = useState([])
  const [vistaPresupuesto, setVistaPresupuesto] = useState('nuevo') // 'nuevo' | 'lista'
  const [presupuestoActivo, setPresupuestoActivo] = useState(null)
  const [editandoPresupuesto, setEditandoPresupuesto] = useState(false)
  const [guardandoPresupuesto, setGuardandoPresupuesto] = useState(false)
  const [busquedaPresupuestos, setBusquedaPresupuestos] = useState('')
  const [busquedaGlobal, setBusquedaGlobal] = useState('')
  const [planDiario, setPlanDiario] = useState([])
  const [fechaPlan, setFechaPlan] = useState(new Date().toISOString().split('T')[0])
  const [modalAgregarPlan, setModalAgregarPlan] = useState(null) // 'vehiculo' | 'suelta' | null
  const [formTareaVehiculo, setFormTareaVehiculo] = useState({trabajo_id:'',vehiculo:'',descripcion:'',mecanico:''})
  const [formTareaSuelta, setFormTareaSuelta] = useState({descripcion:'',mecanico:''})
  const [guardandoTareaPlan, setGuardandoTareaPlan] = useState(false)
  const [mesInforme, setMesInforme] = useState(new Date().toISOString().slice(0,7))
  const [empleados, setEmpleados] = useState([])
  const [checklists, setChecklists] = useState([])
  const [checklistActivo, setChecklistActivo] = useState(null)
  const [editandoChecklist, setEditandoChecklist] = useState(false)
  const [vistaChecklist, setVistaChecklist] = useState('lista')
  const [tipoChecklist, setTipoChecklist] = useState('entrega') // 'entrega' | 'inyectores'
  const [fotosChecklistSubidas, setFotosChecklistSubidas] = useState([])
  const [subiendoFotoChecklist, setSubiendoFotoChecklist] = useState(false)
  const [empleadoActual, setEmpleadoActual] = useState('')
  const [formChecklist, setFormChecklist] = useState({
    trabajo_id:'', vehiculo:'', patente:'', color:'', tipo:'entrega',
    fecha_entrega: new Date().toISOString().split('T')[0],
    mecanico:'', observacion_general:'',
    items: itemsVacios('entrega')
  })
  const [nuevoEmpleado, setNuevoEmpleado] = useState({nombre:'',rol:'mecanico'})
  const [turnos, setTurnos] = useState([])
  const [formTurno, setFormTurno] = useState({nombre:'',telefono:'',vehiculo:'',fecha:'',motivo:''})
  const [editandoTurno, setEditandoTurno] = useState(null)
  const [mostrarFormTurno, setMostrarFormTurno] = useState(false)
  const [verRecordatorios, setVerRecordatorios] = useState(false)
  const [mesTiempos, setMesTiempos] = useState(new Date().toISOString().slice(0,7))
  const [vistaTiempos, setVistaTiempos] = useState('motivos')
  const [mecanicoSeleccionadoTiempos, setMecanicoSeleccionadoTiempos] = useState(null)
  const [trabajoSeleccionadoTiempos, setTrabajoSeleccionadoTiempos] = useState(null)
  const [costoHoraTaller, setCostoHoraTaller] = useState(0)
  const [editandoCostoHora, setEditandoCostoHora] = useState(false)
  const [costoHoraTemp, setCostoHoraTemp] = useState('')
  const [umbralEstancados, setUmbralEstancados] = useState(UMBRAL_ESTANCADOS_DEFAULT)
  const [editandoUmbral, setEditandoUmbral] = useState(false)
  const [mostrarExcluidosEstancados, setMostrarExcluidosEstancados] = useState(false)
  const [mostrarExcluidosTiempos, setMostrarExcluidosTiempos] = useState(false)
  const [umbralTemp, setUmbralTemp] = useState('')
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [mesCalendario, setMesCalendario] = useState(new Date())
  const [form, setForm] = useState({
    nombre:'',telefono:'',email:'',marca_modelo:'',patente:'',anio:'',kilometraje:'',color:'',
    motivo:'',estado:'Diagnóstico',mecanico:'',taller:'Malvinas 2084',llego_en_grua:false,tiene_seguro:false,fecha_ingreso_manual:''
  })
  const [fotoNuevo, setFotoNuevo] = useState([])
  const [clienteDetalle, setClienteDetalle] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [modalSalida, setModalSalida] = useState(null)
  const [observacionFinal, setObservacionFinal] = useState('')
  const [fechaSalidaManual, setFechaSalidaManual] = useState('')
  const [modalReingreso, setModalReingreso] = useState(null)
  const [formReingreso, setFormReingreso] = useState({motivo:'',mecanico:'',taller:'Malvinas 2084',estado:'Diagnóstico',llego_en_grua:false,fecha_ingreso_manual:''})
  const [guardandoReingreso, setGuardandoReingreso] = useState(false)
  const [modalEditar, setModalEditar] = useState(null)
  const [formEditar, setFormEditar] = useState({})
  const [fotos, setFotos] = useState([])
  const [fotosAnteriores, setFotosAnteriores] = useState([])
  const [modalFotosAnteriores, setModalFotosAnteriores] = useState(false)
  const [historial, setHistorial] = useState([])
  const [repuestos, setRepuestos] = useState([])
  const [modalActualizar, setModalActualizar] = useState(null)
  const [modalEditarFecha, setModalEditarFecha] = useState(null)
  const [nuevaFechaHistorial, setNuevaFechaHistorial] = useState('')
  const [nuevoMecanicoHistorial, setNuevoMecanicoHistorial] = useState('')
  const [guardandoFechaHistorial, setGuardandoFechaHistorial] = useState(false)
  const [modalRepuesto, setModalRepuesto] = useState(null)
  const [modalEditarRepuesto, setModalEditarRepuesto] = useState(null)
  const [formEditarRepuesto, setFormEditarRepuesto] = useState({nombre:'',valor:'',lugar:'',fecha:''})
  const [modalFotos, setModalFotos] = useState(null)
  const [modalFotosData, setModalFotosData] = useState([])
  const [fotoZoom, setFotoZoom] = useState(null)
  const [modalWsp, setModalWsp] = useState(null)
  const [msgWsp, setMsgWsp] = useState('')
  const [formRepuesto, setFormRepuesto] = useState({nombre:'',valor:'',lugar:'',fecha:new Date().toISOString().split('T')[0]})
  const [formActualizar, setFormActualizar] = useState({tipo:'estado',descripcion:'',taller_nuevo:'Malvinas 3906',mecanico:'',fecha_manual:''})
  const [subiendo, setSubiendo] = useState(false)
  const [presupuesto, setPresupuesto] = useState({
    numero:'001-00001', fecha:new Date().toISOString().split('T')[0],
    cliente:'', vehiculo:'', trabajo_id:'',
    items:[{descripcion:'',precio_unitario:'',total:'',es_mano_obra:false}],
    notas:'', moneda_mano_obra:'ARS',
    descuento_concepto:'Descuento por diagnóstico', descuento_monto:'', aplicar_descuento:false,
    mostrar_transferencia:false, transferencia_repuestos:true, transferencia_mano_obra:false
  })
  const [recibo, setRecibo] = useState({
    numero:'001-00001', fecha:new Date().toISOString().split('T')[0],
    cliente:'', vehiculo:'', patente:'', trabajo_id:'',
    concepto:'', monto:'', moneda:'ARS', forma_pago:'Efectivo', observaciones:''
  })
  const fileRef = useRef()
  const fileNuevoRef = useRef()
  const fileFotosRef = useRef()
  const fileChecklistFotoRef = useRef()

  // sistema propio de confirmación/aviso, reemplaza alert()/confirm() nativos
  const [toast, setToast] = useState(null) // {mensaje, tipo}
  const [confirmDialog, setConfirmDialog] = useState(null) // {mensaje, onConfirm}
  function avisar(mensaje, tipo='info'){ setToast({mensaje,tipo}); setTimeout(()=>setToast(null), 3200) }
  function pedirConfirmacion(mensaje, onConfirm){ setConfirmDialog({mensaje,onConfirm}) }

  // banderas de "guardando" para evitar doble click / doble insert
  const [guardandoCliente, setGuardandoCliente] = useState(false)
  const [guardandoChecklist, setGuardandoChecklist] = useState(false)
  const [guardandoEmpleado, setGuardandoEmpleado] = useState(false)
  const [guardandoTurnoForm, setGuardandoTurnoForm] = useState(false)
  const [guardandoEdicion, setGuardandoEdicion] = useState(false)
  const [guardandoActualizacion, setGuardandoActualizacion] = useState(false)
  const [guardandoRepuesto, setGuardandoRepuesto] = useState(false)
  const [guardandoEdicionRepuesto, setGuardandoEdicionRepuesto] = useState(false)
  const [guardandoSalida, setGuardandoSalida] = useState(false)

  const [verPapelera, setVerPapelera] = useState(false)

  useEffect(() => { cargarDatos(); cargarNumeracion(); cargarReingresos(); cargarActualizacionesGlobal(); cargarUmbralEstancados(); cargarCostoHoraTaller() }, [])

  // carga de a partes: presupuestos y plan del día recién cuando se visita esa sección, no en cada carga de la app
  const [presupuestosCargados, setPresupuestosCargados] = useState(false)
  const [planDiarioCargado, setPlanDiarioCargado] = useState(false)
  useEffect(() => {
    if((seccion==='presupuesto'||seccion==='tiempos')&&!presupuestosCargados){ cargarPresupuestos(); setPresupuestosCargados(true) }
    if(seccion==='plandia'&&!planDiarioCargado){ cargarPlanDiario(fechaPlan); setPlanDiarioCargado(true) }
  }, [seccion])

  function seleccionarClientePresupuesto(t) {
    setPresupuesto({...presupuesto,cliente:t.vehiculos?.clientes?.nombre||'',vehiculo:t.vehiculos?.marca_modelo||'',trabajo_id:t.id})
  }
  function seleccionarClienteRecibo(t) {
    setRecibo({...recibo,cliente:t.vehiculos?.clientes?.nombre||'',vehiculo:t.vehiculos?.marca_modelo||'',patente:t.vehiculos?.patente||'',trabajo_id:t.id})
  }
  function seleccionarClienteChecklist(t) {
    setFormChecklist({...formChecklist,trabajo_id:t.id,vehiculo:t.vehiculos?.marca_modelo||'',patente:t.vehiculos?.patente||'',color:t.vehiculos?.color||''})
    setFotosChecklistSubidas([])
  }

  async function subirFotosChecklist(e){
    const files=Array.from(e.target.files)
    if(!files.length)return
    if(!formChecklist.trabajo_id){avisar('Elegí primero el cliente/vehículo para poder subir fotos','error');e.target.value='';return}
    setSubiendoFotoChecklist(true)
    const nuevas=[]
    for(const f of files){
      const url=await subirFotoStorage(f,formChecklist.trabajo_id)
      if(!url){avisar('No se pudo subir la imagen al storage','error');continue}
      const{data,error}=await supabase.from('fotos').insert({trabajo_id:formChecklist.trabajo_id,url}).select().single()
      if(error){avisar('Error al guardar la foto: '+error.message,'error');continue}
      if(data)nuevas.push(data)
    }
    setFotosChecklistSubidas(prev=>[...prev,...nuevas])
    setSubiendoFotoChecklist(false)
    e.target.value=''
  }

  async function cargarDatos() {
    setLoading(true)
    const{data:clientesData}=await supabase.from('clientes').select('*').order('created_at',{ascending:false})
    const{data:trabajosData}=await supabase.from('trabajos').select('*, vehiculos(*, clientes(*))').order('fecha_ingreso',{ascending:true})
    const{data:empleadosData}=await supabase.from('empleados').select('*').order('rol').order('nombre')
    const{data:checklistsData}=await supabase.from('checklists').select('*').order('created_at',{ascending:false})
    const{data:turnosData}=await supabase.from('turnos').select('*').order('fecha',{ascending:true})
    setClientes(clientesData||[]);setTrabajos(trabajosData||[]);setEmpleados(empleadosData||[])
    setChecklists(checklistsData||[]);setTurnos(turnosData||[]);setLoading(false)
  }

  // recarga liviana: solo la tabla trabajos, para acciones que no tocan clientes/empleados/checklists/turnos
  async function cargarTrabajos() {
    const{data}=await supabase.from('trabajos').select('*, vehiculos(*, clientes(*))').order('fecha_ingreso',{ascending:true})
    setTrabajos(data||[])
  }

  // numeración automática de presupuestos y recibos, guardada en la tabla numeracion
  async function cargarNumeracion() {
    const{data}=await supabase.from('numeracion').select('*')
    const mapa={presupuesto:0,recibo:0,cliente:0}
    ;(data||[]).forEach(r=>{mapa[r.tipo]=r.ultimo_numero||0})
    setNumeracion(mapa)
    setPresupuesto(p=>({...p,numero:formatNumeroDoc(mapa.presupuesto)}))
    setRecibo(r=>({...r,numero:formatNumeroDoc(mapa.recibo)}))
  }

  async function incrementarNumeracion(tipo) {
    const actual=numeracion[tipo]||0
    const nuevo=actual+1
    await supabase.from('numeracion').update({ultimo_numero:nuevo}).eq('tipo',tipo)
    setNumeracion(prev=>({...prev,[tipo]:nuevo}))
    return nuevo
  }

  async function cargarPresupuestos() {
    const{data}=await supabase.from('presupuestos').select('*').order('created_at',{ascending:false})
    setPresupuestos(data||[])
  }

  async function cargarPresupuestosVehiculo(vehiculoId){
    if(!vehiculoId){setPresupuestosDetalle([]);return}
    const{data:trabajosVeh}=await supabase.from('trabajos').select('id').eq('vehiculo_id',vehiculoId)
    const ids=(trabajosVeh||[]).map(t=>t.id)
    if(ids.length===0){setPresupuestosDetalle([]);return}
    const{data}=await supabase.from('presupuestos').select('*').in('trabajo_id',ids).order('created_at',{ascending:false})
    setPresupuestosDetalle(data||[])
  }

  async function cargarChecklistsVehiculo(vehiculoId){
    if(!vehiculoId){setChecklistsDetalle([]);return}
    const{data:trabajosVeh}=await supabase.from('trabajos').select('id').eq('vehiculo_id',vehiculoId)
    const ids=(trabajosVeh||[]).map(t=>t.id)
    if(ids.length===0){setChecklistsDetalle([]);return}
    const{data}=await supabase.from('checklists').select('*').in('trabajo_id',ids).order('created_at',{ascending:false})
    setChecklistsDetalle(data||[])
  }

  async function cargarReingresos(){
    const{data}=await supabase.from('historial').select('*').eq('tipo','reingreso')
    setReingresosRaw(data||[])
  }

  async function cargarActualizacionesGlobal(){
    const{data}=await supabase.from('actualizaciones').select('trabajo_id, fecha, tipo, mecanico')
    setActualizacionesRaw(data||[])
  }

  async function cargarUmbralEstancados(){
    const{data}=await supabase.from('configuracion').select('valor').eq('clave','umbral_estancados').single()
    if(data?.valor)setUmbralEstancados(parseInt(data.valor)||UMBRAL_ESTANCADOS_DEFAULT)
  }

  async function guardarUmbralEstancados(){
    const num=parseInt(umbralTemp)
    if(!num||num<1){avisar('Ingresá un número de días válido','error');return}
    const{error}=await supabase.from('configuracion').upsert({clave:'umbral_estancados',valor:String(num)})
    if(error){avisar('No se pudo guardar: '+error.message,'error');return}
    setUmbralEstancados(num)
    setEditandoUmbral(false)
    avisar('Umbral actualizado','exito')
  }

  async function cargarCostoHoraTaller(){
    const{data}=await supabase.from('configuracion').select('valor').eq('clave','costo_hora_taller').single()
    if(data?.valor)setCostoHoraTaller(parseFloat(data.valor)||0)
  }

  async function guardarCostoHoraTaller(){
    const num=parseFloat(costoHoraTemp)
    if(isNaN(num)||num<0){avisar('Ingresá un monto válido','error');return}
    const{error}=await supabase.from('configuracion').upsert({clave:'costo_hora_taller',valor:String(num)})
    if(error){avisar('No se pudo guardar: '+error.message,'error');return}
    setCostoHoraTaller(num)
    setEditandoCostoHora(false)
    avisar('Costo por hora actualizado','exito')
  }

  async function cargarPlanDiario(fecha){
    const{data,error}=await supabase.from('plan_diario').select('*').eq('fecha',fecha).order('created_at',{ascending:true})
    if(error){avisar('No se pudo cargar el plan: '+error.message,'error');return}
    setPlanDiario(data||[])
  }

  async function agregarTareaVehiculoPlan(){
    if(guardandoTareaPlan)return
    if(!formTareaVehiculo.trabajo_id){avisar('Elegí un vehículo','error');return}
    setGuardandoTareaPlan(true)
    const{error}=await supabase.from('plan_diario').insert({
      fecha:fechaPlan,tipo:'vehiculo',trabajo_id:formTareaVehiculo.trabajo_id,
      descripcion:formTareaVehiculo.descripcion,mecanico:formTareaVehiculo.mecanico,completado:false
    })
    if(error){avisar('No se pudo guardar: '+error.message,'error');setGuardandoTareaPlan(false);return}
    setFormTareaVehiculo({trabajo_id:'',vehiculo:'',descripcion:'',mecanico:''})
    setModalAgregarPlan(null)
    await cargarPlanDiario(fechaPlan)
    setGuardandoTareaPlan(false)
  }

  async function agregarTareaSueltaPlan(){
    if(guardandoTareaPlan)return
    if(!formTareaSuelta.descripcion.trim()){avisar('Escribí la tarea','error');return}
    setGuardandoTareaPlan(true)
    const{error}=await supabase.from('plan_diario').insert({
      fecha:fechaPlan,tipo:'suelta',descripcion:formTareaSuelta.descripcion,mecanico:formTareaSuelta.mecanico,completado:false
    })
    if(error){avisar('No se pudo guardar: '+error.message,'error');setGuardandoTareaPlan(false);return}
    setFormTareaSuelta({descripcion:'',mecanico:''})
    setModalAgregarPlan(null)
    await cargarPlanDiario(fechaPlan)
    setGuardandoTareaPlan(false)
  }

  async function toggleCompletadoPlan(item){
    await supabase.from('plan_diario').update({completado:!item.completado}).eq('id',item.id)
    setPlanDiario(prev=>prev.map(p=>p.id===item.id?{...p,completado:!p.completado}:p))
  }

  async function borrarTareaPlan(item){
    pedirConfirmacion('¿Borrar esta tarea del plan?', async()=>{
      await supabase.from('plan_diario').delete().eq('id',item.id)
      await cargarPlanDiario(fechaPlan)
    })
  }

  function cambiarDiaPlan(delta){
    const d=new Date(fechaPlan+'T12:00:00')
    d.setDate(d.getDate()+delta)
    const nueva=d.toISOString().split('T')[0]
    setFechaPlan(nueva)
    cargarPlanDiario(nueva)
  }

  function compartirPlanDiario(){
    const fechaF=new Date(fechaPlan+'T12:00:00').toLocaleDateString('es-AR',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
    const porMecanico={}
    planDiario.forEach(p=>{
      const m=p.mecanico||'Sin asignar'
      if(!porMecanico[m])porMecanico[m]=[]
      const trabajoRef=p.tipo==='vehiculo'?trabajos.find(t=>t.id===p.trabajo_id):null
      const texto=p.tipo==='vehiculo'
        ?`${trabajoRef?.vehiculos?.marca_modelo||'Vehículo'} (${trabajoRef?.vehiculos?.clientes?.nombre||'—'})${p.descripcion?': '+p.descripcion:''}`
        :p.descripcion
      porMecanico[m].push(`${p.completado?'✅':'⬜'} ${texto}`)
    })
    let msg=`📋 Plan del día — ${fechaF}\n`
    Object.entries(porMecanico).forEach(([mecanico,tareas])=>{
      msg+=`\n*${mecanico}*\n${tareas.map(t=>`${t}`).join('\n')}\n`
    })
    if(planDiario.length===0)msg+='\nSin tareas planificadas.'
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank')
  }

  function imprimirPlanDiario(){
    const fechaF=new Date(fechaPlan+'T12:00:00').toLocaleDateString('es-AR',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
    const bloques=planPorMecanico.map(([mecanico,tareas])=>{
      const filas=tareas.map(p=>{
        const trabajoRef=p.tipo==='vehiculo'?trabajos.find(t=>t.id===p.trabajo_id):null
        const texto=p.tipo==='vehiculo'
          ?`${trabajoRef?.vehiculos?.marca_modelo||'Vehículo'} (${trabajoRef?.vehiculos?.clientes?.nombre||'—'})${p.descripcion?' — '+p.descripcion:''}`
          :p.descripcion
        return `<tr><td class="check"><span class="checkbox"></span></td><td>${texto}</td></tr>`
      }).join('')
      return `<div class="mecanico">${mecanico}</div><table>${filas}</table>`
    }).join('')
    const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Plan del día</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:16px;max-width:720px;margin:0 auto;}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:2px solid #000;padding-bottom:8px;}.header-logo{font-weight:900;font-size:18px;color:#1a56db;}.header h1{font-size:16px;font-weight:900;}.header p{font-size:11px;color:#555;text-transform:capitalize;}.mecanico{font-weight:900;font-size:12px;margin:12px 0 4px;text-transform:uppercase;}table{width:100%;border-collapse:collapse;margin-bottom:4px;}td{padding:5px 4px;border-bottom:1px solid #ddd;font-size:11.5px;}.check{width:20px;}.checkbox{width:13px;height:13px;border:1.5px solid #000;display:inline-block;}@media print{body{padding:8px;}@page{margin:0.5cm;}}</style></head><body><div class="header"><div class="header-logo">DiFiore Performance</div><div style="text-align:right"><h1>PLAN DEL DÍA</h1><p>${fechaF}</p></div></div>${bloques||'<p style="color:#999;padding:20px 0;text-align:center;">Sin tareas planificadas para este día.</p>'}<script>window.onload=()=>{window.print()}<\/script></body></html>`
    abrirVentana(html)
  }

  async function actualizarTodo(){
    await Promise.all([cargarDatos(),cargarNumeracion(),cargarPresupuestos(),cargarReingresos(),cargarPlanDiario(fechaPlan),cargarActualizacionesGlobal()])
    if(clienteDetalle?.vehiculos?.id){
      cargarHistorial(clienteDetalle.vehiculos.id)
      cargarPresupuestosVehiculo(clienteDetalle.vehiculos.id)
      cargarChecklistsVehiculo(clienteDetalle.vehiculos.id)
      cargarFotos(clienteDetalle.id)
      cargarFotosAnteriores(clienteDetalle.vehiculos.id,clienteDetalle.id)
    }
  }

  // guarda o actualiza el presupuesto actual en la base, sin imprimir. Devuelve el id guardado.
  async function guardarPresupuestoDB(){
    const datos={trabajo_id:presupuesto.trabajo_id||null,numero:presupuesto.numero,fecha:presupuesto.fecha,cliente:presupuesto.cliente,vehiculo:presupuesto.vehiculo,items:presupuesto.items,notas:presupuesto.notas,moneda_mano_obra:presupuesto.moneda_mano_obra,descuento_concepto:presupuesto.descuento_concepto,descuento_monto:presupuesto.descuento_monto,aplicar_descuento:presupuesto.aplicar_descuento,mostrar_transferencia:presupuesto.mostrar_transferencia,transferencia_repuestos:presupuesto.transferencia_repuestos,transferencia_mano_obra:presupuesto.transferencia_mano_obra}
    try{
      if(editandoPresupuesto&&presupuestoActivo){
        const{error}=await supabase.from('presupuestos').update(datos).eq('id',presupuestoActivo.id)
        if(error){avisar('No se pudo guardar: '+error.message,'error');return null}
        return presupuestoActivo.id
      } else {
        const{data,error}=await supabase.from('presupuestos').insert(datos).select().single()
        if(error){avisar('No se pudo guardar: '+error.message,'error');return null}
        return data.id
      }
    }catch(e){
      avisar('No se pudo guardar el presupuesto: '+(e?.message||'error desconocido'),'error')
      return null
    }
  }

  async function guardarPresupuesto(){
    if(guardandoPresupuesto)return
    setGuardandoPresupuesto(true)
    const id=await guardarPresupuestoDB()
    if(id){
      avisar('Presupuesto guardado','exito')
      setPresupuestoActivo({...presupuesto,id})
      setEditandoPresupuesto(true)
      await cargarPresupuestos()
    }
    setGuardandoPresupuesto(false)
  }

  function abrirPresupuesto(p){
    setPresupuesto({
      numero:p.numero||'',fecha:p.fecha||new Date().toISOString().split('T')[0],cliente:p.cliente||'',vehiculo:p.vehiculo||'',trabajo_id:p.trabajo_id||'',
      items:p.items&&p.items.length?p.items:[{descripcion:'',precio_unitario:'',total:'',es_mano_obra:false}],
      notas:p.notas||'',moneda_mano_obra:p.moneda_mano_obra||'ARS',
      descuento_concepto:p.descuento_concepto||'Descuento por diagnóstico',descuento_monto:p.descuento_monto||'',aplicar_descuento:p.aplicar_descuento||false,
      mostrar_transferencia:p.mostrar_transferencia||false,transferencia_repuestos:p.transferencia_repuestos!==false,transferencia_mano_obra:p.transferencia_mano_obra||false
    })
    setPresupuestoActivo(p)
    setEditandoPresupuesto(true)
    setVistaPresupuesto('nuevo')
  }

  function nuevoPresupuesto(){
    setPresupuesto({numero:formatNumeroDoc(numeracion.presupuesto),fecha:new Date().toISOString().split('T')[0],cliente:'',vehiculo:'',trabajo_id:'',items:[{descripcion:'',precio_unitario:'',total:'',es_mano_obra:false}],notas:'',moneda_mano_obra:'ARS',descuento_concepto:'Descuento por diagnóstico',descuento_monto:'',aplicar_descuento:false,mostrar_transferencia:false,transferencia_repuestos:true,transferencia_mano_obra:false})
    setPresupuestoActivo(null)
    setEditandoPresupuesto(false)
    setVistaPresupuesto('nuevo')
  }

  async function borrarPresupuesto(p){
    pedirConfirmacion(`¿Borrar el presupuesto ${p.numero}?`, async()=>{
      await supabase.from('presupuestos').delete().eq('id',p.id)
      await cargarPresupuestos()
      avisar('Presupuesto borrado','exito')
    })
  }

  const presupuestosFiltrados = presupuestos.filter(p=>{
    if(!busquedaPresupuestos.trim())return true
    const q=busquedaPresupuestos.toLowerCase()
    return p.cliente?.toLowerCase().includes(q)||p.vehiculo?.toLowerCase().includes(q)||p.numero?.toLowerCase().includes(q)
  })

  function totalAproxPresupuesto(p){
    try{
      return (p.items||[]).filter(i=>!i.es_mano_obra).reduce((a,i)=>a+(parseFloat((i.total||'0').toString().replace(/\./g,''))||0),0)
    }catch(e){return 0}
  }

  async function cargarFotos(trabajoId){
    if(!trabajoId){setFotos([]);return}
    const{data,error}=await supabase.from('fotos').select('*').eq('trabajo_id',trabajoId).order('created_at',{ascending:false})
    if(!error)setFotos(data||[])
  }
  async function cargarFotosAnteriores(vehiculoId,trabajoActualId){
    if(!vehiculoId){setFotosAnteriores([]);return}
    const{data:trabajosVeh}=await supabase.from('trabajos').select('id').eq('vehiculo_id',vehiculoId).neq('id',trabajoActualId||'')
    const ids=(trabajosVeh||[]).map(t=>t.id)
    if(ids.length===0){setFotosAnteriores([]);return}
    const{data,error}=await supabase.from('fotos').select('*').in('trabajo_id',ids).order('created_at',{ascending:false})
    if(!error)setFotosAnteriores(data||[])
  }
  async function cargarFotosModal(vehiculoId){
    if(!vehiculoId){setModalFotosData([]);return}
    const{data:trabajosVeh}=await supabase.from('trabajos').select('id').eq('vehiculo_id',vehiculoId)
    const ids=(trabajosVeh||[]).map(t=>t.id)
    if(ids.length===0){setModalFotosData([]);return}
    const{data,error}=await supabase.from('fotos').select('*').in('trabajo_id',ids).order('created_at',{ascending:false})
    if(!error)setModalFotosData(data||[])
  }
  async function cargarHistorial(vehiculoId){
    if(!vehiculoId){setHistorial([]);return}
    const{data:trabajosVeh}=await supabase.from('trabajos').select('id').eq('vehiculo_id',vehiculoId)
    const ids=(trabajosVeh||[]).map(t=>t.id)
    if(ids.length===0){setHistorial([]);return}
    const{data:h1}=await supabase.from('historial').select('*').in('trabajo_id',ids)
    const{data:h2}=await supabase.from('actualizaciones').select('*').in('trabajo_id',ids)
    const combinado=[
      ...(h1||[]).map(h=>({...h,_origen:'historial'})),
      ...(h2||[]).map(h=>({...h,_origen:'actualizaciones'}))
    ]
    setHistorial(combinado.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)))
  }
  async function cargarRepuestos(id){const{data}=await supabase.from('repuestos').select('*').eq('trabajo_id',id).order('fecha',{ascending:false});setRepuestos(data||[])}
  async function agregarHistorial(trabajoId,tipo,descripcion,fecha){await supabase.from('historial').insert({trabajo_id:trabajoId,tipo,descripcion,...(fecha?{fecha}:{})})}
  async function subirFotoStorage(file,trabajoId){
    const comprimido=await comprimirImagen(file)
    const ext=comprimido.name.split('.').pop()
    const nombre=`${trabajoId}/${Date.now()}_${Math.random().toString(36).substr(2,9)}.${ext}`
    const{error}=await supabase.storage.from('fotos-vehiculos').upload(nombre,comprimido,{upsert:true})
    if(error)return null
    const{data}=supabase.storage.from('fotos-vehiculos').getPublicUrl(nombre)
    return data.publicUrl
  }
  function formatPeso(v){return Number(v).toLocaleString('es-AR')}

  const checklistsFiltrados = (() => {
    let lista = admin ? checklists : checklists.filter(ch=>ch.mecanico===empleadoActual)
    lista = lista.filter(ch=>(ch.tipo||'entrega')===tipoChecklist)
    if (busquedaChecklist.trim()) {
      const q = busquedaChecklist.toLowerCase()
      lista = lista.filter(ch=>ch.vehiculo?.toLowerCase().includes(q)||ch.patente?.toLowerCase().includes(q)||ch.mecanico?.toLowerCase().includes(q))
    }
    return lista
  })()

  async function guardarChecklist(){
    if(guardandoChecklist) return
    if(!formChecklist.mecanico){avisar('Seleccioná tu nombre antes de guardar','error');return}
    setGuardandoChecklist(true)
    const datos={trabajo_id:formChecklist.trabajo_id||null,fecha_entrega:formChecklist.fecha_entrega,vehiculo:formChecklist.vehiculo,patente:formChecklist.patente,color:formChecklist.color,mecanico:formChecklist.mecanico,items:formChecklist.items,observacion_general:formChecklist.observacion_general,tipo:formChecklist.tipo||tipoChecklist,fotos:fotosChecklistSubidas}
    let error
    if(editandoChecklist&&checklistActivo){
      ;({error}=await supabase.from('checklists').update(datos).eq('id',checklistActivo.id))
      if(!error)avisar('Checklist actualizado correctamente','exito')
    } else {
      ;({error}=await supabase.from('checklists').insert(datos))
      if(!error)avisar('Checklist guardado correctamente','exito')
    }
    if(error){avisar('No se pudo guardar: '+error.message,'error');setGuardandoChecklist(false);return}
    if(formChecklist.trabajo_id){
      const trabajoVinculado=trabajos.find(t=>t.id===formChecklist.trabajo_id)
      if(trabajoVinculado&&!trabajoVinculado.mecanico&&formChecklist.mecanico){
        await supabase.from('trabajos').update({mecanico:formChecklist.mecanico}).eq('id',formChecklist.trabajo_id)
        await cargarTrabajos()
      }
    }
    setFormChecklist({trabajo_id:'',vehiculo:'',patente:'',color:'',tipo:tipoChecklist,fecha_entrega:new Date().toISOString().split('T')[0],mecanico:'',observacion_general:'',items:itemsVacios(tipoChecklist)})
    setVistaChecklist('lista');setChecklistActivo(null);setEditandoChecklist(false)
    const{data}=await supabase.from('checklists').select('*').order('created_at',{ascending:false})
    setChecklists(data||[])
    setGuardandoChecklist(false)
  }

  function abrirEditarChecklist(ch){
    const tipo=ch.tipo||'entrega'
    setTipoChecklist(tipo)
    setFormChecklist({trabajo_id:ch.trabajo_id||'',vehiculo:ch.vehiculo||'',patente:ch.patente||'',color:ch.color||'',tipo,fecha_entrega:ch.fecha_entrega||new Date().toISOString().split('T')[0],mecanico:ch.mecanico||'',observacion_general:ch.observacion_general||'',items:ch.items||itemsVacios(tipo)})
    setFotosChecklistSubidas(ch.fotos||[])
    setChecklistActivo(ch);setEditandoChecklist(true);setVistaChecklist('nuevo')
  }

  async function borrarChecklist(id){
    pedirConfirmacion('¿Borrar este checklist?', async()=>{
      await supabase.from('checklists').delete().eq('id',id)
      const{data}=await supabase.from('checklists').select('*').order('created_at',{ascending:false})
      setChecklists(data||[]);setChecklistActivo(null)
    })
  }

  function getDiasDelMes(fecha){const anio=fecha.getFullYear(),mes=fecha.getMonth();const primerDia=new Date(anio,mes,1).getDay();const diasEnMes=new Date(anio,mes+1,0).getDate();return{primerDia,diasEnMes,anio,mes}}
  function fechaStr(anio,mes,dia){return`${anio}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`}
  function turnosPorDia(fecha){return turnos.filter(t=>t.fecha===fecha)}
  function diaCompleto(fecha){return turnosPorDia(fecha).length>=MAX_TURNOS_POR_DIA}
  function abrirDia(fecha){setDiaSeleccionado(fecha);setFormTurno({...formTurno,fecha});setMostrarFormTurno(false);setEditandoTurno(null)}

  async function guardarTurno(){
    if(guardandoTurnoForm) return
    if(!formTurno.nombre||!formTurno.fecha){avisar('Completá nombre y fecha','error');return}
    if(!editandoTurno&&diaCompleto(formTurno.fecha)){avisar(`El día ya tiene ${MAX_TURNOS_POR_DIA} turnos. Elegí otro día.`,'error');return}
    setGuardandoTurnoForm(true)
    if(editandoTurno){await supabase.from('turnos').update({nombre:formTurno.nombre,telefono:formTurno.telefono,vehiculo:formTurno.vehiculo,fecha:formTurno.fecha,motivo:formTurno.motivo}).eq('id',editandoTurno.id)}
    else{await supabase.from('turnos').insert({nombre:formTurno.nombre,telefono:formTurno.telefono,vehiculo:formTurno.vehiculo,fecha:formTurno.fecha,motivo:formTurno.motivo,estado:'pendiente'})}
    if(formTurno.telefono&&!editandoTurno){
      let tel=formTurno.telefono.replace(/\D/g,'')
      if(!tel.startsWith('54'))tel='54'+tel
      const fechaF=new Date(formTurno.fecha+'T12:00:00').toLocaleDateString('es-AR',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
      const msg=`Hola ${formTurno.nombre}! Te confirmamos tu turno en DiFiore Performance.\n\n📅 Fecha: ${fechaF}\n🕘 Horario: 8:30 hs\n🚗 Vehículo: ${formTurno.vehiculo||'—'}\n📝 Motivo: ${formTurno.motivo||'—'}\n\nTe esperamos en Malvinas 2084, Mar del Plata.\n\nNo te olvides de traer el auto LAVADO, con COMBUSTIBLE, tarjeta VERDE y SEGURO.`
      window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`,'_blank')
    }
    setFormTurno({nombre:'',telefono:'',vehiculo:'',fecha:diaSeleccionado||'',motivo:''})
    setEditandoTurno(null);setMostrarFormTurno(false)
    const{data}=await supabase.from('turnos').select('*').order('fecha',{ascending:true})
    setTurnos(data||[])
    setGuardandoTurnoForm(false)
  }

  async function borrarTurno(id){
    pedirConfirmacion('¿Cancelar este turno?', async()=>{
      await supabase.from('turnos').delete().eq('id',id)
      const{data}=await supabase.from('turnos').select('*').order('fecha',{ascending:true})
      setTurnos(data||[])
    })
  }

  function abrirEditarTurno(t){setFormTurno({nombre:t.nombre,telefono:t.telefono||'',vehiculo:t.vehiculo||'',fecha:t.fecha,motivo:t.motivo||''});setEditandoTurno(t);setMostrarFormTurno(true)}

  function enviarRecordatorioTurno(t){
    if(!t.telefono){avisar('Este turno no tiene teléfono cargado','error');return}
    let tel=t.telefono.replace(/\D/g,'')
    if(!tel.startsWith('54'))tel='54'+tel
    const fechaF=new Date(t.fecha+'T12:00:00').toLocaleDateString('es-AR',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
    const msg=`Hola ${t.nombre}! Te recordamos tu turno en DiFiore Performance.\n\n📅 Fecha: ${fechaF}\n🕘 Horario: 8:30 hs\n🚗 Vehículo: ${t.vehiculo||'—'}\n\nTe esperamos en Malvinas 2084, Mar del Plata.`
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`,'_blank')
  }

  const fechaManiana=(()=>{const d=new Date();d.setDate(d.getDate()+1);return d.toISOString().split('T')[0]})()
  const turnosManiana=turnos.filter(t=>t.fecha===fechaManiana)

  async function marcarEstadoTurno(turno,estado){
    await supabase.from('turnos').update({estado}).eq('id',turno.id)
    const{data}=await supabase.from('turnos').select('*').order('fecha',{ascending:true})
    setTurnos(data||[])
  }

  function usarTurnoComoNuevoCliente(turno){
    marcarEstadoTurno(turno,'presento')
    setForm({
      nombre:turno.nombre||'',telefono:turno.telefono||'',email:'',
      marca_modelo:turno.vehiculo||'',patente:'',anio:'',kilometraje:'',color:'',
      motivo:turno.motivo||'',estado:'Diagnóstico',mecanico:'',taller:'Malvinas 2084',
      llego_en_grua:false,tiene_seguro:false,fecha_ingreso_manual:''
    })
    setSeccion('nuevo')
  }

  async function agregarEmpleado(){
    if(guardandoEmpleado) return
    if(!nuevoEmpleado.nombre.trim())return
    setGuardandoEmpleado(true)
    await supabase.from('empleados').insert({nombre:nuevoEmpleado.nombre.toUpperCase(),rol:nuevoEmpleado.rol})
    setNuevoEmpleado({nombre:'',rol:'mecanico'})
    const{data}=await supabase.from('empleados').select('*').order('rol').order('nombre')
    setEmpleados(data||[])
    setGuardandoEmpleado(false)
  }

  async function borrarEmpleado(id){
    pedirConfirmacion('¿Borrar empleado?', async()=>{
      await supabase.from('empleados').delete().eq('id',id)
      const{data}=await supabase.from('empleados').select('*').order('rol').order('nombre')
      setEmpleados(data||[])
    })
  }

  function imprimirChecklist(ch){
    const items=ch.items||{}
    const tipo=ch.tipo||'entrega'
    const itemsLista=CHECKLIST_ITEMS_POR_TIPO[tipo]
    const titulo=CHECKLIST_TITULO_POR_TIPO[tipo]
    const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${titulo}</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:11px;color:#000;padding:20px;max-width:720px;margin:0 auto;}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:2px solid #000;padding-bottom:10px;}.header-logo img{width:180px;}.header-title h1{font-size:18px;font-weight:900;letter-spacing:1px;}.datos{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border:1px solid #000;margin-bottom:12px;}.dato{padding:6px 8px;border-right:1px solid #000;}.dato:last-child{border-right:none;}.dato label{font-size:8px;font-weight:700;text-transform:uppercase;display:block;margin-bottom:3px;}.dato span{font-size:12px;font-weight:600;}table{width:100%;border-collapse:collapse;margin-bottom:16px;}thead th{background:#222;color:#fff;padding:6px 8px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.5px;}tbody td{padding:8px;border:1px solid #ccc;font-size:11px;vertical-align:middle;}tbody tr:nth-child(even){background:#f9f9f9;}.check-cell{text-align:center;font-size:16px;}.firmas{margin-top:16px;}.firmas-title{font-size:11px;font-weight:900;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;}.firmas-grid{display:grid;grid-template-columns:1fr 1fr;border:1px solid #000;}.firma-item{padding:8px;border-right:1px solid #000;}.firma-item:last-child{border-right:none;}.firma-item label{font-size:9px;font-weight:700;text-transform:uppercase;display:block;margin-bottom:20px;}.firma-item .linea{border-bottom:1px solid #000;height:20px;}.footer{margin-top:12px;border-top:1px solid #ccc;padding-top:6px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:9px;color:#444;}.footer-icon{display:flex;align-items:center;gap:4px;text-decoration:none;color:#444;}@media print{body{padding:10px;}@page{margin:0.5cm;}}</style></head><body><div class="header"><div class="header-logo"><img src="${LOGO_URL}" alt="DiFiore"/></div><div class="header-title"><h1>${titulo.toUpperCase()}</h1><div style="font-size:11px;color:#555;margin-top:4px">Fecha: ${ch.fecha_entrega?new Date(ch.fecha_entrega+'T12:00:00').toLocaleDateString('es-AR'):'—'}</div></div></div><div class="datos"><div class="dato"><label>Vehículo</label><span>${ch.vehiculo||'—'}</span></div><div class="dato"><label>Patente</label><span>${ch.patente||'—'}</span></div><div class="dato"><label>Color</label><span>${ch.color||'—'}</span></div><div class="dato"><label>Fecha</label><span>${ch.fecha_entrega?new Date(ch.fecha_entrega+'T12:00:00').toLocaleDateString('es-AR'):'—'}</span></div></div><table><thead><tr><th style="width:40%">ÍTEM</th><th style="width:15%;text-align:center">SÍ</th><th style="width:15%;text-align:center">NO</th><th>OBSERVACIONES</th></tr></thead><tbody>${itemsLista.map(item=>{const v=items[item]||{};return`<tr><td style="font-weight:500">${item}</td><td class="check-cell">${v.valor==='si'?'✓':''}</td><td class="check-cell">${v.valor==='no'?'✓':''}</td><td>${v.obs||''}</td></tr>`}).join('')}</tbody></table>${ch.observacion_general?`<div style="border:1px solid #ccc;padding:8px;margin-bottom:16px;"><b style="font-size:10px;text-transform:uppercase;">Observaciones generales:</b><p style="margin-top:4px;font-size:11px">${ch.observacion_general}</p></div>`:''}<div class="firmas"><div class="firmas-title">Firmas</div><div class="firmas-grid"><div class="firma-item"><label>Empleado: ${ch.mecanico||'___________'}</label><div class="linea"></div></div><div class="firma-item"><label>Cliente</label><div class="linea"></div></div></div></div><div class="footer">${footerIconsHTML}</div><script>window.onload=()=>{window.print()}<\/script></body></html>`
    const w=window.open('','_blank','width=820,height=1000');w.document.write(html);w.document.close()
  }

  function calcularTotalesPresupuesto(){
    let totalRepuestosPesos=0,totalManoObraUSD=0,totalManoObraPesos=0
    try{
      presupuesto.items.forEach(item=>{
        if(!item.total)return
        const val=parseFloat(parseNum(item.total.toString()))||0
        if(item.es_mano_obra){
          if(presupuesto.moneda_mano_obra==='USD') totalManoObraUSD+=val
          else totalManoObraPesos+=val
        } else totalRepuestosPesos+=val
      })
    }catch(e){}
    const descMonto=presupuesto.aplicar_descuento&&presupuesto.descuento_monto?parseFloat(parseNum(presupuesto.descuento_monto.toString()))||0:0
    const totalEfectivo=totalRepuestosPesos+totalManoObraPesos-descMonto
    let totalTransferencia=totalEfectivo
    if(presupuesto.mostrar_transferencia&&presupuesto.moneda_mano_obra!=='USD'){
      let baseRecargo=0
      if(presupuesto.transferencia_repuestos)baseRecargo+=totalRepuestosPesos
      if(presupuesto.transferencia_mano_obra)baseRecargo+=totalManoObraPesos
      totalTransferencia=totalEfectivo+(baseRecargo*0.20)
    }
    return{totalRepuestosPesos,totalManoObraUSD,totalManoObraPesos,totalEfectivo:Math.max(0,totalEfectivo),totalTransferencia:Math.max(0,totalTransferencia),descMonto}
  }

  function buildHeader(nroCliente){return`<div class="header"><div class="header-logo"><img src="${LOGO_URL}" alt="DiFiore"/></div><div class="header-center"><h1>ORDEN DE SERVICIO</h1><div class="brand">DiFiore<span style="color:#333">Performance</span></div></div><div class="folio">N° CLIENTE<br><span class="folio-num">${nroCliente}</span></div></div>`}
  function buildDatosVehiculo(trabajo){const v=trabajo.vehiculos;return`<div class="body"><div><div class="field"><label>Marca / Modelo:</label><div class="val">${v?.marca_modelo||''}</div></div><div class="field"><label>Color:</label><div class="val">${v?.color||''}</div></div><div class="field"><label>Kilometraje:</label><div class="val">${v?.kilometraje||''}</div></div><div class="field"><label>Patente:</label><div class="val">${v?.patente||''}</div></div><div class="grua-seg"><div class="grua-item"><span>Grúa:</span><span class="checkbox"><span class="box">${trabajo.llego_en_grua?'✓':''}</span> Sí</span><span class="checkbox"><span class="box">${!trabajo.llego_en_grua?'✓':''}</span> No</span></div><div class="grua-item"><span>Seguro:</span><span class="checkbox"><span class="box">${trabajo.tiene_seguro?'✓':''}</span> Sí</span><span class="checkbox"><span class="box">${!trabajo.tiene_seguro?'✓':''}</span> No</span></div></div></div><div><div style="font-weight:900;margin-bottom:5px;font-size:10px;">DATOS DEL CLIENTE</div><div class="field"><label>Ingreso:</label><div class="val">${trabajo.fecha_ingreso?new Date(trabajo.fecha_ingreso).toLocaleDateString('es-AR'):'___/___/______'}</div></div><div class="field"><label>Salida estimada:</label><div class="val">${trabajo.fecha_salida?new Date(trabajo.fecha_salida).toLocaleDateString('es-AR'):'___/___/______'}</div></div><div class="field"><label>Nombre:</label><div class="val">${v?.clientes?.nombre||''}</div></div><div class="field"><label>Teléfono:</label><div class="val">${v?.clientes?.telefono||''}</div></div><div class="field"><label>Email:</label><div class="val">${v?.clientes?.email||''}</div></div></div></div>`}
  function buildTrabajoBox(motivo){const lineas=(motivo||'').split('.').map(l=>l.trim()).filter(l=>l.length>0);return`<div class="section-title">TRABAJO A REALIZAR / DESCRIPCIÓN DEL PROBLEMA</div><div class="trabajo-box"><div class="trabajo-lineas">${Array(7).fill('<div></div>').join('')}</div><div class="trabajo-texto">${lineas.map(l=>`<div>${l}.</div>`).join('')}</div></div>`}
  function abrirVentana(html){const w=window.open('','_blank','width=820,height=1000');w.document.write(html);w.document.close()}

  function imprimirOrden(trabajo){const nroCliente=trabajo.vehiculos?.clientes?.numero_ficha||'—';const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Orden de Servicio</title><style>${baseCSS}.tc{margin-top:8px;border-top:2px solid #000;padding-top:6px;}.tc-title{font-size:11px;font-weight:900;letter-spacing:1px;margin-bottom:6px;text-align:center;background:#222;color:#fff;padding:4px;}.tc-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px 16px;}.tc-item{font-size:9.5px;line-height:1.5;margin-bottom:5px;}.tc-item b{display:block;font-size:9.5px;text-transform:uppercase;margin-bottom:1px;}</style></head><body>${buildHeader(nroCliente)}${buildDatosVehiculo(trabajo)}${buildTrabajoBox(trabajo.motivo)}<div class="acepto"><div class="acepto-line"><div class="firma"></div><span style="font-weight:900;letter-spacing:3px;">A C E P T O</span><div class="firma"></div></div></div>${tcHTML}<div class="footer">${footerIconsHTML}</div><script>window.onload=()=>{window.print()}<\/script></body></html>`;abrirVentana(html)}
  function imprimirOrdenConObservaciones(trabajo,obs){const nroCliente=trabajo.vehiculos?.clientes?.numero_ficha||'—';const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Orden de Servicio</title><style>${baseCSS}.obs-box{margin-top:10px;border-top:2px solid #000;padding-top:8px;}.obs-title{font-size:11px;font-weight:900;letter-spacing:1px;margin-bottom:8px;text-align:center;background:#222;color:#fff;padding:4px;}.obs-text{font-size:12px;line-height:1.7;padding:8px;border:1px solid #ddd;border-radius:4px;background:#f9f9f9;min-height:60px;}</style></head><body>${buildHeader(nroCliente)}${buildDatosVehiculo(trabajo)}${buildTrabajoBox(trabajo.motivo)}<div class="acepto"><div class="acepto-line"><div class="firma"></div><span style="font-weight:900;letter-spacing:3px;">RECIBÍ CONFORME</span><div class="firma"></div></div></div><div class="obs-box"><div class="obs-title">OBSERVACIONES FINALES</div><div class="obs-text">${obs||'—'}</div></div><div class="footer">${footerIconsHTML}</div><script>window.onload=()=>{window.print()}<\/script></body></html>`;abrirVentana(html)}
  function imprimirRepuestos(trabajo,lista){const c=trabajo.vehiculos?.clientes;const v=trabajo.vehiculos;const total=lista.reduce((a,r)=>a+Number(r.valor),0);const nroCliente=trabajo.vehiculos?.clientes?.numero_ficha||'—';const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Historial de Repuestos</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:11px;color:#000;padding:15px;max-width:720px;margin:0 auto;}.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;border-bottom:2px solid #000;padding-bottom:8px;}.header-logo{width:160px;}.header-logo img{width:100%;}.header-center{text-align:center;flex:1;}.header-center h1{font-size:16px;font-weight:900;letter-spacing:1px;margin-bottom:2px;}.header-center .brand{font-size:13px;font-weight:900;color:#1a56db;letter-spacing:2px;}.folio{text-align:right;font-size:9px;font-weight:bold;}.folio-num{font-size:22px;font-weight:900;border-bottom:2px solid #000;display:inline-block;min-width:60px;text-align:center;}.info{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0;padding:8px;border:1px solid #ddd;border-radius:4px;background:#f9f9f9;}.info-item label{font-size:9px;color:#555;display:block;font-weight:bold;text-transform:uppercase;}.info-item span{font-size:12px;font-weight:700;}table{width:100%;border-collapse:collapse;margin-bottom:12px;}thead th{background:#222;color:#fff;padding:7px 10px;text-align:left;font-size:10px;font-weight:bold;}tbody td{padding:7px 10px;border-bottom:1px solid #ddd;font-size:11px;}tbody tr:nth-child(even){background:#f9f9f9;}.total-row td{font-weight:900;background:#e8f4e8;font-size:13px;border-top:2px solid #000;}.footer{margin-top:10px;border-top:1px solid #ccc;padding-top:6px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-size:9px;color:#444;}.footer-icon{display:flex;align-items:center;gap:4px;text-decoration:none;color:#444;}@media print{body{padding:8px;}@page{margin:0.5cm;}}</style></head><body><div class="header"><div class="header-logo"><img src="${LOGO_URL}" alt="DiFiore"/></div><div class="header-center"><h1>HISTORIAL DE REPUESTOS</h1><div class="brand">DiFiore<span style="color:#333">Performance</span></div></div><div class="folio">N° CLIENTE<br><span class="folio-num">${nroCliente}</span></div></div><div class="info"><div class="info-item"><label>Cliente</label><span>${c?.nombre||'—'}</span></div><div class="info-item"><label>Teléfono</label><span>${c?.telefono||'—'}</span></div><div class="info-item"><label>Email</label><span>${c?.email||'—'}</span></div><div class="info-item"><label>Vehículo</label><span>${v?.marca_modelo||'—'}</span></div><div class="info-item"><label>Patente</label><span>${v?.patente||'—'}</span></div><div class="info-item"><label>Color</label><span>${v?.color||'—'}</span></div></div><table><thead><tr><th>#</th><th>Repuesto</th><th>Valor</th><th>Lugar</th><th>Fecha</th></tr></thead><tbody>${lista.map((r,i)=>`<tr><td>${i+1}</td><td>${r.nombre}</td><td>$${Number(r.valor).toLocaleString('es-AR')}</td><td>${r.lugar||'—'}</td><td>${new Date(r.fecha).toLocaleDateString('es-AR')}</td></tr>`).join('')}<tr class="total-row"><td colspan="2">TOTAL</td><td>$${total.toLocaleString('es-AR')}</td><td colspan="2"></td></tr></tbody></table><div class="footer">${footerIconsHTML}</div><script>window.onload=()=>{window.print()}<\/script></body></html>`;abrirVentana(html)}

  async function imprimirPresupuesto(){
    const{totalRepuestosPesos,totalManoObraUSD,totalManoObraPesos,totalEfectivo,totalTransferencia,descMonto}=calcularTotalesPresupuesto()
    const usandoUSD=presupuesto.moneda_mano_obra==='USD'
    const manoObra=presupuesto.items.find(i=>i.es_mano_obra)
    const mostrarTransferencia=presupuesto.mostrar_transferencia&&!usandoUSD
    const numeroFicha=trabajos.find(t=>t.id===presupuesto.trabajo_id)?.vehiculos?.clientes?.numero_ficha||'—'
    const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Presupuesto</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:30px;max-width:750px;margin:0 auto;}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;}.header-logo img{width:180px;}.header-info{text-align:right;}.header-info h1{font-size:28px;font-weight:900;color:#1a56db;letter-spacing:2px;margin-bottom:4px;}.header-info p{font-size:11px;color:#555;margin-bottom:2px;}.divider{height:3px;background:linear-gradient(to right,#1a56db,#93c5fd);margin-bottom:20px;border-radius:2px;}.cliente-box{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;padding:12px;border:1px solid #e0e0e0;border-radius:6px;}.cliente-box label{font-size:9px;font-weight:700;color:#1a56db;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;}.cliente-box span{font-size:14px;font-weight:700;color:#1a1a1a;}table{width:100%;border-collapse:collapse;margin-bottom:20px;}thead th{background:#1a56db;color:#fff;padding:10px 12px;text-align:left;font-size:11px;font-weight:700;}thead th:nth-child(2),thead th:nth-child(3){text-align:right;}tbody td{padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;vertical-align:top;}tbody td:nth-child(2),tbody td:nth-child(3){text-align:right;font-weight:600;}tbody tr:nth-child(even){background:#f8faff;}.descuento-row td{color:#16A34A;font-weight:600;}.footer-box{display:flex;justify-content:space-between;align-items:flex-start;margin-top:16px;}.notas{flex:1;padding-right:30px;}.notas p{font-size:11px;color:#444;display:flex;gap:6px;margin-bottom:6px;}.totales{min-width:260px;}.total-transferencia{display:flex;justify-content:space-between;align-items:center;background:#1a56db;color:#fff;border-radius:8px 8px 0 0;padding:12px 16px;font-size:16px;font-weight:900;}.total-efectivo{display:flex;justify-content:space-between;align-items:center;background:#15803D;color:#fff;border-radius:0 0 8px 8px;padding:12px 16px;font-size:16px;font-weight:900;}.total-unico{display:flex;justify-content:space-between;align-items:center;background:#1a56db;color:#fff;border-radius:8px;padding:12px 16px;font-size:16px;font-weight:900;}.total-sub{display:flex;justify-content:space-between;padding:6px 14px;font-size:11px;color:#555;background:#f8faff;border:1px solid #e0e0e0;border-top:none;}.bottom{margin-top:24px;border-top:2px solid #1a56db;padding-top:10px;text-align:center;font-size:10px;color:#1a56db;font-weight:600;}@media print{body{padding:15px;}@page{margin:0.5cm;}}</style></head><body><div class="header"><div class="header-logo"><img src="${LOGO_URL}" alt="DiFiore"/></div><div class="header-info"><h1>PRESUPUESTO</h1><p>N° ${presupuesto.numero}</p><p>Ficha cliente: ${numeroFicha}</p><p>Fecha: ${new Date(presupuesto.fecha+'T12:00:00').toLocaleDateString('es-AR')}</p><p>Malvinas 2084 — Mar del Plata 7600</p></div></div><div class="divider"></div><div class="cliente-box"><div><label>Cliente</label><span>${presupuesto.cliente||'—'}</span></div><div><label>Vehículo</label><span>${presupuesto.vehiculo||'—'}</span></div></div><table><thead><tr><th style="width:50%">DESCRIPCIÓN</th><th style="width:25%">PRECIO UNITARIO</th><th style="width:25%">TOTAL</th></tr></thead><tbody>${presupuesto.items.filter(i=>i.descripcion).map(item=>{const s=item.es_mano_obra?(usandoUSD?'USS':'$'):'$';return`<tr><td>${item.descripcion}</td><td>${item.precio_unitario?`${s} ${item.precio_unitario}`:''}</td><td>${item.total?`${s} ${item.total}`:''}</td></tr>`}).join('')}${descMonto>0?`<tr class="descuento-row"><td>${presupuesto.descuento_concepto||'Descuento'}</td><td></td><td>-$${formatPeso(descMonto)}</td></tr>`:''}</tbody></table><div class="footer-box"><div class="notas">${presupuesto.notas?presupuesto.notas.split('\n').filter(n=>n.trim()).map(n=>`<p>✅ ${n}</p>`).join(''):''}</div><div class="totales">${usandoUSD?(
      `${totalRepuestosPesos>0?`<div class="total-sub" style="border-radius:6px 6px 0 0;border-top:1px solid #e0e0e0"><span>Repuestos</span><span>$${formatPeso(totalRepuestosPesos)}</span></div>`:''}${manoObra&&manoObra.total?`<div class="total-sub" style="${totalRepuestosPesos===0?'border-radius:6px 6px 0 0;border-top:1px solid #e0e0e0':''}"><span>Mano de obra</span><span>USS ${manoObra.total}</span></div>`:''}${totalRepuestosPesos>0?`<div class="total-sub"><span>Total repuestos</span><span>$${formatPeso(totalRepuestosPesos)}</span></div>`:''}<div class="total-unico" style="margin-top:8px"><span>TOTAL MANO DE OBRA</span><span>USS ${formatPeso(totalManoObraUSD)}</span></div>${totalRepuestosPesos>0?`<div style="background:#15803D;color:#fff;border-radius:0 0 8px 8px;padding:10px 16px;display:flex;justify-content:space-between;font-size:14px;font-weight:900;"><span>+ Repuestos</span><span>$${formatPeso(totalRepuestosPesos)}</span></div>`:''}`
    ):(
      `${totalRepuestosPesos>0?`<div class="total-sub" style="border-radius:6px 6px 0 0;border-top:1px solid #e0e0e0"><span>Repuestos</span><span>$${formatPeso(totalRepuestosPesos)}</span></div>`:''}${descMonto>0?`<div class="total-sub"><span>${presupuesto.descuento_concepto||'Descuento'}</span><span style="color:#16A34A">-$${formatPeso(descMonto)}</span></div>`:''}${mostrarTransferencia?`<div class="total-transferencia" style="margin-top:8px"><span>🏦 Transferencia</span><span>$${formatPeso(Math.round(totalTransferencia))}</span></div><div class="total-efectivo"><span>💵 Efectivo (descuento)</span><span>$${formatPeso(Math.round(totalEfectivo))}</span></div>`:`<div class="total-unico" style="margin-top:8px"><span>TOTAL</span><span>$${formatPeso(Math.round(totalEfectivo))}</span></div>`}`
    )}</div></div><div class="bottom">Di Fiore Performance — Malvinas 2084, Mar del Plata 7600 — ¡Gracias por confiar en nosotros!</div><script>window.onload=()=>{window.print()}<\/script></body></html>`
    abrirVentana(html)
    const eraNuevo=!editandoPresupuesto
    const id=await guardarPresupuestoDB()
    if(id){
      await cargarPresupuestos()
      if(eraNuevo){
        const nuevoNum=await incrementarNumeracion('presupuesto')
        setPresupuesto({numero:formatNumeroDoc(nuevoNum),fecha:new Date().toISOString().split('T')[0],cliente:'',vehiculo:'',trabajo_id:'',items:[{descripcion:'',precio_unitario:'',total:'',es_mano_obra:false}],notas:'',moneda_mano_obra:'ARS',descuento_concepto:'Descuento por diagnóstico',descuento_monto:'',aplicar_descuento:false,mostrar_transferencia:false,transferencia_repuestos:true,transferencia_mano_obra:false})
        setPresupuestoActivo(null)
        setEditandoPresupuesto(false)
      } else {
        setPresupuestoActivo({...presupuesto,id})
      }
    }
  }

  async function imprimirRecibo(){
    const esUSD=recibo.moneda==='USD'
    const montoNum=parseFloat(parseNum(recibo.monto.toString()))||0
    const numeroFicha=trabajos.find(t=>t.id===recibo.trabajo_id)?.vehiculos?.clientes?.numero_ficha||'—'
    const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Recibo</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:30px;max-width:750px;margin:0 auto;}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;border-bottom:3px solid #1a56db;padding-bottom:16px;}.header-logo img{width:180px;}.header-info{text-align:right;}.header-info h1{font-size:28px;font-weight:900;color:#1a56db;letter-spacing:2px;margin-bottom:4px;}.header-info p{font-size:11px;color:#555;margin-bottom:2px;}.datos{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;padding:16px;border:1px solid #e0e0e0;border-radius:8px;background:#f8faff;}.dato label{font-size:9px;font-weight:700;color:#1a56db;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;}.dato span{font-size:13px;font-weight:600;color:#1a1a1a;}.monto-box{background:#1a56db;color:#fff;border-radius:8px;padding:20px;text-align:center;margin:20px 0;}.monto-box label{font-size:11px;letter-spacing:2px;opacity:.8;display:block;margin-bottom:6px;}.monto-box .monto{font-size:32px;font-weight:900;}.monto-box .monto-sub{font-size:13px;opacity:.8;margin-top:4px;}.concepto-box{border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-bottom:20px;}.concepto-box label{font-size:9px;font-weight:700;color:#1a56db;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:8px;}.concepto-box p{font-size:14px;color:#1a1a1a;line-height:1.6;}.firma-box{display:flex;justify-content:space-between;margin-top:30px;padding-top:16px;border-top:1px solid #e0e0e0;}.firma{text-align:center;}.firma-line{border-bottom:1px solid #000;width:180px;margin:0 auto 8px;}.firma span{font-size:10px;color:#555;}.bottom{margin-top:24px;border-top:2px solid #1a56db;padding-top:10px;text-align:center;font-size:10px;color:#1a56db;font-weight:600;}@media print{body{padding:15px;}@page{margin:0.5cm;}}</style></head><body><div class="header"><div class="header-logo"><img src="${LOGO_URL}" alt="DiFiore"/></div><div class="header-info"><h1>RECIBO</h1><p>N° ${recibo.numero}</p><p>Ficha cliente: ${numeroFicha}</p><p>Fecha: ${new Date(recibo.fecha+'T12:00:00').toLocaleDateString('es-AR')}</p><p>Malvinas 2084 — Mar del Plata 7600</p></div></div><div class="datos"><div class="dato"><label>Cliente</label><span>${recibo.cliente||'—'}</span></div><div class="dato"><label>Vehículo</label><span>${recibo.vehiculo||'—'}</span></div><div class="dato"><label>Patente</label><span>${recibo.patente||'—'}</span></div><div class="dato"><label>Forma de pago</label><span>${recibo.forma_pago}</span></div></div><div class="monto-box"><label>MONTO RECIBIDO</label><div class="monto">${esUSD?'USS':'$'} ${montoNum?formatPeso(montoNum):'0'}</div></div><div class="concepto-box"><label>Concepto</label><p>${recibo.concepto||'—'}</p></div>${recibo.observaciones?`<div class="concepto-box"><label>Observaciones</label><p>${recibo.observaciones}</p></div>`:''}<div class="firma-box"><div class="firma"><div class="firma-line"></div><span>Firma del cliente</span></div><div class="firma"><div class="firma-line"></div><span>DiFiore Performance</span></div></div><div class="bottom">Di Fiore Performance — Malvinas 2084, Mar del Plata 7600 — ¡Gracias por confiar en nosotros!</div><script>window.onload=()=>{window.print()}<\/script></body></html>`
    abrirVentana(html)
    const nuevo=await incrementarNumeracion('recibo')
    setRecibo(r=>({...r,numero:formatNumeroDoc(nuevo)}))
  }

  function abrirWsp(trabajo){const tel=trabajo.vehiculos?.clientes?.telefono?.replace(/\D/g,'');setMsgWsp(`Hola ${trabajo.vehiculos?.clientes?.nombre}! Te contactamos desde DiFiore Performance con novedades sobre tu ${trabajo.vehiculos?.marca_modelo} (${trabajo.vehiculos?.patente}).`);setModalWsp({trabajo,tel})}
  function enviarFotoWsp(trabajo,fotoUrl){
    let tel=trabajo?.vehiculos?.clientes?.telefono?.replace(/\D/g,'')
    if(!tel){avisar('Este cliente no tiene teléfono cargado.','error');return}
    if(!tel.startsWith('54'))tel='54'+tel
    const msg=`Hola ${trabajo.vehiculos?.clientes?.nombre||''}! Te compartimos una foto de tu ${trabajo.vehiculos?.marca_modelo||'vehículo'}:\n${fotoUrl}`
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`,'_blank')
  }
  function enviarWsp(){if(!modalWsp)return;const t=modalWsp.trabajo;let tel=modalWsp.tel||'';if(!tel.startsWith('54'))tel='54'+tel;const msg=msgWsp+`\n\n_Datos:_\n• Cliente: ${t.vehiculos?.clientes?.nombre||''}\n• Vehículo: ${t.vehiculos?.marca_modelo||''}\n• Patente: ${t.vehiculos?.patente||''}`;window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`,'_blank');setModalWsp(null)}

  async function registrarReingreso(){
    if(guardandoReingreso) return // ya se está guardando, ignorar clics extra
    setGuardandoReingreso(true)
    const trabajo=modalReingreso
    const fechaIngreso=formReingreso.fecha_ingreso_manual?datetimeLocalAFechaISO(formReingreso.fecha_ingreso_manual):new Date().toISOString()
    const{data:nt}=await supabase.from('trabajos').insert({vehiculo_id:trabajo.vehiculos?.id,motivo:formReingreso.motivo,estado:formReingreso.estado,mecanico:formReingreso.mecanico,taller:formReingreso.taller,llego_en_grua:formReingreso.llego_en_grua,tiene_seguro:trabajo.tiene_seguro,fecha_ingreso:fechaIngreso}).select('*, vehiculos(*, clientes(*))').single()
    if(nt){await agregarHistorial(nt.id,'reingreso',`Reingreso al taller ${formReingreso.taller}. Motivo: ${formReingreso.motivo}`,fechaIngreso);await agregarHistorial(nt.id,'estado',`Historial anterior conservado (trabajo N° ${trabajo.id.slice(0,8)}).`)}
    setModalReingreso(null)
    setFormReingreso({motivo:'',mecanico:'',taller:'Malvinas 2084',estado:'Diagnóstico',llego_en_grua:false,fecha_ingreso_manual:''})
    await cargarTrabajos()
    setVerEntregados(false)
    setGuardandoReingreso(false)
  }

  async function guardarCliente(e){
    e.preventDefault()
    if(guardandoCliente) return
    setGuardandoCliente(true)
    const nuevoNumFicha=await incrementarNumeracion('cliente')
    const{data:cliente,error:errC}=await supabase.from('clientes').insert({nombre:form.nombre,telefono:form.telefono,email:form.email,numero_ficha:formatNumeroFicha(nuevoNumFicha)}).select().single()
    if(errC){setMensaje('Error al guardar cliente');setGuardandoCliente(false);return}
    const{data:vehiculo,error:errV}=await supabase.from('vehiculos').insert({cliente_id:cliente.id,marca_modelo:form.marca_modelo,patente:form.patente,anio:form.anio,kilometraje:form.kilometraje,color:form.color}).select().single()
    if(errV){setMensaje('Error al guardar vehículo');setGuardandoCliente(false);return}
    const fechaIngreso=form.fecha_ingreso_manual?datetimeLocalAFechaISO(form.fecha_ingreso_manual):new Date().toISOString()
    const{data:trabajo}=await supabase.from('trabajos').insert({vehiculo_id:vehiculo.id,motivo:form.motivo,estado:form.estado,mecanico:form.mecanico,taller:form.taller,llego_en_grua:form.llego_en_grua,tiene_seguro:form.tiene_seguro,fecha_ingreso:fechaIngreso}).select('*, vehiculos(*, clientes(*))').single()
    if(fotoNuevo.length>0&&trabajo)for(const f of fotoNuevo){const url=await subirFotoStorage(f,trabajo.id);if(url)await supabase.from('fotos').insert({trabajo_id:trabajo.id,url})}
    await agregarHistorial(trabajo.id,'ingreso',`Ingresó al taller ${form.taller} ${form.llego_en_grua?'(en grúa)':'(andando)'}. Seguro: ${form.tiene_seguro?'Sí':'No'}. Motivo: ${form.motivo}`,fechaIngreso)
    setForm({nombre:'',telefono:'',email:'',marca_modelo:'',patente:'',anio:'',kilometraje:'',color:'',motivo:'',estado:'Diagnóstico',mecanico:'',taller:'Malvinas 2084',llego_en_grua:false,tiene_seguro:false,fecha_ingreso_manual:''})
    setFotoNuevo([])
    await cargarTrabajos()
    if(trabajo?.vehiculos?.clientes?.telefono){
      const tel=trabajo.vehiculos.clientes.telefono.replace(/\D/g,'')
      setModalWsp({trabajo,tel})
      setMsgWsp(`Hola ${trabajo.vehiculos.clientes.nombre}! Te contactamos desde DiFiore Performance. Tu ${trabajo.vehiculos.marca_modelo} (${trabajo.vehiculos.patente}) ingresó al taller.`)
    } else setSeccion('clientes')
    setGuardandoCliente(false)
  }

  function horasEnTallerModal(){
    if(!modalSalida)return 0
    const fechaSalida=fechaSalidaManual?datetimeLocalAFechaISO(fechaSalidaManual):new Date().toISOString()
    return Math.max(0,(new Date(fechaSalida)-new Date(modalSalida.fecha_ingreso))/(1000*60*60))
  }

  async function registrarSalida(){
    if(guardandoSalida) return
    setGuardandoSalida(true)
    const fechaSalida=fechaSalidaManual?datetimeLocalAFechaISO(fechaSalidaManual):new Date().toISOString()
    await supabase.from('trabajos').update({estado:'Salio',fecha_salida:fechaSalida,observacion_final:observacionFinal}).eq('id',modalSalida.id)
    await agregarHistorial(modalSalida.id,'salida',`Vehículo retirado. ${observacionFinal?'Obs: '+observacionFinal:''}`,fechaSalida)
    const tActualizado={...modalSalida,estado:'Salio',fecha_salida:fechaSalida,observacion_final:observacionFinal}
    setModalSalida(null);setObservacionFinal('');setFechaSalidaManual('')
    if(clienteDetalle?.id===tActualizado.id){setSeccion('clientes');setClienteDetalle(null)}
    await cargarTrabajos()
    setGuardandoSalida(false)
    if(observacionFinal){
      pedirConfirmacion('¿Querés imprimir la orden con las observaciones finales?', ()=>imprimirOrdenConObservaciones(tActualizado,observacionFinal))
    }
  }

  // borrado suave: no elimina nada, solo marca el trabajo como borrado para poder recuperarlo desde la papelera
  async function borrarCliente(trabajo){
    pedirConfirmacion(`¿Borrar a ${trabajo.vehiculos?.clientes?.nombre}? Podés recuperarlo después desde la papelera.`, async()=>{
      await supabase.from('trabajos').update({borrado:true}).eq('id',trabajo.id)
      setSeccion('clientes');setClienteDetalle(null)
      await cargarTrabajos()
      avisar('Movido a la papelera','exito')
    })
  }

  async function restaurarCliente(trabajo){
    await supabase.from('trabajos').update({borrado:false}).eq('id',trabajo.id)
    await cargarTrabajos()
    avisar('Cliente restaurado','exito')
  }

  async function borrarClienteDefinitivo(trabajo){
    pedirConfirmacion(`Esto borra a ${trabajo.vehiculos?.clientes?.nombre} para siempre, sin poder recuperarlo. ¿Confirmás?`, async()=>{
      await supabase.from('historial').delete().eq('trabajo_id',trabajo.id)
      await supabase.from('actualizaciones').delete().eq('trabajo_id',trabajo.id)
      await supabase.from('repuestos').delete().eq('trabajo_id',trabajo.id)
      await supabase.from('fotos').delete().eq('trabajo_id',trabajo.id)
      await supabase.from('trabajos').delete().eq('id',trabajo.id)
      await supabase.from('vehiculos').delete().eq('id',trabajo.vehiculos?.id)
      await supabase.from('clientes').delete().eq('id',trabajo.vehiculos?.clientes?.id)
      await cargarTrabajos()
      avisar('Borrado definitivamente','exito')
    })
  }

  async function guardarEdicion(){
    if(guardandoEdicion) return
    setGuardandoEdicion(true)
    const ant=formEditar.taller_anterior,nvo=formEditar.taller
    const nuevaFechaIngreso=formEditar.fecha_ingreso?datetimeLocalAFechaISO(formEditar.fecha_ingreso):null
    await supabase.from('clientes').update({nombre:formEditar.nombre,telefono:formEditar.telefono,email:formEditar.email}).eq('id',formEditar.cliente_id)
    await supabase.from('vehiculos').update({marca_modelo:formEditar.marca_modelo,patente:formEditar.patente,anio:formEditar.anio,kilometraje:formEditar.kilometraje,color:formEditar.color}).eq('id',formEditar.vehiculo_id)
    const datosTrabajo={motivo:formEditar.motivo,estado:formEditar.estado,mecanico:formEditar.mecanico,taller:formEditar.taller,llego_en_grua:formEditar.llego_en_grua,tiene_seguro:formEditar.tiene_seguro}
    if(nuevaFechaIngreso)datosTrabajo.fecha_ingreso=nuevaFechaIngreso
    await supabase.from('trabajos').update(datosTrabajo).eq('id',formEditar.trabajo_id)
    if(nuevaFechaIngreso){
      // sincronizar el registro de ingreso/reingreso del historial con la nueva fecha
      const{data:historialIngreso}=await supabase.from('historial').select('id').eq('trabajo_id',formEditar.trabajo_id).in('tipo',['ingreso','reingreso']).limit(1).single()
      if(historialIngreso)await supabase.from('historial').update({fecha:nuevaFechaIngreso}).eq('id',historialIngreso.id)
    }
    if(ant!==nvo)await agregarHistorial(formEditar.trabajo_id,'movimiento',`Movido de ${ant} a ${nvo}`)
    setModalEditar(null)
    await cargarTrabajos()
    if(clienteDetalle)cargarHistorial(formEditar.vehiculo_id)
    setGuardandoEdicion(false)
  }

  async function guardarActualizacion(){
    if(guardandoActualizacion) return
    setGuardandoActualizacion(true)
    const t=modalActualizar
    let desc=formActualizar.descripcion,tipo=formActualizar.tipo
    if(tipo==='taller'){await supabase.from('trabajos').update({taller:formActualizar.taller_nuevo}).eq('id',t.id);desc=`Movido a ${formActualizar.taller_nuevo}. ${desc}`;tipo='movimiento'}
    else if(tipo==='prueba')desc=`En prueba. ${desc}`
    else if(tipo==='motor')desc=`Arreglo de motor. ${desc}`
    else if(tipo==='terceros')desc=`Esperando a terceros. ${desc}`
    else if(tipo==='repuestos')desc=`Esperando repuestos. ${desc}`
    else if(tipo==='aprobacion')desc=`Esperando aprobación del cliente. ${desc}`
    else if(tipo==='elevador')desc=`Esperando mecánico/elevador. ${desc}`
    else if(tipo==='diagnostico')desc=`Diagnóstico iniciado. ${desc}`
    else if(tipo==='service')desc=`Service iniciado. ${desc}`
    else if(tipo==='diagnostico_fin')desc=`Diagnóstico finalizado. ${desc}`
    else if(tipo==='cliente_aprobo')desc=`Cliente aprobó el presupuesto. ${desc}`
    else if(tipo==='cliente_pago')desc=`Cliente pagó los repuestos. ${desc}`
    else if(tipo==='oficina_salio')desc=`Salieron a comprar repuestos. ${desc}`
    else if(tipo==='repuestos_llegaron')desc=`Repuestos en el taller. ${desc}`
    else if(tipo==='reparacion')desc=`Reparación iniciada. ${desc}`
    else if(tipo==='repuesto_no_pactado')desc=`Repuesto no pactado necesario. ${desc}`
    else if(tipo==='mecanico_pide_repuestos')desc=`El mecánico pidió repuestos. ${desc}`
    else if(tipo==='esperando_retiro')desc=`Terminado, esperando que el cliente lo retire. ${desc}`
    else if(tipo==='trabajo_iniciado')desc=`Trabajo reiniciado. ${desc}`
    const fechaEvento=formActualizar.fecha_manual?datetimeLocalAFechaISO(formActualizar.fecha_manual):new Date().toISOString()
    const{error}=await supabase.from('actualizaciones').insert({trabajo_id:t.id,tipo,descripcion:desc,mecanico:formActualizar.mecanico||null,fecha:fechaEvento})
    if(error){avisar('No se pudo registrar: '+error.message,'error');setGuardandoActualizacion(false);return}
    setModalActualizar(null)
    setFormActualizar({tipo:'estado',descripcion:'',taller_nuevo:'Malvinas 3906',mecanico:'',fecha_manual:''})
    await cargarTrabajos()
    await cargarActualizacionesGlobal()
    if(clienteDetalle?.id===t.id){await cargarHistorial(t.vehiculos?.id);await cargarRepuestos(t.id)}
    avisar('Actualización registrada','exito')
    setGuardandoActualizacion(false)
  }

  function abrirEditarFechaHistorial(item){
    setNuevaFechaHistorial(fechaISOAInputLocal(item.fecha))
    setNuevoMecanicoHistorial(item.mecanico||'')
    setModalEditarFecha(item)
  }

  async function guardarFechaHistorial(){
    if(guardandoFechaHistorial)return
    if(!nuevaFechaHistorial){avisar('Elegí una fecha y hora','error');return}
    setGuardandoFechaHistorial(true)
    const{error}=await supabase.from('actualizaciones').update({fecha:datetimeLocalAFechaISO(nuevaFechaHistorial),mecanico:nuevoMecanicoHistorial||null}).eq('id',modalEditarFecha.id)
    if(error){avisar('No se pudo guardar: '+error.message,'error');setGuardandoFechaHistorial(false);return}
    setModalEditarFecha(null)
    await cargarActualizacionesGlobal()
    if(clienteDetalle?.vehiculos?.id)await cargarHistorial(clienteDetalle.vehiculos.id)
    setGuardandoFechaHistorial(false)
  }

  async function borrarActualizacion(item){
    pedirConfirmacion('¿Borrar esta actualización del historial?', async()=>{
      const{error}=await supabase.from('actualizaciones').delete().eq('id',item.id)
      if(error){avisar('No se pudo borrar: '+error.message,'error');return}
      await cargarActualizacionesGlobal()
      if(clienteDetalle?.vehiculos?.id)await cargarHistorial(clienteDetalle.vehiculos.id)
      avisar('Actualización borrada','exito')
    })
  }

  async function guardarRepuesto(){
    if(guardandoRepuesto) return
    setGuardandoRepuesto(true)
    const id=modalRepuesto.id
    await supabase.from('repuestos').insert({trabajo_id:id,nombre:formRepuesto.nombre,valor:parseFloat(parseNum(formRepuesto.valor.toString()))||0,lugar:formRepuesto.lugar,fecha:formRepuesto.fecha})
    setModalRepuesto(null)
    setFormRepuesto({nombre:'',valor:'',lugar:'',fecha:new Date().toISOString().split('T')[0]})
    await cargarRepuestos(id)
    setGuardandoRepuesto(false)
  }

  async function guardarEdicionRepuesto(){
    if(guardandoEdicionRepuesto) return
    setGuardandoEdicionRepuesto(true)
    await supabase.from('repuestos').update({nombre:formEditarRepuesto.nombre,valor:parseFloat(parseNum(formEditarRepuesto.valor.toString()))||0,lugar:formEditarRepuesto.lugar,fecha:formEditarRepuesto.fecha}).eq('id',formEditarRepuesto.id)
    setModalEditarRepuesto(null)
    await cargarRepuestos(clienteDetalle.id)
    setGuardandoEdicionRepuesto(false)
  }

  async function borrarRepuesto(r){
    pedirConfirmacion(`¿Borrar repuesto "${r.nombre}"?`, async()=>{
      await supabase.from('repuestos').delete().eq('id',r.id)
      await cargarRepuestos(clienteDetalle.id)
    })
  }
  async function subirFotosModal(e){const files=Array.from(e.target.files);if(!files.length||!modalFotos)return;setSubiendo(true);for(const f of files){const url=await subirFotoStorage(f,modalFotos.id);if(url)await supabase.from('fotos').insert({trabajo_id:modalFotos.id,url})}await cargarFotosModal(modalFotos.vehiculos?.id);setSubiendo(false);e.target.value=''}
  async function borrarFotoModal(f){await supabase.from('fotos').delete().eq('id',f.id);await cargarFotosModal(modalFotos.vehiculos?.id)}
  async function subirFoto(e){const files=Array.from(e.target.files);if(!files.length||!clienteDetalle)return;setSubiendo(true);for(const f of files){const url=await subirFotoStorage(f,clienteDetalle.id);if(url)await supabase.from('fotos').insert({trabajo_id:clienteDetalle.id,url})}await cargarFotos(clienteDetalle.id);setSubiendo(false);e.target.value=''}
  async function borrarFoto(f){await supabase.from('fotos').delete().eq('id',f.id);await cargarFotos(clienteDetalle.id)}
  function verDetalle(t){setClienteDetalle(t);setSeccion('detalle');setSidebarOpen(false);cargarFotos(t.id);cargarFotosAnteriores(t.vehiculos?.id,t.id);cargarHistorial(t.vehiculos?.id);cargarRepuestos(t.id);cargarPresupuestosVehiculo(t.vehiculos?.id);cargarChecklistsVehiculo(t.vehiculos?.id)}
  function abrirEditar(t){
    setFormEditar({trabajo_id:t.id,cliente_id:t.vehiculos?.clientes?.id,vehiculo_id:t.vehiculos?.id,nombre:t.vehiculos?.clientes?.nombre,telefono:t.vehiculos?.clientes?.telefono,email:t.vehiculos?.clientes?.email,marca_modelo:t.vehiculos?.marca_modelo,patente:t.vehiculos?.patente,anio:t.vehiculos?.anio,kilometraje:t.vehiculos?.kilometraje,color:t.vehiculos?.color,motivo:t.motivo,estado:t.estado,mecanico:t.mecanico,taller:t.taller,taller_anterior:t.taller,llego_en_grua:t.llego_en_grua||false,tiene_seguro:t.tiene_seguro||false,fecha_ingreso:fechaISOAInputLocal(t.fecha_ingreso)})
    setModalEditar(true)
  }
  function badgeClass(e){if(e==='Listo')return styles.badgeGreen;if(e==='En proceso')return styles.badgeAmber;if(e==='En espera')return styles.badgeBlue;if(e==='Desarmando')return styles.badgeRed;if(e==='Salio')return styles.badgeGray;return styles.badgeGray}
  function generarInforme(){const[anio,mes]=mesInforme.split('-').map(Number);const inicio=new Date(anio,mes-1,1),fin=new Date(anio,mes,0,23,59,59);const ingresados=trabajos.filter(t=>{const d=new Date(t.fecha_ingreso);return d>=inicio&&d<=fin});const salidos=trabajos.filter(t=>{if(!t.fecha_salida)return false;const d=new Date(t.fecha_salida);return d>=inicio&&d<=fin});const mc={};ingresados.forEach(t=>{const m=getMarca(t.vehiculos?.marca_modelo);mc[m]=(mc[m]||0)+1});const marcaTop=Object.entries(mc).sort((a,b)=>b[1]-a[1])[0];const nombreMes=new Date(anio,mes-1,1).toLocaleDateString('es-AR',{month:'long',year:'numeric'});return{ingresados,salidos,marcaTop,marcasCount:mc,nombreMes}}
  function exportarInformeExcel(){
    const{ingresados,salidos,marcasCount,nombreMes}=generarInforme()
    const hojaIngresados=XLSX.utils.json_to_sheet(ingresados.map(t=>({
      Vehiculo:t.vehiculos?.marca_modelo||'',Cliente:t.vehiculos?.clientes?.nombre||'',Patente:t.vehiculos?.patente||'',
      Taller:t.taller||'',Ingreso:new Date(t.fecha_ingreso).toLocaleDateString('es-AR')
    })))
    const hojaEntregados=XLSX.utils.json_to_sheet(salidos.map(t=>({
      Vehiculo:t.vehiculos?.marca_modelo||'',Cliente:t.vehiculos?.clientes?.nombre||'',Patente:t.vehiculos?.patente||'',
      Taller:t.taller||'',Entrega:t.fecha_salida?new Date(t.fecha_salida).toLocaleDateString('es-AR'):''
    })))
    const hojaMarcas=XLSX.utils.json_to_sheet(Object.entries(marcasCount).sort((a,b)=>b[1]-a[1]).map(([marca,cantidad])=>({Marca:marca,Cantidad:cantidad})))
    const libro=XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro,hojaIngresados,'Ingresados')
    XLSX.utils.book_append_sheet(libro,hojaEntregados,'Entregados')
    XLSX.utils.book_append_sheet(libro,hojaMarcas,'Marcas')
    XLSX.writeFile(libro,`informe-difiore-${nombreMes.replace(' ','-')}.xlsx`)
  }

  async function toggleExcluirTiempos(trabajo){
    const{error}=await supabase.from('trabajos').update({excluir_tiempos:!trabajo.excluir_tiempos}).eq('id',trabajo.id)
    if(error){avisar('No se pudo actualizar: '+error.message,'error');return}
    await cargarTrabajos()
    avisar(trabajo.excluir_tiempos?'Vehículo vuelto a incluir':'Vehículo excluido del cálculo','exito')
  }

  async function toggleExcluirEstancados(trabajo){
    const{error}=await supabase.from('trabajos').update({excluir_estancados:!trabajo.excluir_estancados}).eq('id',trabajo.id)
    if(error){avisar('No se pudo actualizar: '+error.message,'error');return}
    await cargarTrabajos()
    avisar(trabajo.excluir_estancados?'Vehículo vuelto a incluir en la alerta':'Vehículo excluido de la alerta de estancados','exito')
  }

  function exportarTiemposExcel(){
    const todasCategorias=Object.keys(CATEGORIA_POR_TIPO).map(k=>CATEGORIA_POR_TIPO[k]).filter((v,i,arr)=>arr.indexOf(v)===i)
    const hojaDetalle=XLSX.utils.json_to_sheet(tiemposDelMes.porTrabajo.map(({trabajo,categorias,totalHoras,motivoPrincipal})=>{
      const fila={Vehiculo:trabajo.vehiculos?.marca_modelo||'',Cliente:trabajo.vehiculos?.clientes?.nombre||'',Patente:trabajo.vehiculos?.patente||'','Total horas':Math.round(totalHoras*10)/10,'Motivo principal':motivoPrincipal?motivoPrincipal[0]:'—'}
      todasCategorias.forEach(cat=>{fila[cat]=Math.round((categorias[cat]||0)*10)/10})
      return fila
    }))
    const hojaResumen=XLSX.utils.json_to_sheet(Object.entries(tiemposDelMes.totalesPorCategoria).sort((a,b)=>b[1]-a[1]).map(([categoria,horas])=>({Categoria:categoria,Horas:Math.round(horas*10)/10})))
    const libro=XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro,hojaResumen,'Resumen')
    XLSX.utils.book_append_sheet(libro,hojaDetalle,'Detalle por vehiculo')
    XLSX.writeFile(libro,`tiempos-difiore-${mesTiempos}.xlsx`)
  }

  function exportarHistoricoExcel(){
    const hoja=XLSX.utils.json_to_sheet(historicoTiempos.map(m=>({
      Mes:new Date(m.mes+'-15').toLocaleDateString('es-AR',{month:'long',year:'numeric'}),
      'Eficiencia %':m.eficiencia,
      'Motivo principal':m.motivoGeneral?m.motivoGeneral[0]:'—',
      'Horas muertas':Math.round(m.horasMuertas*10)/10,
      'Cantidad de vehículos':m.cantidadVehiculos
    })))
    const libro=XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro,hoja,'Histórico')
    XLSX.writeFile(libro,`historico-tiempos-difiore.xlsx`)
  }

  function imprimirInforme(){const{ingresados,salidos,marcaTop,marcasCount,nombreMes}=generarInforme();const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Informe Mensual</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:30px;max-width:750px;margin:0 auto;}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;border-bottom:3px solid #1a56db;padding-bottom:16px;}.header-logo img{width:180px;}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;}.stat-box{border:2px solid #1a56db;border-radius:10px;padding:16px;text-align:center;}.stat-box .num{font-size:36px;font-weight:900;color:#1a56db;}.stat-box .lbl{font-size:10px;color:#555;text-transform:uppercase;letter-spacing:.5px;margin-top:4px;}.section{margin-bottom:20px;}.section-title{background:#222;color:#fff;font-weight:bold;font-size:11px;padding:6px 12px;margin-bottom:8px;letter-spacing:1px;}table{width:100%;border-collapse:collapse;}thead th{background:#f0f0f0;padding:8px 10px;text-align:left;font-size:10px;font-weight:700;border-bottom:2px solid #ccc;}tbody td{padding:8px 10px;border-bottom:1px solid #eee;font-size:11px;}tbody tr:nth-child(even){background:#f9f9f9;}.marcas{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}.marca-item{border:1px solid #e0e0e0;border-radius:6px;padding:10px;display:flex;justify-content:space-between;align-items:center;}.bottom{margin-top:24px;border-top:2px solid #1a56db;padding-top:10px;text-align:center;font-size:10px;color:#1a56db;font-weight:600;}@media print{body{padding:15px;}@page{margin:0.5cm;}}</style></head><body><div class="header"><div class="header-logo"><img src="${LOGO_URL}" alt="DiFiore"/></div><div style="text-align:right"><h1 style="font-size:22px;font-weight:900;color:#1a56db;margin-bottom:4px">INFORME MENSUAL</h1><p style="font-size:14px;font-weight:700;color:#333;margin-bottom:4px">${nombreMes.toUpperCase()}</p><p style="font-size:11px;color:#555">Generado: ${new Date().toLocaleDateString('es-AR')}</p></div></div><div class="stats"><div class="stat-box"><div class="num">${ingresados.length}</div><div class="lbl">Vehículos ingresados</div></div><div class="stat-box"><div class="num">${salidos.length}</div><div class="lbl">Vehículos entregados</div></div><div class="stat-box" style="border-color:#16A34A"><div class="num" style="color:#16A34A;font-size:24px">${marcaTop?marcaTop[0]:'—'}</div><div class="lbl">Marca más frecuente${marcaTop?` (${marcaTop[1]})`:''}</div></div></div><div class="section"><div class="section-title">VEHÍCULOS INGRESADOS (${ingresados.length})</div><table><thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Taller</th><th>Ingreso</th></tr></thead><tbody>${ingresados.map((t,i)=>`<tr><td>${i+1}</td><td>${t.vehiculos?.marca_modelo||'—'}</td><td>${t.vehiculos?.clientes?.nombre||'—'}</td><td>${t.vehiculos?.patente||'—'}</td><td>${t.taller||'—'}</td><td>${new Date(t.fecha_ingreso).toLocaleDateString('es-AR')}</td></tr>`).join('')}${ingresados.length===0?'<tr><td colspan="6" style="text-align:center;color:#999;padding:16px">Sin ingresos este mes</td></tr>':''}</tbody></table></div><div class="section"><div class="section-title">VEHÍCULOS ENTREGADOS (${salidos.length})</div><table><thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Taller</th><th>Entrega</th></tr></thead><tbody>${salidos.map((t,i)=>`<tr><td>${i+1}</td><td>${t.vehiculos?.marca_modelo||'—'}</td><td>${t.vehiculos?.clientes?.nombre||'—'}</td><td>${t.vehiculos?.patente||'—'}</td><td>${t.taller||'—'}</td><td>${new Date(t.fecha_salida).toLocaleDateString('es-AR')}</td></tr>`).join('')}${salidos.length===0?'<tr><td colspan="6" style="text-align:center;color:#999;padding:16px">Sin entregas este mes</td></tr>':''}</tbody></table></div><div class="section"><div class="section-title">MARCAS ATENDIDAS</div><div class="marcas">${Object.entries(marcasCount).sort((a,b)=>b[1]-a[1]).map(([m,n])=>`<div class="marca-item"><span style="font-size:13px;color:#555">${m}</span><b style="font-size:18px;color:#1a56db">${n}</b></div>`).join('')}</div></div><div class="bottom">Di Fiore Performance — Malvinas 2084, Mar del Plata 7600</div><script>window.onload=()=>{window.print()}<\/script></body></html>`;abrirVentana(html)}

  const trabajosVivos=useMemo(()=>trabajos.filter(t=>!t.borrado),[trabajos])
  const trabajosBorrados=useMemo(()=>trabajos.filter(t=>t.borrado).sort((a,b)=>new Date(b.fecha_ingreso)-new Date(a.fecha_ingreso)),[trabajos])
  const trabajosActivos=useMemo(()=>trabajosVivos.filter(t=>t.estado!=='Salio'),[trabajosVivos])
  const trabajosEntregados=useMemo(()=>trabajosVivos.filter(t=>t.estado==='Salio').sort((a,b)=>new Date(b.fecha_salida||b.fecha_ingreso)-new Date(a.fecha_salida||a.fecha_ingreso)),[trabajosVivos])
  const conteoMarcas=useMemo(()=>trabajosActivos.reduce((acc,t)=>{const m=getMarca(t.vehiculos?.marca_modelo);acc[m]=(acc[m]||0)+1;return acc},{}),[trabajosActivos])
  const trabajosFiltrados=useMemo(()=>trabajosVivos.filter(t=>t.estado!=='Salio').filter(t=>{const q=busqueda.toLowerCase();return t.vehiculos?.clientes?.nombre?.toLowerCase().includes(q)||t.vehiculos?.patente?.toLowerCase().includes(q)||t.vehiculos?.marca_modelo?.toLowerCase().includes(q)}).sort((a,b)=>new Date(b.fecha_ingreso)-new Date(a.fecha_ingreso)),[trabajosVivos,busqueda])
  const trabajosEntregadosFiltrados=useMemo(()=>trabajosEntregados.filter(t=>{const q=busquedaEntregados.toLowerCase();return t.vehiculos?.clientes?.nombre?.toLowerCase().includes(q)||t.vehiculos?.patente?.toLowerCase().includes(q)||t.vehiculos?.marca_modelo?.toLowerCase().includes(q)}),[trabajosEntregados,busquedaEntregados])
  const totalFiltrados=trabajosFiltrados.length
  const stats={total:clientes.length,enTaller:trabajosActivos.length,listos:trabajosVivos.filter(t=>t.estado==='Listo').length,salidos:trabajosEntregados.length}
  const listaVistaStats={enTaller:trabajosVivos.filter(t=>t.estado!=='Salio').sort((a,b)=>new Date(b.fecha_ingreso)-new Date(a.fecha_ingreso)),listos:trabajosVivos.filter(t=>t.estado==='Listo').sort((a,b)=>new Date(b.fecha_ingreso)-new Date(a.fecha_ingreso)),salidos:trabajosEntregados}
  const titulosVistaStats={enTaller:'Autos en taller',listos:'Listos para entregar',salidos:'Vehículos entregados'}
  const tipoHistorial={ingreso:'🟢',salida:'🔴',movimiento:'🔵',reingreso:'🟡',estado:'⚪',prueba:'🟠',motor:'🔧',terceros:'⏳',repuestos:'📦',aprobacion:'✍️',elevador:'🅿️',diagnostico:'🔍',reparacion:'🛠️',diagnostico_fin:'✅',cliente_aprobo:'👍',cliente_pago:'💵',oficina_salio:'🚗',repuestos_llegaron:'📦',repuesto_no_pactado:'⚠️',mecanico_pide_repuestos:'🔧',trabajo_iniciado:'▶️',service:'🛢️',esperando_retiro:'🔑'}
  const trabajosTaller=tallerVista?trabajosVivos.filter(t=>t.taller===tallerVista&&t.estado!=='Salio').sort((a,b)=>new Date(b.fecha_ingreso)-new Date(a.fecha_ingreso)):[]
  const trabajosDeMarca=vistaMarca?trabajosActivos.filter(t=>getMarca(t.vehiculos?.marca_modelo)===vistaMarca).sort((a,b)=>new Date(b.fecha_ingreso)-new Date(a.fecha_ingreso)):[]
  const ultimaActualizacionPorTrabajo=useMemo(()=>{
    const mapa={}
    actualizacionesRaw.forEach(a=>{
      if(!mapa[a.trabajo_id]||new Date(a.fecha)>new Date(mapa[a.trabajo_id]))mapa[a.trabajo_id]=a.fecha
    })
    return mapa
  },[actualizacionesRaw])
  function fechaReferenciaEstancado(t){ return ultimaActualizacionPorTrabajo[t.id]||t.fecha_ingreso }
  const trabajosEstancados=useMemo(()=>trabajosActivos.filter(t=>diasDesde(fechaReferenciaEstancado(t))>=umbralEstancados&&!t.excluir_estancados).sort((a,b)=>diasDesde(fechaReferenciaEstancado(b))-diasDesde(fechaReferenciaEstancado(a))),[trabajosActivos,ultimaActualizacionPorTrabajo,umbralEstancados])
  const estancadosExcluidos=useMemo(()=>trabajosActivos.filter(t=>diasDesde(fechaReferenciaEstancado(t))>=umbralEstancados&&t.excluir_estancados).sort((a,b)=>diasDesde(fechaReferenciaEstancado(b))-diasDesde(fechaReferenciaEstancado(a))),[trabajosActivos,ultimaActualizacionPorTrabajo,umbralEstancados])
  const resultadosGlobales=useMemo(()=>{
    const q=busquedaGlobal.trim().toLowerCase()
    if(q.length<2)return{clientes:[],presupuestos:[],checklists:[]}
    const clientesRes=trabajosVivos.filter(t=>t.vehiculos?.clientes?.nombre?.toLowerCase().includes(q)||t.vehiculos?.patente?.toLowerCase().includes(q)||t.vehiculos?.marca_modelo?.toLowerCase().includes(q)).slice(0,6)
    const presupuestosRes=presupuestos.filter(p=>p.cliente?.toLowerCase().includes(q)||p.vehiculo?.toLowerCase().includes(q)||p.numero?.toLowerCase().includes(q)).slice(0,5)
    const checklistsRes=checklists.filter(c=>c.vehiculo?.toLowerCase().includes(q)||c.patente?.toLowerCase().includes(q)||c.mecanico?.toLowerCase().includes(q)).slice(0,5)
    return{clientes:clientesRes,presupuestos:presupuestosRes,checklists:checklistsRes}
  },[busquedaGlobal,trabajosVivos,presupuestos,checklists])
  const hayResultadosGlobales=resultadosGlobales.clientes.length>0||resultadosGlobales.presupuestos.length>0||resultadosGlobales.checklists.length>0
  const planPorMecanico=useMemo(()=>{
    const mapa={}
    planDiario.forEach(p=>{
      const m=p.mecanico||'Sin asignar'
      if(!mapa[m])mapa[m]=[]
      mapa[m].push(p)
    })
    return Object.entries(mapa).sort((a,b)=>a[0]==='Sin asignar'?1:b[0]==='Sin asignar'?-1:a[0].localeCompare(b[0]))
  },[planDiario])
  const reingresosPorVehiculo=useMemo(()=>{
    if(seccion!=='dashboard')return[]
    const mapa={}
    reingresosRaw.forEach(h=>{
      const t=trabajos.find(tr=>tr.id===h.trabajo_id)
      const vehId=t?.vehiculos?.id
      if(!vehId)return
      if(!mapa[vehId])mapa[vehId]={vehiculo:t.vehiculos,cantidad:0}
      mapa[vehId].cantidad++
    })
    return Object.values(mapa).sort((a,b)=>b.cantidad-a.cantidad)
  },[seccion,reingresosRaw,trabajos])

  const tiemposDelMes=useMemo(()=>{
    if(seccion!=='tiempos')return{porTrabajo:[],totalesPorCategoria:{},eficiencia:0,tiempoMuertoProm:0,motivoGeneral:null,excluidos:[],statsPorMecanico:[],statsOficina:[],horasClientes:0,horasMuertas:0,horasMuertasSinCerrado:0,porTerceros:[],porCliente:[],costoTiempoMuerto:0}
    const trabajosDelMes=trabajosVivos.filter(t=>t.fecha_ingreso&&t.fecha_ingreso.slice(0,7)===mesTiempos&&!t.excluir_tiempos)
    const excluidosDelMes=trabajosVivos.filter(t=>t.fecha_ingreso&&t.fecha_ingreso.slice(0,7)===mesTiempos&&t.excluir_tiempos)
    const porTrabajo=trabajosDelMes.map(t=>{
      const eventos=actualizacionesRaw.filter(a=>a.trabajo_id===t.id)
      const categorias=calcularTiemposTrabajo(t,eventos)
      const totalHoras=Object.values(categorias).reduce((a,b)=>a+b,0)
      const motivoPrincipal=Object.entries(categorias).sort((a,b)=>b[1]-a[1])[0]
      return{trabajo:t,categorias,totalHoras,motivoPrincipal}
    })
    const totalesPorCategoria={}
    porTrabajo.forEach(({categorias})=>{
      Object.entries(categorias).forEach(([cat,horas])=>{totalesPorCategoria[cat]=(totalesPorCategoria[cat]||0)+horas})
    })
    const horasMuertas=Object.entries(totalesPorCategoria).filter(([cat])=>CATEGORIAS_MUERTAS.includes(cat)).reduce((a,[,h])=>a+h,0)
    const horasMuertasSinCerrado=Object.entries(totalesPorCategoria).filter(([cat])=>CATEGORIAS_MUERTAS.includes(cat)&&cat!=='Taller cerrado').reduce((a,[,h])=>a+h,0)
    const horasTotales=Object.values(totalesPorCategoria).reduce((a,b)=>a+b,0)
    const eficiencia=horasTotales>0?Math.round(((horasTotales-horasMuertas)/horasTotales)*100):0
    const tiempoMuertoProm=porTrabajo.length>0?Math.round(horasMuertas/porTrabajo.length):0
    const motivoGeneral=Object.entries(totalesPorCategoria).filter(([cat])=>CATEGORIAS_MUERTAS.includes(cat)&&cat!=='Taller cerrado').sort((a,b)=>b[1]-a[1])[0]
    const horasClientes=Object.entries(totalesPorCategoria).filter(([cat])=>CATEGORIAS_CLIENTE.includes(cat)).reduce((a,[,h])=>a+h,0)
    const statsPorMecanicoTodos=calcularStatsMecanicoGeneral(trabajosDelMes,actualizacionesRaw)
    const statsOficina=statsPorMecanicoTodos.filter(s=>s.mecanico==='Oficina')
    const statsPorMecanico=statsPorMecanicoTodos.filter(s=>s.mecanico!=='Oficina')
    const porTerceros=porTrabajo.filter(p=>p.categorias['Esperando a terceros']>0).map(p=>({trabajo:p.trabajo,horas:p.categorias['Esperando a terceros']})).sort((a,b)=>b.horas-a.horas)
    const porCliente=porTrabajo.filter(p=>((p.categorias['Esperando aprobación del cliente']||0)+(p.categorias['Esperando pago de repuestos']||0))>0).map(p=>({trabajo:p.trabajo,horas:(p.categorias['Esperando aprobación del cliente']||0)+(p.categorias['Esperando pago de repuestos']||0)})).sort((a,b)=>b.horas-a.horas)
    const costoTiempoMuerto=horasMuertasSinCerrado*costoHoraTaller
    const retrabajoPorMecanico=calcularRetrabajoPorMecanico(trabajosVivos,actualizacionesRaw,reingresosRaw)
    const statsConCarga=statsPorMecanico.map(s=>({...s,cargaMaxima:calcularCargaMaxima(s.items),retrabajo:retrabajoPorMecanico.find(r=>r.mecanico===s.mecanico)||{totalReparaciones:0,retrabajos:0}}))
    return{porTrabajo:porTrabajo.sort((a,b)=>b.totalHoras-a.totalHoras),totalesPorCategoria,eficiencia,tiempoMuertoProm,motivoGeneral,excluidos:excluidosDelMes,statsPorMecanico:statsConCarga,statsOficina,horasClientes,horasMuertas,horasMuertasSinCerrado,porTerceros,porCliente,costoTiempoMuerto}
  },[seccion,trabajosVivos,actualizacionesRaw,mesTiempos,costoHoraTaller,reingresosRaw])

  const historicoTiempos=useMemo(()=>{
    if(seccion!=='tiempos'||vistaTiempos!=='historico')return[]
    const meses=[]
    const base=new Date(mesTiempos+'-15')
    for(let i=5;i>=0;i--){
      const d=new Date(base.getFullYear(),base.getMonth()-i,1)
      const m=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      if(m>=MES_INICIO_CONTROL_TIEMPOS)meses.push(m)
    }
    return meses.map(m=>calcularResumenMes(trabajosVivos,actualizacionesRaw,m))
  },[seccion,vistaTiempos,trabajosVivos,actualizacionesRaw,mesTiempos])

  const cuelloBotellaPersistente=useMemo(()=>{
    if(historicoTiempos.length<3)return null
    const ultimos3=historicoTiempos.slice(-3)
    if(ultimos3.some(m=>!m.motivoGeneral))return null
    const motivos=ultimos3.map(m=>m.motivoGeneral[0])
    if(motivos[0]===motivos[1]&&motivos[1]===motivos[2])return motivos[0]
    return null
  },[historicoTiempos])

  const tiempoPorMarca=useMemo(()=>{
    if(seccion!=='tiempos'||vistaTiempos!=='marca')return[]
    const trabajosDesdeInicio=trabajosVivos.filter(t=>t.fecha_ingreso&&t.fecha_ingreso.slice(0,7)>=MES_INICIO_CONTROL_TIEMPOS)
    return calcularTiempoPorMarca(trabajosDesdeInicio,actualizacionesRaw)
  },[seccion,vistaTiempos,trabajosVivos,actualizacionesRaw])

  const{totalEfectivo,totalTransferencia,totalManoObraUSD}=calcularTotalesPresupuesto()
  const mecanicos=empleados.filter(e=>e.rol==='mecanico')
  const hoy=new Date().toISOString().split('T')[0]
  const navLinks=[{color:'#E1306C',icon:<IgIcon/>,href:'https://www.instagram.com/di_fiore_mecanica/',label:'@di_fiore_mecanica'},{color:'#1877F2',icon:<FbIcon/>,href:'https://www.facebook.com/share/19VHZRovXq/?mibextid=wwXIfr',label:'di_fiore_mecanica'},{color:'#25D366',icon:<WaIcon/>,href:'tel:+542235299700',label:'223 529-9700'},{color:'#EA4335',icon:<MapIcon/>,href:'https://maps.google.com/maps?ftid=0x9584d9005992c969:0x872bb0a9e0f1a2f1',label:'Malvinas 2084, MdP'}]
  const usandoUSD=presupuesto.moneda_mano_obra==='USD'

  function renderCalendario() {
    const{primerDia,diasEnMes,anio,mes}=getDiasDelMes(mesCalendario)
    const celdas=[]
    for(let i=0;i<primerDia;i++) celdas.push(null)
    for(let d=1;d<=diasEnMes;d++) celdas.push(d)
    return(
      <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <button className={styles.btn} style={{padding:'8px 16px',fontSize:'16px'}} onClick={()=>setMesCalendario(new Date(anio,mes-1,1))}>‹</button>
          <span style={{fontWeight:'700',fontSize:'18px',color:'#2D3748'}}>{MESES[mes]} {anio}</span>
          <button className={styles.btn} style={{padding:'8px 16px',fontSize:'16px'}} onClick={()=>setMesCalendario(new Date(anio,mes+1,1))}>›</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'6px',marginBottom:'10px'}}>
          {DIAS_SEMANA.map(d=><div key={d} style={{textAlign:'center',fontSize:'12px',fontWeight:'700',color:'#718096',padding:'6px 0'}}>{d}</div>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'6px'}}>
          {celdas.map((dia,i)=>{
            if(!dia) return <div key={i}/>
            const f=fechaStr(anio,mes,dia)
            const tDia=turnosPorDia(f)
            const esHoy=f===hoy
            const completo=tDia.length>=MAX_TURNOS_POR_DIA
            const seleccionado=diaSeleccionado===f
            return(
              <div key={i} onClick={()=>abrirDia(f)} style={{minHeight:'72px',borderRadius:'10px',padding:'6px',cursor:'pointer',border:`2px solid ${seleccionado?'#2563EB':esHoy?'#F59E0B':'#E2E8F0'}`,background:seleccionado?'#EFF6FF':esHoy?'#FFFBEB':completo?'#FEF2F2':'#F7FAFC',transition:'all .15s'}}>
                <div style={{textAlign:'center',fontSize:'14px',fontWeight:esHoy?'700':'600',color:esHoy?'#D97706':completo?'#DC2626':'#2D3748',marginBottom:'4px'}}>{dia}</div>
                {tDia.length>0&&<div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
                  {tDia.slice(0,3).map((t,j)=><div key={j} style={{fontSize:'10px',background:completo?'#FECACA':'#BFDBFE',color:completo?'#991B1B':'#1E40AF',borderRadius:'4px',padding:'2px 4px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.nombre}</div>)}
                  {tDia.length>3&&<div style={{fontSize:'10px',color:'#718096',textAlign:'center'}}>+{tDia.length-3} más</div>}
                </div>}
                {tDia.length===0&&<div style={{fontSize:'10px',color:'#CBD5E0',textAlign:'center',marginTop:'6px'}}>libre</div>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
return (
    <div className={styles.app}>
      <button className={styles.menuBtn} onClick={()=>setSidebarOpen(!sidebarOpen)}>☰</button>
      {sidebarOpen&&<div className={styles.sidebarOverlay} onClick={()=>setSidebarOpen(false)}/>}
      {toast&&<div style={{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',background:toast.tipo==='error'?'#DC2626':toast.tipo==='exito'?'#16A34A':'#1F2937',color:'#fff',padding:'12px 22px',borderRadius:'8px',fontSize:'13px',fontWeight:'600',zIndex:9999,boxShadow:'0 4px 16px rgba(0,0,0,.25)'}}>{toast.mensaje}</div>}

      {modalWsp&&<div className={styles.modalOverlay}><div className={styles.modal}><div className={styles.modalTitle}>💬 Enviar WhatsApp</div><div className={styles.modalSub}>{modalWsp.trabajo?.vehiculos?.clientes?.nombre} · {modalWsp.trabajo?.vehiculos?.clientes?.telefono}</div><div className={styles.formGroup} style={{marginTop:'1rem'}}><label>Mensaje</label><textarea value={msgWsp} onChange={e=>setMsgWsp(e.target.value)} style={{minHeight:'100px'}}/></div><div className={styles.modalActions}><button className={styles.btn} onClick={()=>{setModalWsp(null);setSeccion('clientes')}}>Cancelar</button><button style={{padding:'8px 16px',borderRadius:'6px',fontSize:'13px',cursor:'pointer',background:'#25D366',color:'#fff',border:'none',fontFamily:'inherit',fontWeight:'600'}} onClick={enviarWsp}>Enviar WhatsApp</button></div></div></div>}

      {modalReingreso&&<div className={styles.modalOverlay}><div className={styles.modal}><div className={styles.modalTitle}>🔄 Registrar reingreso</div><div className={styles.modalSub}><b>{modalReingreso.vehiculos?.marca_modelo}</b> — {modalReingreso.vehiculos?.clientes?.nombre}</div><div style={{fontSize:'11px',color:'#2563EB',background:'#EFF6FF',padding:'8px 12px',borderRadius:'6px',marginTop:'8px'}}>ℹ️ El historial anterior del vehículo se conserva.</div><div style={{marginTop:'1rem',display:'flex',flexDirection:'column',gap:'10px'}}><div className={styles.formGroup}><label>Motivo</label><textarea value={formReingreso.motivo} onChange={e=>setFormReingreso({...formReingreso,motivo:e.target.value})} placeholder="Describí el problema..."/></div><div className={styles.formGrid}><div className={styles.formGroup}><label>Mecánico</label><input value={formReingreso.mecanico} onChange={e=>setFormReingreso({...formReingreso,mecanico:e.target.value})}/></div><div className={styles.formGroup}><label>Estado</label><select value={formReingreso.estado} onChange={e=>setFormReingreso({...formReingreso,estado:e.target.value})}><option>Diagnóstico</option><option>En proceso</option><option>En espera</option><option>Desarmando</option><option>Listo</option></select></div><div className={styles.formGroup}><label>Taller</label><select value={formReingreso.taller} onChange={e=>setFormReingreso({...formReingreso,taller:e.target.value})}><option>Malvinas 2084</option><option>Malvinas 3906</option></select></div><div className={styles.formGroup}><label>Llegó en</label><select value={formReingreso.llego_en_grua?'grua':'andando'} onChange={e=>setFormReingreso({...formReingreso,llego_en_grua:e.target.value==='grua'})}><option value="andando">Andando</option><option value="grua">En grúa</option></select></div><div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Fecha de ingreso</label><input type="datetime-local" value={formReingreso.fecha_ingreso_manual} onChange={e=>setFormReingreso({...formReingreso,fecha_ingreso_manual:e.target.value})}/></div></div></div><div className={styles.modalActions}><button className={styles.btn} onClick={()=>setModalReingreso(null)} disabled={guardandoReingreso}>Cancelar</button><button className={styles.btnPrimary} onClick={registrarReingreso} disabled={guardandoReingreso}>{guardandoReingreso?'Guardando...':'Registrar reingreso'}</button></div></div></div>}

      {modalSalida&&<div className={styles.modalOverlay}><div className={styles.modal}><div className={styles.modalTitle}>Registrar salida</div><div className={styles.modalSub}><b>{modalSalida.vehiculos?.marca_modelo}</b> — {modalSalida.vehiculos?.clientes?.nombre}</div><div className={styles.formGroup} style={{marginTop:'1rem'}}><label>Observación final</label><textarea value={observacionFinal} onChange={e=>setObservacionFinal(e.target.value)} placeholder="Trabajo realizado, recomendaciones, etc..."/></div><div className={styles.formGroup} style={{marginTop:'10px'}}><label>Fecha y hora de salida</label><input type="datetime-local" value={fechaSalidaManual} onChange={e=>setFechaSalidaManual(e.target.value)}/><div style={{fontSize:'11px',color:'#A0AEC0',marginTop:'4px'}}>Dejalo vacío para usar la hora actual ({formatFechaAR(new Date().toISOString(),true)}).</div></div><div style={{marginTop:'10px',padding:'10px 12px',background:'#F7FAFC',borderRadius:'8px',border:'1px solid #E2E8F0',fontSize:'13px',color:'#2D3748'}}>⏱️ Total en el taller: <b>{formatHoras(horasEnTallerModal())}h</b></div><div className={styles.modalActions}><button className={styles.btn} onClick={()=>{setModalSalida(null);setFechaSalidaManual('')}}>Cancelar</button><button className={styles.btnDangerSolid} onClick={registrarSalida} disabled={guardandoSalida}>{guardandoSalida?'Guardando...':'Confirmar salida'}</button></div></div></div>}

      {modalEditar&&admin&&<div className={styles.modalOverlay}><div className={styles.modal} style={{width:'100%',maxWidth:'520px',maxHeight:'80vh',overflowY:'auto'}}><div className={styles.modalTitle}>Editar cliente</div><div style={{marginTop:'1rem'}}><div className={styles.cardTitle}>Datos del cliente</div><div className={styles.formGrid} style={{marginBottom:'1rem'}}><div className={styles.formGroup}><label>Nombre</label><input value={formEditar.nombre||''} onChange={e=>setFormEditar({...formEditar,nombre:e.target.value})}/></div><div className={styles.formGroup}><label>Teléfono</label><input value={formEditar.telefono||''} onChange={e=>setFormEditar({...formEditar,telefono:e.target.value})}/></div><div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Email</label><input value={formEditar.email||''} onChange={e=>setFormEditar({...formEditar,email:e.target.value})}/></div></div><div className={styles.cardTitle}>Datos del vehículo</div><div className={styles.formGrid} style={{marginBottom:'1rem'}}><div className={styles.formGroup}><label>Modelo</label><input value={formEditar.marca_modelo||''} onChange={e=>setFormEditar({...formEditar,marca_modelo:e.target.value})}/></div><div className={styles.formGroup}><label>Patente</label><input value={formEditar.patente||''} onChange={e=>setFormEditar({...formEditar,patente:e.target.value})}/></div><div className={styles.formGroup}><label>Año</label><input value={formEditar.anio||''} onChange={e=>setFormEditar({...formEditar,anio:e.target.value})}/></div><div className={styles.formGroup}><label>Km</label><input value={formEditar.kilometraje||''} onChange={e=>setFormEditar({...formEditar,kilometraje:e.target.value})}/></div><div className={styles.formGroup}><label>Color</label><input value={formEditar.color||''} onChange={e=>setFormEditar({...formEditar,color:e.target.value})}/></div><div className={styles.formGroup}><label>Llegó en grúa</label><select value={formEditar.llego_en_grua?'si':'no'} onChange={e=>setFormEditar({...formEditar,llego_en_grua:e.target.value==='si'})}><option value="no">No — Andando</option><option value="si">Sí — En grúa</option></select></div><div className={styles.formGroup}><label>Tiene seguro</label><select value={formEditar.tiene_seguro?'si':'no'} onChange={e=>setFormEditar({...formEditar,tiene_seguro:e.target.value==='si'})}><option value="no">No</option><option value="si">Sí</option></select></div><div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Motivo</label><textarea value={formEditar.motivo||''} onChange={e=>setFormEditar({...formEditar,motivo:e.target.value})}/></div><div className={styles.formGroup}><label>Fecha de ingreso</label><input type="datetime-local" value={formEditar.fecha_ingreso||''} onChange={e=>setFormEditar({...formEditar,fecha_ingreso:e.target.value})}/></div><div className={styles.formGroup}><label>Mecánico</label><input value={formEditar.mecanico||''} onChange={e=>setFormEditar({...formEditar,mecanico:e.target.value})}/></div><div className={styles.formGroup}><label>Estado</label><select value={formEditar.estado||''} onChange={e=>setFormEditar({...formEditar,estado:e.target.value})}><option>Diagnóstico</option><option>En proceso</option><option>En espera</option><option>Desarmando</option><option>Listo</option><option>Salio</option></select></div><div className={styles.formGroup}><label>Taller</label><select value={formEditar.taller||''} onChange={e=>setFormEditar({...formEditar,taller:e.target.value})}><option>Malvinas 2084</option><option>Malvinas 3906</option></select></div></div></div><div className={styles.modalActions}><button className={styles.btn} onClick={()=>setModalEditar(null)}>Cancelar</button><button className={styles.btnPrimary} onClick={guardarEdicion} disabled={guardandoEdicion}>{guardandoEdicion?'Guardando...':'Guardar cambios'}</button></div></div></div>}

      {modalActualizar&&<div className={styles.modalOverlay}><div className={styles.modal}><div className={styles.modalTitle}>Registrar actualización</div><div className={styles.modalSub}><b>{modalActualizar.vehiculos?.marca_modelo}</b> — {modalActualizar.vehiculos?.clientes?.nombre}</div><div style={{marginTop:'1rem',display:'flex',flexDirection:'column',gap:'10px'}}><div className={styles.formGroup}><label>Categoría</label><select value={formActualizar.tipo} onChange={e=>setFormActualizar({...formActualizar,tipo:e.target.value})}><option value="estado">Actualización de estado</option><option value="diagnostico">Diagnóstico iniciado</option><option value="service">Service iniciado</option><option value="diagnostico_fin">Diagnóstico finalizado</option><option value="mecanico_pide_repuestos">Mecánico pide repuestos</option><option value="cliente_aprobo">Cliente aprobó presupuesto</option><option value="cliente_pago">Cliente pagó los repuestos</option><option value="oficina_salio">Salieron a comprar repuestos</option><option value="repuestos_llegaron">Repuestos en el taller</option><option value="reparacion">Reparación iniciada</option><option value="esperando_retiro">Esperando que el cliente retire el vehículo</option><option value="repuesto_no_pactado">Repuesto no pactado necesario</option><option value="trabajo_iniciado">Trabajo reiniciado</option><option value="prueba">En prueba</option><option value="motor">Arreglo de motor</option><option value="terceros">Esperando a terceros</option><option value="repuestos">Esperando repuestos (genérico)</option><option value="aprobacion">Esperando aprobación del cliente (manual)</option><option value="elevador">Esperando mecánico/elevador</option><option value="taller">Cambio de taller</option></select></div><div className={styles.formGroup}><label>Mecánico (opcional)</label><select value={formActualizar.mecanico} onChange={e=>setFormActualizar({...formActualizar,mecanico:e.target.value})}><option value="">— Sin asignar —</option><option value="Oficina">🏢 Oficina</option>{mecanicos.map(m=><option key={m.id} value={m.nombre}>{m.nombre}</option>)}</select></div>{formActualizar.tipo==='taller'&&<div className={styles.formGroup}><label>Mover a</label><select value={formActualizar.taller_nuevo} onChange={e=>setFormActualizar({...formActualizar,taller_nuevo:e.target.value})}><option>Malvinas 2084</option><option>Malvinas 3906</option></select></div>}<div className={styles.formGroup}><label>Fecha y hora (opcional, si pasó antes)</label><input type="datetime-local" value={formActualizar.fecha_manual} onChange={e=>setFormActualizar({...formActualizar,fecha_manual:e.target.value})}/><div style={{fontSize:'11px',color:'#A0AEC0',marginTop:'4px'}}>Dejalo vacío para usar la hora actual.</div></div><div className={styles.formGroup}><label>Descripción</label><textarea value={formActualizar.descripcion} onChange={e=>setFormActualizar({...formActualizar,descripcion:e.target.value})} placeholder="Detallá la actualización..."/></div></div><div className={styles.modalActions}><button className={styles.btn} onClick={()=>setModalActualizar(null)}>Cancelar</button><button className={styles.btnSuccess} onClick={guardarActualizacion} disabled={guardandoActualizacion}>{guardandoActualizacion?'Guardando...':'Guardar'}</button></div></div></div>}

      {modalEditarFecha&&<div className={styles.modalOverlay}><div className={styles.modal}><div className={styles.modalTitle}>Editar actualización</div><div className={styles.modalSub}>{modalEditarFecha.descripcion}</div><div className={styles.formGroup} style={{marginTop:'1rem'}}><label>Fecha y hora correcta</label><input type="datetime-local" value={nuevaFechaHistorial} onChange={e=>setNuevaFechaHistorial(e.target.value)}/></div><div className={styles.formGroup} style={{marginTop:'10px'}}><label>Mecánico</label><select value={nuevoMecanicoHistorial} onChange={e=>setNuevoMecanicoHistorial(e.target.value)}><option value="">— Sin asignar —</option><option value="Oficina">🏢 Oficina</option>{mecanicos.map(m=><option key={m.id} value={m.nombre}>{m.nombre}</option>)}</select></div><div className={styles.modalActions}><button className={styles.btn} onClick={()=>setModalEditarFecha(null)}>Cancelar</button><button className={styles.btnPrimary} onClick={guardarFechaHistorial} disabled={guardandoFechaHistorial}>{guardandoFechaHistorial?'Guardando...':'Guardar'}</button></div></div></div>}

      {modalRepuesto&&admin&&<div className={styles.modalOverlay}><div className={styles.modal}><div className={styles.modalTitle}>Agregar repuesto</div><div className={styles.modalSub}><b>{modalRepuesto.vehiculos?.marca_modelo}</b> — {modalRepuesto.vehiculos?.clientes?.nombre}</div><div style={{marginTop:'1rem',display:'flex',flexDirection:'column',gap:'10px'}}><div className={styles.formGroup}><label>Repuesto *</label><input value={formRepuesto.nombre} onChange={e=>setFormRepuesto({...formRepuesto,nombre:e.target.value})} placeholder="Ej: Filtro de aceite..."/></div><div className={styles.formGrid}><div className={styles.formGroup}><label>Valor ($)</label><input value={formRepuesto.valor} onChange={e=>setFormRepuesto({...formRepuesto,valor:formatNum(e.target.value)})} placeholder="0"/></div><div className={styles.formGroup}><label>Fecha</label><input type="date" value={formRepuesto.fecha} onChange={e=>setFormRepuesto({...formRepuesto,fecha:e.target.value})}/></div></div><div className={styles.formGroup}><label>Lugar</label><input value={formRepuesto.lugar} onChange={e=>setFormRepuesto({...formRepuesto,lugar:e.target.value})} placeholder="Ej: Casa del repuesto..."/></div></div><div className={styles.modalActions}><button className={styles.btn} onClick={()=>setModalRepuesto(null)}>Cancelar</button><button className={styles.btnPrimary} onClick={guardarRepuesto} disabled={guardandoRepuesto}>{guardandoRepuesto?'Guardando...':'Agregar'}</button></div></div></div>}

      {modalEditarRepuesto&&admin&&<div className={styles.modalOverlay}><div className={styles.modal}><div className={styles.modalTitle}>Editar repuesto</div><div style={{marginTop:'1rem',display:'flex',flexDirection:'column',gap:'10px'}}><div className={styles.formGroup}><label>Repuesto</label><input value={formEditarRepuesto.nombre} onChange={e=>setFormEditarRepuesto({...formEditarRepuesto,nombre:e.target.value})}/></div><div className={styles.formGrid}><div className={styles.formGroup}><label>Valor ($)</label><input value={formEditarRepuesto.valor} onChange={e=>setFormEditarRepuesto({...formEditarRepuesto,valor:formatNum(e.target.value)})}/></div><div className={styles.formGroup}><label>Fecha</label><input type="date" value={formEditarRepuesto.fecha} onChange={e=>setFormEditarRepuesto({...formEditarRepuesto,fecha:e.target.value})}/></div></div><div className={styles.formGroup}><label>Lugar</label><input value={formEditarRepuesto.lugar||''} onChange={e=>setFormEditarRepuesto({...formEditarRepuesto,lugar:e.target.value})}/></div></div><div className={styles.modalActions}><button className={styles.btn} onClick={()=>setModalEditarRepuesto(null)}>Cancelar</button><button className={styles.btnPrimary} onClick={guardarEdicionRepuesto} disabled={guardandoEdicionRepuesto}>{guardandoEdicionRepuesto?'Guardando...':'Guardar'}</button></div></div></div>}

      {modalFotos&&<div className={styles.modalOverlay}><div className={styles.modal} style={{width:'100%',maxWidth:'560px',maxHeight:'85vh',overflowY:'auto'}}><div className={styles.modalTitle}>Fotos del vehículo</div><div className={styles.modalSub}><b>{modalFotos.vehiculos?.marca_modelo}</b> — {modalFotos.vehiculos?.clientes?.nombre}</div><input type="file" accept="image/*" multiple ref={fileFotosRef} style={{display:'none'}} onChange={subirFotosModal}/>{admin&&<button className={styles.btnPrimary} style={{marginTop:'1rem',marginBottom:'1rem'}} onClick={()=>fileFotosRef.current.click()}>{subiendo?'Subiendo...':'+ Agregar fotos'}</button>}<div className={styles.fotoGrid}>{modalFotosData.map(f=><div key={f.id} className={styles.fotoItem}><img src={f.url} alt="foto" className={styles.fotoImg} onClick={()=>setFotoZoom(f.url)} style={{cursor:'zoom-in'}}/><button style={{position:'absolute',bottom:'4px',left:'4px',fontSize:'11px',padding:'3px 7px',background:'#DCFCE7',color:'#16A34A',border:'1px solid #86EFAC',borderRadius:'6px',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>enviarFotoWsp(modalFotos,f.url)}>💬</button>{admin&&<button className={styles.fotoBorrar} onClick={()=>borrarFotoModal(f)}>✕</button>}</div>)}{modalFotosData.length===0&&<div className={styles.fotoVacio}>No hay fotos todavía</div>}</div><div className={styles.modalActions}><button className={styles.btn} onClick={()=>{setModalFotos(null);setModalFotosData([])}}>Cerrar</button></div></div></div>}

      {modalFotosAnteriores&&<div className={styles.modalOverlay}><div className={styles.modal} style={{width:'100%',maxWidth:'560px',maxHeight:'85vh',overflowY:'auto'}}><div className={styles.modalTitle}>Fotos de ingresos anteriores</div><div className={styles.modalSub}><b>{clienteDetalle?.vehiculos?.marca_modelo}</b> — {clienteDetalle?.vehiculos?.clientes?.nombre}</div><div className={styles.fotoGrid} style={{marginTop:'1rem'}}>{fotosAnteriores.map(f=><div key={f.id} className={styles.fotoItem}><img src={f.url} alt="foto" className={styles.fotoImg} onClick={()=>setFotoZoom(f.url)} style={{cursor:'zoom-in'}}/></div>)}{fotosAnteriores.length===0&&<div className={styles.fotoVacio}>No hay fotos de ingresos anteriores</div>}</div><div className={styles.modalActions}><button className={styles.btn} onClick={()=>setModalFotosAnteriores(false)}>Cerrar</button></div></div></div>}

      {modalAgregarPlan==='elegir'&&<div className={styles.modalOverlay}><div className={styles.modal}><div className={styles.modalTitle}>¿Qué querés agregar al plan?</div><div style={{display:'flex',flexDirection:'column',gap:'10px',marginTop:'1rem'}}><button className={styles.btnPrimary} onClick={()=>setModalAgregarPlan('vehiculo')}>🚗 Tarea sobre un vehículo en el taller</button><button className={styles.btnPrimary} onClick={()=>setModalAgregarPlan('suelta')}>📝 Tarea suelta (sin vehículo)</button></div><div className={styles.modalActions}><button className={styles.btn} onClick={()=>setModalAgregarPlan(null)}>Cancelar</button></div></div></div>}

      {modalAgregarPlan==='vehiculo'&&<div className={styles.modalOverlay}><div className={styles.modal}><div className={styles.modalTitle}>Agregar vehículo al plan</div><div style={{display:'flex',flexDirection:'column',gap:'10px',marginTop:'1rem'}}>
        <div className={styles.formGroup}><label>Vehículo (elegí uno de los que están en el taller)</label><select value={formTareaVehiculo.trabajo_id} onChange={e=>{const t=trabajosActivos.find(x=>x.id===e.target.value);setFormTareaVehiculo({...formTareaVehiculo,trabajo_id:e.target.value,vehiculo:t?.vehiculos?.marca_modelo||''})}}><option value="">— Seleccioná —</option>{trabajosActivos.map(t=><option key={t.id} value={t.id}>{t.vehiculos?.marca_modelo} · {t.vehiculos?.clientes?.nombre}</option>)}</select></div>
        <div className={styles.formGroup}><label>Tarea de hoy (opcional)</label><textarea value={formTareaVehiculo.descripcion} onChange={e=>setFormTareaVehiculo({...formTareaVehiculo,descripcion:e.target.value})} placeholder="Ej: terminar cambio de inyectores, probar en motor..."/></div>
        <div className={styles.formGroup}><label>Asignar a</label><select value={formTareaVehiculo.mecanico} onChange={e=>setFormTareaVehiculo({...formTareaVehiculo,mecanico:e.target.value})}><option value="">— Sin asignar —</option>{mecanicos.map(m=><option key={m.id} value={m.nombre}>{m.nombre}</option>)}</select></div>
      </div><div className={styles.modalActions}><button className={styles.btn} onClick={()=>setModalAgregarPlan(null)}>Cancelar</button><button className={styles.btnPrimary} onClick={agregarTareaVehiculoPlan} disabled={guardandoTareaPlan}>{guardandoTareaPlan?'Guardando...':'Agregar'}</button></div></div></div>}

      {modalAgregarPlan==='suelta'&&<div className={styles.modalOverlay}><div className={styles.modal}><div className={styles.modalTitle}>Agregar tarea suelta</div><div style={{display:'flex',flexDirection:'column',gap:'10px',marginTop:'1rem'}}>
        <div className={styles.formGroup}><label>Tarea</label><textarea value={formTareaSuelta.descripcion} onChange={e=>setFormTareaSuelta({...formTareaSuelta,descripcion:e.target.value})} placeholder="Ej: limpiar depósito, llamar al proveedor..."/></div>
        <div className={styles.formGroup}><label>Asignar a</label><select value={formTareaSuelta.mecanico} onChange={e=>setFormTareaSuelta({...formTareaSuelta,mecanico:e.target.value})}><option value="">— Sin asignar —</option>{mecanicos.map(m=><option key={m.id} value={m.nombre}>{m.nombre}</option>)}</select></div>
      </div><div className={styles.modalActions}><button className={styles.btn} onClick={()=>setModalAgregarPlan(null)}>Cancelar</button><button className={styles.btnPrimary} onClick={agregarTareaSueltaPlan} disabled={guardandoTareaPlan}>{guardandoTareaPlan?'Guardando...':'Agregar'}</button></div></div></div>}

{checklistActivo&&!editandoChecklist&&<div className={styles.modalOverlay}><div className={styles.modal} style={{width:'100%',maxWidth:'600px',maxHeight:'85vh',overflowY:'auto'}}><div className={styles.modalTitle}>{CHECKLIST_TITULO_POR_TIPO[checklistActivo.tipo||'entrega']}</div><div className={styles.modalSub}>{checklistActivo.vehiculo} · {checklistActivo.patente} · {checklistActivo.fecha_entrega?new Date(checklistActivo.fecha_entrega+'T12:00:00').toLocaleDateString('es-AR'):''}</div><div style={{marginTop:'1rem'}}><div style={{fontSize:'13px',marginBottom:'12px'}}><span style={{color:'#718096'}}>Mecánico:</span> <b>{checklistActivo.mecanico||'—'}</b></div>{checklistActivo.fotos&&checklistActivo.fotos.length>0&&<div style={{marginBottom:'12px'}}><div style={{fontSize:'11px',fontWeight:'700',color:'#718096',textTransform:'uppercase',marginBottom:'6px'}}>Fotos</div><div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>{checklistActivo.fotos.map((f,i)=><img key={f.id||i} src={f.url} alt="foto" onClick={()=>setFotoZoom(f.url)} style={{width:'56px',height:'56px',objectFit:'cover',borderRadius:'8px',border:'1px solid #E2E8F0',cursor:'zoom-in'}}/>)}</div></div>}<table className={styles.table}><thead><tr><th>Ítem</th><th style={{textAlign:'center'}}>Sí</th><th style={{textAlign:'center'}}>No</th><th>Observaciones</th></tr></thead><tbody>{CHECKLIST_ITEMS_POR_TIPO[checklistActivo.tipo||'entrega'].map(item=>{const v=(checklistActivo.items||{})[item]||{};return<tr key={item}><td style={{fontSize:'12px',fontWeight:'500'}}>{item}</td><td style={{textAlign:'center',fontSize:'16px',color:'#16A34A'}}>{v.valor==='si'?'✓':''}</td><td style={{textAlign:'center',fontSize:'16px',color:'#DC2626'}}>{v.valor==='no'?'✓':''}</td><td style={{fontSize:'12px',color:'#718096'}}>{v.obs||'—'}</td></tr>})}</tbody></table>{checklistActivo.observacion_general&&<div style={{marginTop:'8px',padding:'10px',background:'#F7FAFC',borderRadius:'6px',fontSize:'13px'}}><b>Obs. general:</b> {checklistActivo.observacion_general}</div>}</div><div className={styles.modalActions}>{admin&&<button className={styles.btnDanger} onClick={()=>borrarChecklist(checklistActivo.id)}>🗑️ Borrar</button>}<button className={styles.btnPrimary} onClick={()=>abrirEditarChecklist(checklistActivo)}>✏️ Editar</button><button className={styles.btn} onClick={()=>imprimirChecklist(checklistActivo)}>🖨️ Imprimir</button><button className={styles.btn} onClick={()=>setChecklistActivo(null)}>Cerrar</button></div></div></div>}

      {confirmDialog&&<div className={styles.modalOverlay}><div className={styles.modal}><div className={styles.modalTitle}>Confirmar</div><div style={{marginTop:'1rem',fontSize:'14px',color:'#2D3748',lineHeight:1.5}}>{confirmDialog.mensaje}</div><div className={styles.modalActions}><button className={styles.btn} onClick={()=>setConfirmDialog(null)}>Cancelar</button><button className={styles.btnDangerSolid} onClick={()=>{confirmDialog.onConfirm();setConfirmDialog(null)}}>Confirmar</button></div></div></div>}

      {fotoZoom&&<FotoZoomViewer url={fotoZoom} onClose={()=>setFotoZoom(null)} styles={styles}/>}

      {/* SIDEBAR */}
      <div className={`${styles.sidebar} ${sidebarOpen?styles.sidebarOpen:''}`}>
        <div className={styles.logoArea}><img src={LOGO_URL} alt="DiFiore Performance" style={{width:'100%',maxWidth:'180px',marginBottom:'8px'}}/></div>
        <div style={{padding:'0 12px 10px',position:'relative'}}>
          <input
            value={busquedaGlobal}
            onChange={e=>setBusquedaGlobal(e.target.value)}
            placeholder="🔍 Buscar en toda la app..."
            style={{width:'100%',padding:'8px 10px',borderRadius:'6px',border:'1px solid #2D3748',background:'#0F1117',color:'#F1F5F9',fontSize:'12.5px',fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}
          />
          {busquedaGlobal.trim().length>=2&&(
            <div style={{position:'absolute',top:'100%',left:'12px',right:'12px',background:'#1A1A2E',border:'1px solid #2D3748',borderRadius:'8px',zIndex:200,maxHeight:'340px',overflowY:'auto',boxShadow:'0 8px 24px rgba(0,0,0,.4)'}}>
              {!hayResultadosGlobales&&<div style={{padding:'12px',fontSize:'12px',color:'#64748B'}}>Sin resultados</div>}
              {resultadosGlobales.clientes.length>0&&<div style={{padding:'8px 10px 4px',fontSize:'10px',color:'#64748B',textTransform:'uppercase',letterSpacing:'.05em'}}>Clientes</div>}
              {resultadosGlobales.clientes.map(t=>(
                <div key={t.id} onClick={()=>{verDetalle(t);setBusquedaGlobal('');setSidebarOpen(false)}} style={{padding:'8px 10px',fontSize:'12.5px',color:'#F1F5F9',cursor:'pointer',borderTop:'1px solid #24283a'}} onMouseOver={e=>e.currentTarget.style.background='#24283a'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <b>{t.vehiculos?.clientes?.nombre}</b> · {t.vehiculos?.marca_modelo}
                </div>
              ))}
              {resultadosGlobales.presupuestos.length>0&&<div style={{padding:'8px 10px 4px',fontSize:'10px',color:'#64748B',textTransform:'uppercase',letterSpacing:'.05em'}}>Presupuestos</div>}
              {resultadosGlobales.presupuestos.map(p=>(
                <div key={p.id} onClick={()=>{abrirPresupuesto(p);setSeccion('presupuesto');setBusquedaGlobal('');setSidebarOpen(false)}} style={{padding:'8px 10px',fontSize:'12.5px',color:'#F1F5F9',cursor:'pointer',borderTop:'1px solid #24283a'}} onMouseOver={e=>e.currentTarget.style.background='#24283a'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <span style={{fontFamily:'monospace',color:'#94A3B8'}}>{p.numero}</span> · {p.cliente||'—'}
                </div>
              ))}
              {resultadosGlobales.checklists.length>0&&<div style={{padding:'8px 10px 4px',fontSize:'10px',color:'#64748B',textTransform:'uppercase',letterSpacing:'.05em'}}>Checklists</div>}
              {resultadosGlobales.checklists.map(c=>(
                <div key={c.id} onClick={()=>{setChecklistActivo(c);setBusquedaGlobal('');setSidebarOpen(false)}} style={{padding:'8px 10px',fontSize:'12.5px',color:'#F1F5F9',cursor:'pointer',borderTop:'1px solid #24283a'}} onMouseOver={e=>e.currentTarget.style.background='#24283a'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  {CHECKLIST_TITULO_POR_TIPO[c.tipo||'entrega'].replace('Checklist de ','')} · {c.vehiculo||'—'}
                </div>
              ))}
            </div>
          )}
        </div>
        {[
          {id:'dashboard',label:'Dashboard'},
          {id:'plandia',label:'📋 Plan del día'},
          {id:'tiempos',label:'⏱️ Control de tiempos'},
          {id:'clientes',label:'Clientes'},
          ...(admin?[{id:'turnos',label:'📅 Turnos'}]:[]),
          ...(admin?[{id:'nuevo',label:'Nuevo cliente'}]:[]),
          ...(admin?[{id:'presupuesto',label:'Presupuesto'}]:[]),
          ...(admin?[{id:'recibo',label:'Recibo'}]:[]),
          {id:'checklist',label:'Checklist entrega'},
          ...(admin?[{id:'informe',label:'Informe mensual'},{id:'empleados',label:'⚙️ Empleados'}]:[])
        ].map(item=>(
          <button key={item.id} className={`${styles.navItem} ${seccion===item.id?styles.navActive:''}`} onClick={()=>{setSeccion(item.id);setTallerVista(null);setVistaStats(null);setVistaMarca(null);setVerEntregados(false);setVerPapelera(false);setSidebarOpen(false)}}>{item.label}</button>
        ))}
        <div className={styles.navBottom}>
          <div style={{display:'flex',flexDirection:'column',gap:'4px',padding:'4px 0'}}>
            {navLinks.map((l,i)=><a key={i} href={l.href} target="_blank" rel="noreferrer" style={{color:'#94A3B8',textDecoration:'none',fontSize:'12px',display:'flex',alignItems:'center',gap:'8px',padding:'6px 8px',borderRadius:'6px'}}><span style={{color:l.color}}>{l.icon}</span>{l.label}</a>)}
          </div>
          <div style={{padding:'8px 0',borderTop:'1px solid #2D3748',marginTop:'8px'}}>
            <div style={{fontSize:'11px',color:'#64748B',marginBottom:'8px',padding:'0 8px'}}>{admin?'👑 Admin':'👷 Empleado'}</div>
            <button onClick={cerrarSesion} style={{width:'100%',padding:'8px',borderRadius:'6px',background:'#DC2626',color:'#fff',border:'none',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>Cerrar sesión</button>
          </div>
        </div>
      </div>

      <div className={styles.main}>

        {seccion==='tiempos'&&admin&&(
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>⏱️ Control de tiempos</h1>
              <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                <input type="month" value={mesTiempos} onChange={e=>setMesTiempos(e.target.value)} style={{padding:'8px 12px',borderRadius:'6px',border:'1px solid #CBD5E0',fontSize:'13px',fontFamily:'inherit'}}/>
                <button style={{padding:'8px 16px',borderRadius:'6px',fontSize:'13px',cursor:'pointer',background:'#15803D',color:'#fff',border:'none',fontFamily:'inherit',fontWeight:'600'}} onClick={exportarTiemposExcel}>📊 Exportar a Excel</button>
              </div>
            </div>
            <div className={styles.divider}></div>

            <div className={styles.stats} style={{marginBottom:'1rem'}}>
              <div className={styles.stat} style={{cursor:'default'}}><div className={styles.statN}>{tiemposDelMes.eficiencia}%</div><div className={styles.statL}>Eficiencia de flujo</div></div>
              <div className={styles.stat} style={{cursor:'default'}}><div className={styles.statN}>{tiemposDelMes.tiempoMuertoProm}h</div><div className={styles.statL}>Tiempo muerto prom.</div></div>
              <div className={styles.stat} style={{cursor:'default'}}>
                <div className={styles.statN} style={{fontSize:'15px'}}>{tiemposDelMes.motivoGeneral?`${tiemposDelMes.motivoGeneral[0]} ${Math.round((tiemposDelMes.motivoGeneral[1]/(tiemposDelMes.horasMuertasSinCerrado||1))*100)}%`:'—'}</div>
                <div className={styles.statL}>Motivo principal{tiemposDelMes.motivoGeneral&&<span style={{display:'block',fontSize:'11px',color:'#A0AEC0',marginTop:'2px'}}>({formatHoras(tiemposDelMes.motivoGeneral[1])}hs de {formatHoras(tiemposDelMes.horasMuertasSinCerrado)}hs)</span>}</div>
              </div>
              <div className={styles.stat} style={{cursor:'default'}}><div className={styles.statN} style={{color:'#DC2626'}}>{formatHoras(tiemposDelMes.horasClientes)}h</div><div className={styles.statL}>👤 Perdidas por clientes</div></div>
              <div className={styles.stat} style={{cursor:'default'}}>
                {costoHoraTaller>0?<div className={styles.statN} style={{color:'#DC2626',fontSize:'15px'}}>${formatPeso(Math.round(tiemposDelMes.costoTiempoMuerto))}</div>:<div className={styles.statN} style={{fontSize:'13px',color:'#A0AEC0'}}>Sin configurar</div>}
                <div className={styles.statL}>💰 Costo t. muerto{!editandoCostoHora?<span onClick={(e)=>{e.stopPropagation();setCostoHoraTemp(String(costoHoraTaller));setEditandoCostoHora(true)}} style={{display:'block',fontSize:'11px',color:'#2563EB',marginTop:'2px',cursor:'pointer'}}>⚙️ {costoHoraTaller>0?'Cambiar':'Configurar'} $/hora</span>:<div style={{display:'flex',gap:'4px',marginTop:'4px'}} onClick={e=>e.stopPropagation()}><input type="number" value={costoHoraTemp} onChange={e=>setCostoHoraTemp(e.target.value)} style={{width:'70px',padding:'3px 6px',fontSize:'11px',borderRadius:'4px',border:'1px solid #CBD5E0'}}/><button onClick={guardarCostoHoraTaller} style={{fontSize:'11px',padding:'3px 8px',borderRadius:'4px',border:'none',background:'#2563EB',color:'#fff',cursor:'pointer'}}>OK</button></div>}</div>
              </div>
            </div>

            {trabajoSeleccionadoTiempos?(
              <div className={styles.card}>
                {(()=>{
                  const p=tiemposDelMes.porTrabajo.find(x=>x.trabajo.id===trabajoSeleccionadoTiempos.id)
                  const mecanicosRaw=tiemposDelMes.statsPorMecanico.concat(tiemposDelMes.statsOficina).flatMap(s=>s.items.filter(it=>it.trabajo.id===trabajoSeleccionadoTiempos.id).map(it=>({mecanico:s.mecanico,...it})))
                  const agrupadoMecanicos={}
                  mecanicosRaw.forEach(it=>{
                    const clave=it.mecanico+'|'+it.categoria
                    if(!agrupadoMecanicos[clave])agrupadoMecanicos[clave]={mecanico:it.mecanico,categoria:it.categoria,horas:0}
                    agrupadoMecanicos[clave].horas+=it.horas
                  })
                  const mecanicosDeEsteTrabajo=Object.values(agrupadoMecanicos).sort((a,b)=>b.horas-a.horas)
                  const esReingreso=reingresosRaw.some(h=>h.trabajo_id===trabajoSeleccionadoTiempos.id)
                  const presupuestoVinculado=presupuestos.find(pr=>pr.trabajo_id===trabajoSeleccionadoTiempos.id)
                  const horasActivas=(p?.categorias['Reparación']||0)+(p?.categorias['Diagnóstico']||0)+(p?.categorias['Service']||0)
                  const montoManoObra=presupuestoVinculado?(presupuestoVinculado.items||[]).filter(i=>i.es_mano_obra).reduce((a,i)=>a+(parseFloat((i.total||'0').toString().replace(/\./g,''))||0),0):0
                  return(<>
                    <div className={styles.cardTitle}>{trabajoSeleccionadoTiempos.vehiculos?.marca_modelo}{esReingreso&&<span style={{marginLeft:'8px',fontSize:'11px',fontWeight:'700',color:'#2563EB',background:'#EFF6FF',padding:'3px 9px',borderRadius:'20px'}}>🔄 Reingreso</span>}</div>
                    <div style={{fontSize:'13px',color:'#718096',marginBottom:'14px'}}>{trabajoSeleccionadoTiempos.vehiculos?.clientes?.nombre} · {trabajoSeleccionadoTiempos.vehiculos?.patente||'—'}</div>
                    {montoManoObra>0&&horasActivas>0&&<div style={{background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:'8px',padding:'10px 12px',marginBottom:'14px'}}>
                      <div style={{fontSize:'11px',color:'#166534',fontWeight:'600',textTransform:'uppercase'}}>Rentabilidad real</div>
                      <div style={{fontSize:'13px',color:'#166534',marginTop:'2px'}}>${formatPeso(montoManoObra)} de mano de obra ÷ {formatHoras(horasActivas)}h reales de trabajo = <b>${formatPeso(Math.round(montoManoObra/horasActivas))}/hora efectiva</b></div>
                    </div>}
                    <div style={{fontSize:'12px',fontWeight:'700',color:'#718096',textTransform:'uppercase',marginBottom:'8px'}}>Tiempo por categoría</div>
                    {p?Object.entries(p.categorias).sort((a,b)=>b[1]-a[1]).map(([cat,horas])=>(
                      <div key={cat} style={{display:'flex',justifyContent:'space-between',fontSize:'13px',padding:'6px 0',borderBottom:'1px solid #EDF2F7'}}>
                        <span style={{color:CATEGORIAS_MUERTAS.includes(cat)?'#DC2626':'#2D3748'}}>{cat}</span>
                        <span style={{fontFamily:'monospace'}}>{formatHoras(horas)}h</span>
                      </div>
                    )):<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin datos este mes para este vehículo</div>}
                    {mecanicosDeEsteTrabajo.length>0&&<>
                      <div style={{fontSize:'12px',fontWeight:'700',color:'#718096',textTransform:'uppercase',marginTop:'18px',marginBottom:'8px'}}>Quién trabajó en esto</div>
                      {mecanicosDeEsteTrabajo.map((it,i)=>(
                        <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'13px',padding:'6px 0',borderBottom:'1px solid #EDF2F7'}}>
                          <span>{it.mecanico==='Oficina'?'🏢 ':'👤 '}{it.mecanico} — {it.categoria}</span>
                          <span style={{fontFamily:'monospace'}}>{formatHoras(it.horas)}h</span>
                        </div>
                      ))}
                    </>}
                    <button className={styles.btn} style={{marginTop:'16px'}} onClick={()=>setTrabajoSeleccionadoTiempos(null)}>← Volver</button>
                  </>)
                })()}
              </div>
            ):(<>

            <div style={{display:'flex',gap:'6px',flexWrap:'wrap',borderBottom:'1px solid #E2E8F0',marginBottom:'1rem'}}>
              {[['motivos','Motivos'],['vehiculo','Por vehículo'],['mecanico','Por mecánico'],['oficina','🏢 Oficina'],['terceros','Por terceros'],['cliente','Por cliente'],['historico','📈 Histórico'],['marca','🚗 Por marca']].map(([id,label])=>(
                <button key={id} onClick={()=>{setVistaTiempos(id);setMecanicoSeleccionadoTiempos(null)}} style={{padding:'8px 14px',fontSize:'13px',fontWeight:vistaTiempos===id?'600':'400',border:'none',background:'none',cursor:'pointer',color:vistaTiempos===id?'#2D3748':'#718096',borderBottom:vistaTiempos===id?'2px solid #2D3748':'2px solid transparent',fontFamily:'inherit'}}>{label}</button>
              ))}
            </div>

            {vistaTiempos==='motivos'&&(
              <div className={styles.card}>
                <div className={styles.cardTitle}>¿Dónde se van las horas este mes?</div>
                {Object.keys(tiemposDelMes.totalesPorCategoria).length===0&&<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin datos este mes</div>}
                {Object.entries(tiemposDelMes.totalesPorCategoria).sort((a,b)=>b[1]-a[1]).map(([cat,horas])=>{
                  const max=Math.max(...Object.values(tiemposDelMes.totalesPorCategoria),1)
                  const esMuerta=CATEGORIAS_MUERTAS.includes(cat)
                  return(
                    <div key={cat} style={{marginBottom:'10px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:'12.5px',marginBottom:'3px'}}><span>{cat}</span><span style={{fontFamily:'monospace'}}>{formatHoras(horas)}h</span></div>
                      <div style={{height:'8px',background:'#F1F5F9',borderRadius:'4px'}}><div style={{width:`${(horas/max)*100}%`,height:'100%',background:esMuerta?'#DC2626':'#2563EB',borderRadius:'4px'}}></div></div>
                    </div>
                  )
                })}
              </div>
            )}

            {vistaTiempos==='vehiculo'&&(()=>{
              const idsReingreso=new Set(reingresosRaw.map(h=>h.trabajo_id))
              const normales=tiemposDelMes.porTrabajo.filter(p=>!idsReingreso.has(p.trabajo.id))
              const reingresos=tiemposDelMes.porTrabajo.filter(p=>idsReingreso.has(p.trabajo.id))
              const filaVehiculo=({trabajo,motivoPrincipal,totalHoras})=>(
                <tr key={trabajo.id}><td onClick={()=>setTrabajoSeleccionadoTiempos(trabajo)}><b>{trabajo.vehiculos?.marca_modelo}</b></td><td onClick={()=>setTrabajoSeleccionadoTiempos(trabajo)}>{trabajo.vehiculos?.clientes?.nombre}</td><td onClick={()=>setTrabajoSeleccionadoTiempos(trabajo)} style={{color:motivoPrincipal&&CATEGORIAS_MUERTAS.includes(motivoPrincipal[0])?'#DC2626':'#4A5568'}}>{motivoPrincipal?motivoPrincipal[0]:'—'}</td><td onClick={()=>setTrabajoSeleccionadoTiempos(trabajo)} style={{fontFamily:'monospace'}}>{formatHoras(totalHoras)}h</td><td style={{cursor:'default'}}><button className={styles.btn} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>toggleExcluirTiempos(trabajo)}>🚫 Excluir</button></td></tr>
              )
              return(<>
                <div className={styles.card}>
                  <div className={styles.cardTitle}>Detalle por vehículo</div>
                  {normales.length===0&&<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin vehículos ingresados este mes</div>}
                  {normales.length>0&&<table className={styles.table}><thead><tr><th>Vehículo</th><th>Cliente</th><th>Motivo principal</th><th>Horas totales</th><th></th></tr></thead><tbody>{normales.map(filaVehiculo)}</tbody></table>}
                </div>
                {reingresos.length>0&&<div className={styles.card}>
                  <div className={styles.cardTitle}>🔄 Reingresos</div>
                  <div style={{fontSize:'12px',color:'#A0AEC0',marginBottom:'10px'}}>Vehículos que volvieron al taller este mes (segunda visita o más).</div>
                  <table className={styles.table}><thead><tr><th>Vehículo</th><th>Cliente</th><th>Motivo principal</th><th>Horas totales</th><th></th></tr></thead><tbody>{reingresos.map(filaVehiculo)}</tbody></table>
                </div>}
                {tiemposDelMes.excluidos.length>0&&<div className={styles.card}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}} onClick={()=>setMostrarExcluidosTiempos(v=>!v)}>
                    <div className={styles.cardTitle} style={{margin:0}}>Excluidos del cálculo este mes ({tiemposDelMes.excluidos.length})</div>
                    <span style={{fontSize:'12px',color:'#718096'}}>{mostrarExcluidosTiempos?'▲ Ocultar':'▼ Ver'}</span>
                  </div>
                  {mostrarExcluidosTiempos&&<>
                    <div style={{fontSize:'12px',color:'#A0AEC0',margin:'10px 0'}}>Estos vehículos no se cuentan en los promedios ni en el gráfico.</div>
                    <table className={styles.table}><thead><tr><th>Vehículo</th><th>Cliente</th><th></th></tr></thead><tbody>{tiemposDelMes.excluidos.map(t=>(<tr key={t.id}><td onClick={()=>setTrabajoSeleccionadoTiempos(t)}><b>{t.vehiculos?.marca_modelo}</b></td><td onClick={()=>setTrabajoSeleccionadoTiempos(t)}>{t.vehiculos?.clientes?.nombre}</td><td style={{cursor:'default'}}><button className={styles.btn} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>toggleExcluirTiempos(t)}>↩️ Volver a incluir</button></td></tr>))}</tbody></table>
                  </>}
                </div>}
              </>)
            })()}

            {vistaTiempos==='mecanico'&&(<>
              <div className={styles.card}>
                {!mecanicoSeleccionadoTiempos?(<>
                  <div className={styles.cardTitle}>Tiempo por mecánico</div>
                  {tiemposDelMes.statsPorMecanico.length===0&&<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin datos este mes</div>}
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                    {tiemposDelMes.statsPorMecanico.map(s=>(
                      <button key={s.mecanico} onClick={()=>setMecanicoSeleccionadoTiempos(s.mecanico)} style={{padding:'10px 16px',borderRadius:'10px',border:'1px solid #E2E8F0',background:'#F7FAFC',cursor:'pointer',fontFamily:'inherit',fontSize:'13px',fontWeight:'600',color:'#2D3748'}}>
                        {s.mecanico}<span style={{opacity:.6,fontSize:'11px',marginLeft:'6px',fontWeight:'400'}}>{s.cantidad} registro{s.cantidad===1?'':'s'}</span>
                      </button>
                    ))}
                  </div>
                </>):(()=>{
                  const s=tiemposDelMes.statsPorMecanico.find(x=>x.mecanico===mecanicoSeleccionadoTiempos)
                  if(!s)return null
                  const agrupado={}
                  s.items.forEach(it=>{
                    if(!agrupado[it.trabajo.id])agrupado[it.trabajo.id]={trabajo:it.trabajo,horas:0,categorias:[]}
                    agrupado[it.trabajo.id].horas+=it.horas
                    agrupado[it.trabajo.id].categorias.push(it.categoria)
                  })
                  const filas=Object.values(agrupado).sort((a,b)=>b.horas-a.horas)
                  return(<>
                    <div className={styles.cardTitle}>{s.mecanico}</div>
                    <div style={{fontSize:'12px',color:'#718096',marginBottom:'14px'}}>{Object.entries(s.items.reduce((acc,i)=>{acc[i.categoria]=(acc[i.categoria]||0)+i.horas;return acc},{})).map(([cat,h])=>`${formatHoras(h)}h ${cat.toLowerCase()}`).join(' · ')}</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'14px'}}>
                      <div style={{background:'#F7FAFC',borderRadius:'8px',padding:'10px'}}><div style={{fontSize:'11px',color:'#718096'}}>Retrabajo (todo el historial)</div><div style={{fontSize:'18px',fontWeight:'700',fontFamily:'monospace',color:s.retrabajo.retrabajos>0?'#DC2626':'#2D3748'}}>{s.retrabajo.retrabajos} de {s.retrabajo.totalReparaciones}</div></div>
                      <div style={{background:'#F7FAFC',borderRadius:'8px',padding:'10px'}}><div style={{fontSize:'11px',color:'#718096'}}>Máx. autos el mismo día</div><div style={{fontSize:'18px',fontWeight:'700',fontFamily:'monospace'}}>{s.cargaMaxima}</div></div>
                    </div>
                    <table className={styles.table}><thead><tr><th>Vehículo</th><th>Cliente</th><th>Categorías</th><th>Horas totales</th></tr></thead><tbody>{filas.map((it,i)=><tr key={i} onClick={()=>setTrabajoSeleccionadoTiempos(it.trabajo)}><td><b>{it.trabajo.vehiculos?.marca_modelo}</b></td><td>{it.trabajo.vehiculos?.clientes?.nombre}</td><td style={{fontSize:'12px',color:'#718096'}}>{[...new Set(it.categorias)].join(', ')}</td><td style={{fontFamily:'monospace'}}>{formatHoras(it.horas)}h</td></tr>)}</tbody></table>
                    <button className={styles.btn} style={{marginTop:'14px'}} onClick={()=>setMecanicoSeleccionadoTiempos(null)}>← Volver a todos</button>
                  </>)
                })()}
              </div>
              {!mecanicoSeleccionadoTiempos&&tiemposDelMes.statsPorMecanico.length>0&&(()=>{
                const categoriasComunes=[...new Set(tiemposDelMes.statsPorMecanico.flatMap(s=>s.items.map(i=>i.categoria)))]
                return <div className={styles.card}>
                  <div className={styles.cardTitle}>Ranking por especialidad</div>
                  <div style={{fontSize:'12px',color:'#A0AEC0',marginBottom:'10px'}}>Horas promedio de cada mecánico en cada categoría este mes — quién es más rápido en qué.</div>
                  <div className={styles.tblWrap}><table className={styles.table}><thead><tr><th>Mecánico</th>{categoriasComunes.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{tiemposDelMes.statsPorMecanico.map(s=>{
                    const porCategoria={}
                    s.items.forEach(i=>{if(!porCategoria[i.categoria])porCategoria[i.categoria]={horas:0,cantidad:0};porCategoria[i.categoria].horas+=i.horas;porCategoria[i.categoria].cantidad++})
                    return <tr key={s.mecanico}><td><b>{s.mecanico}</b></td>{categoriasComunes.map(c=><td key={c} style={{fontFamily:'monospace',fontSize:'12px'}}>{porCategoria[c]?formatHoras(porCategoria[c].horas/porCategoria[c].cantidad)+'h':'—'}</td>)}</tr>
                  })}</tbody></table></div>
                </div>
              })()}
            </>)}

            {vistaTiempos==='oficina'&&(
              <div className={styles.card}>
                <div className={styles.cardTitle}>🏢 Oficina</div>
                <div style={{fontSize:'12px',color:'#A0AEC0',marginBottom:'10px'}}>Tareas asignadas a "Oficina" en vez de a un mecánico puntual (ej: comprar repuestos).</div>
                {tiemposDelMes.statsOficina.length===0&&<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin datos este mes</div>}
                {tiemposDelMes.statsOficina.length>0&&(()=>{
                  const agrupado={}
                  tiemposDelMes.statsOficina.flatMap(s=>s.items).forEach(it=>{
                    if(!agrupado[it.trabajo.id])agrupado[it.trabajo.id]={trabajo:it.trabajo,horas:0,categorias:[]}
                    agrupado[it.trabajo.id].horas+=it.horas
                    agrupado[it.trabajo.id].categorias.push(it.categoria)
                  })
                  const filas=Object.values(agrupado).sort((a,b)=>b.horas-a.horas)
                  return <table className={styles.table}><thead><tr><th>Vehículo</th><th>Cliente</th><th>Categorías</th><th>Horas totales</th></tr></thead><tbody>{filas.map((it,i)=><tr key={i} onClick={()=>setTrabajoSeleccionadoTiempos(it.trabajo)}><td><b>{it.trabajo.vehiculos?.marca_modelo}</b></td><td>{it.trabajo.vehiculos?.clientes?.nombre}</td><td style={{fontSize:'12px',color:'#718096'}}>{[...new Set(it.categorias)].join(', ')}</td><td style={{fontFamily:'monospace'}}>{formatHoras(it.horas)}h</td></tr>)}</tbody></table>
                })()}
              </div>
            )}

            {vistaTiempos==='terceros'&&(
              <div className={styles.card}>
                <div className={styles.cardTitle}>Horas perdidas por terceros</div>
                <div style={{fontSize:'12px',color:'#A0AEC0',marginBottom:'10px'}}>Vehículos con horas en "Esperando a terceros" este mes, de mayor a menor.</div>
                {tiemposDelMes.porTerceros.length===0&&<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin horas perdidas por terceros este mes 🎉</div>}
                {tiemposDelMes.porTerceros.length>0&&<table className={styles.table}><thead><tr><th>Vehículo</th><th>Cliente</th><th>Horas</th></tr></thead><tbody>{tiemposDelMes.porTerceros.map(({trabajo,horas})=>(<tr key={trabajo.id} onClick={()=>setTrabajoSeleccionadoTiempos(trabajo)}><td><b>{trabajo.vehiculos?.marca_modelo}</b></td><td>{trabajo.vehiculos?.clientes?.nombre}</td><td style={{fontFamily:'monospace',color:'#DC2626'}}>{formatHoras(horas)}h</td></tr>))}</tbody></table>}
              </div>
            )}

            {vistaTiempos==='cliente'&&(
              <div className={styles.card}>
                <div className={styles.cardTitle}>👤 Horas perdidas por cliente</div>
                <div style={{fontSize:'12px',color:'#A0AEC0',marginBottom:'10px'}}>Suma de "esperando aprobación" + "esperando pago de repuestos" por cliente, de mayor a menor.</div>
                {tiemposDelMes.porCliente.length===0&&<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin horas perdidas por clientes este mes 🎉</div>}
                {tiemposDelMes.porCliente.length>0&&<table className={styles.table}><thead><tr><th>Cliente</th><th>Vehículo</th><th>Horas</th></tr></thead><tbody>{tiemposDelMes.porCliente.map(({trabajo,horas})=>(<tr key={trabajo.id} onClick={()=>setTrabajoSeleccionadoTiempos(trabajo)}><td><b>{trabajo.vehiculos?.clientes?.nombre}</b></td><td>{trabajo.vehiculos?.marca_modelo}</td><td style={{fontFamily:'monospace',color:'#DC2626'}}>{formatHoras(horas)}h</td></tr>))}</tbody></table>}
              </div>
            )}

            {vistaTiempos==='historico'&&(<>
              {cuelloBotellaPersistente&&<div className={styles.card} style={{background:'#FEF2F2',border:'1px solid #FECACA'}}>
                <div style={{fontSize:'13px',color:'#991B1B',fontWeight:'600'}}>⚠️ "{cuelloBotellaPersistente}" es el motivo principal hace 3 meses seguidos — parece un problema estructural, no un mes suelto.</div>
              </div>}
              <div className={styles.card}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                  <div className={styles.cardTitle} style={{margin:0}}>Eficiencia — últimos 6 meses</div>
                  <button style={{padding:'6px 12px',borderRadius:'6px',fontSize:'12px',cursor:'pointer',background:'#15803D',color:'#fff',border:'none',fontFamily:'inherit',fontWeight:'600'}} onClick={exportarHistoricoExcel}>📊 Exportar histórico completo</button>
                </div>
                <div style={{display:'flex',alignItems:'flex-end',gap:'10px',height:'120px'}}>
                  {historicoTiempos.map(m=>(
                    <div key={m.mes} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
                      <div style={{fontSize:'11px',fontFamily:'monospace',color:'#718096'}}>{m.eficiencia}%</div>
                      <div style={{width:'100%',height:`${Math.max(4,m.eficiencia)}px`,background:m.mes===mesTiempos?'#2563EB':'#CBD5E0',borderRadius:'4px 4px 0 0'}}></div>
                      <span style={{fontSize:'10px',color:m.mes===mesTiempos?'#2D3748':'#A0AEC0',fontWeight:m.mes===mesTiempos?'700':'400'}}>{new Date(m.mes+'-15').toLocaleDateString('es-AR',{month:'short'})}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Motivo principal por mes</div>
                <table className={styles.table}><thead><tr><th>Mes</th><th>Motivo principal</th><th>Vehículos</th></tr></thead><tbody>{historicoTiempos.map(m=>(<tr key={m.mes}><td style={{textTransform:'capitalize'}}>{new Date(m.mes+'-15').toLocaleDateString('es-AR',{month:'long',year:'numeric'})}</td><td style={{color:'#DC2626'}}>{m.motivoGeneral?m.motivoGeneral[0]:'—'}</td><td style={{fontFamily:'monospace'}}>{m.cantidadVehiculos}</td></tr>))}</tbody></table>
              </div>
            </>)}

            {vistaTiempos==='marca'&&(
              <div className={styles.card}>
                <div className={styles.cardTitle}>🚗 Tiempo de reparación promedio por marca</div>
                <div style={{fontSize:'12px',color:'#A0AEC0',marginBottom:'10px'}}>Desde agosto 2026 (no solo el mes seleccionado). Útil para presupuestar mejor a futuro.</div>
                {tiempoPorMarca.length===0&&<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin datos todavía</div>}
                {tiempoPorMarca.length>0&&<table className={styles.table}><thead><tr><th>Marca</th><th>Horas promedio</th><th>Vehículos</th></tr></thead><tbody>{tiempoPorMarca.map(m=>(<tr key={m.marca}><td><b>{m.marca}</b></td><td style={{fontFamily:'monospace'}}>{formatHoras(m.promedio)}h</td><td style={{fontFamily:'monospace',color:'#718096'}}>{m.cantidad}</td></tr>))}</tbody></table>}
              </div>
            )}
            </>)}
          </div>
        )}

        {seccion==='plandia'&&(
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>📋 Plan del día</h1>
              <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                <button className={styles.btn} onClick={()=>cambiarDiaPlan(-1)}>‹</button>
                <span style={{fontSize:'13px',fontWeight:'600',color:'#2D3748',minWidth:'150px',textAlign:'center'}}>{new Date(fechaPlan+'T12:00:00').toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})}</span>
                <button className={styles.btn} onClick={()=>cambiarDiaPlan(1)}>›</button>
                <button className={styles.btn} onClick={()=>{const hoy=new Date().toISOString().split('T')[0];setFechaPlan(hoy);cargarPlanDiario(hoy)}}>Hoy</button>
                <button style={{padding:'8px 16px',borderRadius:'6px',fontSize:'13px',cursor:'pointer',background:'#DCFCE7',color:'#16A34A',border:'1px solid #86EFAC',fontFamily:'inherit',fontWeight:'600'}} onClick={compartirPlanDiario}>💬 Compartir</button>
                <button className={styles.btn} onClick={imprimirPlanDiario}>🖨️ Imprimir</button>
                {admin&&<button className={styles.btnPrimary} onClick={()=>setModalAgregarPlan('elegir')}>+ Agregar</button>}
              </div>
            </div>
            <div className={styles.divider}></div>

            {planDiario.length===0&&<div style={{color:'#A0AEC0',fontSize:'14px',textAlign:'center',padding:'3rem'}}>Sin tareas planificadas para este día</div>}

            {planPorMecanico.map(([mecanico,tareas])=>(
              <div key={mecanico} className={styles.card}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
                  <div style={{width:'26px',height:'26px',borderRadius:'50%',background:'#EFF6FF',color:'#2563EB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:'700'}}>{mecanico==='Sin asignar'?'?':mecanico.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}</div>
                  <div className={styles.cardTitle} style={{margin:0}}>{mecanico} — {tareas.length} {tareas.length===1?'tarea':'tareas'}</div>
                </div>
                {tareas.map(p=>{
                  const trabajoRef=p.tipo==='vehiculo'?trabajos.find(t=>t.id===p.trabajo_id):null
                  return (
                    <div key={p.id} style={{display:'flex',gap:'10px',alignItems:'flex-start',padding:'8px 0',borderBottom:'1px solid #EDF2F7'}}>
                      <input type="checkbox" checked={p.completado} onChange={()=>toggleCompletadoPlan(p)} style={{marginTop:'3px'}}/>
                      <div style={{flex:1,opacity:p.completado?0.5:1}}>
                        {p.tipo==='vehiculo'?(
                          <>
                            <div style={{fontSize:'13.5px',textDecoration:p.completado?'line-through':'none'}}><b>{trabajoRef?.vehiculos?.marca_modelo||'Vehículo'}</b> · {trabajoRef?.vehiculos?.clientes?.nombre||'—'}</div>
                            {p.descripcion&&<div style={{fontSize:'12.5px',color:'#718096',marginTop:'2px',textDecoration:p.completado?'line-through':'none'}}>{p.descripcion}</div>}
                          </>
                        ):(
                          <div style={{fontSize:'13.5px',textDecoration:p.completado?'line-through':'none'}}>{p.descripcion}</div>
                        )}
                      </div>
                      {admin&&<button className={styles.btnDelete} style={{fontSize:'10px',padding:'3px 7px'}} onClick={()=>borrarTareaPlan(p)}>🗑️</button>}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}


        {seccion==='dashboard'&&!tallerVista&&!vistaStats&&!vistaMarca&&(
          <div>
            <div className={styles.topBar}><h1 className={styles.pageTitle}>Dashboard</h1><div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}><button className={styles.btnPrimary} onClick={actualizarTodo}>↻ Actualizar</button></div></div>
            <div className={styles.divider}></div>
            <div className={styles.stats}><div className={styles.stat} style={{cursor:'default'}}><div className={styles.statN}>{stats.total}</div><div className={styles.statL}>Clientes totales</div></div><div className={styles.stat} style={{cursor:'pointer'}} onClick={()=>setVistaStats('enTaller')}><div className={styles.statN}>{stats.enTaller}</div><div className={styles.statL}>En taller →</div></div><div className={styles.stat} style={{cursor:'pointer'}} onClick={()=>setVistaStats('listos')}><div className={styles.statN}>{stats.listos}</div><div className={styles.statL}>Listos →</div></div><div className={styles.stat} style={{cursor:'pointer'}} onClick={()=>setVistaStats('salidos')}><div className={styles.statN}>{stats.salidos}</div><div className={styles.statL}>Entregados →</div></div><div className={styles.stat} style={{cursor:'pointer'}} onClick={()=>setVistaStats('reingresos')}><div className={styles.statN}>{reingresosRaw.length}</div><div className={styles.statL}>🔄 Reingresos →</div></div><div className={styles.stat} style={{cursor:'pointer'}} onClick={()=>setVistaStats('estancados')}><div className={styles.statN} style={{color:trabajosEstancados.length>0?'#DC2626':undefined}}>{trabajosEstancados.length}</div><div className={styles.statL}>⚠️ Estancados →</div></div></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>{['Malvinas 2084','Malvinas 3906'].map(taller=>{const t=trabajos.filter(x=>x.taller===taller&&x.estado!=='Salio');return<div key={taller} className={styles.tallerCard} onClick={()=>setTallerVista(taller)}><div className={styles.tallerNombre}>{taller}</div><div className={styles.tallerN}>{t.length} <span>autos</span></div><div style={{marginTop:'10px'}}>{['Diagnóstico','En proceso','En espera','Desarmando','Listo'].map(estado=>{const n=t.filter(x=>x.estado===estado).length;return n>0?<div key={estado} style={{display:'flex',justifyContent:'space-between',fontSize:'12px',padding:'4px 0',borderBottom:'1px solid #EDF2F7'}}><span style={{color:'#718096'}}>{estado}</span><span style={{color:'#2D3748',fontWeight:'600'}}>{n}</span></div>:null})}</div><div className={styles.tallerBtn}>Ver detalle →</div></div>})}</div>
            <div className={styles.card}><div className={styles.cardTitle}>Marcas en taller</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:'8px'}}>{Object.entries(conteoMarcas).sort((a,b)=>b[1]-a[1]).map(([marca,n])=>(<div key={marca} onClick={()=>setVistaMarca(marca)} style={{background:'#F7FAFC',borderRadius:'8px',padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',border:'1px solid #E2E8F0',cursor:'pointer'}} onMouseOver={e=>{e.currentTarget.style.borderColor='#2563EB';e.currentTarget.style.background='#EBF5FF'}} onMouseOut={e=>{e.currentTarget.style.borderColor='#E2E8F0';e.currentTarget.style.background='#F7FAFC'}}><span style={{fontSize:'13px',color:'#4A5568',fontWeight:'500'}}>{marca}</span><span style={{fontSize:'20px',fontWeight:'700',color:'#2563EB'}}>{n}</span></div>))}{Object.keys(conteoMarcas).length===0&&<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin autos en taller</div>}</div></div>
          </div>
        )}

        {seccion==='dashboard'&&!tallerVista&&!vistaStats&&vistaMarca&&(<div><div className={styles.topBar}><button className={styles.btn} onClick={()=>setVistaMarca(null)}>← Volver</button><h1 className={styles.pageTitle}>{vistaMarca} en taller</h1></div><div className={styles.divider}></div><div className={styles.tblWrap}><table className={styles.table}><thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Estado</th><th>Taller</th><th>Ingreso</th></tr></thead><tbody>{trabajosDeMarca.map((t,i)=><tr key={t.id} onClick={()=>verDetalle(t)}><td style={{color:'#A0AEC0'}}>{i+1}</td><td><b>{t.vehiculos?.marca_modelo}</b></td><td>{t.vehiculos?.clientes?.nombre}</td><td>{t.vehiculos?.patente}</td><td><span className={badgeClass(t.estado)}>{t.estado}</span></td><td>{t.taller}</td><td style={{fontSize:'12px',color:'#718096'}}>{new Date(t.fecha_ingreso).toLocaleDateString('es-AR')}</td></tr>)}{trabajosDeMarca.length===0&&<tr><td colSpan="7" style={{textAlign:'center',color:'#A0AEC0',padding:'2rem'}}>Sin resultados</td></tr>}</tbody></table></div></div>)}

        {seccion==='dashboard'&&!tallerVista&&vistaStats&&vistaStats!=='reingresos'&&vistaStats!=='estancados'&&(<div><div className={styles.topBar}><button className={styles.btn} onClick={()=>setVistaStats(null)}>← Volver</button><h1 className={styles.pageTitle}>{titulosVistaStats[vistaStats]}</h1></div><div className={styles.divider}></div><div className={styles.tblWrap}><table className={styles.table}><thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Estado</th><th>Taller</th><th>Ingreso</th></tr></thead><tbody>{listaVistaStats[vistaStats].map((t,i)=><tr key={t.id} onClick={()=>verDetalle(t)}><td style={{color:'#A0AEC0'}}>{i+1}</td><td><b>{t.vehiculos?.marca_modelo}</b></td><td>{t.vehiculos?.clientes?.nombre}</td><td>{t.vehiculos?.patente}</td><td><span className={badgeClass(t.estado)}>{t.estado}</span></td><td>{t.taller}</td><td style={{fontSize:'12px',color:'#718096'}}>{new Date(t.fecha_ingreso).toLocaleDateString('es-AR')}</td></tr>)}{listaVistaStats[vistaStats].length===0&&<tr><td colSpan="7" style={{textAlign:'center',color:'#A0AEC0',padding:'2rem'}}>Sin resultados</td></tr>}</tbody></table></div></div>)}

        {seccion==='dashboard'&&!tallerVista&&vistaStats==='estancados'&&(<div><div className={styles.topBar}><button className={styles.btn} onClick={()=>setVistaStats(null)}>← Volver</button><h1 className={styles.pageTitle}>⚠️ Vehículos estancados (+{umbralEstancados} días sin cambiar de estado)</h1>{!editandoUmbral?<button className={styles.btn} onClick={()=>{setUmbralTemp(String(umbralEstancados));setEditandoUmbral(true)}}>⚙️ Cambiar umbral</button>:<div style={{display:'flex',gap:'6px',alignItems:'center'}}><input type="number" min="1" value={umbralTemp} onChange={e=>setUmbralTemp(e.target.value)} style={{width:'60px',padding:'6px 8px',borderRadius:'6px',border:'1px solid #CBD5E0',fontSize:'13px',fontFamily:'inherit'}}/><span style={{fontSize:'12px',color:'#718096'}}>días</span><button className={styles.btnPrimary} style={{fontSize:'12px',padding:'6px 12px'}} onClick={guardarUmbralEstancados}>Guardar</button><button className={styles.btn} style={{fontSize:'12px',padding:'6px 12px'}} onClick={()=>setEditandoUmbral(false)}>Cancelar</button></div>}</div><div className={styles.divider}></div><div className={styles.tblWrap}><table className={styles.table}><thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Estado</th><th>Días</th><th></th></tr></thead><tbody>{trabajosEstancados.map((t,i)=><tr key={t.id}><td style={{color:'#A0AEC0'}}>{i+1}</td><td onClick={()=>verDetalle(t)}><b>{t.vehiculos?.marca_modelo}</b></td><td onClick={()=>verDetalle(t)}>{t.vehiculos?.clientes?.nombre}</td><td onClick={()=>verDetalle(t)}>{t.vehiculos?.patente}</td><td onClick={()=>verDetalle(t)}><span className={badgeClass(t.estado)}>{t.estado}</span></td><td onClick={()=>verDetalle(t)} style={{fontWeight:'700',color:'#DC2626'}}>{diasDesde(fechaReferenciaEstancado(t))} días</td><td style={{cursor:'default'}}><button className={styles.btn} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>toggleExcluirEstancados(t)}>🚫 Excluir</button></td></tr>)}{trabajosEstancados.length===0&&<tr><td colSpan="7" style={{textAlign:'center',color:'#A0AEC0',padding:'2rem'}}>Ningún vehículo estancado 🎉</td></tr>}</tbody></table></div>
        {estancadosExcluidos.length>0&&<div className={styles.card} style={{marginTop:'1rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}} onClick={()=>setMostrarExcluidosEstancados(v=>!v)}>
            <div className={styles.cardTitle} style={{margin:0}}>Excluidos de la alerta ({estancadosExcluidos.length})</div>
            <span style={{fontSize:'12px',color:'#718096'}}>{mostrarExcluidosEstancados?'▲ Ocultar':'▼ Ver'}</span>
          </div>
          {mostrarExcluidosEstancados&&<>
            <div style={{fontSize:'12px',color:'#A0AEC0',margin:'10px 0'}}>Estos vehículos llevan más de {umbralEstancados} días sin cambiar de estado, pero elegiste no contarlos.</div>
            <table className={styles.table}><thead><tr><th>Vehículo</th><th>Cliente</th><th>Días</th><th></th></tr></thead><tbody>{estancadosExcluidos.map(t=>(<tr key={t.id}><td onClick={()=>verDetalle(t)}><b>{t.vehiculos?.marca_modelo}</b></td><td onClick={()=>verDetalle(t)}>{t.vehiculos?.clientes?.nombre}</td><td onClick={()=>verDetalle(t)} style={{color:'#718096'}}>{diasDesde(fechaReferenciaEstancado(t))} días</td><td style={{cursor:'default'}}><button className={styles.btn} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>toggleExcluirEstancados(t)}>↩️ Volver a incluir</button></td></tr>))}</tbody></table>
          </>}
        </div>}
        </div>)}

        {seccion==='dashboard'&&!tallerVista&&vistaStats==='reingresos'&&(<div><div className={styles.topBar}><button className={styles.btn} onClick={()=>setVistaStats(null)}>← Volver</button><h1 className={styles.pageTitle}>🔄 Reingresos</h1></div><div className={styles.divider}></div><div className={styles.tblWrap}><table className={styles.table}><thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Veces que reingresó</th></tr></thead><tbody>{reingresosPorVehiculo.map((r,i)=><tr key={r.vehiculo?.id||i} onClick={()=>{const t=trabajos.find(tr=>tr.vehiculos?.id===r.vehiculo?.id);if(t)verDetalle(t)}}><td style={{color:'#A0AEC0'}}>{i+1}</td><td><b>{r.vehiculo?.marca_modelo}</b></td><td>{r.vehiculo?.clientes?.nombre}</td><td>{r.vehiculo?.patente}</td><td style={{fontWeight:'700',color:'#2563EB'}}>{r.cantidad} {r.cantidad===1?'vez':'veces'}</td></tr>)}{reingresosPorVehiculo.length===0&&<tr><td colSpan="5" style={{textAlign:'center',color:'#A0AEC0',padding:'2rem'}}>Sin reingresos registrados</td></tr>}</tbody></table></div></div>)}

        {seccion==='dashboard'&&tallerVista&&(<div><div className={styles.topBar}><button className={styles.btn} onClick={()=>setTallerVista(null)}>← Volver</button><h1 className={styles.pageTitle}>{tallerVista}</h1></div><div className={styles.divider}></div><div className={styles.tblWrap}><table className={styles.table}><thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Estado</th><th>Mecánico</th><th>Ingreso</th>{admin&&<th>Acciones</th>}</tr></thead><tbody>{trabajosTaller.map((t,i)=>(<tr key={t.id}><td style={{color:'#A0AEC0'}}>{i+1}</td><td onClick={()=>verDetalle(t)}><b>{t.vehiculos?.marca_modelo}</b></td><td onClick={()=>verDetalle(t)}>{t.vehiculos?.clientes?.nombre}</td><td onClick={()=>verDetalle(t)}>{t.vehiculos?.patente}</td><td onClick={()=>verDetalle(t)}><span className={badgeClass(t.estado)}>{t.estado}</span></td><td onClick={()=>verDetalle(t)}>{t.mecanico||'—'}</td><td onClick={()=>verDetalle(t)} style={{fontSize:'12px',color:'#718096'}}>{new Date(t.fecha_ingreso).toLocaleDateString('es-AR')}</td>{admin&&<td style={{display:'flex',gap:'5px',cursor:'default'}}><button className={styles.btnSuccess} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>{setModalActualizar(t);setFormActualizar({tipo:'estado',descripcion:'',taller_nuevo:'Malvinas 3906',mecanico:'',fecha_manual:''})}}>✓</button>{t.estado!=='Salio'&&<button className={styles.btnDangerSolid} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>setModalSalida(t)}>Salida</button>}<button className={styles.btnEdit} onClick={()=>abrirEditar(t)}>✏️</button></td>}</tr>))}</tbody></table></div></div>)}

        {seccion==='clientes'&&!verEntregados&&!verPapelera&&(<div><div className={styles.topBar}><h1 className={styles.pageTitle}>Clientes</h1><div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}><button className={styles.btn} onClick={actualizarTodo}>↻ Actualizar</button>{admin&&trabajosBorrados.length>0&&<button style={{padding:'8px 16px',borderRadius:'6px',fontSize:'13px',cursor:'pointer',background:'#6B7280',color:'#fff',border:'none',fontFamily:'inherit',fontWeight:'600'}} onClick={()=>setVerPapelera(true)}>🗑️ Papelera ({trabajosBorrados.length})</button>}{admin&&<button style={{padding:'8px 16px',borderRadius:'6px',fontSize:'13px',cursor:'pointer',background:'#EA580C',color:'#fff',border:'none',fontFamily:'inherit',fontWeight:'600'}} onClick={()=>setVerEntregados(true)}>Vehículos entregados ({trabajosEntregados.length})</button>}{admin&&<button className={styles.btnPrimary} onClick={()=>setSeccion('nuevo')}>+ Nuevo cliente</button>}</div></div><div className={styles.divider}></div><div className={styles.searchBar}><input type="text" placeholder="Buscar por nombre, patente o vehículo..." value={busqueda} onChange={e=>{setBusqueda(e.target.value);setLimiteClientes(40)}}/></div><div className={styles.tblWrap}>{loading?<p className={styles.loading}>Cargando...</p>:(<table className={styles.table}><thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Estado</th><th>Taller</th><th>Ingreso</th>{admin&&<th>Acciones</th>}</tr></thead><tbody>{trabajosFiltrados.slice(0,limiteClientes).map((t,i)=>(<tr key={t.id}><td style={{color:'#A0AEC0',width:'40px'}}>{totalFiltrados-i}</td><td onClick={()=>verDetalle(t)}><b>{t.vehiculos?.marca_modelo}</b></td><td onClick={()=>verDetalle(t)}>{t.vehiculos?.clientes?.nombre}</td><td onClick={()=>verDetalle(t)}>{t.vehiculos?.patente}</td><td onClick={()=>verDetalle(t)}><span className={badgeClass(t.estado)}>{t.estado}</span>{diasDesde(fechaReferenciaEstancado(t))>=umbralEstancados&&!t.excluir_estancados&&<span style={{marginLeft:'6px',fontSize:'10px',fontWeight:'700',color:'#DC2626',background:'#FEE2E2',padding:'2px 6px',borderRadius:'10px'}}>⚠️ {diasDesde(fechaReferenciaEstancado(t))}d</span>}</td><td onClick={()=>verDetalle(t)}>{t.taller}</td><td onClick={()=>verDetalle(t)} style={{fontSize:'12px',color:'#718096'}}>{new Date(t.fecha_ingreso).toLocaleDateString('es-AR')}</td>{admin&&<td style={{display:'flex',gap:'5px',cursor:'default',flexWrap:'wrap'}}><button className={styles.btnSuccess} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>{setModalActualizar(t);setFormActualizar({tipo:'estado',descripcion:'',taller_nuevo:'Malvinas 3906',mecanico:'',fecha_manual:''})}}>Actualizar</button><button className={styles.btnRepuesto} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>setModalRepuesto(t)}>🔩</button><button className={styles.btnEdit} style={{fontSize:'11px',padding:'4px 8px'}} onClick={async()=>{await cargarFotosModal(t.vehiculos?.id);setModalFotos(t)}}>📷</button><button style={{fontSize:'11px',padding:'4px 8px',background:'#DCFCE7',color:'#16A34A',border:'1px solid #86EFAC',borderRadius:'6px',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>abrirWsp(t)}>💬</button>{t.estado!=='Salio'&&<button className={styles.btnDangerSolid} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>setModalSalida(t)}>Salida</button>}<button className={styles.btnEdit} onClick={()=>abrirEditar(t)}>✏️</button><button className={styles.btnDelete} onClick={()=>borrarCliente(t)}>🗑️</button></td>}</tr>))}</tbody></table>)}{trabajosFiltrados.length>limiteClientes&&<button className={styles.btn} style={{width:'100%',marginTop:'10px'}} onClick={()=>setLimiteClientes(l=>l+40)}>Ver más ({trabajosFiltrados.length-limiteClientes} restantes)</button>}</div></div>)}

        {seccion==='clientes'&&verPapelera&&admin&&(<div><div className={styles.topBar}><button className={styles.btn} onClick={()=>setVerPapelera(false)}>← Volver</button><h1 className={styles.pageTitle}>🗑️ Papelera ({trabajosBorrados.length})</h1></div><div className={styles.divider}></div><div className={styles.tblWrap}><table className={styles.table}><thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Taller</th><th>Acciones</th></tr></thead><tbody>{trabajosBorrados.map((t,i)=>(<tr key={t.id}><td style={{color:'#A0AEC0'}}>{i+1}</td><td><b>{t.vehiculos?.marca_modelo}</b></td><td>{t.vehiculos?.clientes?.nombre}</td><td>{t.vehiculos?.patente}</td><td>{t.taller}</td><td style={{display:'flex',gap:'5px',cursor:'default'}}><button className={styles.btnSuccess} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>restaurarCliente(t)}>↩️ Restaurar</button><button className={styles.btnDelete} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>borrarClienteDefinitivo(t)}>🗑️ Borrar definitivo</button></td></tr>))}{trabajosBorrados.length===0&&<tr><td colSpan="6" style={{textAlign:'center',color:'#A0AEC0',padding:'2rem'}}>La papelera está vacía</td></tr>}</tbody></table></div></div>)}

        {seccion==='clientes'&&verEntregados&&admin&&(<div><div className={styles.topBar}><button className={styles.btn} onClick={()=>setVerEntregados(false)}>← Volver</button><h1 className={styles.pageTitle}>Vehículos entregados ({trabajosEntregados.length})</h1></div><div className={styles.divider}></div><div className={styles.searchBar} style={{marginBottom:'12px'}}><input type="text" placeholder="Buscar por nombre, patente o vehículo..." value={busquedaEntregados} onChange={e=>setBusquedaEntregados(e.target.value)}/></div><div className={styles.tblWrap}><table className={styles.table}><thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Taller</th><th>Entregado</th><th>Acciones</th></tr></thead><tbody>{trabajosEntregadosFiltrados.map((t,i)=>(<tr key={t.id}><td style={{color:'#A0AEC0'}}>{i+1}</td><td onClick={()=>verDetalle(t)}><b>{t.vehiculos?.marca_modelo}</b></td><td onClick={()=>verDetalle(t)}>{t.vehiculos?.clientes?.nombre}</td><td onClick={()=>verDetalle(t)}>{t.vehiculos?.patente}</td><td onClick={()=>verDetalle(t)}>{t.taller}</td><td onClick={()=>verDetalle(t)} style={{fontSize:'12px',color:'#718096'}}>{t.fecha_salida?new Date(t.fecha_salida).toLocaleDateString('es-AR'):'—'}</td><td style={{display:'flex',gap:'5px',cursor:'default'}}><button className={styles.btnPrimary} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>{setModalReingreso(t);setFormReingreso({motivo:'',mecanico:t.mecanico||'',taller:t.taller||'Malvinas 2084',estado:'Diagnóstico',llego_en_grua:false,fecha_ingreso_manual:''})}}>🔄 Reingreso</button><button style={{fontSize:'11px',padding:'4px 8px',background:'#DCFCE7',color:'#16A34A',border:'1px solid #86EFAC',borderRadius:'6px',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>abrirWsp(t)}>💬</button><button className={styles.btnEdit} onClick={()=>abrirEditar(t)}>✏️</button><button className={styles.btnDelete} onClick={()=>borrarCliente(t)}>🗑️</button></td></tr>))}{trabajosEntregadosFiltrados.length===0&&<tr><td colSpan="7" style={{textAlign:'center',color:'#A0AEC0',padding:'2rem'}}>{busquedaEntregados?'Sin resultados':'Sin vehículos entregados todavía'}</td></tr>}</tbody></table></div></div>)}

        {seccion==='turnos'&&admin&&(
          <div>
            <div className={styles.topBar}><h1 className={styles.pageTitle}>📅 Turnos</h1><div style={{display:'flex',gap:'8px'}}><button className={styles.btn} onClick={actualizarTodo}>↻ Actualizar</button><button className={`${styles.btn} ${verRecordatorios?styles.navActive:''}`} onClick={()=>setVerRecordatorios(v=>!v)}>🔔 Recordatorios de mañana {turnosManiana.length>0?`(${turnosManiana.length})`:''}</button><button className={styles.btnPrimary} onClick={()=>{setMostrarFormTurno(true);setEditandoTurno(null);setFormTurno({nombre:'',telefono:'',vehiculo:'',fecha:diaSeleccionado||'',motivo:''})}}>+ Nuevo turno</button></div></div>
            {verRecordatorios&&(<div className={styles.card} style={{marginBottom:'1rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                <div className={styles.cardTitle} style={{margin:0}}>📅 Turnos de mañana ({turnosManiana.length})</div>
                {turnosManiana.filter(t=>t.telefono).length>0&&<button className={styles.btnPrimary} style={{fontSize:'12px',padding:'6px 12px'}} onClick={()=>{turnosManiana.filter(t=>t.telefono).forEach((t,i)=>setTimeout(()=>enviarRecordatorioTurno(t),i*800))}}>Enviar todos</button>}
              </div>
              {turnosManiana.length===0&&<div style={{color:'#A0AEC0',fontSize:'13px',textAlign:'center',padding:'1rem'}}>No hay turnos para mañana</div>}
              {turnosManiana.map(t=>(
                <div key={t.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:'#F7FAFC',borderRadius:'8px',border:'1px solid #E2E8F0',marginBottom:'8px'}}>
                  <div><div style={{fontSize:'13px',fontWeight:'600',color:'#2D3748'}}>{t.nombre}</div><div style={{fontSize:'12px',color:'#718096'}}>{t.vehiculo||'Sin vehículo'} · 8:30 hs</div></div>
                  {t.telefono?<button style={{fontSize:'12px',padding:'6px 12px',background:'#DCFCE7',color:'#16A34A',border:'1px solid #86EFAC',borderRadius:'6px',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>enviarRecordatorioTurno(t)}>💬 Enviar</button>:<span style={{fontSize:'11px',color:'#A0AEC0'}}>Sin teléfono</span>}
                </div>
              ))}
            </div>)}
            <div className={styles.divider}></div>
            <div style={{display:'grid',gridTemplateColumns:diaSeleccionado?'1fr 340px':'1fr',gap:'1.5rem'}}>
              <div className={styles.card} style={{padding:'20px'}}>{renderCalendario()}</div>
              {diaSeleccionado&&(
                <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                  <div className={styles.card}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                      <div className={styles.cardTitle} style={{margin:0}}>{new Date(diaSeleccionado+'T12:00:00').toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})}</div>
                      <div style={{fontSize:'11px',color:turnosPorDia(diaSeleccionado).length>=MAX_TURNOS_POR_DIA?'#DC2626':'#16A34A',fontWeight:'600',background:turnosPorDia(diaSeleccionado).length>=MAX_TURNOS_POR_DIA?'#FEE2E2':'#DCFCE7',padding:'2px 8px',borderRadius:'20px'}}>{turnosPorDia(diaSeleccionado).length}/{MAX_TURNOS_POR_DIA}</div>
                    </div>
                    {turnosPorDia(diaSeleccionado).length===0&&<div style={{color:'#A0AEC0',fontSize:'13px',textAlign:'center',padding:'1rem'}}>Sin turnos este día</div>}
                    {turnosPorDia(diaSeleccionado).map(t=>{
                      const estadoTurno=t.estado||'pendiente'
                      const estadoInfo={
                        pendiente:{label:'Pendiente',bg:'#F1F5F9',color:'#64748B'},
                        presento:{label:'Se presentó',bg:'#DCFCE7',color:'#16A34A'},
                        no_presento:{label:'No se presentó',bg:'#FEE2E2',color:'#DC2626'},
                        reprogramado:{label:'Reprogramado',bg:'#FEF3C7',color:'#B45309'}
                      }[estadoTurno]
                      return(
                      <div key={t.id} style={{padding:'10px 12px',background:'#F7FAFC',borderRadius:'8px',border:'1px solid #E2E8F0',marginBottom:'8px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                          <div><div style={{fontSize:'13px',fontWeight:'600',color:'#2D3748'}}>{t.nombre}</div><div style={{fontSize:'12px',color:'#718096'}}>{t.vehiculo||'Sin vehículo'}</div>{t.motivo&&<div style={{fontSize:'11px',color:'#A0AEC0',marginTop:'2px'}}>{t.motivo}</div>}</div>
                          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'4px'}}>
                            <div style={{fontSize:'11px',fontWeight:'700',color:'#2563EB'}}>8:30 hs</div>
                            <span style={{fontSize:'10px',fontWeight:'700',padding:'2px 8px',borderRadius:'20px',background:estadoInfo.bg,color:estadoInfo.color}}>{estadoInfo.label}</span>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:'4px',marginTop:'8px',flexWrap:'wrap'}}>
                          {t.telefono&&<button style={{fontSize:'11px',padding:'3px 8px',background:'#DCFCE7',color:'#16A34A',border:'1px solid #86EFAC',borderRadius:'6px',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>{let tel=t.telefono.replace(/\D/g,'');if(!tel.startsWith('54'))tel='54'+tel;const fechaF=new Date(t.fecha+'T12:00:00').toLocaleDateString('es-AR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});const msg=`Hola ${t.nombre}! Te recordamos tu turno en DiFiore Performance.\n\n📅 Fecha: ${fechaF}\n🕘 Horario: 8:30 hs\n🚗 Vehículo: ${t.vehiculo||'—'}\n\nTe esperamos en Malvinas 2084, Mar del Plata.`;window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`,'_blank')}}>💬</button>}
                          <button className={styles.btnEdit} style={{fontSize:'11px',padding:'3px 8px'}} onClick={()=>abrirEditarTurno(t)}>✏️</button>
                          <button className={styles.btnDelete} style={{fontSize:'11px',padding:'3px 8px'}} onClick={()=>borrarTurno(t.id)}>🗑️</button>
                        </div>
                        <div style={{display:'flex',gap:'4px',marginTop:'6px',flexWrap:'wrap',borderTop:'1px solid #E2E8F0',paddingTop:'6px'}}>
                          <button style={{fontSize:'10px',padding:'3px 7px',background:estadoTurno==='presento'?'#16A34A':'#F1F5F9',color:estadoTurno==='presento'?'#fff':'#4A5568',border:'1px solid #E2E8F0',borderRadius:'6px',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>usarTurnoComoNuevoCliente(t)}>✅ Se presentó</button>
                          <button style={{fontSize:'10px',padding:'3px 7px',background:estadoTurno==='no_presento'?'#DC2626':'#F1F5F9',color:estadoTurno==='no_presento'?'#fff':'#4A5568',border:'1px solid #E2E8F0',borderRadius:'6px',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>marcarEstadoTurno(t,'no_presento')}>❌ No se presentó</button>
                          <button style={{fontSize:'10px',padding:'3px 7px',background:estadoTurno==='reprogramado'?'#B45309':'#F1F5F9',color:estadoTurno==='reprogramado'?'#fff':'#4A5568',border:'1px solid #E2E8F0',borderRadius:'6px',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>{marcarEstadoTurno(t,'reprogramado');abrirEditarTurno(t)}}>🔁 Reprogramó</button>
                        </div>
                      </div>
                      )
                    })}
                    {!mostrarFormTurno&&turnosPorDia(diaSeleccionado).length<MAX_TURNOS_POR_DIA&&<button className={styles.btnPrimary} style={{width:'100%',marginTop:'8px',fontSize:'13px'}} onClick={()=>{setMostrarFormTurno(true);setEditandoTurno(null);setFormTurno({nombre:'',telefono:'',vehiculo:'',fecha:diaSeleccionado,motivo:''})}}>+ Agregar turno</button>}
                  </div>
                  {mostrarFormTurno&&(
                    <div className={styles.card}>
                      <div className={styles.cardTitle}>{editandoTurno?'Editar turno':'Nuevo turno'}</div>
                      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                        <div className={styles.formGroup}><label>Nombre *</label><input value={formTurno.nombre} onChange={e=>setFormTurno({...formTurno,nombre:e.target.value})} placeholder="Juan García"/></div>
                        <div className={styles.formGroup}><label>Teléfono</label><input value={formTurno.telefono} onChange={e=>setFormTurno({...formTurno,telefono:e.target.value})} placeholder="223 000-0000"/></div>
                        <div className={styles.formGroup}><label>Vehículo</label><input value={formTurno.vehiculo} onChange={e=>setFormTurno({...formTurno,vehiculo:e.target.value})} placeholder="VW Amarok V6"/></div>
                        <div className={styles.formGroup}><label>Motivo</label><textarea value={formTurno.motivo} onChange={e=>setFormTurno({...formTurno,motivo:e.target.value})} placeholder="Service de aceite, revisión frenos..." style={{minHeight:'50px'}}/></div>
                      </div>
                      <div className={styles.formActions}>
                        <button className={styles.btn} onClick={()=>{setMostrarFormTurno(false);setEditandoTurno(null)}}>Cancelar</button>
                        <button className={styles.btnPrimary} onClick={guardarTurno} disabled={guardandoTurnoForm}>{guardandoTurnoForm?'Guardando...':(editandoTurno?'Guardar':'✓ Agendar y WhatsApp')}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {seccion==='presupuesto'&&admin&&(
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>Presupuesto</h1>
              <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                <button className={styles.btn} onClick={actualizarTodo}>↻ Actualizar</button>
                <button className={`${styles.btn} ${vistaPresupuesto==='lista'?styles.navActive:''}`} onClick={()=>setVistaPresupuesto('lista')}>Ver historial</button>
                <button className={styles.btnPrimary} onClick={nuevoPresupuesto}>+ Nuevo</button>
              </div>
            </div>
            <div className={styles.divider}></div>

            {vistaPresupuesto==='lista'&&(
              <div>
                <div className={styles.searchBar} style={{marginBottom:'12px'}}><input type="text" placeholder="Buscar por cliente, vehículo o número..." value={busquedaPresupuestos} onChange={e=>setBusquedaPresupuestos(e.target.value)}/></div>
                <div className={styles.tblWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>N°</th><th>Fecha</th><th>Cliente</th><th>Vehículo</th><th>Total aprox.</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {presupuestosFiltrados.map(p=>(
                        <tr key={p.id}>
                          <td style={{fontFamily:'monospace',fontSize:'12px'}} onClick={()=>abrirPresupuesto(p)}>{p.numero}</td>
                          <td onClick={()=>abrirPresupuesto(p)} style={{fontSize:'12px',color:'#718096'}}>{p.fecha?new Date(p.fecha+'T12:00:00').toLocaleDateString('es-AR'):'—'}</td>
                          <td onClick={()=>abrirPresupuesto(p)}>{p.cliente||'—'}</td>
                          <td onClick={()=>abrirPresupuesto(p)}>{p.vehiculo||'—'}</td>
                          <td onClick={()=>abrirPresupuesto(p)}>${formatPeso(totalAproxPresupuesto(p))}</td>
                          <td style={{display:'flex',gap:'5px',cursor:'default'}}>
                            <button className={styles.btnEdit} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>abrirPresupuesto(p)}>✏️ Editar</button>
                            <button className={styles.btnDelete} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>borrarPresupuesto(p)}>🗑️</button>
                          </td>
                        </tr>
                      ))}
                      {presupuestosFiltrados.length===0&&<tr><td colSpan="6" style={{textAlign:'center',color:'#A0AEC0',padding:'2rem'}}>Sin presupuestos guardados todavía</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {vistaPresupuesto==='nuevo'&&(<>
            <div className={styles.card}><div className={styles.cardTitle}>Datos generales</div><div className={styles.formGrid}><div className={styles.formGroup}><label>N° de presupuesto</label><input value={presupuesto.numero} onChange={e=>setPresupuesto({...presupuesto,numero:e.target.value})} placeholder="001-00001"/></div><div className={styles.formGroup}><label>Fecha</label><input type="date" value={presupuesto.fecha} onChange={e=>setPresupuesto({...presupuesto,fecha:e.target.value})}/></div><div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Buscar cliente existente</label><BuscadorCliente trabajos={trabajos} onSeleccionar={seleccionarClientePresupuesto}/></div><div className={styles.formGroup}><label>Cliente</label><input value={presupuesto.cliente} onChange={e=>setPresupuesto({...presupuesto,cliente:e.target.value})} placeholder="Nombre del cliente"/></div><div className={styles.formGroup}><label>Vehículo</label><input value={presupuesto.vehiculo} onChange={e=>setPresupuesto({...presupuesto,vehiculo:e.target.value})} placeholder="Ej: Volkswagen Amarok V6"/></div></div></div>
            <div className={styles.card}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}><div className={styles.cardTitle} style={{margin:0}}>Ítems del presupuesto</div><button className={styles.btnPrimary} style={{fontSize:'12px',padding:'6px 12px'}} onClick={()=>setPresupuesto({...presupuesto,items:[...presupuesto.items,{descripcion:'',precio_unitario:'',total:'',es_mano_obra:false}]})}>+ Agregar ítem</button></div>
              <div style={{marginBottom:'12px',padding:'10px 14px',background:'#EFF6FF',borderRadius:'8px',border:'1px solid #BFDBFE',display:'flex',alignItems:'center',gap:'20px'}}><span style={{fontSize:'12px',color:'#2563EB',fontWeight:'600'}}>Moneda mano de obra:</span><label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',cursor:'pointer'}}><input type="radio" value="ARS" checked={presupuesto.moneda_mano_obra==='ARS'} onChange={e=>setPresupuesto({...presupuesto,moneda_mano_obra:e.target.value})}/> $ Pesos</label><label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',cursor:'pointer'}}><input type="radio" value="USD" checked={presupuesto.moneda_mano_obra==='USD'} onChange={e=>setPresupuesto({...presupuesto,moneda_mano_obra:e.target.value})}/> USS Dólar</label>{presupuesto.moneda_mano_obra==='USD'&&<span style={{fontSize:'12px',color:'#DC2626',fontWeight:'600'}}>⚠️ El total se mostrará en USS sin conversión a pesos</span>}</div>
              {presupuesto.items.map((item,idx)=>(<div key={idx} style={{background:'#F7FAFC',border:'1px solid #E2E8F0',borderRadius:'8px',padding:'12px',marginBottom:'10px'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}><div style={{display:'flex',alignItems:'center',gap:'12px'}}><span style={{fontSize:'12px',fontWeight:'600',color:'#718096'}}>Ítem {idx+1}</span><label style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'12px',cursor:'pointer',color:'#2563EB',fontWeight:'500'}}><input type="checkbox" checked={item.es_mano_obra} onChange={e=>{const items=[...presupuesto.items];items[idx]={...items[idx],es_mano_obra:e.target.checked};setPresupuesto({...presupuesto,items})}}/> Es mano de obra</label></div>{presupuesto.items.length>1&&<button style={{background:'none',border:'none',color:'#DC2626',cursor:'pointer',fontSize:'18px',lineHeight:1}} onClick={()=>setPresupuesto({...presupuesto,items:presupuesto.items.filter((_,i)=>i!==idx)})}>✕</button>}</div><div className={styles.formGrid}><div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Descripción</label><input value={item.descripcion} onChange={e=>{const items=[...presupuesto.items];items[idx]={...items[idx],descripcion:e.target.value};setPresupuesto({...presupuesto,items})}} placeholder={item.es_mano_obra?'Ej: Reparación de motor...':'Ej: Kit de distribución Alemán'}/></div><div className={styles.formGroup}><label>Precio unitario {item.es_mano_obra?`(${presupuesto.moneda_mano_obra==='USD'?'USS':'$'})`:'(opcional)'}</label><input value={item.precio_unitario} onChange={e=>{const items=[...presupuesto.items];items[idx]={...items[idx],precio_unitario:formatNum(e.target.value)};setPresupuesto({...presupuesto,items})}} placeholder="0"/></div><div className={styles.formGroup}><label>Total {item.es_mano_obra?`(${presupuesto.moneda_mano_obra==='USD'?'USS':'$'})`:'($)'}</label><input value={item.total} onChange={e=>{const items=[...presupuesto.items];items[idx]={...items[idx],total:formatNum(e.target.value)};setPresupuesto({...presupuesto,items})}} placeholder="0"/></div></div></div>))}
              {!usandoUSD&&<>
                <div style={{background:'#F0FDF4',border:'1px solid #86EFAC',borderRadius:'8px',padding:'12px 16px',marginTop:'4px',marginBottom:'8px'}}><label style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',cursor:'pointer',fontWeight:'600',color:'#16A34A',marginBottom:'10px'}}><input type="checkbox" checked={presupuesto.aplicar_descuento} onChange={e=>setPresupuesto({...presupuesto,aplicar_descuento:e.target.checked})}/>Aplicar descuento</label>{presupuesto.aplicar_descuento&&<div className={styles.formGrid}><div className={styles.formGroup}><label>Concepto del descuento</label><input value={presupuesto.descuento_concepto} onChange={e=>setPresupuesto({...presupuesto,descuento_concepto:e.target.value})} placeholder="Ej: Descuento por diagnóstico"/></div><div className={styles.formGroup}><label>Monto a descontar ($)</label><input value={presupuesto.descuento_monto} onChange={e=>setPresupuesto({...presupuesto,descuento_monto:formatNum(e.target.value)})} placeholder="100.000"/></div></div>}</div>
                <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:'8px',padding:'12px 16px',marginBottom:'8px'}}><label style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',cursor:'pointer',fontWeight:'600',color:'#2563EB',marginBottom:'10px'}}><input type="checkbox" checked={presupuesto.mostrar_transferencia} onChange={e=>setPresupuesto({...presupuesto,mostrar_transferencia:e.target.checked})}/>Mostrar precio transferencia / efectivo (descuento)</label>{presupuesto.mostrar_transferencia&&<div><div style={{fontSize:'12px',color:'#555',marginBottom:'8px'}}>Aplicar recargo del 20% sobre:</div><div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}><label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',cursor:'pointer'}}><input type="checkbox" checked={presupuesto.transferencia_repuestos} onChange={e=>setPresupuesto({...presupuesto,transferencia_repuestos:e.target.checked})}/> Repuestos</label><label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',cursor:'pointer'}}><input type="checkbox" checked={presupuesto.transferencia_mano_obra} onChange={e=>setPresupuesto({...presupuesto,transferencia_mano_obra:e.target.checked})}/> Mano de obra</label></div><div style={{marginTop:'12px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}><div style={{background:'#1a56db',color:'white',borderRadius:'8px',padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:'12px',fontWeight:'600'}}>🏦 Transferencia</span><span style={{fontSize:'16px',fontWeight:'900'}}>${formatPeso(Math.round(totalTransferencia))}</span></div><div style={{background:'#15803D',color:'white',borderRadius:'8px',padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:'12px',fontWeight:'600'}}>💵 Efectivo (descuento)</span><span style={{fontSize:'16px',fontWeight:'900'}}>${formatPeso(Math.round(totalEfectivo))}</span></div></div></div>}{!presupuesto.mostrar_transferencia&&<div style={{background:'#1a56db',color:'white',borderRadius:'8px',padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'4px'}}><span style={{fontSize:'12px',fontWeight:'600'}}>TOTAL</span><span style={{fontSize:'16px',fontWeight:'900'}}>${formatPeso(Math.round(totalEfectivo))}</span></div>}</div>
              </>}
              {usandoUSD&&<div style={{background:'#1a56db',color:'white',borderRadius:'8px',padding:'12px 16px',marginTop:'4px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:'13px',fontWeight:'600'}}>TOTAL MANO DE OBRA</span><span style={{fontSize:'18px',fontWeight:'900'}}>USS {formatPeso(totalManoObraUSD)}</span></div>}
            </div>
            <div className={styles.card}><div className={styles.cardTitle}>Notas / Observaciones</div><div className={styles.formGroup}><label>Una por línea (aparecerán con ✅)</label><textarea value={presupuesto.notas} onChange={e=>setPresupuesto({...presupuesto,notas:e.target.value})} placeholder={'Kit de distribución de origen Alemán.\nRepuestos originales. Trabajo garantizado.'} style={{minHeight:'80px'}}/></div></div>
            <div className={styles.formActions}><button className={styles.btn} onClick={nuevoPresupuesto}>Limpiar</button><button className={styles.btn} onClick={guardarPresupuesto} disabled={guardandoPresupuesto}>{guardandoPresupuesto?'Guardando...':'💾 Guardar'}</button><button className={styles.btnPrimary} onClick={imprimirPresupuesto}>🖨️ Imprimir presupuesto</button></div>
            </>)}
          </div>
        )}
{seccion==='recibo'&&admin&&(
          <div>
            <div className={styles.topBar}><h1 className={styles.pageTitle}>Nuevo recibo</h1><div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}><button className={styles.btn} onClick={actualizarTodo}>↻ Actualizar</button><button className={styles.btnPrimary} onClick={imprimirRecibo}>🖨️ Imprimir</button></div></div>
            <div className={styles.divider}></div>
            <div className={styles.card}><div className={styles.cardTitle}>Datos del recibo</div><div className={styles.formGrid}><div className={styles.formGroup}><label>N° de recibo</label><input value={recibo.numero} onChange={e=>setRecibo({...recibo,numero:e.target.value})} placeholder="001-00001"/></div><div className={styles.formGroup}><label>Fecha</label><input type="date" value={recibo.fecha} onChange={e=>setRecibo({...recibo,fecha:e.target.value})}/></div><div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Buscar cliente existente</label><BuscadorCliente trabajos={trabajos} onSeleccionar={seleccionarClienteRecibo}/></div><div className={styles.formGroup}><label>Cliente</label><input value={recibo.cliente} onChange={e=>setRecibo({...recibo,cliente:e.target.value})} placeholder="Nombre del cliente"/></div><div className={styles.formGroup}><label>Vehículo</label><input value={recibo.vehiculo} onChange={e=>setRecibo({...recibo,vehiculo:e.target.value})} placeholder="Ej: VW Amarok V6"/></div><div className={styles.formGroup}><label>Patente</label><input value={recibo.patente} onChange={e=>setRecibo({...recibo,patente:e.target.value})} placeholder="AB 123 CD"/></div><div className={styles.formGroup}><label>Forma de pago</label><select value={recibo.forma_pago} onChange={e=>setRecibo({...recibo,forma_pago:e.target.value})}><option>Efectivo</option><option>Transferencia</option><option>Tarjeta de débito</option><option>Tarjeta de crédito</option><option>Cheque</option></select></div></div></div>
            <div className={styles.card}><div className={styles.cardTitle}>Monto</div><div style={{marginBottom:'12px',padding:'10px 14px',background:'#EFF6FF',borderRadius:'8px',border:'1px solid #BFDBFE',display:'flex',alignItems:'center',gap:'20px'}}><span style={{fontSize:'12px',color:'#2563EB',fontWeight:'600'}}>Moneda:</span><label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',cursor:'pointer'}}><input type="radio" value="ARS" checked={recibo.moneda==='ARS'} onChange={e=>setRecibo({...recibo,moneda:e.target.value})}/> $ Pesos</label><label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',cursor:'pointer'}}><input type="radio" value="USD" checked={recibo.moneda==='USD'} onChange={e=>setRecibo({...recibo,moneda:e.target.value})}/> USS Dólar</label></div><div className={styles.formGrid}><div className={styles.formGroup}><label>Monto ({recibo.moneda==='USD'?'USS':'$'})</label><input value={recibo.monto} onChange={e=>setRecibo({...recibo,monto:formatNum(e.target.value)})} placeholder="0"/></div></div><div className={styles.formGroup} style={{marginTop:'10px'}}><label>Concepto</label><textarea value={recibo.concepto} onChange={e=>setRecibo({...recibo,concepto:e.target.value})} placeholder="Ej: Pago total por reparación de motor..." style={{minHeight:'70px'}}/></div><div className={styles.formGroup} style={{marginTop:'10px'}}><label>Observaciones (opcional)</label><textarea value={recibo.observaciones} onChange={e=>setRecibo({...recibo,observaciones:e.target.value})} placeholder="Notas adicionales..." style={{minHeight:'50px'}}/></div></div>
            <div className={styles.formActions}><button className={styles.btn} onClick={()=>setRecibo({numero:formatNumeroDoc(numeracion.recibo),fecha:new Date().toISOString().split('T')[0],cliente:'',vehiculo:'',patente:'',trabajo_id:'',concepto:'',monto:'',moneda:'ARS',forma_pago:'Efectivo',observaciones:''})}>Limpiar</button><button className={styles.btnPrimary} onClick={imprimirRecibo}>🖨️ Imprimir recibo</button></div>
          </div>
        )}

        {seccion==='checklist'&&(
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>{CHECKLIST_TITULO_POR_TIPO[tipoChecklist]}</h1>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                <button className={styles.btn} onClick={actualizarTodo}>↻ Actualizar</button>
                <button className={`${styles.btn} ${tipoChecklist==='entrega'?styles.navActive:''}`} onClick={()=>{setTipoChecklist('entrega');setVistaChecklist('lista');setEditandoChecklist(false);setChecklistActivo(null)}}>Entrega</button>
                <button className={`${styles.btn} ${tipoChecklist==='inyectores'?styles.navActive:''}`} onClick={()=>{setTipoChecklist('inyectores');setVistaChecklist('lista');setEditandoChecklist(false);setChecklistActivo(null)}}>Inyectores</button>
              </div>
            </div>
            <div className={styles.divider}></div>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'14px'}}>
              <button className={`${styles.btn} ${vistaChecklist==='lista'?styles.navActive:''}`} onClick={()=>{setVistaChecklist('lista');setEditandoChecklist(false);setChecklistActivo(null)}}>Ver registros</button>
              {tipoChecklist==='inyectores'&&<button className={`${styles.btn} ${vistaChecklist==='procedimiento'?styles.navActive:''}`} onClick={()=>setVistaChecklist('procedimiento')}>📋 Ver procedimiento</button>}
              <button className={styles.btnPrimary} onClick={()=>{setVistaChecklist('nuevo');setEditandoChecklist(false);setFormChecklist({trabajo_id:'',vehiculo:'',patente:'',color:'',tipo:tipoChecklist,fecha_entrega:new Date().toISOString().split('T')[0],mecanico:'',observacion_general:'',items:itemsVacios(tipoChecklist)});setFotosChecklistSubidas([])}}>+ Nuevo checklist</button>
            </div>
            {!admin&&!empleadoActual&&vistaChecklist==='lista'&&<div className={styles.card} style={{marginBottom:'1rem'}}><div className={styles.cardTitle}>¿Quién sos?</div><div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginTop:'8px'}}>{mecanicos.map(e=><button key={e.id} className={styles.btnPrimary} style={{fontSize:'13px',padding:'8px 16px'}} onClick={()=>setEmpleadoActual(e.nombre)}>{e.nombre}</button>)}</div></div>}
            {!admin&&empleadoActual&&<div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:'8px',padding:'8px 14px',marginBottom:'12px',fontSize:'13px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span>👷 Mostrando registros de <b>{empleadoActual}</b></span><button className={styles.btn} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>setEmpleadoActual('')}>Cambiar</button></div>}
            {vistaChecklist==='procedimiento'&&(
              <div className={styles.card}>
                <div className={styles.cardTitle}>Procedimiento de reparación de inyectores</div>
                <div style={{background:'#FEF3C7',border:'1px solid #FDE68A',borderRadius:'8px',padding:'12px 14px',marginBottom:'14px',fontSize:'13px',color:'#92400E',fontWeight:'600'}}>⚠️ Cuando hay trabajos de inyectores, los hace una sola persona por completo.</div>
                <div style={{display:'flex',flexDirection:'column',gap:'0'}}>
                  {PROCEDIMIENTO_INYECTORES.map((paso,idx)=>(
                    <div key={idx} style={{display:'flex',gap:'14px',padding:'14px 0',borderBottom:idx<PROCEDIMIENTO_INYECTORES.length-1?'1px solid #EDF2F7':'none'}}>
                      <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'#EFF6FF',color:'#2563EB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700',flexShrink:0}}>{idx+1}</div>
                      <div>
                        <div style={{fontSize:'14px',fontWeight:'600',color:'#2D3748',marginBottom:'2px'}}>{paso.titulo}</div>
                        <div style={{fontSize:'13px',color:'#718096',lineHeight:1.5}}>{paso.descripcion}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {vistaChecklist==='nuevo'&&(
              <div>
                <div className={styles.card}>
                  <div className={styles.cardTitle}>{editandoChecklist?'Editar checklist':'Datos del vehículo'}</div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Buscar cliente</label><BuscadorCliente trabajos={trabajos} onSeleccionar={seleccionarClienteChecklist}/></div>
                    <div className={styles.formGroup}><label>Vehículo</label><input value={formChecklist.vehiculo} onChange={e=>setFormChecklist({...formChecklist,vehiculo:e.target.value})} placeholder="VW Amarok V6"/></div>
                    <div className={styles.formGroup}><label>Patente</label><input value={formChecklist.patente} onChange={e=>setFormChecklist({...formChecklist,patente:e.target.value})} placeholder="AB 123 CD"/></div>
                    <div className={styles.formGroup}><label>Color</label><input value={formChecklist.color} onChange={e=>setFormChecklist({...formChecklist,color:e.target.value})} placeholder="Blanco"/></div>
                    <div className={styles.formGroup}><label>Fecha de entrega</label><input type="date" value={formChecklist.fecha_entrega} onChange={e=>setFormChecklist({...formChecklist,fecha_entrega:e.target.value})}/></div>
                  </div>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardTitle}>Mecánico</div>
                  <div className={styles.formGroup}><select value={formChecklist.mecanico} onChange={e=>setFormChecklist({...formChecklist,mecanico:e.target.value})}><option value="">— Seleccioná tu nombre —</option>{mecanicos.map(m=><option key={m.id} value={m.nombre}>{m.nombre}</option>)}</select></div>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardTitle}>Checklist</div>
                  <div style={{display:'flex',flexDirection:'column',gap:'0'}}>
                    {CHECKLIST_ITEMS_POR_TIPO[formChecklist.tipo||tipoChecklist].map((item,idx)=>(
                      <Fragment key={item}>
                      <div style={{display:'grid',gridTemplateColumns:'1fr auto auto 1fr',gap:'8px',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #EDF2F7'}}>
                        <span style={{fontSize:'13px',fontWeight:'500',color:'#2D3748'}}>{item}</span>
                        <label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',cursor:'pointer',padding:'6px 12px',borderRadius:'6px',background:formChecklist.items[item]?.valor==='si'?'#DCFCE7':'#F7FAFC',border:'1px solid',borderColor:formChecklist.items[item]?.valor==='si'?'#86EFAC':'#E2E8F0',whiteSpace:'nowrap'}}>
                          <input type="radio" name={`item-${idx}`} value="si" checked={formChecklist.items[item]?.valor==='si'} onChange={()=>setFormChecklist({...formChecklist,items:{...formChecklist.items,[item]:{...formChecklist.items[item],valor:'si'}}})}/>
                          <span style={{color:formChecklist.items[item]?.valor==='si'?'#16A34A':'#718096'}}>✓ Sí</span>
                        </label>
                        <label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',cursor:'pointer',padding:'6px 12px',borderRadius:'6px',background:formChecklist.items[item]?.valor==='no'?'#FEE2E2':'#F7FAFC',border:'1px solid',borderColor:formChecklist.items[item]?.valor==='no'?'#FECACA':'#E2E8F0',whiteSpace:'nowrap'}}>
                          <input type="radio" name={`item-${idx}`} value="no" checked={formChecklist.items[item]?.valor==='no'} onChange={()=>setFormChecklist({...formChecklist,items:{...formChecklist.items,[item]:{...formChecklist.items[item],valor:'no'}}})}/>
                          <span style={{color:formChecklist.items[item]?.valor==='no'?'#DC2626':'#718096'}}>✗ No</span>
                        </label>
                        <input value={formChecklist.items[item]?.obs||''} onChange={e=>setFormChecklist({...formChecklist,items:{...formChecklist.items,[item]:{...formChecklist.items[item],obs:e.target.value}}})} placeholder="Observación..." style={{fontSize:'12px'}}/>
                      </div>
                      {tipoChecklist==='inyectores'&&item==='FOTO DE CÓDIGO DE INYECTORES CARGADA EN LA PÁGINA'&&(
                        <div style={{padding:'8px 0 14px',borderBottom:'1px solid #EDF2F7',display:'flex',flexDirection:'column',gap:'8px'}}>
                          <input type="file" accept="image/*" multiple ref={fileChecklistFotoRef} style={{display:'none'}} onChange={subirFotosChecklist}/>
                          <button type="button" className={styles.btnPrimary} style={{width:'fit-content',fontSize:'12.5px',padding:'6px 12px'}} onClick={()=>fileChecklistFotoRef.current.click()}>📷 {subiendoFotoChecklist?'Subiendo...':'Subir foto'}</button>
                          {!formChecklist.trabajo_id&&<span style={{fontSize:'11.5px',color:'#A0AEC0'}}>Elegí primero el cliente/vehículo arriba para poder subir fotos.</span>}
                          {fotosChecklistSubidas.length>0&&<div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>{fotosChecklistSubidas.map(f=><img key={f.id} src={f.url} alt="foto" style={{width:'52px',height:'52px',objectFit:'cover',borderRadius:'6px',border:'1px solid #E2E8F0'}}/>)}</div>}
                        </div>
                      )}
                      </Fragment>
                    ))}
                  </div>
                  <div className={styles.formGroup} style={{marginTop:'16px'}}><label>Observaciones generales</label><textarea value={formChecklist.observacion_general} onChange={e=>setFormChecklist({...formChecklist,observacion_general:e.target.value})} placeholder="Notas adicionales..." style={{minHeight:'60px'}}/></div>
                </div>
                <div className={styles.formActions}>
                  <button className={styles.btn} onClick={()=>{setVistaChecklist('lista');setEditandoChecklist(false);setChecklistActivo(null)}}>Cancelar</button>
                  <button className={styles.btnPrimary} onClick={guardarChecklist} disabled={guardandoChecklist}>{guardandoChecklist?'Guardando...':(editandoChecklist?'Actualizar checklist':'Guardar checklist')}</button>
                </div>
              </div>
            )}
            {vistaChecklist==='lista'&&(
              <div>
                <div className={styles.searchBar} style={{marginBottom:'12px'}}><input type="text" placeholder="Buscar por vehículo, patente o mecánico..." value={busquedaChecklist} onChange={e=>setBusquedaChecklist(e.target.value)}/></div>
                {checklistsFiltrados.length===0?<div style={{color:'#A0AEC0',fontSize:'14px',textAlign:'center',padding:'3rem'}}>{!admin&&!empleadoActual?'Seleccioná tu nombre arriba para ver tus registros':'No hay checklists registrados todavía'}</div>:(
                  <div className={styles.tblWrap}><table className={styles.table}><thead><tr><th>Fecha</th><th>Vehículo</th><th>Patente</th><th>Mecánico</th><th>Acciones</th></tr></thead><tbody>{checklistsFiltrados.slice(0,limiteChecklists).map(ch=>(<tr key={ch.id}><td style={{fontSize:'12px',color:'#718096'}}>{ch.fecha_entrega?new Date(ch.fecha_entrega+'T12:00:00').toLocaleDateString('es-AR'):'—'}</td><td onClick={()=>setChecklistActivo(ch)} style={{cursor:'pointer'}}><b>{ch.vehiculo||'—'}</b></td><td onClick={()=>setChecklistActivo(ch)} style={{cursor:'pointer'}}>{ch.patente||'—'}</td><td>{ch.mecanico||'—'}</td><td style={{display:'flex',gap:'5px'}}><button className={styles.btn} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>setChecklistActivo(ch)}>Ver</button><button className={styles.btnPrimary} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>abrirEditarChecklist(ch)}>✏️ Editar</button><button className={styles.btn} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>imprimirChecklist(ch)}>🖨️</button>{admin&&<button className={styles.btnDelete} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>borrarChecklist(ch.id)}>🗑️</button>}</td></tr>))}</tbody></table>{checklistsFiltrados.length>limiteChecklists&&<button className={styles.btn} style={{width:'100%',marginTop:'10px'}} onClick={()=>setLimiteChecklists(l=>l+40)}>Ver más ({checklistsFiltrados.length-limiteChecklists} restantes)</button>}</div>
                )}
              </div>
            )}
          </div>
        )}

        {seccion==='empleados'&&admin&&(
          <div>
            <div className={styles.topBar}><h1 className={styles.pageTitle}>⚙️ Empleados</h1><button className={styles.btn} onClick={actualizarTodo}>↻ Actualizar</button></div>
            <div className={styles.divider}></div>
            <div className={styles.card}><div className={styles.cardTitle}>Agregar empleado</div><div className={styles.formGrid}><div className={styles.formGroup}><label>Nombre</label><input value={nuevoEmpleado.nombre} onChange={e=>setNuevoEmpleado({...nuevoEmpleado,nombre:e.target.value})} placeholder="NOMBRE APELLIDO"/></div><div className={styles.formGroup}><label>Rol</label><select value={nuevoEmpleado.rol} onChange={e=>setNuevoEmpleado({...nuevoEmpleado,rol:e.target.value})}><option value="mecanico">Mecánico</option><option value="encargado">Encargado</option></select></div></div><button className={styles.btnPrimary} style={{marginTop:'8px'}} onClick={agregarEmpleado} disabled={guardandoEmpleado}>{guardandoEmpleado?'Agregando...':'+ Agregar'}</button></div>
            <div className={styles.card}><div className={styles.cardTitle}>Mecánicos</div>{mecanicos.length===0?<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin mecánicos</div>:<div style={{display:'flex',flexDirection:'column',gap:'6px'}}>{mecanicos.map(e=><div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:'#F7FAFC',borderRadius:'6px',border:'1px solid #E2E8F0'}}><span style={{fontSize:'13px',fontWeight:'500'}}>{e.nombre}</span><button className={styles.btnDelete} style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>borrarEmpleado(e.id)}>🗑️</button></div>)}</div>}</div>
          </div>
        )}

        {seccion==='nuevo'&&admin&&(
          <div>
            <div className={styles.topBar}><h1 className={styles.pageTitle}>Nuevo cliente</h1><button className={styles.btn} onClick={()=>setSeccion('clientes')}>Cancelar</button></div>
            <div className={styles.divider}></div>
            {mensaje&&<div className={styles.mensaje}>{mensaje}</div>}
            <form onSubmit={guardarCliente}>
              <div className={styles.card}><div className={styles.cardTitle}>Datos del cliente</div><div className={styles.formGrid}><div className={styles.formGroup}><label>Nombre y apellido *</label><input required value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Juan García"/></div><div className={styles.formGroup}><label>Teléfono</label><input value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} placeholder="223 000-0000"/></div><div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="juan@email.com"/></div></div></div>
              <div className={styles.card}><div className={styles.cardTitle}>Datos del vehículo</div><div className={styles.formGrid}><div className={styles.formGroup}><label>Marca y modelo *</label><input required value={form.marca_modelo} onChange={e=>setForm({...form,marca_modelo:e.target.value})} placeholder="VW Amarok V6"/></div><div className={styles.formGroup}><label>Patente</label><input value={form.patente} onChange={e=>setForm({...form,patente:e.target.value})} placeholder="AB 123 CD"/></div><div className={styles.formGroup}><label>Año</label><input value={form.anio} onChange={e=>setForm({...form,anio:e.target.value})} placeholder="2022"/></div><div className={styles.formGroup}><label>Kilometraje</label><input value={form.kilometraje} onChange={e=>setForm({...form,kilometraje:e.target.value})} placeholder="85.000 km"/></div><div className={styles.formGroup}><label>Color</label><input value={form.color} onChange={e=>setForm({...form,color:e.target.value})} placeholder="Ej: Blanco, Negro..."/></div><div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Motivo de ingreso</label><textarea value={form.motivo} onChange={e=>setForm({...form,motivo:e.target.value})} placeholder="Reparación de motor. Cambio de distribución. Service completo."/></div><div className={styles.formGroup}><label>Fecha de ingreso</label><input type="datetime-local" value={form.fecha_ingreso_manual} onChange={e=>setForm({...form,fecha_ingreso_manual:e.target.value})}/></div><div className={styles.formGroup}><label>Llegó en</label><select value={form.llego_en_grua?'grua':'andando'} onChange={e=>setForm({...form,llego_en_grua:e.target.value==='grua'})}><option value="andando">Andando</option><option value="grua">En grúa</option></select></div><div className={styles.formGroup}><label>Tiene seguro</label><select value={form.tiene_seguro?'si':'no'} onChange={e=>setForm({...form,tiene_seguro:e.target.value==='si'})}><option value="no">No</option><option value="si">Sí</option></select></div><div className={styles.formGroup}><label>Mecánico</label><input value={form.mecanico} onChange={e=>setForm({...form,mecanico:e.target.value})} placeholder="Agus D."/></div><div className={styles.formGroup}><label>Estado</label><select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})}><option>Diagnóstico</option><option>En proceso</option><option>En espera</option><option>Desarmando</option><option>Listo</option></select></div><div className={styles.formGroup} style={{gridColumn:'1/-1'}}><label>Taller</label><select value={form.taller} onChange={e=>setForm({...form,taller:e.target.value})}><option>Malvinas 2084</option><option>Malvinas 3906</option></select></div></div></div>
              <div className={styles.card}><div className={styles.cardTitle}>Fotos del vehículo</div><input type="file" accept="image/*" multiple ref={fileNuevoRef} style={{display:'none'}} onChange={e=>{setFotoNuevo(prev=>[...prev,...Array.from(e.target.files)]);e.target.value=''}}/><button type="button" className={styles.btnPrimary} onClick={()=>fileNuevoRef.current.click()}>{fotoNuevo.length>0?`✓ ${fotoNuevo.length} foto(s)`:'+ Seleccionar fotos'}</button>{fotoNuevo.length>0&&<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginTop:'12px'}}>{fotoNuevo.map((f,i)=><div key={i} style={{position:'relative'}}><img src={URL.createObjectURL(f)} alt="preview" style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',borderRadius:'8px'}}/><button type="button" className={styles.fotoBorrar} onClick={()=>setFotoNuevo(fotoNuevo.filter((_,j)=>j!==i))}>✕</button></div>)}</div>}</div>
              <div className={styles.formActions}><button type="button" className={styles.btn} onClick={()=>setSeccion('clientes')}>Cancelar</button><button type="submit" className={styles.btnPrimary} disabled={guardandoCliente}>{guardandoCliente?'Guardando...':'Registrar cliente'}</button></div>
            </form>
          </div>
        )}

        {seccion==='informe'&&admin&&(
          <div>
            <div className={styles.topBar}><h1 className={styles.pageTitle}>Informe mensual</h1><div style={{display:'flex',gap:'8px',alignItems:'center'}}><button className={styles.btn} onClick={actualizarTodo}>↻ Actualizar</button><input type="month" value={mesInforme} onChange={e=>setMesInforme(e.target.value)} style={{padding:'8px 12px',borderRadius:'6px',border:'1px solid #CBD5E0',fontSize:'13px',fontFamily:'inherit'}}/><button style={{padding:'8px 16px',borderRadius:'6px',fontSize:'13px',cursor:'pointer',background:'#15803D',color:'#fff',border:'none',fontFamily:'inherit',fontWeight:'600'}} onClick={exportarInformeExcel}>📊 Exportar a Excel</button><button className={styles.btnPrimary} onClick={imprimirInforme}>🖨️ Imprimir informe</button></div></div>
            <div className={styles.divider}></div>
            {(()=>{const{ingresados,salidos,marcaTop,marcasCount,nombreMes}=generarInforme();return<div><div style={{marginBottom:'12px',fontSize:'14px',fontWeight:'600',color:'#718096',textTransform:'capitalize'}}>{nombreMes}</div><div className={styles.stats} style={{marginBottom:'1.5rem'}}><div className={styles.stat} style={{cursor:'default'}}><div className={styles.statN}>{ingresados.length}</div><div className={styles.statL}>Ingresados</div></div><div className={styles.stat} style={{cursor:'default'}}><div className={styles.statN}>{salidos.length}</div><div className={styles.statL}>Entregados</div></div><div className={styles.stat} style={{cursor:'default'}}><div className={styles.statN} style={{fontSize:'18px',color:'#16A34A'}}>{marcaTop?marcaTop[0]:'—'}</div><div className={styles.statL}>Marca frecuente{marcaTop?` (${marcaTop[1]})`:''}</div></div><div className={styles.stat} style={{cursor:'default'}}><div className={styles.statN} style={{fontSize:'16px'}}>{Object.keys(marcasCount).length}</div><div className={styles.statL}>Marcas distintas</div></div></div><div className={styles.card}><div className={styles.cardTitle}>Vehículos ingresados ({ingresados.length})</div>{ingresados.length===0?<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin ingresos este mes</div>:<table className={styles.table}><thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Taller</th><th>Ingreso</th></tr></thead><tbody>{ingresados.map((t,i)=><tr key={t.id} onClick={()=>verDetalle(t)}><td style={{color:'#A0AEC0'}}>{i+1}</td><td><b>{t.vehiculos?.marca_modelo}</b></td><td>{t.vehiculos?.clientes?.nombre}</td><td>{t.vehiculos?.patente}</td><td>{t.taller}</td><td style={{fontSize:'12px',color:'#718096'}}>{new Date(t.fecha_ingreso).toLocaleDateString('es-AR')}</td></tr>)}</tbody></table>}</div><div className={styles.card}><div className={styles.cardTitle}>Vehículos entregados ({salidos.length})</div>{salidos.length===0?<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin entregas este mes</div>:<table className={styles.table}><thead><tr><th>#</th><th>Vehículo</th><th>Cliente</th><th>Patente</th><th>Taller</th><th>Entrega</th></tr></thead><tbody>{salidos.map((t,i)=><tr key={t.id} onClick={()=>verDetalle(t)}><td style={{color:'#A0AEC0'}}>{i+1}</td><td><b>{t.vehiculos?.marca_modelo}</b></td><td>{t.vehiculos?.clientes?.nombre}</td><td>{t.vehiculos?.patente}</td><td>{t.taller}</td><td style={{fontSize:'12px',color:'#718096'}}>{new Date(t.fecha_salida).toLocaleDateString('es-AR')}</td></tr>)}</tbody></table>}</div><div className={styles.card}><div className={styles.cardTitle}>Marcas atendidas</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:'8px'}}>{Object.entries(marcasCount).sort((a,b)=>b[1]-a[1]).map(([marca,n])=><div key={marca} style={{background:'#F7FAFC',borderRadius:'8px',padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',border:'1px solid #E2E8F0'}}><span style={{fontSize:'13px',color:'#4A5568',fontWeight:'500'}}>{marca}</span><span style={{fontSize:'20px',fontWeight:'700',color:'#2563EB'}}>{n}</span></div>)}{Object.keys(marcasCount).length===0&&<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin datos este mes</div>}</div></div></div>})()}
          </div>
        )}

        {seccion==='detalle'&&clienteDetalle&&(
          <div>
            <div className={styles.topBar}><div style={{display:'flex',gap:'8px'}}><button className={styles.btn} onClick={()=>setSeccion('clientes')}>← Volver</button><button className={styles.btn} onClick={actualizarTodo}>↻ Actualizar</button></div><div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>{admin&&<button className={styles.btn} onClick={()=>imprimirOrden(clienteDetalle)}>🖨️ Imprimir</button>}{admin&&<button className={styles.btnSuccess} onClick={()=>{setModalActualizar(clienteDetalle);setFormActualizar({tipo:'estado',descripcion:'',taller_nuevo:'Malvinas 3906',mecanico:'',fecha_manual:''})}}>Actualización</button>}{admin&&<button className={styles.btnRepuesto} onClick={()=>setModalRepuesto(clienteDetalle)}>🔩 Repuesto</button>}{admin&&<button style={{padding:'8px 16px',borderRadius:'6px',fontSize:'13px',cursor:'pointer',background:'#DCFCE7',color:'#16A34A',border:'1px solid #86EFAC',fontFamily:'inherit',fontWeight:'500'}} onClick={()=>abrirWsp(clienteDetalle)}>💬 WhatsApp</button>}{admin&&<button className={styles.btnPrimary} onClick={()=>abrirEditar(clienteDetalle)}>✏️ Editar</button>}{admin&&clienteDetalle.estado!=='Salio'&&<button className={styles.btnDangerSolid} onClick={()=>setModalSalida(clienteDetalle)}>Registrar salida</button>}{admin&&clienteDetalle.estado==='Salio'&&<button className={styles.btnPrimary} onClick={()=>{setModalReingreso(clienteDetalle);setFormReingreso({motivo:'',mecanico:clienteDetalle.mecanico||'',taller:clienteDetalle.taller||'Malvinas 2084',estado:'Diagnóstico',llego_en_grua:false,fecha_ingreso_manual:''})}}>🔄 Reingreso</button>}{admin&&<button className={styles.btnDanger} onClick={()=>borrarCliente(clienteDetalle)}>🗑️ Borrar</button>}</div></div>
            <div className={styles.divider}></div>
            <div className={styles.detailHeader}><div className={styles.detailAvatar}>{clienteDetalle.vehiculos?.clientes?.nombre?.charAt(0)}</div><div style={{flex:1}}><div className={styles.detailNombre}>{clienteDetalle.vehiculos?.clientes?.nombre}</div><div className={styles.detailSub}>{clienteDetalle.vehiculos?.clientes?.telefono} · {clienteDetalle.llego_en_grua?'Llegó en grúa':'Llegó andando'} · {clienteDetalle.tiene_seguro?'🛡️ Con seguro':'Sin seguro'} · N° {clienteDetalle.vehiculos?.clientes?.numero_ficha||'—'}</div></div><span className={badgeClass(clienteDetalle.estado)}>{clienteDetalle.estado}</span></div>
            <div className={styles.detGrid}>
              <div className={styles.card}><div className={styles.cardTitle}>Vehículo</div>{[['Modelo',clienteDetalle.vehiculos?.marca_modelo],['Patente',clienteDetalle.vehiculos?.patente],['Color',clienteDetalle.vehiculos?.color],['Año',clienteDetalle.vehiculos?.anio],['Km',clienteDetalle.vehiculos?.kilometraje],['Mecánico',clienteDetalle.mecanico],['Taller',clienteDetalle.taller],['Seguro',clienteDetalle.tiene_seguro?'Sí':'No']].map(([k,v])=><div key={k} className={styles.detRow}><span className={styles.detLabel}>{k}</span><span className={styles.detVal}>{v||'—'}</span></div>)}</div>
              <div className={styles.card}><div className={styles.cardTitle}>Trabajo</div><p className={styles.detText}>{clienteDetalle.motivo||'Sin descripción'}</p><div className={styles.detFecha}>Ingresó: {formatFechaAR(clienteDetalle.fecha_ingreso,true)}</div>{clienteDetalle.fecha_salida&&<div className={styles.detFecha}>Salió: {formatFechaAR(clienteDetalle.fecha_salida,true)}</div>}{clienteDetalle.observacion_final&&<div className={styles.detText} style={{marginTop:'8px'}}><b>Obs. final:</b> {clienteDetalle.observacion_final}</div>}</div>
            </div>
            <div className={styles.card}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}><div className={styles.cardTitle} style={{margin:0}}>Repuestos</div>{admin&&repuestos.length>0&&<button className={styles.btn} style={{fontSize:'12px',padding:'4px 10px'}} onClick={()=>imprimirRepuestos(clienteDetalle,repuestos)}>🖨️ Imprimir</button>}</div>{repuestos.length===0&&<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin repuestos registrados</div>}{repuestos.length>0&&<table className={styles.table}><thead><tr><th>Repuesto</th><th>Valor</th><th>Lugar</th><th>Fecha</th>{admin&&<th></th>}</tr></thead><tbody>{repuestos.map(r=>(<tr key={r.id}><td>{r.nombre}</td><td>${formatPeso(r.valor)}</td><td>{r.lugar||'—'}</td><td style={{fontSize:'12px',color:'#718096'}}>{new Date(r.fecha).toLocaleDateString('es-AR')}</td>{admin&&<td style={{display:'flex',gap:'4px',cursor:'default'}}><button className={styles.btnEdit} style={{fontSize:'11px',padding:'3px 7px'}} onClick={()=>{setFormEditarRepuesto({id:r.id,nombre:r.nombre,valor:formatNum(r.valor.toString()),lugar:r.lugar||'',fecha:r.fecha});setModalEditarRepuesto(true)}}>✏️</button><button className={styles.btnDelete} style={{fontSize:'11px',padding:'3px 7px'}} onClick={()=>borrarRepuesto(r)}>🗑️</button></td>}</tr>))}<tr><td style={{fontWeight:'700',color:'#2D3748'}}>Total</td><td style={{fontWeight:'700',color:'#16A34A'}}>${formatPeso(repuestos.reduce((a,r)=>a+Number(r.valor),0))}</td><td colSpan={admin?3:2}></td></tr></tbody></table>}</div>
            {admin&&<div className={styles.card}><div className={styles.cardTitle}>Presupuestos</div>{presupuestosDetalle.length===0&&<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin presupuestos guardados para este vehículo</div>}{presupuestosDetalle.length>0&&<table className={styles.table}><thead><tr><th>N°</th><th>Fecha</th><th>Total aprox.</th><th></th></tr></thead><tbody>{presupuestosDetalle.map(p=>(<tr key={p.id}><td style={{fontFamily:'monospace',fontSize:'12px'}}>{p.numero}</td><td style={{fontSize:'12px',color:'#718096'}}>{p.fecha?new Date(p.fecha+'T12:00:00').toLocaleDateString('es-AR'):'—'}</td><td>${formatPeso(totalAproxPresupuesto(p))}</td><td><button className={styles.btnEdit} style={{fontSize:'11px',padding:'3px 7px'}} onClick={()=>{abrirPresupuesto(p);setSeccion('presupuesto')}}>Ver / Editar</button></td></tr>))}</tbody></table>}</div>}
            <div className={styles.card}><div className={styles.cardTitle}>Checklists</div>{checklistsDetalle.length===0&&<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin checklists hechos para este vehículo</div>}{checklistsDetalle.length>0&&<table className={styles.table}><thead><tr><th>Tipo</th><th>Fecha</th><th>Mecánico</th><th></th></tr></thead><tbody>{checklistsDetalle.map(ch=>(<tr key={ch.id}><td><span className={badgeClass()} style={{background:(ch.tipo||'entrega')==='inyectores'?'#EFF6FF':'#F7FAFC',color:(ch.tipo||'entrega')==='inyectores'?'#2563EB':'#4A5568'}}>{CHECKLIST_TITULO_POR_TIPO[ch.tipo||'entrega'].replace('Checklist de ','')}</span></td><td style={{fontSize:'12px',color:'#718096'}}>{ch.fecha_entrega?new Date(ch.fecha_entrega+'T12:00:00').toLocaleDateString('es-AR'):'—'}</td><td style={{fontWeight:'600'}}>{ch.mecanico||'—'}</td><td><button className={styles.btnEdit} style={{fontSize:'11px',padding:'3px 7px'}} onClick={()=>setChecklistActivo(ch)}>Ver</button></td></tr>))}</tbody></table>}</div>
            {(()=>{const mecs=[...new Set(historial.filter(h=>h.mecanico&&h.mecanico!=='Oficina').map(h=>h.mecanico))];return mecs.length>0&&<div className={styles.card}><div className={styles.cardTitle}>Mecánicos que intervinieron</div><div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>{mecs.map(m=><span key={m} style={{fontSize:'12px',padding:'4px 12px',borderRadius:'20px',background:'#F7FAFC',color:'#4A5568',fontWeight:'600'}}>{m}</span>)}</div></div>})()}
            <div className={styles.card}><div className={styles.cardTitle}>Historial</div>{historial.length===0&&<div style={{color:'#A0AEC0',fontSize:'13px'}}>Sin historial todavía</div>}{historial.map(h=>(<div key={h.id} className={styles.histItem}><span className={styles.histIcon}>{tipoHistorial[h.tipo]||'⚪'}</span><div style={{flex:1}}><div style={{fontSize:'13px',color:'#2D3748'}}>{h.descripcion}</div>{h.mecanico&&<div style={{fontSize:'11px',color:h.mecanico==='Oficina'?'#2563EB':'#16A34A',fontWeight:'600',marginTop:'2px'}}>{h.mecanico==='Oficina'?'🏢 ':'👤 '}{h.mecanico}</div>}<div style={{fontSize:'11px',color:'#718096',marginTop:'2px'}}>{formatFechaAR(h.fecha,true)}</div></div>{admin&&h._origen==='actualizaciones'&&<button className={styles.btnEdit} style={{fontSize:'10px',padding:'3px 7px'}} onClick={()=>abrirEditarFechaHistorial(h)}>✏️ Editar</button>}{admin&&h._origen==='actualizaciones'&&<button className={styles.btnDelete} style={{fontSize:'10px',padding:'3px 7px',marginLeft:'4px'}} onClick={()=>borrarActualizacion(h)}>🗑️</button>}</div>))}</div>
            <div className={styles.card}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div className={styles.cardTitle} style={{margin:0}}>Fotos del vehículo</div>{fotosAnteriores.length>0&&<button className={styles.btn} style={{fontSize:'12px',padding:'6px 12px'}} onClick={()=>setModalFotosAnteriores(true)}>📷 Ver fotos de ingresos anteriores ({fotosAnteriores.length})</button>}</div><input type="file" accept="image/*" multiple ref={fileRef} style={{display:'none'}} onChange={subirFoto}/>{admin&&<button className={styles.btnPrimary} onClick={()=>fileRef.current.click()} style={{marginTop:'1rem',marginBottom:'1rem'}}>{subiendo?'Subiendo...':'+ Agregar fotos'}</button>}<div className={styles.fotoGrid}>{fotos.map(f=><div key={f.id} className={styles.fotoItem}><img src={f.url} alt="foto" className={styles.fotoImg} onClick={()=>setFotoZoom(f.url)} style={{cursor:'zoom-in'}}/><button style={{position:'absolute',bottom:'4px',left:'4px',fontSize:'11px',padding:'3px 7px',background:'#DCFCE7',color:'#16A34A',border:'1px solid #86EFAC',borderRadius:'6px',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>enviarFotoWsp(clienteDetalle,f.url)}>💬</button>{admin&&<button className={styles.fotoBorrar} onClick={()=>borrarFoto(f)}>✕</button>}</div>)}{fotos.length===0&&<div className={styles.fotoVacio}>No hay fotos todavía</div>}</div></div>
          </div>
        )}
      </div>
    </div>
  )
}
