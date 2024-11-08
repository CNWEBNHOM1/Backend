const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu trữ file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Lưu file trong thư mục uploads/
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Đổi tên file
    },
});

// Bộ lọc file để chỉ chấp nhận ảnh
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype == 'image/jpeg' ||
        file.mimetype == 'image/jpg' ||
        file.mimetype == 'image/png' ||
        file.mimetype == 'image/gif' ||
        file.mimetype == 'image/gif' 
    ) {
        cb(null, true)
    }
    else {
        cb(null, false);
        cb(new Error('Only jpeg, jpg, png, and gif Image allow'))
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });
module.exports = upload;
