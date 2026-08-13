/**
 * Respaldo para cuando `navigator.clipboard` no existe (contexto no seguro,
 * navegador viejo) o su permiso está denegado — pasa más seguido de lo que
 * parece y antes fallaba en silencio: la promesa de `writeText` rechazaba,
 * nadie la atrapaba, y el botón se quedaba pegado en "Copiar" sin avisar
 * nada ni copiar de verdad.
 */
function copyViaExecCommand(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  let success = false
  try {
    success = document.execCommand('copy')
  } catch {
    success = false
  }
  document.body.removeChild(textarea)
  return success
}

/** Nunca lanza — devuelve si realmente se copió, para que la UI pueda mostrar éxito o error. */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // sigue al respaldo de abajo
    }
  }
  return copyViaExecCommand(text)
}
