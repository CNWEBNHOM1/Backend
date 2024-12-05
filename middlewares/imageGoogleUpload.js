const multer = require('multer');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const storage = require('../config/firebaseConfig'); // Import Firebase Storage instance đã khởi tạo

// Cấu hình bộ lọc file để chỉ chấp nhận ảnh
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

// Hàm để upload file lên Firebase Storage
const uploadToFirebase = async (file, folder) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    // LỖIIIIIII 
    const storageRef = ref(storage, `${folder}/${fileName}`); // Tạo tham chiếu tới Firebase Storage
    const metadata = {
        contentType: file.mimetype,
    };
    // Upload file lên Firebase Storage
    const snapshot = await uploadBytes(storageRef, file.buffer, metadata);
    console.log(`Uploaded file to Firebase (${folder}):`, snapshot.metadata.name);

    // Lấy URL download của file
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('File available at:', downloadURL);

    return downloadURL;
};

// Middleware xử lý file upload và lưu trên Firebase
const uploadHandler = (folder) => async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }
        const fileURL = await uploadToFirebase(req.file, folder);
        req.fileURL = fileURL; // Gắn URL file vào request để sử dụng sau
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
