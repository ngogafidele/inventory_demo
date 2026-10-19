// Fetches a PDF endpoint and saves the response under the server's filename.
// Returns an error message, or null when the download started.
import { downloadFile } from "@/lib/utils/file-download"

export function downloadPdf(
  url: string,
  fallbackName: string
): Promise<string | null> {
  return downloadFile(url, fallbackName, "Failed to download the PDF.")
}
