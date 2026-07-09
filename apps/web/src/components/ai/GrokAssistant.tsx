'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '@/lib/api';

export function GrokAssistant() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hola, soy tu asistente de inteligencia artificial potenciado por Grok. Puedes preguntarme sobre estimaciones de precios de materiales de construcción, mano de obra, o cualquier servicio.' }
  ]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/search-construction-prices', { query: userMessage });
      if (data && data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      } else if (data && data.answer) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Hubo un error al procesar tu consulta.' }]);
      }
    } catch (error) {
      console.error('Error querying Grok:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un problema de conexión con el asistente.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:text-white/80 hover:bg-white/10" title="Asistente de IA (Grok)">
          <Bot className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            Asistente Grok - Construcción
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 py-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-lg p-3 ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-muted rounded-bl-none prose prose-sm dark:prose-invert max-w-full'
                  }`}
                >
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg rounded-bl-none p-3 flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Grok está pensando...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <Input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Pregunta precios (ej. bulto de cemento gris 50kg)..." 
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !query.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
