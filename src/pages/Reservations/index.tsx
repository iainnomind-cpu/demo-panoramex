import { useState } from 'react'
import { ReservationTable } from './ReservationTable'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useEffect } from 'react'
import { ReservationModal } from '../../components/shared/ReservationModal'
import { exportToCSV } from '../../lib/exportData'

export function Reservations() {
  const { reservations, loadReservations } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadReservations()
  }, [])

  const filteredReservations = reservations.filter(res => {
    const term = searchTerm.toLowerCase()
    return res.id.toLowerCase().includes(term) || 
           res.status.toLowerCase().includes(term)
  })

  const handleExportCSV = () => {
    if (filteredReservations.length === 0) return
    const csvContent = [
      ['ID', 'Estado', 'Pax', 'Total'],
      ...filteredReservations.map(r => [r.id, r.status, r.num_people, r.total_price])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reservas_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-h2 text-on-surface">Reservaciones</h1>
          <p className="text-body-md text-on-surface-variant">Gestión de reservas confirmadas, pagos y logística operativa.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon="download" onClick={handleExportCSV}>Exportar CSV</Button>
          <Button variant="primary" leftIcon="add" onClick={() => setIsModalOpen(true)}>Nueva Reserva</Button>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="w-full md:w-96">
          <Input 
            placeholder="Buscar por ID, nombre o estado..." 
            leftIcon="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-on-surface-variant">
            <span className="material-symbols-outlined nav-icon mr-2">calendar_today</span>
            Todas las fechas
          </Button>
          <Button variant="ghost" size="sm" className="text-on-surface-variant">
            <span className="material-symbols-outlined nav-icon mr-2">filter_list</span>
            Más filtros
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <ReservationTable reservations={filteredReservations} />
      </div>

      <ReservationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
