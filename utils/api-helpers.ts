/**
 * Función para realizar solicitudes HTTP con reintentos automáticos
 */
export async function fetchWithRetries(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  delayMs = 1000,
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Añadir un timeout para evitar solicitudes que se queden colgadas
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const fetchOptions = {
        ...options,
        signal: controller.signal,
      }

      const response = await fetch(url, fetchOptions)
      clearTimeout(timeoutId)

      // Si recibimos un error de rate limit, esperar antes de reintentar
      if (response.status === 429) {
        const delay = delayMs * Math.pow(2, attempt)
        console.log(`⚠️ Rate limited, waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      return response
    } catch (error) {
      lastError = error as Error

      // Si no es el último intento, esperar antes de reintentar
      if (attempt < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, attempt)
        console.log(`⚠️ Fetch failed, retrying in ${delay}ms (${attempt + 1}/${maxRetries})`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error(`Failed after ${maxRetries} attempts`)
}

/**
 * Función para verificar si una URL es accesible
 */
export async function isUrlAccessible(url: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    return false
  }
}
