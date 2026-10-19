// Fetches a file endpoint and saves the response under the server's filename.
// Returns an error message, or null when the download started.
export async function downloadFile(
  url: string,
  fallbackName: string,
  failureMessage = "Failed to download the file."
): Promise<string | null> {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      return body?.error ?? failureMessage
    }

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement("a")
    const disposition = response.headers.get("content-disposition")

    link.href = objectUrl
    link.download = disposition?.match(/filename="(.+)"/)?.[1] ?? fallbackName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(objectUrl)

    return null
  } catch {
    return failureMessage
  }
}
