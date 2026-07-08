'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const EVENT_COLORS = [
  { label: 'Azul', value: '#3b82f6' },
  { label: 'Verde', value: '#22c55e' },
  { label: 'Rojo', value: '#ef4444' },
  { label: 'Amarillo', value: '#eab308' },
  { label: 'Púrpura', value: '#a855f7' },
  { label: 'Rosa', value: '#ec4899' },
  { label: 'Naranja', value: '#f97316' },
  { label: 'Cian', value: '#06b6d4' },
];

interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  color: string;
}

const emptyForm = {
  title: '',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
  isAllDay: false,
  color: '#3b82f6',
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/calendar', {
        params: {
          startDate: format(monthStart, 'yyyy-MM-dd'),
          endDate: format(monthEnd, 'yyyy-MM-dd'),
        },
      });
      setEvents(data.data ?? data ?? []);
    } catch {
      toast.error('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  }, [monthStart, monthEnd]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const prevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const nextMonth = () => setCurrentMonth((m) => addMonths(m, 1));

  const dayEvents = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.startDate), day));

  const handleDayClick = (day: Date) => {
    setSelectedDate(isSameDay(selectedDate ?? new Date(-1), day) ? null : day);
  };

  const openCreateModal = () => {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm");
    setForm({ ...emptyForm, startDate: now, endDate: now });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/calendar', form);
      toast.success('Evento creado');
      setModalOpen(false);
      fetchEvents();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al crear evento');
    } finally {
      setSaving(false);
    }
  };

  const selectedDayEvents = selectedDate ? dayEvents(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
            Volver al inicio
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-lg font-semibold capitalize">
                {format(currentMonth, "MMMM 'de' yyyy", { locale: es })}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => (
                <div key={d} className="bg-muted/50 p-2 text-center text-xs font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-card p-2 min-h-[80px]" />
              ))}
              {days.map((day) => {
                const dayEvts = dayEvents(day);
                const isSel = selectedDate && isSameDay(day, selectedDate);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    className={`bg-card p-1.5 min-h-[80px] text-left text-sm transition-colors hover:bg-accent/50 border border-transparent ${
                      isSel ? 'ring-2 ring-primary' : ''
                    } ${isToday(day) ? 'bg-primary/5' : ''}`}
                  >
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        isToday(day) ? 'bg-primary text-primary-foreground font-bold' : ''
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvts.slice(0, 3).map((evt) => (
                        <div
                          key={evt.id}
                          className="h-1.5 w-1.5 rounded-full mx-0.5 inline-block"
                          style={{ backgroundColor: evt.color }}
                        />
                      ))}
                      {dayEvts.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{dayEvts.length - 3}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: es }) : 'Selecciona un día'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedDayEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay eventos este día</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDayEvents.map((evt) => (
                      <div key={evt.id} className="flex gap-3">
                        <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: evt.color }} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{evt.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {evt.isAllDay
                              ? 'Todo el día'
                              : `${format(new Date(evt.startDate), 'HH:mm')} - ${format(new Date(evt.endDate), 'HH:mm')}`}
                          </p>
                          {evt.location && (
                            <p className="text-xs text-muted-foreground">{evt.location}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <p className="text-sm text-muted-foreground">Haz clic en un día para ver sus eventos</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Nuevo Evento</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Título *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Descripción</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Ubicación</label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Inicio *</label>
                  <Input
                    type={form.isAllDay ? 'date' : 'datetime-local'}
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Fin *</label>
                  <Input
                    type={form.isAllDay ? 'date' : 'datetime-local'}
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAllDay"
                  checked={form.isAllDay}
                  onChange={(e) => setForm({ ...form, isAllDay: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="isAllDay" className="text-sm font-medium">
                  Todo el día
                </label>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2">
                  {EVENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm({ ...form, color: c.value })}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${
                        form.color === c.value ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
