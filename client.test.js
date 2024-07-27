"use strict";

const uDBClient = require("./client");

const testStore = "test-store";
const timeoutSeconds = 30; // GAS can be reaaaally slow

const apiUrl = (() => {
    let apiUrl = (process.env["API_URL"] || "").trim();
    if (apiUrl.length == 0) apiUrl = null;
    if (apiUrl == null) {
        console.log("Skipping API tests");
    }
    return apiUrl;
})();

describe("Test the database", () => {
    const testAPI = (name, func) => {
        if (apiUrl != null) {
            test(name, func, timeoutSeconds * 1000);
        }
    }

    if (apiUrl != null) {
        beforeEach(async () => {
            if (apiUrl != null)
                await new uDBClient(apiUrl).store(testStore).clear();
        }, timeoutSeconds * 1000);

        afterEach(async () => {
            if (apiUrl != null)
                await new uDBClient(apiUrl).store(testStore).clear();
        }, timeoutSeconds * 1000);
    }
    else {
        // Test suite must contain at least one test.
        test("Dummy", () => { });
    }

    testAPI("List empty store", async () => {
        const docs = await new uDBClient(apiUrl).store(testStore).getAll();
        expect(docs).toEqual([]);
    });

    testAPI("Insert documents", async () => {
        const db = new uDBClient(apiUrl).store(testStore);
        expect((await db.getAll()).length).toBe(0);
        const doc = { "foo": "bar" }
        const docInserted = await db.put(doc);
        expect((await db.getAll()).length).toBe(1);
        const docInserted2 = await db.put(doc);
        expect((await db.getAll()).length).toBe(2);
        expect(docInserted.foo).toBe(doc.foo);
        expect(docInserted2.foo).toBe(doc.foo);
        expect(docInserted._id).not.toEqual(docInserted2._id);
    });

    testAPI("Update document", async () => {
        const db = new uDBClient(apiUrl).store(testStore);
        expect((await db.getAll()).length).toBe(0);
        const doc = { "foo": "bar" }
        let docInserted = await db.put(doc);
        expect((await db.getAll()).length).toBe(1);
        docInserted.foo = "bazz"
        const docInserted2 = await db.put(docInserted);
        expect((await db.getAll()).length).toBe(1);
        expect(docInserted._id).toEqual(docInserted2._id);
    });

    testAPI("Find document", async () => {
        const db = new uDBClient(apiUrl).store(testStore);
        expect((await db.getAll()).length).toBe(0);
        const doc = { "foo": "bar" }
        let docInserted = await db.put(doc);
        expect(await db.get(docInserted._id)).toEqual(docInserted);
        expect(await db.get("no-such-id")).toBe(null);
    });

    testAPI("Delete document", async () => {
        const db = new uDBClient(apiUrl).store(testStore);
        expect((await db.getAll()).length).toBe(0);
        const doc = { "foo": "bar" }
        let docInserted = await db.put(doc);
        expect((await db.getAll()).length).toBe(1);
        expect((await db.delete(docInserted._id)).length).toBe(0);
    });

    testAPI("List stores", async () => {
        const doc = { "foo": "bar" }
        await new uDBClient(apiUrl).store(testStore).put(doc);
        const stores = await new uDBClient(apiUrl).getStores();
        expect(stores[0]).toBe(testStore);
        expect((await new uDBClient(apiUrl).store(stores[0]).getAll())[0].foo).toBe(doc.foo);
    });
});
