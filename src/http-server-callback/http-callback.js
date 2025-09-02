module.exports = function makeHttpCallabck({controller}) {
    return async (req, res) => {
        const httpRequest = {
            body: req.body,
            query: req.query,
            params: req.params,
            ip: req.ip,
            method: req.method,
            path: req.path,
            headers: req.headers,
            app: req.app,
            logger: req.logger,
            uuid: req.uuid,
            linkname: req.headers['x-linkname'],
        };

        httpRequest.user = {
            id: httpRequest.headers['x-user-id'],
        };

        if (httpRequest.headers['x-client-id']) {
            httpRequest.application = {
                clientId: httpRequest.headers['x-client-id'],
            };
        }

        try {
            const httpResponse = await controller(httpRequest);
            if (httpResponse.headers) {
                for (const header in httpResponse.headers) {
                    if (Object.prototype.hasOwnProperty.call(httpResponse.headers,
                        header)) {
                        res.setHeader(header, httpResponse.headers[header]);
                    }
                }
            }
            if (httpResponse.statusCode >= 200 && httpResponse.statusCode < 300) {
                req.logger.info(`${httpRequest.method} - ${httpRequest.path} : ${httpResponse.statusCode}`)
                await res.sendResponse(httpResponse.body, );
            } else {
                await res.sendError(httpResponse);
            }
        } catch (e) {
            req.logger.error(e);
            await res.sendError(e);
        }
    };
};
