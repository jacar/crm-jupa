'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Smartphone, CheckCircle2, XCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

export default function WhatsappSettingsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await api.get('/whatsapp/status');
        setStatus(data.status);
        setQrCode(data.qr);
      } catch (err) {
        toast.error('Error al conectar con el servicio de WhatsApp');
      }
    };
    fetchStatus();

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/whatsapp', {
      transports: ['websocket'],
    });

    newSocket.on('status', (newStatus) => {
      setStatus(newStatus);
      if (newStatus === 'connected') {
        setQrCode(null);
        toast.success('WhatsApp vinculado exitosamente');
        setTimeout(() => {
          router.push('/whatsapp');
        }, 1500);
      }
    });

    newSocket.on('qr', (qr) => {
      setQrCode(qr);
      setStatus('disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/whatsapp/logout');
      toast.success('Sesión de WhatsApp cerrada');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Integración de WhatsApp</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Vincular Dispositivo
            </CardTitle>
            <CardDescription>
              Escanea el código QR usando la aplicación de WhatsApp en tu teléfono para vincular la línea de la empresa.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 min-h-[300px]">
            {status === 'connected' ? (
              <div className="flex flex-col items-center gap-4 text-green-600 dark:text-green-500">
                <CheckCircle2 className="h-20 w-20" />
                <h3 className="text-xl font-semibold">WhatsApp Conectado</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  El sistema está listo para enviar y recibir mensajes, y despachar cotizaciones.
                </p>
                <div className="flex gap-4">
                  <Link href="/whatsapp">
                    <Button variant="default" className="bg-green-600 hover:bg-green-700">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Abrir Bandeja de Chats
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={handleLogout}>
                    Desconectar Cuenta
                  </Button>
                </div>
              </div>
            ) : status === 'connecting' ? (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p>Generando código QR...</p>
              </div>
            ) : qrCode ? (
              <div className="flex flex-col items-center gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
                  <QRCodeSVG value={qrCode} size={256} />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  1. Abre WhatsApp en tu teléfono<br />
                  2. Toca Menú o Configuración y selecciona <strong>Dispositivos vinculados</strong><br />
                  3. Toca en <strong>Vincular un dispositivo</strong> y apunta tu cámara hacia este código.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <XCircle className="h-12 w-12 text-destructive" />
                <p>El servicio de WhatsApp está desconectado.</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Reintentar Conexión
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Servicio</CardTitle>
            <CardDescription>Detalles operativos de la integración</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Estado del Motor:</span>
              <span className="font-medium">
                {status === 'connected' ? 'En línea' : 'Desconectado'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Sincronización de Chats:</span>
              <span className="font-medium">Activa</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Envío de Cotizaciones:</span>
              <span className="font-medium">Habilitado</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
