// Plata: se carga en pesos enteros con punto de miles (85.000), igual que en la app del taller.
export function formatNum(val) {
  if (!val && val !== 0) return ''
  const n = val.toString().replace(/\D/g, '')
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
export function parseNum(val) {
  const n = parseInt((val || '').toString().replace(/\D/g, ''), 10)
  return isNaN(n) ? 0 : n
}
export function pesos(n) {
  const v = Math.round(Number(n) || 0)
  return (v < 0 ? '-$ ' : '$ ') + formatNum(Math.abs(v))
}

// Fecha de hoy en Argentina (UTC-3 fijo, sin horario de verano) como YYYY-MM-DD.
export function hoyAR() {
  const d = new Date(Date.now() - 3 * 60 * 60 * 1000)
  return d.toISOString().slice(0, 10)
}
export function fechaAR(yyyymmdd) {
  if (!yyyymmdd) return '—'
  const [a, m, d] = yyyymmdd.slice(0, 10).split('-')
  return `${d}/${m}/${a}`
}

// Cómo se vende: define si se cobra todo en el momento o en cuotas.
export const FORMAS_PAGO = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA EN CUOTAS', 'PLAN PERSONAL']
// Con qué entra cada pago (un plan personal se va pagando en efectivo o transferencia).
export const MEDIOS_PAGO = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA']
export const FRECUENCIAS = ['SEMANAL', 'QUINCENAL', 'MENSUAL']

// Fecha de la cuota número n (0 = la primera) de un plan personal.
export function fechaCuota(primera, frecuencia, n) {
  const [a, m, d] = primera.slice(0, 10).split('-').map(Number)
  const f = frecuencia === 'MENSUAL'
    ? new Date(Date.UTC(a, m - 1 + n, Math.min(d, diasDelMes(a, m - 1 + n))))
    : new Date(Date.UTC(a, m - 1, d + n * (frecuencia === 'QUINCENAL' ? 15 : 7)))
  return f.toISOString().slice(0, 10)
}
function diasDelMes(a, mes0) { return new Date(Date.UTC(a, mes0 + 1, 0)).getUTCDate() }

export function diasEntre(desde, hasta) {
  return Math.round((new Date(hasta + 'T00:00:00Z') - new Date(desde + 'T00:00:00Z')) / 86400000)
}

// Estado de una venta según lo que lleva pagado. La mercadería se entrega recién cuando
// está todo pagado: hasta entonces la venta queda "PAGANDO".
export function estadoVenta(venta, pagosDeVenta, hoy = hoyAR()) {
  const total = Number(venta.total)
  const pagado = pagosDeVenta.reduce((t, p) => t + Number(p.monto), 0)
  const saldo = total - pagado
  const estado = venta.entregado_el ? 'ENTREGADO' : saldo <= 0 ? 'PARA ENTREGAR' : 'PAGANDO'
  let plan = null
  if (venta.forma_pago === 'PLAN PERSONAL' && venta.cuotas && venta.monto_cuota && venta.primera_cuota) {
    const n = venta.cuotas
    const anticipo = Number(venta.anticipo) || 0
    // Cuotas cubiertas por lo pagado (descontando el anticipo). Se deja $1 de tolerancia por redondeo.
    const pagadas = saldo <= 0 ? n : Math.max(0, Math.min(n, Math.floor((pagado - anticipo + 1) / Number(venta.monto_cuota))))
    const proxima = pagadas < n ? { numero: pagadas + 1, fecha: fechaCuota(venta.primera_cuota, venta.frecuencia, pagadas) } : null
    const diasAtraso = proxima && saldo > 0 ? diasEntre(proxima.fecha, hoy) : 0
    plan = { cuotas: n, pagadas, proxima, atrasada: diasAtraso > 0, diasAtraso }
  }
  return { total, pagado, saldo, estado, plan }
}

// Saldo de cada cliente = total vendido - total pagado. Positivo = el cliente debe.
export function calcularSaldos(ventas, pagos) {
  const s = {}
  for (const v of ventas) {
    s[v.cliente_id] = s[v.cliente_id] || { vendido: 0, pagado: 0, ultimo: null }
    s[v.cliente_id].vendido += Number(v.total)
    if (!s[v.cliente_id].ultimo || v.fecha > s[v.cliente_id].ultimo) s[v.cliente_id].ultimo = v.fecha
  }
  for (const p of pagos) {
    s[p.cliente_id] = s[p.cliente_id] || { vendido: 0, pagado: 0, ultimo: null }
    s[p.cliente_id].pagado += Number(p.monto)
    if (!s[p.cliente_id].ultimo || p.fecha > s[p.cliente_id].ultimo) s[p.cliente_id].ultimo = p.fecha
  }
  for (const id in s) s[id].saldo = s[id].vendido - s[id].pagado
  return s
}

// Link de WhatsApp para un teléfono argentino cargado de cualquier forma (223 529-9700, 0223..., +54 9...).
export function linkWhatsapp(telefono, texto) {
  let t = (telefono || '').replace(/\D/g, '')
  if (!t) return null
  if (t.startsWith('54')) t = t.slice(2)
  if (t.startsWith('9')) t = t.slice(1)
  if (t.startsWith('0')) t = t.slice(1)
  // Con el 15 son 12 dígitos: se lo sacamos (va después del código de área, de 2 a 4 dígitos)
  if (t.length === 12) t = t.replace(/^(\d{2,4})15(\d{6,8})$/, (m, area, num) => (area + num).length === 10 ? area + num : m)
  return `https://wa.me/549${t}?text=${encodeURIComponent(texto)}`
}
