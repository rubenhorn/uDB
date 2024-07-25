
"use strict";

const testStore = "test-store";

function beforeEach() {
    new uDB(testStore).clear();
}

function afterEach() {
    new uDB(testStore).clear();
}

function test(name, testFunc) {
    beforeEach();
    console.log(` - ${name}`);
    testFunc();
    afterEach();
}

function assertEqual(a, b) {
    const jsonA = JSON.stringify(a);
    const jsonB = JSON.stringify(b);
    if (jsonA != jsonB) {
        throw new Error(`Unexpected: ${jsonA} != ${jsonB}`);
    }
}

function assertNotEqual(a, b) {
    const jsonA = JSON.stringify(a);
    const jsonB = JSON.stringify(b);
    if (jsonA == jsonB) {
        throw new Error(`Unexpected: ${jsonA} == ${jsonB}`);
    }
}

function runTests() {
    console.log("Test the database:");

    test("List empty store", () => {
        assertEqual(new uDB(testStore).getAll(), []);
    });

    test("Insert documents", () => {
        const db = new uDB(testStore);
        assertEqual(db.getAll().length, 0);
        const doc = { "foo": "bar" }
        const docInserted = db.put(doc);
        assertEqual(db.getAll().length, 1);
        const docInserted2 = db.put(doc);
        assertEqual(db.getAll().length, 2);
        assertEqual(docInserted.foo, doc.foo);
        assertEqual(docInserted2.foo, doc.foo);
        assertNotEqual(docInserted._id, docInserted2._id);
    });

    test("Update document", () => {
        const db = new uDB(testStore);
        assertEqual(db.getAll().length, 0);
        const doc = { "foo": "bar" }
        let docInserted = db.put(doc);
        assertEqual(db.getAll().length, 1);
        docInserted.foo = "bazz"
        const docInserted2 = db.put(docInserted);
        assertEqual(db.getAll().length, 1);
        assertEqual(docInserted._id, docInserted2._id);
    });

    test("Find document", () => {
        const db = new uDB(testStore);
        assertEqual(db.getAll().length, 0);
        const doc = { "foo": "bar" }
        let docInserted = db.put(doc);
        assertEqual(db.get(docInserted._id), docInserted);
        assertEqual(db.get("no-such-id"), null);
    });

    test("Delete document", () => {
        const db = new uDB(testStore);
        assertEqual(db.getAll().length, 0);
        const doc = { "foo": "bar" }
        let docInserted = db.put(doc);
        assertEqual(db.getAll().length, 1);
        assertEqual(db.delete(docInserted._id).length, 0);
    });

    console.log("All test passed. :)")
}
