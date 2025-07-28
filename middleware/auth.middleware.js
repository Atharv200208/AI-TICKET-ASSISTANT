import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const token = req.headers.authorixation?.split(' ')[1]

    if(!token){
        return res.status(401).json({ error: "Access Denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded
        next()
    } catch (error) {
        return status(401).json({error: "Invalid Token"})
    }
}