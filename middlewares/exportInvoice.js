const PDFDocument = require('pdfkit');
const moment = require('moment');

function generateInvoicePdf(res, billData) {
    const doc = new PDFDocument({ margin: 50 });
    doc.registerFont('Roboto-Regular', 'fonts/Roboto-Regular.ttf');
    doc.registerFont('Roboto-Bold', 'fonts/Roboto-Bold.ttf');
    doc.registerFont('Roboto-Italic', 'fonts/Roboto-Italic.ttf');

    const line = '--------------------------------------------------------------------------------------------';
    const filename = `${billData.department}_${billData.room}_${Date.now()}_Invoice.pdf`;
    res.setHeader('Content-Type', 'application/pdf; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const labelWidth = 200;
    const valueStartX = labelWidth + 100;
    doc.pipe(res);

    doc.font('Roboto-Bold')
        .fontSize(20)
        .text('HÓA ĐƠN TIỀN PHÒNG KÝ TÚC XÁ', { align: 'center' })



    const currentDate = moment().format('DD/MM/YYYY');
    const day = moment().format('DD');
    const month = moment().format('MM');
    const year = moment().format('YYYY');
    const dueDate = moment(billData.handong).format('DD/MM/YYYY');

    doc.font('Roboto-Italic')
        .fontSize(12)
        .text(`Ngày ${day} tháng ${month} năm ${year}`, 50, 100, { align: 'center' })
        .moveDown(1);

    doc.fontSize(5)
        .text(`${line + line + line + line}`, { align: 'center' });

    doc.fontSize(14).font('Roboto-Bold')
        .text(`Đơn vị bán hàng:`, 50).font('Roboto-Italic')
        .text(`Nhóm 1 công nghệ Web`, valueStartX, doc.y - 14, { align: 'right' })

    doc.font('Roboto-Bold').text(`Mã số thuế:`, 50)
        .font('Roboto-Italic')
        .text(`01234561232`, valueStartX, doc.y - 14, { align: 'right' })


    doc.font('Roboto-Bold').text(`Địa chỉ:`, 50)
        .font('Roboto-Italic')
        .text(`DHBKHN`, valueStartX, doc.y - 14, { align: 'right' })


    doc.font('Roboto-Bold').text(`Số tài khoản:`, 50)
        .font('Roboto-Italic')
        .text(`021439214`, 300, y = doc.y - 14, { align: 'right' })


    doc.font('Roboto-Bold').text(`Điện thoại:`, 50)
        .font('Roboto-Italic')
        .text(`+84 394 305 264`, valueStartX, doc.y - 14, { align: 'right' })
    // valueStartX = 0;
    doc.moveDown(1).fontSize(5)
        .text(`${line + line + line + line}`, 50);


    // doc.moveDown(2)
    //     .fontSize(20)
    //     .text(`${line}`, { align: 'center' })
    doc.font('Roboto-Bold')
        .fontSize(16)
        .text('Chi tiết hóa đơn:', { underline: false, align: 'center' })
        .moveDown(0.5);

    const details = [
        { label: 'Chỉ số điện đầu:', value: billData.sodiendau },
        { label: 'Chỉ số điện cuối:', value: billData.sodiencuoi },
        { label: 'Đơn giá điện:', value: `${billData.dongia.toLocaleString()} VNĐ` },
        { label: 'Thành tiền:', value: `${billData.thanhtien.toLocaleString()} VNĐ` },
        { label: 'Hạn đóng:', value: dueDate },
        { label: 'Trạng thái:', value: billData.trangthai },
        // { label: 'Giá trang bị:', value: billData.giatrangbi },
        // { label: 'Tiền ở:', value: billData.tieno },
        // { label: 'Tiền nước', value: billData.tiennuoc }
    ];
    // console.log(details);
    doc.fontSize(15)
        .text(`Phòng: ${billData.department}-${billData.room}`).moveDown(1);
    // .text(`Phòng: ${billData.room}`)
    // .text(`Ngày tạo: ${currentDate}`)

    const detailStartY = doc.y;
    details.forEach((detail, index) => {
        const yPosition = detailStartY + index * 20;
        doc.font('Roboto-Bold')
            .fontSize(14)
            .text(detail.label, 50, yPosition).font('Roboto-Italic')
            .text(detail.value, 300, yPosition, { align: 'right' });
    });
    doc.moveDown(1).fontSize(5)
        .text(`${line + line + line + line}`, 50);
    doc.moveDown(4);


    doc.fontSize(14)
        .font('Roboto-Bold')
        .text('Người mua hàng', 50, doc.y + 20)
        .text('Người bán hàng', 300, doc.y - 14, { align: 'right' })
        .moveDown(4)
    doc.moveDown(2)
        .font('Roboto-Italic')
        .fontSize(10)
        .text('Cần kiểm tra đối chiếu khi lập, giao, nhận hóa đơn.', 50, doc.page.height - 80, { align: 'center' });

    doc.end();
}

module.exports = generateInvoicePdf;
