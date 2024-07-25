"use strict";

const uDB = require("./uDB")

const testStore = "test-store";

describe("Test the database", () => {
  beforeEach(() => {
    new uDB(testStore).clear();
  });

  afterEach(() => {
    new uDB(testStore).clear();
  });

  test("List empty store", () => {
    expect(new uDB(testStore).getAll()).toEqual([]);
  });

  test("Insert documents", () => {
    const db = new uDB(testStore);
    expect(db.getAll().length).toBe(0);
    const doc = { "foo": "bar" }
    const docInserted = db.put(doc);
    expect(db.getAll().length).toBe(1);
    const docInserted2 = db.put(doc);
    expect(db.getAll().length).toBe(2);
    expect(docInserted.foo).toBe(doc.foo);
    expect(docInserted2.foo).toBe(doc.foo);
    expect(docInserted._id).not.toEqual(docInserted2._id);
  });

  test("Update document", () => {
    const db = new uDB(testStore);
    expect(db.getAll().length).toBe(0);
    const doc = { "foo": "bar" }
    let docInserted = db.put(doc);
    expect(db.getAll().length).toBe(1);
    docInserted.foo = "bazz"
    const docInserted2 = db.put(docInserted);
    expect(db.getAll().length).toBe(1);
    expect(docInserted._id).toEqual(docInserted2._id);
  });

  test("Find document", () => {
    const db = new uDB(testStore);
    expect(db.getAll().length).toBe(0);
    const doc = { "foo": "bar" }
    let docInserted = db.put(doc);
    expect(db.get(docInserted._id)).toEqual(docInserted);
    expect(db.get("no-such-id")).toBe(null);
  });

  test("Delete document", () => {
    const db = new uDB(testStore);
    expect(db.getAll().length).toBe(0);
    const doc = { "foo": "bar" }
    let docInserted = db.put(doc);
    expect(db.getAll().length).toBe(1);
    expect(db.delete(docInserted._id).length).toBe(0);
  });
});
