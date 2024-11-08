const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Đổi tên file để tránh trùng
    }
});

const uploadImage = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == 'image/jpeg' ||
            file.mimetype == 'image/jpg' ||
            file.mimetype == 'image/png' ||
            file.mimetype == 'image/gif' ||
            file.mimetype == 'image/jfif'
        ) {
            cb(null, true)
        }
        else {
            cb(null, false);
            cb(new Error('Only jpeg, jpg, png, gif and jfif Image allow'))
        }
    }
})
module.exports = uploadImage;