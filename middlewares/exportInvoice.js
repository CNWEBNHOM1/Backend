const PDFDocument = require('pdfkit');
const path = require('path');
function generateInvoicePdf(res, billData) {
    const doc = new PDFDocument();
    // doc.font('fonts/Roboto-Regular.ttf');
    doc.registerFont('Roboto-Regular', 'fonts/Roboto-Regular.ttf');
    doc.registerFont('Roboto-Bold', 'fonts/Roboto-Bold.ttf');
    doc.registerFont('Roboto-Italic', 'fonts/Roboto-Italic.ttf');
    const filename = `${billData.department}_${billData.room}_${Date.now()}_Invoice.pdf`;
    res.setHeader('Content-Type', 'application/pdf; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);
    // console.log("3");


    doc.font('Roboto-Bold').fontSize(24).fillColor('#333')
        .text('HÓA ĐƠN', { align: 'center', underline: true })
        .moveDown(0.5);


    doc.font('Roboto-Bold').fontSize(16).fillColor('#333')
        .text(`Tòa: ${billData.department}`, { align: 'left' })
        .text(`Phòng: ${billData.room}`, { align: 'left' })
        .text(`Ngày tạo: ${new Date().toLocaleDateString()}`, { align: 'left' })
        .moveDown(1);


    doc.fontSize(18).font('Roboto-Bold').fillColor('#555')
        .text('Chi tiết hóa đơn:', { underline: true })
        .moveDown(0.5);

    const details = [
        { label: 'Chỉ số điện đầu:', value: billData.sodiendau },
        { label: 'Chỉ số điện cuối:', value: billData.sodiencuoi },
        { label: 'Đơn giá điện:', value: `${billData.dongia} VNĐ` },
        { label: 'Thành tiền:', value: `${billData.thanhtien} VNĐ` },
        { label: 'Hạn đóng:', value: new Date(billData.handong).toLocaleDateString() },
        { label: 'Trạng thái:', value: billData.trangthai },
    ];

    details.forEach(detail => {
        doc.font('Roboto-Bold').fontSize(14).fillColor('#333')
            .text(detail.label, { continued: true })
            .font('Roboto-Regular').fillColor('#000').text(detail.value, { align: 'right' });
    });


    doc.moveDown(2);

    doc.end();
}


module.exports = generateInvoicePdf;
