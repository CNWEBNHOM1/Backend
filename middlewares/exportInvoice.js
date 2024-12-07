const PDFDocument = require('pdfkit');

function generateInvoicePdf(res, billData) {
    const doc = new PDFDocument({ margin: 50 });
    doc.registerFont('Roboto-Regular', 'fonts/Roboto-Regular.ttf');
    doc.registerFont('Roboto-Bold', 'fonts/Roboto-Bold.ttf');
    doc.registerFont('Roboto-Italic', 'fonts/Roboto-Italic.ttf');

    const filename = `${billData.department}_${billData.room}_${Date.now()}_Invoice.pdf`;
    res.setHeader('Content-Type', 'application/pdf; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.font('Roboto-Bold')
        .fontSize(20)
        .text('HÓA ĐƠN TIỀN PHÒNG KÝ TÚC XÁ', { align: 'center' })
        .moveDown(1);

    doc.fontSize(14)
        .text(`Tòa: ${billData.department}`)
        .text(`Phòng: ${billData.room}`)
        .text(`Ngày tạo: ${new Date().toLocaleDateString()}`)
        .moveDown(1);

    doc.font('Roboto-Bold')
        .fontSize(16)
        .text('Chi tiết hóa đơn:', { underline: true })
        .moveDown(0.5);

    const details = [
        { label: 'Chỉ số điện đầu:', value: billData.sodiendau },
        { label: 'Chỉ số điện cuối:', value: billData.sodiencuoi },
        { label: 'Đơn giá điện:', value: `${billData.dongia.toLocaleString()} VNĐ` },
        { label: 'Thành tiền:', value: `${billData.thanhtien.toLocaleString()} VNĐ` },
        { label: 'Hạn đóng:', value: new Date(billData.handong).toLocaleDateString() },
        { label: 'Trạng thái:', value: billData.trangthai },
    ];

    const detailStartY = doc.y;
    details.forEach((detail, index) => {
        const yPosition = detailStartY + index * 20;
        doc.font('Roboto-Regular')
            .fontSize(14)
            .text(detail.label, 50, yPosition)
            .text(detail.value, 300, yPosition, { align: 'right' });
    });

    doc.moveDown(2)
        .font('Roboto-Italic')
        .fontSize(10)
        .text('Cảm ơn bạn đã tuân thủ quy định và đóng phí đúng hạn!', { align: 'center' });

    doc.end();
}

module.exports = generateInvoicePdf;
