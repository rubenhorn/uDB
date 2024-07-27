"use strict";

const http = require("node:http");
const process = require("node:process");
const uDB = require("./uDB");

const host = process.env.HOST || "localhost";
const port = process.env.PORT || 8080;
const expectedApiKey = process.env.API_KEY;

if (expectedApiKey == null) {
    console.error('Environment variable "API_KEY" not set');
    process.exit(1);
}

function makeResponse(response, data) {
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(data));
}

function withAuthentication(request, response, func) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const apiKey = url.searchParams.get("api_key");
    if (apiKey == null || apiKey !== expectedApiKey) {
        makeResponse(response, {
            status: "fail",
            data: {
                authentication: 'Invalid or missing URL parameter "api_key"',
            },
        });
        return;
    }
    func();
}

function doGet(request, response) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const store = url.searchParams.get("store");
    const id = url.searchParams.get("id");
    if (store == null && id != null) {
        makeResponse(response, {
            status: "fail",
            data: {
                parameters:
                    'URL parameter "store" cannot be missing if "id" is present',
            },
        });
        return;
    }
    let data = null;
    if (store == null) data = uDB.getStores();
    else if (id == null) data = new uDB(store).getAll();
    else data = new uDB(store).get(id);
    makeResponse(response, {
        status: "success",
        data: data,
    });
}

function doPost(request, response) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const store = url.searchParams.get("store");
    const id = url.searchParams.get("id");
    if (store == null) {
        makeResponse(response, {
            status: "fail",
            data: { store: 'Missing URL parameter "store"' },
        });
        return;
    }
    let requestData = "";
    request.on("data", (chunk) => (requestData += chunk.toString()));
    request.on("end", () => {
        if (
            id != null &&
            requestData != null &&
            requestData.trim().length > 0
        ) {
            makeResponse(response, {
                status: "fail",
                data: {
                    id: 'URL parameter "id" may not be given with document in body',
                },
            });
            return;
        }
        let data = null;
        if (id == null && requestData.trim().length == 0)
            data = new uDB(store).clear();
        else if (id != null) data = new uDB(store).delete(id);
        else {
            let doc = null;
            try {
                doc = JSON.parse(requestData);
            } catch {
                makeResponse(response, {
                    status: "fail",
                    data: { postData: "Request body is not valid JSON" },
                });
                return;
            }
            data = new uDB(store).put(doc);
        }
        makeResponse(response, {
            status: "success",
            data: data,
        });
    });
}

const requestListener = (request, response) => {
    withAuthentication(request, response, () => {
        if (request.method === "GET") {
            doGet(request, response);
        } else if (request.method === "POST") {
            doPost(request, response);
        } else {
            makeResponse(response, {
                status: "fail",
                data: {
                    method: `HTTP method "${request.method}" not allowed`,
                },
            });
        }
    });
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(
        `uDB API running on http://${host}:${port}?api_key=${expectedApiKey}`
    );
});
