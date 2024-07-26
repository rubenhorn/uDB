"use strict";

const fetch = (() => {
    if (typeof window !== "undefined") {
        // Browser runtime
        return window.fetch;
    }
    else if (typeof process !== "undefined") {
        // Node.js runtime
        return require("node-fetch");
    }
    else {
        throw new Error("Unknown JavaScript runtime!");
    }
})();

class uDBClient {
    constructor(url) {
        const jsendRequest = (url, body) => new Promise((resolve, reject) => {
            fetch(url, {
                method: body != null ? "POST" : "GET",
                headers: { "Content-Type": "application/json; charset=UTF-8" },
                body: (body != null && body.trim().length > 0) ? JSON.stringify(body) : null,
                redirect: "follow",
            }).then(async (httpResponse) => {
                try {
                    if (httpResponse.status == 200) {
                        const response = await httpResponse.json();
                        if (response.status == "success") resolve(response.data);
                        else if (response.status == "error") throw Error(response.message);
                        else throw Error(JSON.stringify(response.data));
                    }
                    else throw Error(`Got HTTP ${xmlHttp.status}`);
                }
                catch (err) {
                    reject(err);
                }
            }, reject);
        });

        const sendApiRequest = (store, id, doc) => new Promise((resolve, reject) => {
            let requestUrl = url;
            if (store != null) requestUrl += `&store=${store}`;
            if (id != null) requestUrl += `&id=${id}`;
            return jsendRequest(requestUrl, doc).then(resolve, reject);
        });

        // Public functions
        this.getStores = () => sendApiRequest(null, null, null);
        this.store = (store) => {
            this.getAll = () => sendApiRequest(store, null, null);
            this.get = (id) => sendApiRequest(store, id, null);
            this.put = (doc) => sendApiRequest(store, null, doc);
            this.delete = (id) => sendApiRequest(store, id, null);
            this.clear = () => sendApiRequest(store, null, "");
            return this;
        };
    }
};

if (typeof process !== "undefined") module.exports = uDBClient;
