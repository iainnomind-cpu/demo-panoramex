import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../../hooks/useToast';
import { Tour, Reservation } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/authStore';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour?: Tour | null;
  initialName?: string;
  initialPhone?: string;
  prospectId?: string;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, tour, initialName = '', initialPhone = '', prospectId }) => {
  const { addToast } = useToast();
  const { loadReservations } = useAppStore();
  const { agent } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: initialName,
    phone: initialPhone,
    email: '',
    date: '',
    num_people: '2',
    notes: ''
  });

  // Update initial values if they arrive later via props
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: initialName || prev.name,
      phone: initialPhone || prev.phone
    }));
  }, [initialName, initialPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('reservations').insert([{
        prospect_id: prospectId || 'p1', // fallback needed if no prospect is passed
        tour_variant_id: tour?.tour_variants?.[0]?.id || 'v1',
        service_date: formData.date,
        num_people: parseInt(formData.num_people, 10),
        status: 'confirmed',
        total_amount: tour?.tour_variants?.[0]?.price_per_person ? (tour.tour_variants[0].price_per_person) * parseInt(formData.num_people, 10) : 0,
        deposit_amount: 0,
        created_by: agent?.id || 'a1',
        created_at: new Date().toISOString()
      }]);

      if (error) throw error;

      await loadReservations();
      
      addToast({
        type: 'success',
        title: 'Reserva creada',
        message: 'La reserva ha sido registrada en el sistema.'
      });
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error al crear reserva',
        message: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
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
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input 
              label="Teléfono" 
              placeholder="Ej. 33 1234 5678" 
              leftIcon="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
            <div className="md:col-span-2">
              <Input 
                label="Correo Electrónico (Opcional)" 
                placeholder="ejemplo@correo.com" 
                leftIcon="mail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                {tour ? tour.name : 'Seleccionar un tour...'}
              </div>
            </div>
            <Input 
              label="Fecha del Tour" 
              type="date"
              leftIcon="calendar_today"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
            <Input 
              label="Número de Personas" 
              type="number"
              min="1"
              leftIcon="group"
              value={formData.num_people}
              onChange={(e) => setFormData({...formData, num_people: e.target.value})}
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
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          ></textarea>
        </div>

      </form>
    </Modal>
  );
};
