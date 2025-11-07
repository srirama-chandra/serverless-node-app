const jwt = require("jsonwebtoken");

function authMiddleware(req,res,next)
{
    const token = req.headers.authorization;

    if(!token)
    {
        return res.status(401).json({ msg: "Authorization token missing!! Login Again" });
    }

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.username = decoded.username;
        next();
    }
    catch(e)
    {
        return res.json({msg:e.message});
    }
}

module.exports = authMiddleware;