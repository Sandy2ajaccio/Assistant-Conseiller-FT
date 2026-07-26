const buildHeaders = (headers = {}) => ({
  Accept: 'application/json',
  ...headers,
})

const parseJsonSafely = async (response) => {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers),
  })

  const payload = await parseJsonSafely(response)

  if (!response.ok) {
    const error = new Error(`API request failed: ${response.status}`)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

export const apiGet = (url, options = {}) => request(url, { method: 'GET', ...options })
export const apiPost = (url, body, options = {}) =>
  request(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

export const apiPut = (url, body, options = {}) =>
  request(url, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

export const apiDelete = (url, options = {}) => request(url, { method: 'DELETE', ...options })
