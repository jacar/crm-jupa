import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generateQuotePdf(quote: any): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `quote-${quote.number}.pdf`;
        const uploadsDir = path.join(process.cwd(), 'uploads');
        const filePath = path.join(uploadsDir, fileName);
        
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fillColor('#0c0c0c').fontSize(24).text('COTIZACIÓN', { align: 'right' });
        doc.fontSize(10).text(`Cotización #: ${quote.number}`, { align: 'right' });
        doc.text(`Fecha: ${new Date(quote.createdAt).toLocaleDateString()}`, { align: 'right' });
        
        doc.moveDown();

        // Company Details (JUPA)
        doc.fontSize(12).text('JUPA Arquitectura', 50, 100);
        doc.fontSize(10).text('contacto@jupaarquitectura.com');
        doc.text('https://jupaarquitectura.com');

        // Client Details
        doc.moveDown();
        doc.fontSize(12).text('Preparado para:', 50, 160);
        if (quote.contact) {
          doc.fontSize(10).text(`${quote.contact.firstName} ${quote.contact.lastName}`);
          if (quote.contact.email) doc.text(quote.contact.email);
        } else if (quote.company) {
          doc.fontSize(10).text(quote.company.name);
        }

        doc.moveDown(2);

        // Items Table Header
        const tableTop = 250;
        doc.font('Helvetica-Bold');
        doc.text('Item', 50, tableTop);
        doc.text('Cantidad', 250, tableTop);
        doc.text('Precio Unit.', 350, tableTop);
        doc.text('Total', 450, tableTop);
        
        doc.moveTo(50, tableTop + 15).lineTo(500, tableTop + 15).stroke();
        doc.font('Helvetica');

        // Items
        let y = tableTop + 25;
        for (const item of (quote.items || [])) {
          doc.text(item.material?.name || 'Item', 50, y);
          doc.text(item.quantity.toString(), 250, y);
          doc.text(`$${Number(item.unitPrice).toFixed(2)}`, 350, y);
          doc.text(`$${Number(item.total).toFixed(2)}`, 450, y);
          y += 20;
        }

        doc.moveTo(50, y + 10).lineTo(500, y + 10).stroke();

        // Totals
        y += 20;
        doc.text('Subtotal:', 350, y);
        doc.text(`$${Number(quote.subtotal).toFixed(2)}`, 450, y);
        y += 20;
        doc.text('Impuestos:', 350, y);
        doc.text(`$${Number(quote.tax).toFixed(2)}`, 450, y);
        y += 20;
        doc.font('Helvetica-Bold');
        doc.text('Total:', 350, y);
        doc.text(`$${Number(quote.total).toFixed(2)}`, 450, y);

        // Footer
        doc.font('Helvetica');
        doc.fontSize(10);
        if (quote.notes) {
          doc.moveDown(2);
          doc.text('Notas:', 50);
          doc.text(quote.notes);
        }

        doc.end();

        stream.on('finish', () => {
          resolve(filePath);
        });

      } catch (error) {
        this.logger.error('Error generating PDF', error);
        reject(error);
      }
    });
  }
}
