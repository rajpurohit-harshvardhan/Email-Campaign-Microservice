function formatResponse(
    {contentType, statusCode, body, headers}) {
    const formattedResponse = {
        statusCode: statusCode,
        headers: headers ? headers : {},
    };
    if (typeof body === 'Error') {
        formattedResponse.body = body.message;
    } else {
        formattedResponse.body = body;
    }
    if (contentType) {
        formattedResponse.headers['content-type'] = contentType ?
            contentType :
            'application/json';
    }
    return formattedResponse;
}

function formatError({error}) {
    return formatResponse({
        statusCode: error.httpStatusCode,
        body: {
            message: error.message,
        },
    });
}

module.exports = {formatResponse, formatError};
