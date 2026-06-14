import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Tour, TOUR_CATEGORY_CONFIG } from '../../types';
import { Button } from '../../components/ui/Button';

interface TourDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: Tour | null;
  onReserve: (tour: Tour) => void;
}

export const TourDetailModal: React.FC<TourDetailModalProps> = ({ isOpen, onClose, tour, onReserve }) => {
  if (!tour) return null;

  const categoryConfig = TOUR_CATEGORY_CONFIG[tour.categoria];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Tour"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          <Button 
            variant="secondary" 
            onClick={() => {
              onClose();
              onReserve(tour);
            }}
          >
            Reservar Tour
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Header Image */}
        <div className="relative aspect-video rounded-xl overflow-hidden">
          <img 
            src={tour.imagen} 
            alt={tour.nombre} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&auto=format&fit=crop&q=60';
            }}
          />
          <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-medium border border-white/20">
            <span className="material-symbols-outlined text-[16px]">{categoryConfig.icon}</span>
            {categoryConfig.label}
          </div>
        </div>

        {/* Title and Price */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">{tour.nombre}</h2>
            <div className="flex items-center gap-1 text-on-surface-variant mt-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {tour.ubicacion}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-on-surface-variant">Precio Base</p>
            <p className="text-2xl font-bold text-coral">${tour.precio_base.toLocaleString('es-MX')}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-on-surface mb-2">Descripción</h3>
          <p className="text-on-surface-variant whitespace-pre-line">{tour.descripcion}</p>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-4 bg-surface-variant/30 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Horario</p>
              <p className="text-sm font-medium">{tour.horario_salida} - {tour.horario_regreso}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">calendar_today</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Días Disponibles</p>
              <p className="text-sm font-medium capitalize">{tour.dias_disponibles.join(', ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">timer</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Duración</p>
              <p className="text-sm font-medium">{tour.duracion_horas} horas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">group</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Capacidad</p>
              <p className="text-sm font-medium">{tour.capacidad_min} - {tour.capacidad_max} personas</p>
            </div>
          </div>
        </div>

        {/* Included Items */}
        <div>
          <h3 className="text-lg font-semibold text-on-surface mb-3">¿Qué incluye?</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {tour.incluye.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-coral text-[20px]">check_circle</span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
};
