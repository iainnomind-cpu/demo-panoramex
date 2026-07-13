import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';
import { TourCategory, TOUR_CATEGORY_CONFIG } from '../../types';

interface NuevoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = Object.entries(TOUR_CATEGORY_CONFIG) as [TourCategory, { label: string; icon: string }][];

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();

export const NuevoTourModal: React.FC<NuevoTourModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const { loadTours } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: 'cultural' as TourCategory,
    description: '',
    image_url: '',
    inclusions: '',
    min_capacity_alert: '8',
    // Variant fields
    variant_name: 'Estándar',
    price_per_person: '',
    capacity: '15',
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price_per_person) {
      addToast({ title: 'Por favor completa el nombre y precio del tour.', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create the tour
      const { data: tourData, error: tourError } = await supabase
        .from('tours')
        .insert({
          name: form.name.trim(),
          slug: slugify(form.name),
          description: form.description.trim() || null,
          image_url: form.image_url.trim() || null,
          inclusions: form.inclusions
            ? form.inclusions.split('\n').map((s) => s.trim()).filter(Boolean)
            : null,
          min_capacity_alert: parseInt(form.min_capacity_alert, 10) || 8,
          is_active: true,
        })
        .select()
        .single();

      if (tourError) throw tourError;

      // 2. Create the first variant
      const { error: variantError } = await supabase.from('tour_variants').insert({
        tour_id: tourData.id,
        name: form.variant_name.trim() || 'Estándar',
        price_per_person: parseFloat(form.price_per_person),
        capacity: parseInt(form.capacity, 10) || 15,
        sort_order: 1,
      });

      if (variantError) throw variantError;

      addToast({ title: `Tour "${form.name}" creado con éxito.`, type: 'success' });
      await loadTours();
      onClose();

      // Reset form
      setForm({
        name: '',
        category: 'cultural',
        description: '',
        image_url: '',
        inclusions: '',
        min_capacity_alert: '8',
        variant_name: 'Estándar',
        price_per_person: '',
        capacity: '15',
      });
    } catch (err: any) {
      addToast({ title: `Error al crear tour: ${err.message}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Tour"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit as any}
            disabled={isSubmitting}
            leftIcon={isSubmitting ? 'hourglass_empty' : 'add'}
          >
            {isSubmitting ? 'Creando...' : 'Crear Tour'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">
            Nombre del Tour <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Ej. Tour en Tren José Cuervo Express"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Categoría</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => set('category', key)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  form.category === key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-outline-variant text-on-surface-variant hover:border-primary/50 hover:bg-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{cfg.icon}</span>
                {cfg.label.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Descripción</label>
          <textarea
            rows={3}
            placeholder="Describe el tour, experiencia, destinos..."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        </div>

        {/* URL Imagen */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">URL de Imagen</label>
          <Input
            placeholder="https://..."
            value={form.image_url}
            onChange={(e) => set('image_url', e.target.value)}
          />
        </div>

        {/* Inclusiones */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">
            ¿Qué incluye? <span className="text-xs text-on-surface-variant">(una por línea)</span>
          </label>
          <textarea
            rows={3}
            placeholder={"Transporte desde hotel\nGuía bilingüe\nComida típica"}
            value={form.inclusions}
            onChange={(e) => set('inclusions', e.target.value)}
            className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        </div>

        <hr className="border-outline-variant" />

        {/* Variante básica */}
        <div>
          <p className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary">sell</span>
            Tarifa Principal
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">Nombre</label>
              <Input
                placeholder="Estándar"
                value={form.variant_name}
                onChange={(e) => set('variant_name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Precio / pax <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="0"
                value={form.price_per_person}
                onChange={(e) => set('price_per_person', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">Capacidad</label>
              <Input
                type="number"
                placeholder="15"
                value={form.capacity}
                onChange={(e) => set('capacity', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">
            Alerta de capacidad mínima
          </label>
          <Input
            type="number"
            placeholder="8"
            value={form.min_capacity_alert}
            onChange={(e) => set('min_capacity_alert', e.target.value)}
          />
          <p className="text-xs text-on-surface-variant mt-1">
            Se enviará alerta cuando queden menos de este número de lugares.
          </p>
        </div>
      </form>
    </Modal>
  );
};
