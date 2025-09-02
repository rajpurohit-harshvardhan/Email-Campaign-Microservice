function responseEnhancer(req, res, next) {
    res.sendError = (error, statusCode = error.statusCode || 500) => {
        res.status(statusCode).json({
            success: false,
            message: error?.message || 'An unexpected error occurred',
            error,
        });
    };

    res.sendResponse = (data, statusCode = 200) => {
        res.status(statusCode).json({
            success: true,
            data,
        });
    };

    next();
}

module.exports = responseEnhancer;
