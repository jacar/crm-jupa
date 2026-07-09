import { Controller, Get, Post, Body, HttpException, HttpStatus, Param } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('whatsapp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('status')
  @ApiOperation({ summary: 'Obtener el estado de la conexión de WhatsApp y el QR actual' })
  getStatus() {
    return this.whatsappService.getStatus();
  }

  @Get('chats')
  @ApiOperation({ summary: 'Obtener todos los chats activos' })
  async getChats() {
    return await this.whatsappService.getChats();
  }

  @Get('chats/:id/messages')
  @ApiOperation({ summary: 'Obtener mensajes de un chat específico' })
  async getMessages(@Param('id') id: string) {
    return await this.whatsappService.getMessages(id);
  }

  @Get('chats/:id/profile-pic')
  @ApiOperation({ summary: 'Obtener foto de perfil de un chat específico' })
  async getProfilePic(@Param('id') id: string) {
    const url = await this.whatsappService.getProfilePicUrl(id);
    return { url };
  }

  @Post('send')
  @ApiOperation({ summary: 'Enviar un mensaje a un número de WhatsApp' })
  async sendMessage(@Body() body: { to: string; message: string }) {
    if (!body.to || !body.message) {
      throw new HttpException('Faltan parámetros (to, message)', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.whatsappService.sendMessage(body.to, body.message);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw new HttpException(error.message || 'Error desconocido al enviar mensaje', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('send-media')
  @ApiOperation({ summary: 'Enviar archivo multimedia a un número de WhatsApp' })
  async sendMedia(@Body() body: { to: string; filePath: string; caption?: string }) {
    if (!body.to || !body.filePath) {
      throw new HttpException('Faltan parámetros (to, filePath)', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.whatsappService.sendMedia(body.to, body.filePath, body.caption);
    } catch (error) {
      console.error('Error in sendMedia:', error);
      throw new HttpException(error.message || 'Error desconocido al enviar archivo', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión de WhatsApp' })
  async logout() {
    await this.whatsappService.logout();
    return { success: true };
  }
}
