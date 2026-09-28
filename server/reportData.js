export const reportRows = [
  {
    id: 'embassy-target',
    campaign: 'Embassy',
    status: 'Target',
    impressions: 6000000,
    reach: 2000000,
    ctr: 0.5,
    clicks: 30000,
    totalBudget: 300000,
    totalSpend: null,
  },
  {
    id: 'embassy-delivered',
    campaign: 'Embassy',
    status: 'Delivered',
    impressions: 3650707,
    reach: 1229885,
    ctr: 0.51,
    clicks: 18501,
    totalBudget: null,
    totalSpend: 185010,
  },
]

export function getReportData({ campaign = 'all', status = 'all', search = '' } = {}) {
  const query = search.trim().toLowerCase()
  const scopedRows = reportRows.filter((row) => {
    const matchesCampaign = campaign === 'all' || row.campaign === campaign
    const matchesSearch = !query || row.campaign.toLowerCase().includes(query)
    return matchesCampaign && matchesSearch
  })
  const visibleRows = status === 'all'
    ? scopedRows
    : scopedRows.filter((row) => row.status.toLowerCase() === status.toLowerCase())
  const targetRows = scopedRows.filter((row) => row.status === 'Target')
  const deliveredRows = scopedRows.filter((row) => row.status === 'Delivered')

  return {
    reports: visibleRows,
    summary: {
      audience: total(targetRows, 'reach'),
      impressions: total(deliveredRows, 'impressions'),
      reach: total(deliveredRows, 'reach'),
      netCost: total(deliveredRows, 'totalSpend'),
    },
    campaigns: [...new Set(reportRows.map((row) => row.campaign))],
  }
}

function total(rows, key) {
  return rows.reduce((sum, row) => sum + (row[key] ?? 0), 0)
}