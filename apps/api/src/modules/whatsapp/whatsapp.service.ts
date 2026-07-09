import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { WhatsappGateway } from './whatsapp.gateway';

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private readonly logger = new Logger(WhatsappService.name);
  public qrCode: string | null = null;
  public status: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

  constructor(private readonly gateway: WhatsappGateway) {}

  onModuleInit() {
    this.initialize();
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.destroy();
    }
  }

  private initialize() {
    this.logger.log('Inicializando cliente de WhatsApp...');
    this.status = 'connecting';
    this.gateway.emitStatus(this.status);

    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: './whatsapp-session' }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
        executablePath: process.env.NODE_ENV === 'production' ? '/usr/bin/chromium-browser' : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      },
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1042790212-alpha.html',
      }
    });

    this.client.on('qr', (qr) => {
      this.logger.log('QR Code recibido, esperando escaneo...');
      this.qrCode = qr;
      this.status = 'disconnected';
      this.gateway.emitQr(qr);
      this.gateway.emitStatus(this.status);
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      this.logger.log('WhatsApp Web está listo!');
      this.qrCode = null;
      this.status = 'connected';
      this.gateway.emitStatus(this.status);
    });

    this.client.on('authenticated', () => {
      this.logger.log('WhatsApp Autenticado exitosamente');
      this.qrCode = null;
      this.status = 'connected';
      this.gateway.emitStatus(this.status);
    });

    this.client.on('auth_failure', (msg) => {
      this.logger.error('Fallo de autenticación en WhatsApp', msg);
      this.status = 'disconnected';
      this.gateway.emitStatus(this.status);
    });

    this.client.on('disconnected', (reason) => {
      this.logger.warn('WhatsApp desconectado', reason);
      this.status = 'disconnected';
      this.qrCode = null;
      this.gateway.emitStatus(this.status);
      this.initialize(); // Re-inicializar para generar nuevo QR
    });

    this.client.on('message', (msg) => {
      this.logger.log(`Mensaje recibido de ${msg.from}: ${msg.body}`);
      this.gateway.emitMessage({
        id: msg.id._serialized,
        from: msg.from,
        body: msg.body,
        timestamp: msg.timestamp,
      });
    });

    this.client.initialize().catch((err) => {
      this.logger.error('Error al inicializar el cliente de WhatsApp', err);
    });
  }

  public getStatus() {
    return { status: this.status, qr: this.qrCode };
  }

  public async sendMessage(to: string, message: string) {
    if (this.status !== 'connected') {
      throw new Error('WhatsApp no está conectado');
    }
    // Formatear el número si es necesario
    const chatId = to.includes('@') ? to : `${to.replace(/[^0-9]/g, '')}@c.us`;
    await this.client.sendMessage(chatId, message);
    return { success: true };
  }

  public async getChats() {
    if (this.status !== 'connected' || !this.client) return [];
    try {
      const chats = await this.client.getChats();
      
      // Tomamos los primeros 40 chats para no sobrecargar de peticiones
      const recentChats = chats.slice(0, 40);
      
      const enrichedChats = await Promise.all(recentChats.map(async (chat) => {
        let profilePicUrl = null;
        let finalName = chat.name || chat.id.user;
        
        try {
          const contact = await chat.getContact();
          if (contact) {
            profilePicUrl = await contact.getProfilePicUrl().catch(() => null);
            finalName = contact.name || contact.pushname || chat.name || chat.id.user;
          }
        } catch (error) {
          // Si falla al obtener el contacto, ignoramos y usamos fallback
        }
        
        return {
          id: chat.id._serialized,
          name: finalName,
          profilePicUrl: profilePicUrl,
          timestamp: chat.timestamp,
          unreadCount: chat.unreadCount,
        };
      }));
      
      return enrichedChats;
    } catch (e) {
      this.logger.error('Error al obtener chats', e);
      return [];
    }
  }

  public async getMessages(chatId: string) {
    if (this.status !== 'connected' || !this.client) return [];
    try {
      const chat = await this.client.getChatById(chatId);
      const messages = await chat.fetchMessages({ limit: 50 });
      return messages.map(msg => ({
        id: msg.id._serialized,
        from: msg.fromMe ? 'me' : msg.from,
        body: msg.body,
        timestamp: msg.timestamp,
      }));
    } catch (e) {
      this.logger.error('Error al obtener mensajes', e);
      return [];
    }
  }

  public async logout() {
    if (this.client) {
      await this.client.logout();
      this.status = 'disconnected';
      this.qrCode = null;
      this.gateway.emitStatus(this.status);
    }
  }
}
