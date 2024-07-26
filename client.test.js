"use strict";

const uDB = require("./client");

const testStore = "test-store";
const apiUrl = (() => {
    let apiUrl = (process.env["API_URL"] || "").trim();
    if (apiUrl.length == 0) apiUrl = null;
    if (apiUrl == null) {
        console.log("Skipping API tests");
    }
    return apiUrl;
})();

describe("Test the database", () => {

    const testApi = (name, func) => {
        if (apiUrl != null) {
            test(name, func);
        }
    }

    beforeEach(async () => {
        if (apiUrl != null)
            await new uDB(apiUrl).store(testStore).clear();
    });

    afterEach(async () => {
        if (apiUrl != null)
            await new uDB(apiUrl).store(testStore).clear();
    });

    // Test suite must contain at least one test.
    test("Dummy", () => { });

    testApi("List empty store", () => {
        // TODO write client tests
        var foo = "bar"
        expect(foo).toEqual("bar");
    });
});
