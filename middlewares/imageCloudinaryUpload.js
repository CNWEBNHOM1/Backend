const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig'); // Import cấu hình Cloudinary
const stream = require('stream');

// Bộ lọc để chỉ chấp nhận các file ảnh
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/gif' ||
        file.mimetype === 'image/jfif'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
        cb(new Error('Only jpeg, jpg, png, gif, and jfif Images are allowed'));
    }
};

// Tạo middleware upload file với multer
const upload = multer({
    storage: multer.memoryStorage(), // Sử dụng bộ nhớ tạm
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn file 10MB
});

// Hàm upload file lên Cloudinary
const uploadToCloudinary = (file, folder) => {
    return new Promise((resolve, reject) => {
        // Tạo stream upload lên Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder, // Thư mục trên Cloudinary
                resource_type: 'image', // Đảm bảo đây là loại ảnh
            },
            (error, result) => {
                if (error) {
                    return reject(new Error('Error uploading to Cloudinary: ' + error.message));
                }
                resolve(result); // Trả về kết quả nếu thành công
            }
        );

        // Gửi buffer qua stream upload
        const bufferStream = new stream.PassThrough();
        bufferStream.end(file); // Dữ liệu file ở dạng buffer
        bufferStream.pipe(uploadStream); // Pipe dữ liệu vào upload stream
    });
};

// Middleware xử lý file upload và lưu trên Cloudinary
const uploadHandler = (folder) => async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }
        const fileBuffer = req.file.buffer; // Lấy dữ liệu file từ memory storage
        const result = await uploadToCloudinary(fileBuffer, folder); // Đợi upload hoàn thành
        req.fileURL = result.secure_url; // Gắn URL file vào request để sử dụng sau
        req.cloudinaryId = result.public_id; // Lưu lại `public_id` để xóa hoặc quản lý sau
        next();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading file');
    }
};

module.exports = {
    upload: upload.single('minhchung'), // Middleware nhận file
    uploadRequestHandler: uploadHandler('requests'),
    uploadBillHandler: uploadHandler('bills'),
    uploadReportHandler: uploadHandler('reports'),
};
