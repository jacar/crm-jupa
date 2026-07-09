'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BrainCircuit, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

export default function AiSearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/ai/search-construction-prices', { query });
      if (data?.answer) {
        setResult(data.answer);
      } else {
        toast.error('No se pudo obtener una respuesta clara de la IA');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al conectar con la IA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
          Volver al inicio
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Búsqueda Inteligente</h1>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BrainCircuit className="h-6 w-6 text-primary" />
            Asistente de IA Grok
          </CardTitle>
          <CardDescription>
            Busca precios de materiales, consulta normativas o haz preguntas sobre proyectos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-8">
            <Input
              placeholder="Ej. ¿Cuál es el precio aproximado de 1 tonelada de cemento?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-lg py-6"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !query.trim()} className="py-6 px-8">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5 mr-2" />
              )}
              Buscar
            </Button>
          </form>

          {result && (
            <div className="mt-8 p-6 bg-muted/30 rounded-xl border">
              <h3 className="font-semibold mb-4 text-lg">Respuesta:</h3>
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
