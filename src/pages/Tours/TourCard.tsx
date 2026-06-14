import React from 'react';
import { Tour, TOUR_CATEGORY_CONFIG } from '../../types';
import { Button } from '../../components/ui/Button';

interface TourCardProps {
  tour: Tour;
  onViewDetails: (tour: Tour) => void;
  onReserve: (tour: Tour) => void;
}

export const TourCard: React.FC<TourCardProps> = ({ tour, onViewDetails, onReserve }) => {
  const categoryConfig = TOUR_CATEGORY_CONFIG[tour.categoria];

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group flex flex-col">
      {/* Image - taller aspect ratio */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={tour.imagen} 
          alt={tour.nombre} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&auto=format&fit=crop&q=60';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
          <span className="material-symbols-outlined text-[14px]">{categoryConfig.icon}</span>
          {categoryConfig.label}
        </div>
        
        {/* Title over image */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="font-bold text-lg leading-snug">{tour.nombre}</h3>
          <div className="flex items-center gap-1 text-white/80 text-xs mt-1">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {tour.ubicacion}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            {tour.duracion_horas} hrs
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">group</span>
            Hasta {tour.capacidad_max} pax
          </div>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-5 flex-1">
          {tour.descripcion}
        </p>

        {/* Price */}
        <div className="mb-5 pb-5 border-b border-gray-100">
          <span className="text-xs text-gray-400">Desde</span>
          <p className="text-2xl font-bold text-coral">
            ${tour.precio_base.toLocaleString('es-MX')} <span className="text-xs font-normal text-gray-400">MXN</span>
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewDetails(tour)}
          >
            Ver Detalles
          </Button>
          <Button 
            variant="secondary" 
            className="flex-1"
            onClick={() => onReserve(tour)}
          >
            Reservar
          </Button>
        </div>
      </div>
    </div>
  );
};
