const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 5, // each IP can make up to 5 requests per `windowsMs` (10 minutes)
    standardHeaders: true, // add the `RateLimit-*` headers to the response
    legacyHeaders: false, // remove the `X-RateLimit-*` headers from the response
    message: "Too many password reset requests from this IP, please try again later.",
});
