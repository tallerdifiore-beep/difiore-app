import { supabase } from './supabase'

const BUCKET = 'comprobantes'

// Achica y comprime la foto en el celular antes de subirla, para no llenar el storage
// con fotos de varios MB. Los PDF (o lo que no sea imagen) se suben tal cual.
function comprimirImagen(file, maxAncho = 1600, calidad = 0.75) {
  return new Promise(resolve => {
    if (!file.type || !file.type.startsWith('image/')) { resolve(file); return }
    const lector = new FileReader()
    lector.onload = e => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxAncho) { height = Math.round(height * (maxAncho / width)); width = maxAncho }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        canvas.toBlob(blob => resolve(blob ? new File([blob], 'comprobante.jpg', { type: 'image/jpeg' }) : file), 'image/jpeg', calidad)
      }
      img.onerror = () => resolve(file)
      img.src = e.target.result
    }
    lector.onerror = () => resolve(file)
    lector.readAsDataURL(file)
  })
}

// Sube el comprobante y devuelve { url, path } para guardar en el pago.
export async function subirComprobante(file, clienteId) {
  const archivo = await comprimirImagen(file)
  const ext = archivo.type === 'image/jpeg' ? 'jpg' : (file.name.split('.').pop() || 'bin').toLowerCase()
  const path = `${clienteId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, archivo, { contentType: archivo.type || undefined })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, path }
}

export async function borrarComprobante(path) {
  if (path) await supabase.storage.from(BUCKET).remove([path])
}
