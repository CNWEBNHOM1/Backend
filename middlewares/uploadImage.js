const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storageBill = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'billProofImages/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Đổi tên file để tránh trùng
    }
});
const storageGuest = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'guestProofImages/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Đổi tên file để tránh trùng
    }
});

const uploadBillProof = multer({
    storage: storageBill,
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
const uploadGuestProof = multer({
    storage: storageGuest,
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
module.exports = {
    uploadBillProof, uploadGuestProof
};