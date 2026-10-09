// Corre solo (Vercel Cron, ver vercel.json) una vez por día. Busca services cargados
// exactamente hace un mes y le manda un mail al cliente dueño de esa patente, si
// todavía no se le mandó el recordatorio de ese service.
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = process.env.RESEND_FROM || 'DiFiore Performance <service@difioreperformance.com>'
const norm = s => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '')

function fechaHaceUnMes() {
  const hoy = new Date()
  const d = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate())
  return d.toISOString().slice(0, 10)
}

export default async function handler(req, res) {
  // Vercel agrega este header automáticamente en los cron jobs cuando hay CRON_SECRET
  // configurado — así nadie más puede pegarle a esta ruta y disparar mails.
  if (process.env.CRON_SECRET && req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  const fechaObjetivo = fechaHaceUnMes()
  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .eq('fecha', fechaObjetivo)
    .or('recordatorio_enviado.is.null,recordatorio_enviado.eq.false')

  if (error) return res.status(500).json({ error: error.message })
  if (!services || services.length === 0) return res.status(200).json({ enviados: 0, detalles: [] })

  const { data: vehiculos } = await supabase.from('vehiculos').select('*, clientes(*)')

  let enviados = 0
  const detalles = []

  for (const service of services) {
    const patenteService = norm(service.patente)
    const vehiculo = (vehiculos || []).find(v => norm(v.patente) === patenteService)
    const email = vehiculo?.clientes?.email

    if (!email) { detalles.push({ patente: service.patente, enviado: false, motivo: 'sin email' }); continue }

    const nombre = vehiculo.clientes.nombre || ''
    const auto = vehiculo.marca_modelo || 'tu vehículo'

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#0e1118">
        <h2 style="color:#1b4cff;margin-bottom:4px">DiFiore Performance</h2>
        <p>Hola ${nombre}!</p>
        <p>Hace un mes que hiciste el último service de tu ${auto} (${service.patente}) en nuestro taller.</p>
        <p>Queríamos saber cómo anduvo todo y recordarte que estamos para lo que necesites: revisiones, consultas o cualquier novedad con el auto.</p>
        <p>Cualquier cosa, respondé este mail o escribinos por WhatsApp.</p>
        <p style="margin-top:24px;color:#6b7488;font-size:13px">Di Fiore Mecánica · Malvinas 2084, Mar del Plata</p>
      </div>
    `

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: email, subject: `¿Cómo anduvo tu ${auto} después del service?`, html })
    })

    if (r.ok) {
      await supabase.from('services').update({ recordatorio_enviado: true }).eq('id', service.id)
      enviados++
      detalles.push({ patente: service.patente, email, enviado: true })
    } else {
      detalles.push({ patente: service.patente, email, enviado: false, motivo: await r.text() })
    }
  }

  res.status(200).json({ enviados, detalles })
}
