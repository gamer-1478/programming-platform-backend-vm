function verifyServerIdentity(req, res, next) {
    if (req.body.authString === process.env.SERVER_AUTH_STRING) {
        next();
    }
    else {
        res.status(403).send({ error: 'Server Auth Failed To Verify Server Identity, Likely Server Auth String Not Set In .env' });
    }
}

module.exports = { verifyServerIdentity };