'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import {
  User,
  Users,
  Shield,
  Puzzle,
  Zap,
  Monitor,
  Plus,
  Search,
  Loader2,
  Check,
  X,
  Plug,
  Activity,
  Globe,
  Package,
  Server,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'perfil' | 'usuarios' | 'roles' | 'integraciones' | 'automatizaciones' | 'sistema';

const TABS: { key: Tab; label: string; icon: typeof User }[] = [
  { key: 'perfil', label: 'Perfil', icon: User },
  { key: 'usuarios', label: 'Usuarios', icon: Users },
  { key: 'roles', label: 'Roles', icon: Shield },
  { key: 'integraciones', label: 'Integraciones', icon: Puzzle },
  { key: 'automatizaciones', label: 'Automatizaciones', icon: Zap },
  { key: 'sistema', label: 'Sistema', icon: Monitor },
];

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Integration {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  config?: Record<string, unknown>;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}

const ROLES: { value: string; label: string; description: string; permissions: string[] }[] = [
  {
    value: 'ADMIN',
    label: 'Administrador',
    description: 'Acceso completo al sistema. Puede gestionar usuarios, roles y configuración global.',
    permissions: ['Todos los módulos', 'Gestionar usuarios', 'Gestionar roles', 'Configuración del sistema', 'Ver reportes'],
  },
  {
    value: 'DIRECTOR',
    label: 'Director',
    description: 'Visión ejecutiva del negocio. Acceso a reportes, dashboard y métricas globales.',
    permissions: ['Dashboard ejecutivo', 'Reportes globales', 'Ver oportunidades', 'Ver leads', 'Ver facturación'],
  },
  {
    value: 'MANAGER',
    label: 'Gerente',
    description: 'Supervisa equipos y gestiona oportunidades. Puede asignar tareas y ver métricas del equipo.',
    permissions: ['Gestionar oportunidades', 'Asignar leads', 'Ver métricas de equipo', 'Gestionar contactos', 'Aprobar cotizaciones'],
  },
  {
    value: 'SALES',
    label: 'Vendedor',
    description: 'Gestión de leads y oportunidades comerciales. Crea cotizaciones y da seguimiento a clientes.',
    permissions: ['Crear leads', 'Gestionar oportunidades', 'Crear cotizaciones', 'Ver contactos', 'Registrar actividades'],
  },
  {
    value: 'ARCHITECT',
    label: 'Arquitecto',
    description: 'Diseña soluciones técnicas y gestiona proyectos. Visualiza requerimientos y propuestas.',
    permissions: ['Diseñar soluciones', 'Gestionar proyectos', 'Ver requerimientos', 'Documentación técnica'],
  },
  {
    value: 'DESIGNER',
    label: 'Diseñador',
    description: 'Crea y modifica diseños para proyectos. Gestiona assets y recursos visuales.',
    permissions: ['Crear diseños', 'Gestionar assets', 'Ver proyectos', 'Colaborar en propuestas'],
  },
  {
    value: 'ACCOUNTING',
    label: 'Contabilidad',
    description: 'Gestión financiera: facturación, pagos, reportes contables y cobranza.',
    permissions: ['Gestionar facturas', 'Registrar pagos', 'Reportes contables', 'Ver clientes', 'Cobranza'],
  },
  {
    value: 'CLIENT',
    label: 'Cliente',
    description: 'Acceso limitado a proyectos asignados, facturación y comunicación con el equipo.',
    permissions: ['Ver proyectos asignados', 'Ver facturas', 'Descargar documentos', 'Comunicación con el equipo'],
  },
  {
    value: 'VISOR',
    label: 'Visor',
    description: 'Acceso de solo lectura a la información del sistema.',
    permissions: ['Ver clientes', 'Ver oportunidades', 'Ver reportes', 'Ver dashboard'],
  },
];

const ROLE_BADGE: Record<string, 'default' | 'destructive' | 'warning' | 'success' | 'secondary' | 'outline'> = {
  ADMIN: 'destructive',
  DIRECTOR: 'default',
  MANAGER: 'warning',
  SALES: 'success',
  ARCHITECT: 'secondary',
  DESIGNER: 'secondary',
  ACCOUNTING: 'warning',
  CLIENT: 'outline',
  VISOR: 'outline',
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('perfil');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>

      <div className="flex flex-wrap gap-1 border-b">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'perfil' && <PerfilTab />}
      {activeTab === 'usuarios' && <UsuariosTab />}
      {activeTab === 'roles' && <RolesTab />}
      {activeTab === 'integraciones' && <IntegracionesTab />}
      {activeTab === 'automatizaciones' && <AutomatizacionesTab />}
      {activeTab === 'sistema' && <SistemaTab />}
    </div>
  );
}

function PerfilTab() {
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string; role: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setSaving(true);
    try {
      await api.patch('/auth/password', {
        currentPassword,
        newPassword,
      });
      toast.success('Contraseña actualizada');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No se pudo cargar la información del usuario.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nombre</label>
            <p className="text-sm">{user.firstName} {user.lastName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-sm">{user.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Rol</label>
            <div className="text-sm mt-1">
              <Badge variant={ROLE_BADGE[user.role] || 'outline'}>
                {ROLES.find((r) => r.value === user.role)?.label || user.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Contraseña actual</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nueva contraseña</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Confirmar contraseña</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Actualizar Contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function UsuariosTab() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'SALES',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const { data } = await api.get('/users', { params });
      setUsers(data.data?.data ?? data.data ?? []);
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/users', form);
      toast.success('Usuario creado');
      setShowCreate(false);
      setForm({ email: '', password: '', firstName: '', lastName: '', role: 'SALES' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al crear usuario');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user: UserData) => {
    try {
      await api.patch(`/users/${user.id}`, { isActive: !user.isActive });
      toast.success(`Usuario ${user.isActive ? 'desactivado' : 'activado'}`);
      fetchUsers();
    } catch {
      toast.error('Error al cambiar estado');
    }
  };

  const filtered = users.filter(
    (u) =>
      !search ||
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Nombre</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Rol</th>
                  <th className="text-center p-3 font-medium">Estado</th>
                  <th className="text-right p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{u.firstName} {u.lastName}</td>
                      <td className="p-3 text-muted-foreground">{u.email}</td>
                      <td className="p-3">
                        <Badge variant={ROLE_BADGE[u.role] || 'outline'}>
                          {ROLES.find((r) => r.value === u.role)?.label || u.role}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={u.isActive ? 'success' : 'secondary'}>
                          {u.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(u)}
                        >
                          {u.isActive ? 'Desactivar' : 'Activar'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Nuevo Usuario</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nombre *</label>
                  <Input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Apellido *</label>
                  <Input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Contraseña *</label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Rol *</label>
                <Select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creando...' : 'Crear Usuario'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RolesTab() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {ROLES.map((role) => (
        <Card key={role.value}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{role.label}</CardTitle>
              <Badge variant={ROLE_BADGE[role.value]}>{role.value}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{role.description}</p>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Permisos</p>
              <ul className="space-y-1">
                {role.permissions.map((perm) => (
                  <li key={perm} className="flex items-center gap-2 text-sm">
                    <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function IntegracionesTab() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: 'Asistente Groq',
    provider: 'GROQ',
    apiKey: '',
    model: 'llama-3.3-70b-versatile',
  });

  const fetchIntegrations = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/integrations');
      setIntegrations(Array.isArray(data) ? data : data?.data ?? []);
    } catch {
      toast.error('Error al cargar integraciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/integrations', {
        name: form.name,
        provider: form.provider,
        config: { apiKey: form.apiKey, model: form.model },
        isActive: true,
      });
      toast.success('Integración creada');
      setShowCreate(false);
      setForm({ name: 'Asistente Groq', provider: 'GROQ', apiKey: '', model: 'llama-3.3-70b-versatile' });
      fetchIntegrations();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al crear integración');
    } finally {
      setSaving(false);
    }
  };

  const toggleIntegration = async (integration: Integration) => {
    try {
      await api.patch(`/integrations/${integration.id}`, {
        isActive: !integration.isActive,
      });
      toast.success(
        `Integración ${integration.isActive ? 'desactivada' : 'activada'}`,
      );
      fetchIntegrations();
    } catch {
      toast.error('Error al cambiar estado');
    }
  };

  const testConnection = async (id: string) => {
    setTestingId(id);
    try {
      const { data } = await api.post(`/integrations/${id}/test`);
      toast.success(data.message || 'Conexión exitosa');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error de conexión');
    } finally {
      setTestingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Integración
        </Button>
      </div>
      {integrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Plug className="h-12 w-12 mb-3" />
            <p className="text-lg font-medium">Sin integraciones</p>
            <p className="text-sm">No hay integraciones configuradas.</p>
          </CardContent>
        </Card>
      ) : (
        integrations.map((integration) => (
          <Card key={integration.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    integration.isActive
                      ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{integration.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(integration as any).provider || integration.type || 'GROQ'}
                    {integration.config?.model ? ` (${integration.config.model})` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection(integration.id)}
                  disabled={testingId === integration.id}
                >
                  {testingId === integration.id ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Activity className="h-3 w-3 mr-1" />
                  )}
                  Probar conexión
                </Button>
                <Button
                  variant={integration.isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleIntegration(integration)}
                >
                  {integration.isActive ? 'Activo' : 'Inactivo'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Nueva Integración</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nombre de la Integración *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Ej: Asistente Groq"
                />
              </div>
              {/* Proveedor hardcoded a GROQ */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">API Key de Groq *</label>
                <Input
                  type="password"
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                  required
                  placeholder="Pega aquí tu llave de Groq (gsk_...)"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Modelo a utilizar (Opcional)</label>
                <Select
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  options={[
                    { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Rápido y Potente)' },
                    { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Ultra Rápido)' },
                    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' }
                  ]}
                />
                <p className="text-xs text-muted-foreground">Selecciona el modelo que deseas usar para la inteligencia artificial.</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creando...' : 'Crear Integración'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AutomatizacionesTab() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    trigger: '',
    action: '',
    config: '',
  });

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/automation');
      setRules(data.data?.data ?? data.data ?? []);
    } catch {
      toast.error('Error al cargar automatizaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const toggleRule = async (rule: AutomationRule) => {
    try {
      await api.patch(`/automation/${rule.id}`, {
        isActive: !rule.isActive,
      });
      toast.success(`Regla ${rule.isActive ? 'desactivada' : 'activada'}`);
      fetchRules();
    } catch {
      toast.error('Error al cambiar estado');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/automation', {
        ...form,
        config: form.config ? JSON.parse(form.config) : {},
      });
      toast.success('Regla creada');
      setShowCreate(false);
      setForm({ name: '', trigger: '', action: '', config: '' });
      fetchRules();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al crear regla');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Regla
        </Button>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Zap className="h-12 w-12 mb-3" />
            <p className="text-lg font-medium">Sin automatizaciones</p>
            <p className="text-sm">No hay reglas de automatización configuradas.</p>
          </CardContent>
        </Card>
      ) : (
        rules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{rule.name}</p>
                  <Badge variant={rule.isActive ? 'success' : 'secondary'}>
                    {rule.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Disparador: {rule.trigger} — Acción: {rule.action}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleRule(rule)}
              >
                {rule.isActive ? 'Desactivar' : 'Activar'}
              </Button>
            </CardContent>
          </Card>
        ))
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Nueva Regla de Automatización</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nombre *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Ej: Asignar lead automáticamente"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Disparador *</label>
                <Input
                  value={form.trigger}
                  onChange={(e) => setForm({ ...form, trigger: e.target.value })}
                  required
                  placeholder="Ej: lead.created"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Acción *</label>
                <Input
                  value={form.action}
                  onChange={(e) => setForm({ ...form, action: e.target.value })}
                  required
                  placeholder="Ej: assign.user"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Configuración (JSON)</label>
                <textarea
                  className="flex h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.config}
                  onChange={(e) => setForm({ ...form, config: e.target.value })}
                  placeholder='{"userId": "..."}'
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creando...' : 'Crear Regla'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SistemaTab() {
  const [systemInfo, setSystemInfo] = useState<{
    version: string;
    environment: string;
    nodeVersion: string;
    uptime: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/system/info')
      .then(({ data }) => {
        setSystemInfo(data.data ?? data);
      })
      .catch(() => {
        // fallback info
        setSystemInfo({
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          nodeVersion: '—',
          uptime: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Información del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-sm text-muted-foreground">Versión API</span>
            <span className="text-sm font-medium">{systemInfo?.version || '—'}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-sm text-muted-foreground">Entorno</span>
            <Badge variant={systemInfo?.environment === 'Materialion' ? 'default' : 'warning'}>
              {systemInfo?.environment || '—'}
            </Badge>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-sm text-muted-foreground">Node.js</span>
            <span className="text-sm font-medium">{systemInfo?.nodeVersion || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Uptime</span>
            <span className="text-sm font-medium">
              {systemInfo?.uptime
                ? `${Math.floor(systemInfo.uptime / 3600)}h ${Math.floor((systemInfo.uptime % 3600) / 60)}m`
                : '—'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Módulos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              { name: 'Leads', status: 'Operativo' },
              { name: 'Contactos', status: 'Operativo' },
              { name: 'Oportunidades', status: 'Operativo' },
              { name: 'Facturación', status: 'Operativo' },
              { name: 'Materialos', status: 'Operativo' },
              { name: 'Dashboard', status: 'Operativo' },
            ].map((mod) => (
              <li key={mod.name} className="flex items-center justify-between">
                <span className="text-sm">{mod.name}</span>
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <Check className="h-3 w-3" />
                  {mod.status}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

