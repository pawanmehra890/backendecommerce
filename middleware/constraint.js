const jwt = require('jsonwebtoken')
const key = 'paoooooooooooooooosoosnbdhdbhcdbdbjhbdcbjhc'

exports.VerifyToken = async (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        try {
            const decode = jwt.verify(token, key);
            req.user = decode;
            console.log(req.user);
            next(); // Use next() instead of nxt()
        } catch (err) {
            res.status(401).json({ msg: "You are not authorized" });
        }
    } else {
        res.status(401).json({ msg: "Authorization header is missing" });
    }
};
// Check if the user is an admin based on the role stored in the JWT token
exports.checkAdmin = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }
    try {
        // Decode the token to access the payload
        const decodedToken = jwt.verify(token, key);
        // Check if the decoded token contains the 'role' field and if its value is 'admin'
        if (decodedToken.role === 'admin') {
            // User is an admin, proceed to the next middleware
            next();
        } else {
            // User is not an admin, return a 403 Forbidden response
            return res.status(403).json({ message: 'Unauthorized access' });
        }
    } catch (error) {
        // If an error occurs while verifying the token, return a 401 Unauthorized response
        return res.status(401).json({ message: 'Invalid token' });
    }
};

exports.checkUser = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }
    try {
        // Decode the token to access the payload
        const decodedToken = jwt.verify(token, key);
        // Check if the decoded token contains the 'role' field and if its value is 'admin'
        if (decodedToken.role === 'user') {
            // User is an admin, proceed to the next middleware
            next();
        } else {
            // User is not an admin, return a 403 Forbidden response
            return res.status(403).json({ message: 'Unauthorized access' });
        }
    } catch (error) {
        // If an error occurs while verifying the token, return a 401 Unauthorized response
        return res.status(401).json({ message: 'Invalid token' });
    }
};