import { supabase } from './supabase'

/**
 * Realiza un fetch paginado para extraer todos los registros de una tabla,
 * evitando sobrepasar límites de memoria o timeout en requests grandes.
 */
async function fetchAllRecords(table: string) {
  let allData: any[] = []
  const limit = 1000
  let page = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      console.error(`Error fetching ${table}:`, error)
      throw error
    }

    if (data && data.length > 0) {
      allData = allData.concat(data)
      if (data.length < limit) {
        hasMore = false
      } else {
        page++
      }
    } else {
      hasMore = false
    }
  }

  return allData
}

/**
 * Exporta toda la información crítica a un objeto JSON.
 */
export async function exportAllData() {
  const exportData: Record<string, any[]> = {}

  const tablesToExport = [
    'prospects',
    'conversations',
    'messages',
    'tours',
    'tour_variants',
    'reservations',
    'campaigns',
    'campaign_sends',
    'satisfaction_surveys',
    'webhook_events'
  ]

  for (const table of tablesToExport) {
    exportData[table] = await fetchAllRecords(table)
  }

  return exportData
}

/**
 * Inicia la descarga del objeto JSON como un archivo.
 */
export function downloadJsonData(data: any, filename: string) {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
