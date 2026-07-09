import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, jidNormalizedUser } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as qrcode from 'qrcode-terminal';
import { WhatsappGateway } from './whatsapp.gateway';
import * as fs from 'fs';
import pino from 'pino';

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
  private sock: any;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private myChats: Map<string, any> = new Map();
  private myMessages: Map<string, any[]> = new Map();
  private readonly logger = new Logger(WhatsappService.name);
  public qrCode: string | null = null;
  public status: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

  constructor(private readonly gateway: WhatsappGateway) {}

  async onModuleInit() {
    await this.initialize();
  }

  async onModuleDestroy() {
    if (this.sock) {
      this.sock.end(undefined);
    }
  }

  private async initialize() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Clear old socket listeners if they exist to prevent memory leaks and overlapping events
    if (this.sock) {
      this.sock.ev.removeAllListeners('connection.update');
      this.sock.ev.removeAllListeners('creds.update');
      this.sock.ev.removeAllListeners('messaging-history.set');
      this.sock.ev.removeAllListeners('chats.upsert');
      this.sock.ev.removeAllListeners('messages.upsert');
    }

    this.logger.log('Inicializando cliente de WhatsApp (Baileys)...');
    this.status = 'connecting';
    this.gateway.emitStatus(this.status);

    const { state, saveCreds } = await useMultiFileAuthState('./whatsapp-session-baileys');
    const { version, isLatest } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }) as any,
      printQRInTerminal: false,
      auth: state,
      generateHighQualityLinkPreview: true,
      browser: ['JUPA Arquitectura', 'Chrome', '1.0.0'],
    });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('connection.update', (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.logger.log('QR Code recibido, esperando escaneo...');
        this.qrCode = qr;
        this.status = 'disconnected';
        this.gateway.emitQr(qr);
        this.gateway.emitStatus(this.status);
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        this.logger.warn(`Conexión cerrada, reconectando: ${shouldReconnect}`);
        this.status = 'disconnected';
        this.qrCode = null;
        this.gateway.emitStatus(this.status);
        
        if (shouldReconnect) {
          if (!this.reconnectTimer) {
            this.reconnectTimer = setTimeout(() => this.initialize(), 2000);
          }
        } else {
          // Si fue loggedOut, borrar sesión y reiniciar
          try { fs.rmSync('./whatsapp-session-baileys', { recursive: true, force: true }); } catch (e) {}
          if (!this.reconnectTimer) {
            this.reconnectTimer = setTimeout(() => this.initialize(), 2000);
          }
        }
      } else if (connection === 'open') {
        this.logger.log('WhatsApp Autenticado exitosamente (Baileys)');
        this.qrCode = null;
        this.status = 'connected';
        this.gateway.emitStatus(this.status);
      }
    });

    this.sock.ev.on('messaging-history.set', (history: any) => {
      if (history.chats) {
        for (const chat of history.chats) {
          this.myChats.set(chat.id, chat);
        }
      }
      if (history.messages) {
        for (const msg of history.messages) {
          const chatId = msg.key.remoteJid;
          if (!this.myMessages.has(chatId)) this.myMessages.set(chatId, []);
          this.myMessages.get(chatId)!.push(msg);
        }
      }
      this.logger.log(`History synced: ${history.chats?.length || 0} chats`);
    });

    this.sock.ev.on('chats.upsert', (newChats: any) => {
      for (const chat of newChats) {
        if (this.myChats.has(chat.id)) {
           this.myChats.set(chat.id, { ...this.myChats.get(chat.id), ...chat });
        } else {
           this.myChats.set(chat.id, chat);
        }
      }
    });

    this.sock.ev.on('messages.upsert', async (m: any) => {
      if (m.type !== 'notify') return;
      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const from = msg.key.remoteJid;
      const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      const ts = Number(msg.messageTimestamp) || Math.floor(Date.now() / 1000);
      
      if (!this.myMessages.has(from)) this.myMessages.set(from, []);
      this.myMessages.get(from)!.push(msg);

      this.logger.log(`Mensaje recibido de ${from}: ${body}`);
      this.gateway.emitMessage({
        id: msg.key.id,
        from: from,
        body: body,
        timestamp: ts,
      });

      // Auto-reply logic
      const text = body.toLowerCase();
      if (text.includes('cotización') || text.includes('cotizacion') || text.includes('información') || text.includes('informacion')) {
        const replyText = "Hola, gracias por contactarnos. Para poder generarte una cotización precisa, por favor indícanos tu nombre, correo y una breve descripción de tu proyecto o los materiales que necesitas. ¡En breve un asesor de Jupa Arquitectura te atenderá!";
        try {
          await this.sock.sendMessage(from, { text: replyText });
          this.logger.log(`Auto-respuesta enviada a ${from}`);
        } catch (e) {
          this.logger.error(`Error enviando auto-respuesta a ${from}`, e);
        }
      }
    });
  }

  public getStatus() {
    return { status: this.status, qr: this.qrCode };
  }

  public async sendMessage(to: string, message: string) {
    if (this.status !== 'connected') throw new Error('WhatsApp no está conectado');
    
    await this.sock.sendMessage(to, { text: message });
    return { success: true };
  }

  public async sendMedia(to: string, filePath: string, caption?: string) {
    if (this.status !== 'connected') throw new Error('WhatsApp no está conectado');
    
    const chatId = to.includes('@s.whatsapp.net') ? to : `${to.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    const buffer = fs.readFileSync(filePath);
    await this.sock.sendMessage(chatId, { 
        document: buffer, 
        mimetype: 'application/octet-stream', // Adjust dynamically if needed
        fileName: filePath.split('/').pop() || 'file',
        caption 
    });
    return { success: true };
  }

  public async getChats() {
    if (this.status !== 'connected' || !this.sock) return [];
    try {
      const chatsArray = Array.from(this.myChats.values());
      const recentChats = chatsArray.sort((a, b) => (b.conversationTimestamp || 0) - (a.conversationTimestamp || 0)).slice(0, 40);
      
      const enrichedChats = recentChats.map((chat: any) => {
        const finalName = chat.name || chat.id.split('@')[0];
        const ts = Number(chat.conversationTimestamp) || Math.floor(Date.now() / 1000);
        return {
          id: chat.id,
          name: finalName,
          profilePicUrl: null,
          timestamp: ts,
          unreadCount: chat.unreadCount || 0,
        };
      });
      
      return enrichedChats;
    } catch (e) {
      this.logger.error('Error al obtener chats', e);
      return [];
    }
  }

  public async getMessages(chatId: string) {
    if (this.status !== 'connected' || !this.sock) return [];
    try {
      const baileysChatId = chatId.replace('@c.us', '@s.whatsapp.net');
      const messages = this.myMessages.get(baileysChatId) || [];
      
      return messages.map((msg: any) => {
        const ts = Number(msg.messageTimestamp) || Math.floor(Date.now() / 1000);
        return {
          id: msg.key.id,
          from: msg.key.fromMe ? 'me' : msg.key.remoteJid,
          body: msg.message?.conversation || msg.message?.extendedTextMessage?.text || '',
          timestamp: ts,
        };
      });
    } catch (e) {
      this.logger.error('Error al obtener mensajes', e);
      return [];
    }
  }

  public async getProfilePicUrl(chatId: string): Promise<string | null> {
    if (this.status !== 'connected' || !this.sock) return null;
    try {
      const baileysChatId = chatId.replace('@c.us', '@s.whatsapp.net');
      const url = await this.sock.profilePictureUrl(baileysChatId, 'image');
      return url || null;
    } catch (e) {
      return null;
    }
  }

  public async logout() {
    if (this.sock) {
      try {
        await this.sock.logout();
      } catch(e) {}

      this.status = 'disconnected';
      this.qrCode = null;
      this.gateway.emitStatus(this.status);
      
      try { fs.rmSync('./whatsapp-session-baileys', { recursive: true, force: true }); } catch (e) {}

      setTimeout(() => {
        this.initialize();
      }, 3000);
    }
  }
}
