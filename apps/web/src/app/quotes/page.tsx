'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, FileDown, CheckSquare, XCircle, Eye, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

type QuoteStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

interface Company {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
}

interface Material {
  id: string;
  name: string;
  price: number;
}

interface QuoteItem {
  id?: number;
  MaterialId: string;
  quantity: number;
  unitPrice: number;
  MaterialName?: string;
}

interface Quote {
  id: number;
  number: string;
  title: string;
  company: Company;
  contact?: Contact | null;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: QuoteStatus;
  validUntil: string;
  notes?: string;
  terms?: string;
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
}

const STATUS_BADGE: Record<QuoteStatus, 'outline' | 'default' | 'warning' | 'success' | 'destructive' | 'secondary'> = {
  DRAFT: 'outline',
  SENT: 'default',
  VIEWED: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'destructive',
  EXPIRED: 'secondary',
};

const STATUS_LABEL: Record<QuoteStatus, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviada',
  VIEWED: 'Vista',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  EXPIRED: 'Expirada',
};

const STATUS_OPTIONS = Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }));

const emptyItem = { MaterialId: '', quantity: 1, unitPrice: 0 };

const emptyForm = {
  title: '',
  companyId: '',
  contactId: '',
  validUntil: '',
  notes: '',
  terms: '',
  items: [{ ...emptyItem }] as QuoteItem[],
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [Materials, setMaterials] = useState<Material[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState<Quote | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState<number | null>(null);
  const [waLoading, setWaLoading] = useState<number | null>(null);
  const [statusLoading, setStatusLoading] = useState<number | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '10' };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await api.get('/quotes', { params });
      setQuotes(data?.data ?? data?.data?.data ?? []);
      setMeta(data?.meta ?? data?.data?.meta ?? { total: 0, page: 1, limit: 10 });
    } catch {
      toast.error('Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  const fetchCompanies = useCallback(async () => {
    try {
      const { data } = await api.get('/companies');
      setCompanies(data.data?.data ?? data.data ?? []);
    } catch {}
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const { data } = await api.get('/contacts');
      setContacts(data.data?.data ?? data.data ?? []);
    } catch {}
  }, []);

  const fetchMaterials = useCallback(async () => {
    try {
      const { data } = await api.get('/Materials');
      setMaterials(data.data?.data ?? data.data ?? []);
    } catch {}
  }, []);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const openCreate = () => {
    setForm(emptyForm);
    setCreateOpen(true);
    fetchCompanies();
    fetchContacts();
    fetchMaterials();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  };

  const removeItem = (index: number) => {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const items = form.items.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'MaterialId') {
        const Material = Materials.find((p) => String(p.id) === String(value));
        if (Material) {
          updated.unitPrice = Material.price;
          updated.MaterialName = Material.name;
        }
      }
      return updated;
    });
    setForm({ ...form, items });
  };

  const subtotal = form.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return; }
    if (!form.companyId) { toast.error('Selecciona una empresa'); return; }
    if (form.items.some((item) => item.MaterialId === '')) { toast.error('Completa todos los Materialos'); return; }
    setSaving(true);
    try {
      await api.post('/quotes', {
        title: form.title,
        companyId: form.companyId,
        contactId: form.contactId || undefined,
        validUntil: form.validUntil || undefined,
        notes: form.notes || undefined,
        terms: form.terms || undefined,
        items: form.items.map((item) => ({
          MaterialId: item.MaterialId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      });
      toast.success('Cotización creada');
      setCreateOpen(false);
      fetchQuotes();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al crear cotización');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: number, status: QuoteStatus) => {
    setStatusLoading(id);
    try {
      await api.patch(`/quotes/${id}/status`, { status });
      toast.success('Estado actualizado');
      fetchQuotes();
      setDetailOpen(null);
    } catch {
      toast.error('Error al cambiar estado');
    } finally {
      setStatusLoading(null);
    }
  };

  const handleExportPdf = async (id: number) => {
    setPdfLoading(id);
    try {
      const response = await api.get(`/quotes/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Cotizacion_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error('Error al exportar PDF');
    } finally {
      setPdfLoading(null);
    }
  };

  const handleSendWhatsApp = async (quote: Quote) => {
    if (!quote.contact || !quote.contact.phone) {
      toast.error('El contacto asociado no tiene un número de teléfono registrado.');
      return;
    }
    setWaLoading(quote.id);
    try {
      const message = `Hola ${quote.contact.firstName}, adjuntamos la cotización ${quote.number} - "${quote.title}" por un total de ${formatCurrency(quote.total)}. ¡Quedamos atentos a sus comentarios!`;
      await api.post('/whatsapp/send', { to: quote.contact.phone, message });
      toast.success('Cotización enviada por WhatsApp');
      handleStatusChange(quote.id, 'SENT');
    } catch {
      toast.error('Error al enviar WhatsApp. ¿Está el dispositivo vinculado?');
    } finally {
      setWaLoading(null);
    }
  };

  const totalPages = Math.ceil((meta?.total || 0) / (meta?.limit || 10));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
            Volver al inicio
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Cotizaciones</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cotización
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por número o empresa..."
                className="pl-9"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              options={STATUS_OPTIONS}
              placeholder="Filtrar por estado"
              className="w-[180px]"
            />
            {(statusFilter || search) && (
              <Button variant="ghost" size="sm" onClick={() => { setStatusFilter(''); setSearch(''); setPage(1); }}>
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Número</th>
                  <th className="text-left p-3 font-medium">Cliente</th>
                  <th className="text-right p-3 font-medium">Total</th>
                  <th className="text-center p-3 font-medium">Estado</th>
                  <th className="text-left p-3 font-medium">Válida hasta</th>
                  <th className="text-right p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">Cargando...</td>
                  </tr>
                ) : quotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">No se encontraron cotizaciones</td>
                  </tr>
                ) : (
                  quotes.map((q) => (
                    <tr key={q.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{q.number}</td>
                      <td className="p-3">{q.company.name}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(q.total)}</td>
                      <td className="p-3 text-center">
                        <Badge variant={STATUS_BADGE[q.status]}>{STATUS_LABEL[q.status]}</Badge>
                      </td>
                      <td className="p-3">{q.validUntil ? formatDate(q.validUntil) : '—'}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setDetailOpen(q)} title="Ver detalle">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleExportPdf(q.id)} disabled={pdfLoading === q.id} title="Exportar PDF">
                            <FileDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * (meta?.limit || 10) + 1}–{Math.min(page * (meta?.limit || 10), meta?.total || 0)} de {meta?.total || 0}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)}>
                    {p}
                  </Button>
                ))}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Nueva Cotización</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Título *</label>
                <Input className="text-slate-900 dark:text-slate-100" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Empresa *</label>
                  <Select
                    value={form.companyId}
                    onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                    options={companies.map((c) => ({ value: String(c.id), label: c.name }))}
                    placeholder="Seleccionar empresa"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Contacto</label>
                  <Select
                    value={form.contactId}
                    onChange={(e) => setForm({ ...form, contactId: e.target.value })}
                    options={contacts.map((c) => ({ value: String(c.id), label: `${c.firstName} ${c.lastName}` }))}
                    placeholder="Seleccionar contacto (opcional)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Válida hasta</label>
                  <Input className="text-slate-900 dark:text-slate-100" type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Notas</label>
                <textarea
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Términos y condiciones</label>
                <textarea
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Proyectos / Consultorías</label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="mr-1 h-3 w-3" /> Agregar ítem
                  </Button>
                </div>
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex items-end gap-2 p-3 rounded-lg border bg-muted/20">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-medium">Proyecto</label>
                      <Select
                        value={String(item.MaterialId)}
                        onChange={(e) => updateItem(idx, 'MaterialId', e.target.value)}
                        options={Materials.map((p) => ({ value: String(p.id), label: `${p.name} (${formatCurrency(p.price)})` }))}
                        placeholder="Seleccionar proyecto"
                        className="text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div className="w-24 space-y-1.5">
                      <label className="text-xs font-medium">Cantidad</label>
                      <Input className="text-slate-900 dark:text-slate-100" type="number" min={1} value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} />
                    </div>
                    <div className="w-28 space-y-1.5">
                      <label className="text-xs font-medium">Precio Unit.</label>
                      <Input className="text-slate-900 dark:text-slate-100" type="number" min={0} step={0.01} value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))} />
                    </div>
                    <div className="w-24 pt-1.5 text-right text-sm font-medium">
                      {formatCurrency((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))}
                    </div>
                    <Button type="button" variant="ghost" size="icon" disabled={form.items.length <= 1} onClick={() => removeItem(idx)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA (19%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear Cotización'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{detailOpen.number} — {detailOpen.title}</h2>
              <Button variant="ghost" size="icon" onClick={() => setDetailOpen(null)}>
                <Trash2 className="h-4 w-4 rotate-45" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-muted-foreground">Empresa</p>
                <p className="font-medium">{detailOpen.company.name}</p>
              </div>
              {detailOpen.contact && (
                <div>
                  <p className="text-muted-foreground">Contacto</p>
                  <p className="font-medium">{detailOpen.contact.firstName} {detailOpen.contact.lastName}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Válida hasta</p>
                <p className="font-medium">{detailOpen.validUntil ? formatDate(detailOpen.validUntil) : '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estado</p>
                <Badge variant={STATUS_BADGE[detailOpen.status]}>{STATUS_LABEL[detailOpen.status]}</Badge>
              </div>
            </div>

            {detailOpen.notes && (
              <div className="mb-4 text-sm">
                <p className="text-muted-foreground">Notas</p>
                <p>{detailOpen.notes}</p>
              </div>
            )}

            {detailOpen.terms && (
              <div className="mb-4 text-sm">
                <p className="text-muted-foreground">Términos</p>
                <p>{detailOpen.terms}</p>
              </div>
            )}

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 font-medium">Proyecto</th>
                    <th className="text-right p-2 font-medium">Cantidad</th>
                    <th className="text-right p-2 font-medium">Precio Unit.</th>
                    <th className="text-right p-2 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detailOpen.items.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{item.MaterialName || `Proyecto #${item.MaterialId}`}</td>
                      <td className="p-2 text-right">{item.quantity}</td>
                      <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-2 text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t pt-3 space-y-1 text-sm mb-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(detailOpen.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">IVA (19%)</span><span>{formatCurrency(detailOpen.tax)}</span></div>
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatCurrency(detailOpen.total)}</span></div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex gap-2">
                {(detailOpen.status === 'SENT' || detailOpen.status === 'VIEWED') && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      disabled={statusLoading === detailOpen.id}
                      onClick={() => handleStatusChange(detailOpen.id, 'ACCEPTED')}
                    >
                      <CheckSquare className="mr-1 h-4 w-4" /> Aceptar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={statusLoading === detailOpen.id}
                      onClick={() => handleStatusChange(detailOpen.id, 'REJECTED')}
                    >
                      <XCircle className="mr-1 h-4 w-4" /> Rechazar
                    </Button>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExportPdf(detailOpen.id)} disabled={pdfLoading === detailOpen.id}>
                  <FileDown className="mr-1 h-4 w-4" /> Exportar PDF
                </Button>
                <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleSendWhatsApp(detailOpen)} disabled={waLoading === detailOpen.id}>
                  <MessageCircle className="mr-1 h-4 w-4" /> {waLoading === detailOpen.id ? 'Enviando...' : 'WhatsApp'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

