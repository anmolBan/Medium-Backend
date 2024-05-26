"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signinVerfication = void 0;
const jwt = require('jsonwebtoken');
function signinVerfication(req, res, next) {
    let unfilteredToken = req.headers.authorization;
    unfilteredToken = unfilteredToken.split(" ");
    const token = unfilteredToken[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.id = decoded.id;
    }
    catch (error) {
        return res.status(403).json({ error });
    }
    next();
}
exports.signinVerfication = signinVerfication;
