function doGet(request) {
    return withAuthentication(request, () => {
        const store = request.parameter["store"];
        const id = request.parameter["id"];
        if (store == null && id != null)
            return makeResponse({
                "status": "fail",
                "data": { "parameters": 'URL parameter "store" cannot be missing if "id" is present' }
            });
        let data = null;
        if (store == null) data = uDB.getStores();
        else if (id == null) data = new uDB(store).getAll();
        else data = new uDB(store).get(id);
        return makeResponse({
            "status": "success",
            "data": data
        });
    });
}

function doPost(request) {
    return withAuthentication(request, () => {
        const store = request.parameter["store"];
        if (store == null)
            return makeResponse({
                "status": "fail",
                "data": { "store": 'Missing URL parameter "store"' }
            });
        const id = request.parameter["id"];
        if (id != null && request.postData != null && request.postData.contents.trim().length > 0)
            return makeResponse({
                "status": "fail",
                "data": { "id": 'URL parameter "id" may not be given with document in body' }
            });
        let data = null;
        if (id == null && (request.postData == null || request.postData.contents.trim().length == 0))
            data = new uDB(store).clear();
        else if (id != null) data = new uDB(store).delete(id);
        else {
            let doc = null;
            try {
                doc = JSON.parse(request.postData.contents);
            }
            catch {
                return makeResponse({
                    "status": "fail",
                    "data": { "postData": "Request body is not valid JSON" }
                });
            }
            data = new uDB(store).put(doc);
        }
        return makeResponse({
            "status": "success",
            "data": data
        });
    });
}

function makeResponse(response) {
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function withAuthentication(request, func) {
    const expectedApiKey = PropertiesService.getScriptProperties().getProperty("api_key");
    if (expectedApiKey == null) {
        console.error('No script property "api_key" set up!');
        return makeResponse({
            "status": "error",
            "message": 'No script property "api_key" set up'
        });
    }
    const apiKey = request.parameter["api_key"];
    if (apiKey == null || apiKey !== expectedApiKey)
        return makeResponse({
            "status": "fail",
            "data": { "authentication": 'Invalid or missing URL parameter "api_key"' }
        });
    return func();
}
