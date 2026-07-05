import { useState } from 'react'
import { Tour } from '../../types'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

interface TopToursProps {
  tours: Tour[]
  /** Real reservation counts per tour ID, derived from the reservations store */
  tourReservationCounts: Record<string, number>
}

export function TopTours({ tours, tourReservationCounts }: TopToursProps) {
  const navigate = useNavigate()
  const topTours = tours.slice(0, 4)
  // Track image error state per tour ID to avoid raw DOM manipulation
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleImageError = (tourId: string) => {
    setImageErrors(prev => ({ ...prev, [tourId]: true }))
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm">
      <div className="px-6 py-5 border-b border-outline-variant/50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-on-surface">Tours Destacados</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Los más vendidos este mes</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/tours')}>
          Ver catálogo
        </Button>
      </div>

      {topTours.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <span className="material-symbols-outlined text-[40px] text-outline">map</span>
          <div>
            <p className="text-sm font-medium text-on-surface">No hay tours activos</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Los tours publicados aparecerán aquí</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/tours')}>
            Ver catálogo
          </Button>
        </div>
      ) : (
        <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {topTours.map((tour) => {
            const reservationCount = tourReservationCounts[tour.id] ?? 0
            const hasImageError = imageErrors[tour.id]

            return (
              <button
                key={tour.id}
                type="button"
                aria-label={`Ver tour: ${tour.name}`}
                className="relative rounded-xl overflow-hidden group cursor-pointer aspect-[4/3] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                onClick={() => navigate('/tours')}
              >
                {!hasImageError ? (
                  <img
                    src={tour.image_url || ''}
                    alt={tour.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => handleImageError(tour.id)}
                  />
                ) : (
                  /* Placeholder shown when image fails to load via React state instead of DOM manipulation */
                  <div
                    className="absolute inset-0 bg-surface-container flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="material-symbols-outlined text-[32px] text-outline">image_not_supported</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute bottom-0 left-0 p-4 w-full text-left">
                  <h4 className="text-white font-semibold text-sm leading-tight mb-1 line-clamp-2">
                    {tour.name}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-xs">
                      {reservationCount > 0
                        ? `${reservationCount} reserva${reservationCount !== 1 ? 's' : ''}`
                        : 'Sin reservas aún'}
                    </span>
                    <span className="text-white font-bold text-sm">
                      ${(tour.tour_variants?.[0]?.price_per_person ?? 0).toLocaleString('es-MX')}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
