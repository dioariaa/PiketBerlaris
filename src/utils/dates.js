// Semua kalkulasi tanggal memakai timezone Asia/Jakarta (WIB, UTC+7).
// day_of_week: 0=Senin ... 6=Minggu (bukan default JS 0=Sunday).

export const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
export const DAYS_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

// Date object yang field lokalnya merepresentasikan waktu Jakarta
export function jakartaNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
}

// Format ke YYYY-MM-DD (dari field lokal date)
export function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Parse YYYY-MM-DD ke Date lokal (tanpa pergeseran timezone)
export function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Tanggal hari ini (WIB) sebagai YYYY-MM-DD
export function todayStr() {
  return formatDate(jakartaNow())
}

// Index hari: 0=Senin ... 6=Minggu
export function getDayIndex(date = jakartaNow()) {
  return (date.getDay() + 6) % 7
}

// Senin dari minggu yang memuat `date`, sebagai YYYY-MM-DD
export function getWeekStart(date = jakartaNow()) {
  const d = new Date(date)
  d.setDate(d.getDate() - getDayIndex(d))
  return formatDate(d)
}

// Tambah n hari ke YYYY-MM-DD, hasil YYYY-MM-DD
export function addDays(dateStr, n) {
  const d = parseDate(dateStr)
  d.setDate(d.getDate() + n)
  return formatDate(d)
}

// Format "6 Jul 2026"
export function formatDateID(dateInput) {
  const d = typeof dateInput === 'string' ? parseDate(dateInput) : dateInput
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`
}

// Format "Senin, 6 Jul 2026"
export function formatFullDateID(dateInput) {
  const d = typeof dateInput === 'string' ? parseDate(dateInput) : dateInput
  return `${DAYS[getDayIndex(d)]}, ${formatDateID(d)}`
}

// Label rentang minggu: "30 Jun - 6 Jul 2026"
export function formatWeekRange(weekStartStr) {
  const start = parseDate(weekStartStr)
  const end = parseDate(addDays(weekStartStr, 6))
  const startLabel =
    start.getMonth() === end.getMonth()
      ? `${start.getDate()}`
      : `${start.getDate()} ${MONTHS_ID[start.getMonth()]}`
  return `${startLabel} - ${formatDateID(end)}`
}

// Format jam "14:35" dari timestamp ISO (WIB)
export function formatTimeID(isoString) {
  return new Date(isoString).toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
  })
}
