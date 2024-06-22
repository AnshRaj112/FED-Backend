const logRequestBody = (req, res, next) => {

    console.log('.............................')
    console.log("Incoming Request Body:");
    if (req && req.body) {
        const bodyCopy = { ...req.body };
        
        if (bodyCopy.password) {
            bodyCopy.password = "####";
        }
        
        console.log(bodyCopy);
    }
    console.log('.............................')
    next();
    
};

module.exports = logRequestBody;
