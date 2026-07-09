'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Plus, FileText, ExternalLink, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DrivePage() {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false); // Simulate connection status

  const handleConnect = () => {
    setLoading(true);
    // Here we would typically redirect to the Google OAuth consent screen
    // For example: window.location.href = '/api/auth/google';
    setTimeout(() => {
      setLoading(false);
      toast.error('Falta configurar credenciales de Google Drive (Client ID/Secret) en el servidor.');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
            Volver al inicio
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Google Drive</h1>
        </div>
      </div>

      {!connected ? (
        <Card className="max-w-3xl mx-auto mt-12 text-center border-dashed border-2">
          <CardContent className="pt-12 pb-12 flex flex-col items-center">
            <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <FolderOpen className="h-10 w-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Conectar con Google Drive</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Para vincular y explorar documentos en línea directamente desde el CRM, necesitas autorizar el acceso a tu cuenta de Google Drive.
            </p>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg mb-8 max-w-lg text-sm flex gap-3 text-left">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <strong>Aviso al Administrador:</strong> Para que la integración funcione, se requiere configurar <code>GOOGLE_CLIENT_ID</code> y <code>GOOGLE_CLIENT_SECRET</code> en las variables de entorno del servidor.
              </div>
            </div>

            <Button size="lg" onClick={handleConnect} disabled={loading} className="px-8 bg-[#4285F4] hover:bg-[#3367D6] text-white">
              {loading ? 'Conectando...' : 'Autorizar Google Drive'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder for when connected */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Documento de Prueba.pdf
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Modificado hace 2 días</p>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="h-3 w-3 mr-2" /> Abrir en Drive
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
