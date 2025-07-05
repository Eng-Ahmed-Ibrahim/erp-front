import jsPDF from 'jspdf';
import moment from 'moment';
import 'moment/locale/ar';

// Import the Amiri font
import './../../fonts/Amiri-Regular-normal.js';

moment.locale('ar');

class BookingTicketPDF {
  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Set the font to Amiri for Arabic support
    this.doc.setFont('Amiri-Regular', 'normal');

    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 15;
    this.currentY = this.margin;

    // Refined color palette
    this.primaryColor = [128, 61, 59]; // #803D3B
    this.secondaryColor = [248, 250, 252]; // Very light gray
    this.accentColor = [16, 185, 129]; // Emerald
    this.textColor = [15, 23, 42]; // Dark slate
    this.mutedTextColor = [71, 85, 105]; // Muted slate
    this.borderColor = [226, 232, 240]; // Light border
    this.highlightBg = [254, 252, 232]; // Light yellow
  }

  // Compact elegant header
  addHeader() {
    const headerHeight = 35;

    // Header background with gradient effect
    this.doc.setFillColor(...this.primaryColor);
    this.doc.rect(0, 0, this.pageWidth, headerHeight, 'F');

    // Elegant decoration line
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(0, headerHeight - 1, this.pageWidth, 1, 'F');

    // Main title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.text('تذكرة حجز فندقي', this.pageWidth / 2, 18, {
      align: 'center',
    });

    // Subtitle
    this.doc.setFontSize(12);
    this.doc.text('مصيف ضباط المشاة بفايد', this.pageWidth / 2, 28, {
      align: 'center',
    });

    this.currentY = headerHeight + 8;
  }

  // Compact section header
  addSection(title, showBorder = true) {
    this.currentY += 6;

    if (showBorder) {
      // Right accent line
      this.doc.setFillColor(...this.primaryColor);
      this.doc.rect(
        this.pageWidth - this.margin - 2,
        this.currentY - 4,
        2,
        10,
        'F'
      );
    }

    // Section title - right aligned
    this.doc.setFontSize(13);
    this.doc.setTextColor(...this.primaryColor);
    this.doc.setFont('Amiri-Regular', 'normal');
    this.doc.text(title, this.pageWidth - this.margin - 8, this.currentY + 1, {
      align: 'right',
    });

    this.currentY += 10;
  }

  // Compact info row with minimal spacing
  addInfoRow(label, value, isImportant = false) {
    const labelX = this.pageWidth - this.margin - 5;
    const valueX = this.pageWidth - this.margin - 60; // Reduced spacing between key and value

    this.doc.setTextColor(...this.textColor);
    this.doc.setFont('Amiri-Regular', 'normal');

    // Label
    this.doc.setFontSize(10);
    this.doc.text(label + ':', labelX, this.currentY, {
      align: 'right',
    });

    // Value
    this.doc.setFontSize(10);
    this.doc.setTextColor(
      ...(isImportant ? this.primaryColor : this.mutedTextColor)
    );
    const displayValue = value || 'غير محدد';
    this.doc.text(String(displayValue), valueX, this.currentY, {
      align: 'right',
    });

    this.currentY += 6; // Reduced spacing
  }

  // Two-column compact layout
  addInfoPair(leftLabel, leftValue, rightLabel, rightValue, highlight = false) {
    const rightLabelX = this.pageWidth - this.margin - 5;
    const rightValueX = this.pageWidth - this.margin - 60; // Reduced spacing
    const leftLabelX = this.pageWidth / 2 - 5;
    const leftValueX = this.pageWidth / 2 - 50; // Reduced spacing to prevent overlap

    this.doc.setTextColor(...this.textColor);
    this.doc.setFont('Amiri-Regular', 'normal');
    this.doc.setFontSize(10);

    // Right column
    this.doc.text(rightLabel + ':', rightLabelX, this.currentY, {
      align: 'right',
    });
    this.doc.setTextColor(
      ...(highlight ? this.primaryColor : this.mutedTextColor)
    );
    this.doc.text(
      String(rightValue || 'غير محدد'),
      rightValueX,
      this.currentY,
      { align: 'right' }
    );

    // Left column
    this.doc.setTextColor(...this.textColor);
    this.doc.text(leftLabel + ':', leftLabelX, this.currentY, {
      align: 'right',
    });
    this.doc.setTextColor(
      ...(highlight ? this.primaryColor : this.mutedTextColor)
    );
    this.doc.text(String(leftValue || 'غير محدد'), leftValueX, this.currentY, {
      align: 'right',
    });

    this.currentY += 6; // Reduced spacing
  }

  // Compact financial table
  addFinancialTable(financialData) {
    const tableY = this.currentY;
    const tableWidth = this.pageWidth - 2 * this.margin;
    const rowHeight = 8;

    let currentRow = 0;

    // Table header
    this.doc.setFillColor(...this.primaryColor);
    this.doc.rect(this.margin, tableY, tableWidth, rowHeight + 2, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(11);
    this.doc.text('البند', this.pageWidth - this.margin - 10, tableY + 7, {
      align: 'right',
    });
    this.doc.text('المبلغ', this.margin + 40, tableY + 7, { align: 'left' });

    currentRow = 1.2;

    const addFinancialRow = (label, amount, isTotal = false) => {
      const y = tableY + currentRow * rowHeight;

      // Row background
      if (isTotal) {
        this.doc.setFillColor(240, 253, 244); // Light green
      } else if (currentRow % 2 === 0) {
        this.doc.setFillColor(...this.secondaryColor);
      } else {
        this.doc.setFillColor(255, 255, 255);
      }
      this.doc.rect(this.margin, y, tableWidth, rowHeight, 'F');

      // Row border
      this.doc.setDrawColor(...this.borderColor);
      this.doc.setLineWidth(0.2);
      this.doc.rect(this.margin, y, tableWidth, rowHeight);

      // Text
      this.doc.setFontSize(isTotal ? 11 : 10);
      this.doc.setFont('Amiri-Regular', 'normal');
      this.doc.setTextColor(...(isTotal ? this.primaryColor : this.textColor));

      // Label
      this.doc.text(label || '', this.pageWidth - this.margin - 10, y + 5.5, {
        align: 'right',
      });

      // Amount
      const numAmount = Number(amount) || 0;
      const formattedAmount = `${numAmount.toLocaleString()} ج.م`;
      this.doc.setTextColor(
        ...(isTotal ? this.accentColor : this.mutedTextColor)
      );
      this.doc.text(formattedAmount, this.margin + 40, y + 5.5, {
        align: 'left',
      });

      currentRow++;
    };

    // Financial breakdown
    const {
      totalAmount = 0,
      productsTotal = 0,
      discountAmount = 0,
      depositAmount = 0,
    } = financialData;

    const accommodationCost = totalAmount - productsTotal;
    const finalTotal = totalAmount - discountAmount;
    const remainingAmount = finalTotal - depositAmount;

    if (accommodationCost > 0) {
      addFinancialRow('تكلفة الإقامة', accommodationCost);
    }
    if (productsTotal > 0) {
      addFinancialRow('الخدمات الإضافية', productsTotal);
    }
    if (discountAmount > 0) {
      addFinancialRow('الخصم', discountAmount);
    }
    if (depositAmount > 0) {
      addFinancialRow('المبلغ المدفوع', depositAmount);
    }

    // Separator
    currentRow += 0.2;
    const separatorY = tableY + currentRow * rowHeight;
    this.doc.setDrawColor(...this.primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(
      this.margin + 5,
      separatorY,
      this.pageWidth - this.margin - 5,
      separatorY
    );
    currentRow += 0.3;

    // Totals
     ('إجمالي المبلغ', finalTotal, true);
    if (remainingAmount > 0) {
      addFinancialRow('المبلغ المتبقي', remainingAmount, true);
    }

    // Final border
    this.doc.setDrawColor(...this.primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, tableY, tableWidth, currentRow * rowHeight);

    this.currentY = tableY + currentRow * rowHeight + 8;
  }

  // Compact instructions
  addInstructions() {
    this.addSection('تعليمات هامة');

    // Compact instruction box
    const boxY = this.currentY;
    const boxHeight = 24;

    this.doc.setFillColor(254, 249, 195); // Light yellow
    this.doc.rect(
      this.margin,
      boxY,
      this.pageWidth - 2 * this.margin,
      boxHeight,
      'F'
    );

    this.doc.setDrawColor(245, 158, 11); // Amber border
    this.doc.setLineWidth(0.5);
    this.doc.rect(
      this.margin,
      boxY,
      this.pageWidth - 2 * this.margin,
      boxHeight
    );

    // Warning strip
    this.doc.setFillColor(245, 158, 11);
    this.doc.rect(this.margin, boxY, 3, boxHeight, 'F');

    // Instructions
    this.doc.setFontSize(9);
    this.doc.setTextColor(...this.textColor);
    this.doc.setFont('Amiri-Regular', 'normal');

    const instructions = [
      '• يرجى الاحتفاظ بهذه التذكرة طوال فترة الإقامة',
      '• يجب إبراز التذكرة عند الوصول والمغادرة',
      '• في حالة فقدان التذكرة يرجى مراجعة الاستقبال',
      '• يرجى مراجعة الاستقبال قبل المغادرة بـ 30 دقيقة',
    ];

    instructions.forEach((instruction, index) => {
      this.doc.text(
        instruction,
        this.pageWidth - this.margin - 8,
        boxY + 6 + index * 5,
        {
          align: 'right',
        }
      );
    });

    this.currentY = boxY + boxHeight + 8;
  }

  // Minimal footer
  addFooter() {
    const footerY = this.pageHeight - 25;

    // Simple divider
    this.doc.setDrawColor(...this.borderColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY);

    // Footer text
    this.doc.setTextColor(...this.primaryColor);
    this.doc.setFontSize(11);
    this.doc.setFont('Amiri-Regular', 'normal');
    this.doc.text('نتمنى لكم إقامة سعيدة', this.pageWidth / 2, footerY + 8, {
      align: 'center',
    });

    this.doc.setFontSize(9);
    this.doc.setTextColor(...this.mutedTextColor);
    const issueDate = `تاريخ الإصدار: ${moment().format('DD/MM/YYYY HH:mm')}`;
    this.doc.text(issueDate, this.pageWidth / 2, footerY + 15, {
      align: 'center',
    });
  }

  generateTicket(bookingData) {
    try {
      // Header
      this.addHeader();

      // Guest Information
      this.addSection('بيانات النزيل');
      this.addInfoRow('اسم النزيل', bookingData.visitor?.name, true);
      this.addInfoPair(
        'نوع العميل',
        bookingData.visitor?.client_type?.name,
        'رقم الهاتف',
        bookingData.visitor?.phone
      );

      // Accommodation Information
      this.addSection('بيانات الإقامة');
      this.addInfoPair(
        'نوع الغرفة',
        bookingData.apartment?.room_type,
        'رقم الغرفة',
        bookingData.apartment?.apartment_number,
        true
      );
      this.addInfoRow('المبنى', bookingData.apartment?.building?.name, true);

      // Stay Duration
      this.addSection('مواعيد الإقامة');
      this.addInfoPair(
        'تاريخ المغادرة',
        moment(bookingData.checkout_datetime).format('DD/MM/YYYY'),
        'تاريخ الوصول',
        moment(bookingData.arrival_datetime).format('DD/MM/YYYY'),
        true
      );
      this.addInfoPair(
        'وقت المغادرة',
        moment(bookingData.checkout_datetime).format('HH:mm'),
        'وقت الوصول',
        moment(bookingData.arrival_datetime).format('HH:mm')
      );
      this.addInfoRow(
        'مدة الإقامة',
        `${bookingData.duration_days || 1} يوم`,
        true
      );

      // Financial Summary
      this.addSection('الملخص المالي');
      this.addFinancialTable({
        totalAmount: Number(bookingData.total_amount || 0),
        productsTotal: Number(bookingData.products_total || 0),
        discountAmount: Number(bookingData.checkout_discount_amount || 0),
        depositAmount: Number(bookingData.deposit_amount || 0),
      });

      // Status
      this.doc.setFillColor(...this.accentColor);
      this.doc.rect(
        this.margin,
        this.currentY,
        this.pageWidth - 2 * this.margin,
        8,
        'F'
      );
      this.doc.setFontSize(11);
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFont('Amiri-Regular', 'normal');
      const status = `حالة الحجز: ${bookingData.status_text || 'مؤكد'} ✓`;
      this.doc.text(status, this.pageWidth / 2, this.currentY + 5.5, {
        align: 'center',
      });
      this.currentY += 12;

      // Instructions
      this.addInstructions();

      // Footer
      this.addFooter();

      return this.doc;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
}

// Export both the class and the convenience function
export { BookingTicketPDF };

export function generateBookingTicket(bookingData) {
  const ticket = new BookingTicketPDF();
  return ticket.generateTicket(bookingData);
}
