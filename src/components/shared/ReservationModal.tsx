import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../../hooks/useToast';
import { Tour } from '../../types';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour?: Tour | null;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, tour }) => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      addToast({
        type: 'success',
        title: 'Reserva creada',
        message: 'La reserva ha sido registrada en el sistema.'
      });
      onClose();
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Reserva"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon="check"
          >
            Confirmar Reserva
          </Button>
        </div>
      }
    >
      <form id="reservation-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Info Cliente */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2 border-b border-surface-variant pb-2">
            <span className="material-symbols-outlined text-[18px]">person</span>
            Información del Cliente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Nombre Completo" 
              placeholder="Ej. Juan Pérez" 
              leftIcon="person"
              required
            />
            <Input 
              label="Teléfono" 
              placeholder="Ej. 33 1234 5678" 
              leftIcon="phone"
              type="tel"
              required
            />
            <div className="md:col-span-2">
              <Input 
                label="Correo Electrónico (Opcional)" 
                placeholder="ejemplo@correo.com" 
                leftIcon="mail"
                type="email"
              />
            </div>
          </div>
        </div>

        {/* Detalles Tour */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2 border-b border-surface-variant pb-2">
            <span className="material-symbols-outlined text-[18px]">tour</span>
            Detalles del Tour
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Tour Seleccionado
              </label>
              <div className="w-full rounded-md border border-outline-variant bg-surface-variant/50 py-2 px-3 text-sm text-on-surface">
                {tour ? tour.nombre : 'Seleccionar un tour...'}
              </div>
            </div>
            <Input 
              label="Fecha del Tour" 
              type="date"
              leftIcon="calendar_today"
              required
            />
            <Input 
              label="Número de Personas" 
              type="number"
              min="1"
              defaultValue="2"
              leftIcon="group"
              required
            />
          </div>
        </div>

        {/* Notas */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2 border-b border-surface-variant pb-2">
            <span className="material-symbols-outlined text-[18px]">notes</span>
            Notas Adicionales
          </h3>
          <textarea
            className="w-full rounded-md border border-outline-variant bg-surface py-2 px-3 text-sm placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none h-24"
            placeholder="Alergias, requerimientos especiales, etc."
          ></textarea>
        </div>

      </form>
    </Modal>
  );
};
