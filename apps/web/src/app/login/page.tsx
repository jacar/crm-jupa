'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Inicio de sesión exitoso');
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#E8E6DF]">
      {/* Columna Izquierda: Imagen */}
      <div className="hidden lg:block lg:w-1/2 relative bg-black">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://www.jupaarquitectura.com/img/Juan%20P.webp")' }}
        />
        {/* Un leve gradiente oscuro para que no se vea tan plana, opcional */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md animate-in bg-white shadow-2xl border-0 overflow-hidden">
          
          {/* Cabecera con Logo y Franja Oscura */}
          <div 
            className="w-full py-10 flex flex-col justify-center items-center gap-4"
            style={{ backgroundColor: 'rgba(12, 12, 12, 0.78)' }}
          >
            <img 
              src="https://www.jupaarquitectura.com/img/logo.svg" 
              alt="Jupa Arquitectura Logo" 
              className="h-[200px] w-auto object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <h1 className="text-white text-xl font-semibold tracking-widest uppercase">
              CRM JUPA Arquitectura
            </h1>
          </div>

          <CardHeader className="text-center pt-8 pb-4">
            <CardDescription className="text-slate-500 text-base">Ingresa tus credenciales para continuar</CardDescription>
          </CardHeader>
          
          <CardContent className="pb-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Contraseña</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 mt-4" disabled={loading}>
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="absolute bottom-6 text-center text-xs text-slate-500 w-full lg:w-1/2">
          <p>Todos los derechos reservados JUPA ARQUITECTURA 2026</p>
          <p>Desarrollo FOCUS CREATIVE</p>
        </div>
      </div>
    </div>
  );
}
