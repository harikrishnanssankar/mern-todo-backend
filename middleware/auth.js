import jsonwebtoken from "jsonwebtoken";



function auth(req, res, next){
    const token = req.header("x-auth-token")
    if (!token) return res.status(401).send("Not Authorized")


    try {
        const secretKey = process.env.SECRET_KEY;
        const payload = jsonwebtoken.verify(token, secretKey)
        req.user = payload
        next()
    } catch (error) {
        res.status(400).send("Invalid token")
    }
}

export default auth