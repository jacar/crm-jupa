'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import {
  DollarSign, Users, UserPlus, UserX, TrendingUp, BarChart4, Activity,
} from 'lucide-react';

interface Summary {
  monthlySales: number;
  newClients: number;
  activeClients: number;
  lostClients: number;
  totalQuotes: number;
  totalRevenue: number;
  activeProjects: number;
  pendingTasks: number;
}

interface PipelineStage {
  stage: string;
  count: number;
}

interface MonthlyRevenue {
  month: string;
  year: number;
  amount: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

interface Kpi {
  conversionRate: number;
  avgDealSize: number;
  avgClosingTime: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [kpi, setKpi] = useState<Kpi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, pipelineRes, revenueRes, activitiesRes, kpiRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/sales-pipeline'),
          api.get('/dashboard/monthly-revenue'),
          api.get('/dashboard/recent-activities'),
          api.get('/dashboard/kpi'),
        ]);
        setSummary(summaryRes.data);
        setPipeline(pipelineRes.data);
        setMonthlyRevenue(revenueRes.data);
        setActivities(activitiesRes.data);
        setKpi(kpiRes.data);
      } catch {
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = summary
    ? [
        { title: 'Ventas del Mes', value: formatCurrency(summary.monthlySales), icon: DollarSign, variant: 'default' as const },
        { title: 'Nuevos Clientes', value: summary.newClients, icon: UserPlus, variant: 'success' as const },
        { title: 'Clientes Activos', value: summary.activeClients, icon: Users, variant: 'default' as const },
        { title: 'Clientes Perdidos', value: summary.lostClients, icon: UserX, variant: 'destructive' as const },
      ]
    : [];

  const activityIcon = (type: string) => {
    switch (type) {
      case 'client': return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'deal': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'task': return <BarChart4 className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del negocio</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart4 className="h-5 w-5 text-muted-foreground" />
              Pipeline de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipeline}>
                  <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              Ingresos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(m) => {
                      const months: Record<string, string> = { '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic' };
                      return months[m] || m;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              Actividades Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-0.5">{activityIcon(activity.type)}</div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleDateString('es-CL', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay actividades recientes</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              KPIs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {kpi && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Tasa de Conversión</p>
                  <p className="text-2xl font-bold">{(kpi.conversionRate * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Promedio</p>
                  <p className="text-2xl font-bold">{formatCurrency(kpi.avgDealSize)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tiempo Prom. Cierre</p>
                  <p className="text-2xl font-bold">{kpi.avgClosingTime} días</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
