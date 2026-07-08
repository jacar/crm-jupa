'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as Tabs from '@radix-ui/react-tabs';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, Users, GitBranch, Target, DollarSign, BarChart4,
} from 'lucide-react';

interface SalesReport {
  totalRevenue: number;
  totalQuotes: number;
  conversionRate: number;
  avgDealSize: number;
  topSalespeople: { name: string; revenue: number }[];
  topMaterials: { name: string; quantity: number; revenue: number }[];
}

interface UserReport {
  user: string;
  activities: number;
  tasks: number;
  deals: number;
  revenue: number;
}

interface PipelineStage {
  stage: string;
  count: number;
  amount: number;
}

interface ConversionReport {
  leads: number;
  opportunities: number;
  quotes: number;
  invoices: number;
}

interface MonthlyRevenue {
  month: string;
  amount: number;
}

export default function ReportsPage() {
  const [tab, setTab] = useState('ventas');
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [users, setUsers] = useState<UserReport[]>([]);
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [conversion, setConversion] = useState<ConversionReport | null>(null);
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [salesRes, usersRes, pipelineRes, conversionRes, revenueRes] = await Promise.all([
          api.get('/reports/sales'),
          api.get('/reports/users'),
          api.get('/reports/pipeline'),
          api.get('/reports/conversion'),
          api.get('/reports/revenue', { params: { year: 2026 } }),
        ]);
        setSales(salesRes.data);
        setUsers(usersRes.data);
        setPipeline(pipelineRes.data);
        setConversion(conversionRes.data);
        setRevenue(revenueRes.data);
      } catch {
        // error handled per tab
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const monthNames: Record<string, string> = {
    '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
    '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
    '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
  };

  const tabs = [
    { value: 'ventas', label: 'Ventas', icon: TrendingUp },
    { value: 'usuarios', label: 'Usuarios', icon: Users },
    { value: 'pipeline', label: 'Pipeline', icon: GitBranch },
    { value: 'conversion', label: 'Conversión', icon: Target },
    { value: 'ingresos', label: 'Ingresos', icon: DollarSign },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">Análisis y métricas del negocio</p>
      </div>

      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List className="flex gap-1 border-b">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <Tabs.Trigger
                key={t.value}
                value={t.value}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.value
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>

        <Tabs.Content value="ventas" className="pt-6 space-y-6">
          {sales && (
            <>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Totales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(sales.totalRevenue)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Cotizaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{sales.totalQuotes}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de Conversión</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(sales.conversionRate * 100).toFixed(1)}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(sales.avgDealSize)}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Top 10 Vendedores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sales.topSalespeople} layout="vertical" margin={{ left: 80 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart4 className="h-4 w-4 text-muted-foreground" />
                      Top 10 Materialos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sales.topMaterials} layout="vertical" margin={{ left: 80 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </Tabs.Content>

        <Tabs.Content value="usuarios" className="pt-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="p-3 font-medium">Usuario</th>
                      <th className="p-3 font-medium text-center">Actividades</th>
                      <th className="p-3 font-medium text-center">Tareas</th>
                      <th className="p-3 font-medium text-center">Negocios</th>
                      <th className="p-3 font-medium text-right">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No hay datos de usuarios
                        </td>
                      </tr>
                    ) : (
                      users.map((u, i) => (
                        <tr key={u.user} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-medium">{u.user}</td>
                          <td className="p-3 text-center"><Badge variant="secondary">{u.activities}</Badge></td>
                          <td className="p-3 text-center"><Badge variant="secondary">{u.tasks}</Badge></td>
                          <td className="p-3 text-center"><Badge variant="secondary">{u.deals}</Badge></td>
                          <td className="p-3 text-right font-medium">{formatCurrency(u.revenue)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="pipeline" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Oportunidades por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip formatter={(value: number, name: string) =>
                      name === 'amount' ? formatCurrency(value) : value
                    } />
                    <Bar yAxisId="left" dataKey="count" name="Cantidad" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="amount" name="Monto" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.5} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="conversion" className="pt-6">
          {conversion && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Embudo de Conversión</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Leads', value: conversion.leads, color: 'bg-blue-500' },
                      { label: 'Oportunidades', value: conversion.opportunities, color: 'bg-indigo-500' },
                      { label: 'Cotizaciones', value: conversion.quotes, color: 'bg-purple-500' },
                      { label: 'Facturas', value: conversion.invoices, color: 'bg-green-500' },
                    ].map((step) => {
                      const maxVal = Math.max(conversion.leads, 1);
                      const pct = (step.value / maxVal) * 100;
                      return (
                        <div key={step.label} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{step.label}</span>
                            <span className="text-muted-foreground">{step.value.toLocaleString()}</span>
                          </div>
                          <div className="h-6 w-full rounded-md bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-md ${step.color} transition-all`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resumen de Conversión</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Lead → Oportunidad', value: conversion.opportunities, total: conversion.leads },
                    { label: 'Oportunidad → Cotización', value: conversion.quotes, total: conversion.opportunities },
                    { label: 'Cotización → Factura', value: conversion.invoices, total: conversion.quotes },
                  ].map((step) => {
                    const rate = step.total > 0 ? ((step.value / step.total) * 100).toFixed(1) : '0.0';
                    return (
                      <div key={step.label} className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">{step.label}</p>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{rate}%</span>
                          <span className="text-sm text-muted-foreground">
                            ({step.value} / {step.total})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          )}
        </Tabs.Content>

        <Tabs.Content value="ingresos" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Ingresos Mensuales 2026
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(m) => monthNames[m] || m}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

