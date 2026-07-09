'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smartphone, ShieldAlert, Phone } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

interface WAMessage {
  id: string;
  from: string;
  body: string;
  timestamp: number;
}

export default function WhatsappInboxPage() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [messages, setMessages] = useState<WAMessage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatList, setChatList] = useState<{id: string, name: string, profilePicUrl?: string, timestamp: number, unreadCount: number}[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    // Initial fetch
    api.get('/whatsapp/status').then(({ data }) => {
      setStatus(data.status);
      if (data.status === 'connected') {
        fetchChats();
      }
    }).catch(() => setStatus('disconnected'));

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const wsUrl = apiUrl.replace('/api', '') + '/whatsapp';
    
    const newSocket = io(wsUrl);

    newSocket.on('status', (newStatus) => {
      setStatus(newStatus);
      if (newStatus === 'connected') {
        fetchChats();
      }
    });

    newSocket.on('message', (msg: WAMessage) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg].sort((a, b) => a.timestamp - b.timestamp);
      });
      setActiveChat((prev) => prev ? prev : msg.from);
      fetchChats();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchChats = async () => {
    try {
      const { data } = await api.get('/whatsapp/chats');
      setChatList(data);
      // Fetch profile pics asynchronously
      data.forEach((chat: any) => {
        api.get(`/whatsapp/chats/${chat.id}/profile-pic`).then((res) => {
          if (res.data.url) {
            setChatList((prev) => prev.map(c => c.id === chat.id ? { ...c, profilePicUrl: res.data.url } : c));
          }
        }).catch(() => {});
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeChat && status === 'connected') {
      setLoadingMessages(true);
      api.get(`/whatsapp/chats/${activeChat}/messages`).then(({ data }) => {
        setMessages(data.sort((a: WAMessage, b: WAMessage) => a.timestamp - b.timestamp));
      }).catch(console.error)
      .finally(() => setLoadingMessages(false));
    }
  }, [activeChat, status]);

  const handleSend = async () => {
    if (!activeChat || !replyText.trim()) return;
    try {
      await api.post('/whatsapp/send', { to: activeChat, message: replyText });
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), from: 'me', body: replyText, timestamp: Math.floor(Date.now() / 1000) }
      ]);
      setReplyText('');
    } catch {
      toast.error('Error al enviar el mensaje');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/whatsapp/logout');
      toast.success('Sesión de WhatsApp cerrada');
      setStatus('disconnected');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  const getDisplayName = (id: string) => {
    const chat = chatList.find(c => c.id === id);
    return chat && chat.name ? chat.name : id.replace('@c.us', '');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Inbox</h1>
        <div className="flex items-center gap-2">
          {status !== 'connected' ? (
            <Link href="/settings/whatsapp">
              <Button variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                <ShieldAlert className="h-4 w-4 mr-2" />
                Requiere Vinculación (Ver QR)
              </Button>
            </Link>
          ) : (
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          )}
        </div>
      </div>

      <Card className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3">
        {/* Sidebar */}
        <div className="border-r bg-muted/20 flex flex-col h-full min-h-0 overflow-hidden">
          <div className="p-4 border-b bg-muted/40 font-medium z-10 shadow-sm">Chats Recientes</div>
          <div className="flex-1 overflow-y-auto">
            {chatList.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Smartphone className="h-8 w-8 mx-auto mb-2 opacity-20" />
                No hay chats activos o están cargando...
              </div>
            ) : (
              chatList.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`w-full text-left px-4 py-3 border-b text-sm transition-colors ${
                    activeChat === chat.id ? 'bg-primary/10 font-medium' : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden border border-slate-300">
                      {chat.profilePicUrl ? (
                        <img src={chat.profilePicUrl} alt={chat.name} className="h-full w-full object-cover" />
                      ) : (
                        <Phone className="h-5 w-5 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 truncate text-slate-700">
                      <div className="font-semibold">{chat.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{chat.id.replace('@c.us', '')}</div>
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="h-5 w-5 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2 flex flex-col h-full min-h-0 overflow-hidden bg-[#E5DDD5]/20">
          {activeChat ? (
            <>
              <div className="p-4 border-b bg-white flex items-center gap-3 shadow-sm z-10">
                 <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300">
                    {chatList.find(c => c.id === activeChat)?.profilePicUrl ? (
                      <img src={chatList.find(c => c.id === activeChat)?.profilePicUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <Phone className="h-5 w-5 text-slate-500" />
                    )}
                 </div>
                 <div>
                   <h3 className="font-semibold text-slate-800">{getDisplayName(activeChat)}</h3>
                   <p className="text-xs text-green-600">
                     {status === 'connected' ? 'En línea (Conectado)' : 'Desconectado'}
                   </p>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
                {loadingMessages && <div className="text-center text-sm text-muted-foreground p-4">Cargando mensajes...</div>}
                {!loadingMessages && messages.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground p-4">No hay mensajes en este chat.</div>
                )}
                {!loadingMessages && messages
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 text-sm shadow-sm ${
                          msg.from === 'me'
                            ? 'bg-[#d9fdd3] text-slate-800'
                            : 'bg-white text-slate-800'
                        }`}
                      >
                        {msg.body}
                        <div className="text-[10px] text-right mt-1 text-slate-500">
                          {formatDateTime(new Date(msg.timestamp * 1000).toISOString())}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="p-4 bg-white border-t">
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                >
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-slate-100 text-slate-900 placeholder:text-slate-500 border-none focus-visible:ring-1 focus-visible:ring-slate-300"
                  />
                  <Button type="submit" disabled={!replyText.trim()} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <Smartphone className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-700">WhatsApp Web</p>
              <p className="text-sm mt-2 max-w-sm">
                Selecciona un chat en la barra lateral o vincula tu dispositivo para empezar a enviar mensajes directamente a los clientes.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
