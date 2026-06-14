import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TourCategory, Tour } from '../../types';
import { CategoryFilter } from './CategoryFilter';
import { TourCard } from './TourCard';
import { TourDetailModal } from './TourDetailModal';
import { ReservationModal } from '../../components/shared/ReservationModal';
import { Button } from '../../components/ui/Button';

export const Tours: React.FC = () => {
  const tours = useAppStore((state) => state.tours);
  const [selectedCategory, setSelectedCategory] = useState<TourCategory | 'todos'>('todos');
  
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  const filteredTours = selectedCategory === 'todos' 
    ? tours 
    : tours.filter(tour => tour.categoria === selectedCategory);

  const handleViewDetails = (tour: Tour) => {
    setSelectedTour(tour);
    setDetailModalOpen(true);
  };

  const handleReserve = (tour: Tour) => {
    setSelectedTour(tour);
    setReservationModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Tours</h1>
          <p className="text-sm text-gray-500 mt-1">Explora y gestiona los tours disponibles</p>
        </div>
        <Button variant="primary" leftIcon="add">Nuevo Tour</Button>
      </div>

      {/* Filter */}
      <div className="mb-8">
        <CategoryFilter 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />
      </div>

      {/* Grid - max 3 columns for breathing room */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredTours.map((tour) => (
              <TourCard 
                key={tour.id} 
                tour={tour} 
                onViewDetails={handleViewDetails}
                onReserve={handleReserve}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">search_off</span>
            <p className="text-lg font-medium">No se encontraron tours</p>
            <p className="text-sm">Intenta seleccionar otra categoría</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <TourDetailModal 
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        tour={selectedTour}
        onReserve={handleReserve}
      />
      <ReservationModal 
        isOpen={reservationModalOpen}
        onClose={() => setReservationModalOpen(false)}
        tour={selectedTour}
      />
    </div>
  );
};

export default Tours;
