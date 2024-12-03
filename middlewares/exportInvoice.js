const PDFDocument = require('pdfkit');
const path = require('path');
function generateInvoicePdf(res, billData) {
    const doc = new PDFDocument();
    doc.font('fonts/Roboto-Regular.ttf');
    const filename = `${billData.department}_${billData.room}_${Date.now()}_Invoice.pdf`;
    res.setHeader('Content-Type', 'application/pdf; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);
    // console.log("3");
    doc.fontSize(20).text('Hóa đơn', { align: 'left' });
    doc.moveDown();

    doc.fontSize(14)
        .text(`Tòa: ${billData.department}`, { align: 'left' })
        .text(`Phòng: ${billData.room}`)
        .text(`Ngày tạo: ${new Date().toLocaleDateString()}`)
        .moveDown();

    doc.text(`Chỉ số điện đầu: ${billData.sodiendau}`);
    doc.text(`Chỉ số điện cuối: ${billData.sodiencuoi}`);
    doc.text(`Đơn giá điện: ${billData.dongia} VNĐ`);
    doc.text(`Thành tiền: ${billData.thanhtien} VNĐ`);
    doc.text(`Hạn đóng: ${new Date(billData.handong).toLocaleDateString()}`);
    doc.text(`Trạng thái: ${billData.trangthai}`);
    doc.moveDown();
    // console.log("4");

    doc.end();
}

module.exports = generateInvoicePdf;
