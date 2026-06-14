import { Tour } from '../../types'
import { useNavigate } from 'react-router-dom'

interface TopToursProps {
  tours: Tour[]
}

export function TopTours({ tours }: TopToursProps) {
  const navigate = useNavigate()
  const sales = [12, 8, 5, 3]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Tours Destacados</h3>
          <p className="text-xs text-gray-500 mt-0.5">Los más vendidos este mes</p>
        </div>
        <button 
          onClick={() => navigate('/tours')}
          className="text-sm font-medium text-coral hover:underline"
        >
          Ver catálogo →
        </button>
      </div>

      <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
        {tours.slice(0, 4).map((tour, index) => (
          <div 
            key={tour.id} 
            className="relative rounded-xl overflow-hidden group cursor-pointer aspect-[4/3]"
            onClick={() => navigate('/tours')}
          >
            <img 
              src={tour.imagen} 
              alt={tour.nombre} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&auto=format&fit=crop&q=60';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-4 w-full">
              <h4 className="text-white font-semibold text-sm leading-tight mb-1 line-clamp-2">
                {tour.nombre}
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-xs">
                  {sales[index]} reservas
                </span>
                <span className="text-white font-bold text-sm">
                  ${tour.precio_base.toLocaleString('es-MX')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
