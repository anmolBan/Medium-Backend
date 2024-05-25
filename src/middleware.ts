const jwt = require('jsonwebtoken');

export function signinVerfication(req: any, res: any, next: any){
    let unfilteredToken = req.headers.authorization;
    unfilteredToken = unfilteredToken.split(" ");
    const token = unfilteredToken[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.id = decoded.id;
    } catch(error){
        return res.status(403).json({error});
    }
    next();
}