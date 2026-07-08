'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, DollarSign, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';

type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

interface Invoice {
  id: number;
  number: string;
  client: string;
  total: number;
  paid: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
}

interface Quote {
  id: number;
  number: string;
  company: { name: string };
  total: number;
}

interface Company {
  id: string;
  name: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
}

const STATUS_BADGE: Record<InvoiceStatus, 'outline' | 'default' | 'warning' | 'success' | 'destructive' | 'secondary'> = {
  DRAFT: 'outline',
  SENT: 'default',
  PARTIAL: 'warning',
  PAID: 'success',
  OVERDUE: 'destructive',
  CANCELLED: 'secondary',
};

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviada',
  PARTIAL: 'Parcial',
  PAID: 'Pagada',
  OVERDUE: 'Vencida',
  CANCELLED: 'Anulada',
};

const emptyForm = {
  companyId: '',
  dueDate: '',
  quoteId: '',
};

const emptyPayment = {
  amount: '',
  method: '',
  reference: '',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [payment, setPayment] = useState(emptyPayment);
  const [paying, setPaying] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '10' };
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const { data } = await api.get('/invoices', { params });
      setInvoices(data?.data ?? data?.data?.data ?? []);
      setMeta(data?.meta ?? data?.data?.meta ?? { total: 0, page: 1, limit: 10 });
    } catch {
      toast.error('Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateFrom, dateTo]);

  const fetchQuotes = useCallback(async () => {
    try {
      const { data } = await api.get('/quotes', { params: { limit: '100' } });
      setQuotes(data.data?.data ?? data.data ?? []);
    } catch {
      // non-critical
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    try {
      const { data } = await api.get('/companies', { params: { limit: '100' } });
      setCompanies(data.data?.data ?? data.data ?? []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setCreateOpen(true);
    fetchQuotes();
    fetchCompanies();
  };

  const openEdit = (invoice: Invoice) => {
    setEditing(invoice);
    // Note: editing an invoice might not map perfectly if the API response only gives us company name in invoice.client. 
    // Ideally we should use invoice.companyId. Since the backend might return companyId, we will try to use it if available, else empty.
    setForm({ companyId: (invoice as any).companyId || '', dueDate: invoice.dueDate, quoteId: '' });
    setCreateOpen(true);
    fetchQuotes();
    fetchCompanies();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!editing && form.quoteId) {
        await api.post(`/invoices/from-quote/${form.quoteId}`);
        toast.success('Factura creada desde cotización');
      } else {
        // Create manually with items array or patch
        const payload: Record<string, unknown> = {
          companyId: form.companyId,
          dueDate: form.dueDate,
        };
        if (form.quoteId) payload.quoteId = form.quoteId;

        if (editing) {
          await api.patch(`/invoices/${editing.id}`, payload);
          toast.success('Factura actualizada');
        } else {
          // If no items are provided in manual creation, this will fail validation.
          // Since UI lacks items for manual invoice, we send an empty array to satisfy DTO, 
          // or ideally the user should use from-quote.
          payload.items = []; 
          await api.post('/invoices', payload);
          toast.success('Factura creada');
        }
      }
      setCreateOpen(false);
      fetchInvoices();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al guardar factura');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/invoices/${deleteId}`);
      toast.success('Factura eliminada');
      setDeleteId(null);
      fetchInvoices();
    } catch {
      toast.error('Error al eliminar factura');
    } finally {
      setDeleting(false);
    }
  };

  const openPayment = (invoice: Invoice) => {
    setPaymentInvoice(invoice);
    setPayment({
      amount: String(invoice.total - invoice.paid),
      method: '',
      reference: '',
    });
    setPaymentOpen(true);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice) return;
    setPaying(true);
    try {
      await api.post(`/invoices/${paymentInvoice.id}/payments`, {
        amount: Number(payment.amount),
        method: payment.method,
        reference: payment.reference,
      });
      toast.success('Pago registrado');
      setPaymentOpen(false);
      setPaymentInvoice(null);
      fetchInvoices();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al registrar pago');
    } finally {
      setPaying(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Factura
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              options={[
                { value: 'DRAFT', label: 'Borrador' },
                { value: 'SENT', label: 'Enviada' },
                { value: 'PARTIAL', label: 'Parcial' },
                { value: 'PAID', label: 'Pagada' },
                { value: 'OVERDUE', label: 'Vencida' },
                { value: 'CANCELLED', label: 'Anulada' },
              ]}
              placeholder="Filtrar por estado"
              className="w-[180px]"
            />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              placeholder="Desde"
              className="w-[160px]"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              placeholder="Hasta"
              className="w-[160px]"
            />
            {(statusFilter || dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}
              >
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
                  <th className="text-right p-3 font-medium">Pagado</th>
                  <th className="text-center p-3 font-medium">Estado</th>
                  <th className="text-left p-3 font-medium">Vencimiento</th>
                  <th className="text-right p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Cargando...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No se encontraron facturas
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{inv.number}</td>
                      <td className="p-3">{inv.client}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(inv.total)}</td>
                      <td className="p-3 text-right">{formatCurrency(inv.paid)}</td>
                      <td className="p-3 text-center">
                        <Badge variant={STATUS_BADGE[inv.status]}>
                          {STATUS_LABEL[inv.status]}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {new Date(inv.dueDate).toLocaleDateString('es-CL')}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                            <Button variant="ghost" size="icon" onClick={() => openPayment(inv)}>
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => openEdit(inv)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(inv.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
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
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">
              {editing ? 'Editar Factura' : 'Nueva Factura'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Cliente (Empresa)</label>
                <Select
                  value={form.companyId}
                  onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                  options={companies.map((c) => ({ value: String(c.id), label: c.name }))}
                  placeholder="Seleccionar cliente/empresa"
                  required={!form.quoteId}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Fecha de Vencimiento</label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  required
                />
              </div>
              {!editing && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Copiar ítems desde Cotización</label>
                  <Select
                    value={form.quoteId}
                    onChange={(e) => setForm({ ...form, quoteId: e.target.value })}
                    options={quotes.map((q) => ({
                      value: String(q.id),
                      label: `${q.number} - ${q.company?.name || 'Sin empresa'} (${formatCurrency(q.total)})`,
                    }))}
                    placeholder="Seleccionar cotización (opcional)"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {paymentOpen && paymentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Registrar Pago</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Factura: <strong>{paymentInvoice.number}</strong> — Pendiente:{' '}
              <strong>{formatCurrency(paymentInvoice.total - paymentInvoice.paid)}</strong>
            </p>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Monto</label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={payment.amount}
                  onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Método de Pago</label>
                <Select
                  value={payment.method}
                  onChange={(e) => setPayment({ ...payment, method: e.target.value })}
                  options={[
                    { value: 'TRANSFER', label: 'Transferencia' },
                    { value: 'CASH', label: 'Efectivo' },
                    { value: 'CHECK', label: 'Cheque' },
                    { value: 'CARD', label: 'Tarjeta' },
                    { value: 'OTHER', label: 'Otro' },
                  ]}
                  placeholder="Seleccionar método"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Referencia</label>
                <Input
                  value={payment.reference}
                  onChange={(e) => setPayment({ ...payment, reference: e.target.value })}
                  placeholder="N° de transferencia, voucher, etc."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setPaymentOpen(false); setPaymentInvoice(null); }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={paying}>
                  {paying ? 'Registrando...' : 'Registrar Pago'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg">
            <h2 className="mb-2 text-lg font-semibold">Confirmar eliminación</h2>
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
