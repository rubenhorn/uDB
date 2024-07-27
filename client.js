"use strict";

const fetch = (() => {
    if (typeof window !== "undefined") {
        // Browser runtime
        return window.fetch;
    } else if (typeof process !== "undefined") {
        // Node.js runtime
        return require("node-fetch");
    } else {
        throw new Error("Unknown JavaScript runtime!");
    }
})();

class uDBClient {
    constructor(url) {
        const jsendRequest = (url, method, body) =>
            new Promise((resolve, reject) => {
                if (method === "GET" || method === "HEAD") body = null;
                else body = body != null ? JSON.stringify(body) : "";
                fetch(url, {
                    method: method,
                    body: body,
                    redirect: "follow",
                }).then(async (httpResponse) => {
                    try {
                        if (httpResponse.status == 200) {
                            const response = await httpResponse.json();
                            if (response.status === "success")
                                resolve(response.data);
                            else if (response.status === "error")
                                throw Error(response.message);
                            else throw Error(JSON.stringify(response.data));
                        } else throw Error(`Got HTTP ${httpResponse.status}`);
                    } catch (err) {
                        reject(err);
                    }
                }, reject);
            });

        const sendApiGetRequest = (store, id, doc) =>
            new Promise((resolve, reject) => {
                let requestUrl = url;
                if (store != null) requestUrl += `&store=${store}`;
                if (id != null) requestUrl += `&id=${id}`;
                return jsendRequest(requestUrl, "GET", doc).then(
                    resolve,
                    reject
                );
            });

        const sendApiPostRequest = (store, id, doc) =>
            new Promise((resolve, reject) => {
                let requestUrl = url;
                if (store != null) requestUrl += `&store=${store}`;
                if (id != null) requestUrl += `&id=${id}`;
                return jsendRequest(requestUrl, "POST", doc).then(
                    resolve,
                    reject
                );
            });

        // Public functions
        this.getStores = () => sendApiGetRequest(null, null, null);
        this.store = (store) => {
            this.getAll = () => sendApiGetRequest(store, null, null);

            this.get = async (id) => {
                if (typeof id !== "string")
                    throw new Error('id must be of type "string"');
                return await sendApiGetRequest(store, id, null);
            };
            this.put = async (doc) => {
                if (doc == null || typeof doc !== "object")
                    throw new Error(
                        'doc must be of type "object" and not "null"'
                    );
                return await sendApiPostRequest(store, null, doc);
            };
            this.delete = async (id) => {
                if (typeof id !== "string")
                    throw new Error('id must be of type "string"');
                return await sendApiPostRequest(store, id, null);
            };

            this.clear = () => sendApiPostRequest(store, null);
            return this;
        };
    }
}

if (typeof process !== "undefined") module.exports = uDBClient;
