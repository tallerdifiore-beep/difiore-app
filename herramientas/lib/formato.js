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

export const MEDIOS_PAGO = ['EFECTIVO', 'TRANSFERENCIA', 'MERCADO PAGO', 'TARJETA', 'CHEQUE']

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
