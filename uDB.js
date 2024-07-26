"use strict";

let crypto = null;
let localStorage = null;

if (typeof window !== "undefined" || typeof process !== "undefined") {
  // Browser or Node.js runtime
  [crypto, localStorage] = (() => {
    if (typeof process !== "undefined") {
      // Import Node.js libraries
      const crypto = require("node:crypto");
      const { LocalStorage } = require("node-localstorage");
      const path = require("node:path");
      const localStorage = new LocalStorage(path.join(__dirname, "data"));
      return [crypto, localStorage];
    }
    else {
      return [window.crypto, window.localStorage];
    }
  })();
}

class uDB {
  static getDataFolder() {
    if (typeof DriveApp === "undefined") throw new Error("Only supported on Google Apps Script.");
    const scriptFile = DriveApp.getFileById(ScriptApp.getScriptId());
    const rootFolder = scriptFile.getParents().next();
    const folderIterator = rootFolder.getFoldersByName("data");
    if (folderIterator.hasNext()) {
      return folderIterator.next();
    }
    else {
      return rootFolder.createFolder("data");
    }
  }

  static getStores() {
    let keys = []
    if (typeof window !== "undefined" || typeof process !== "undefined") {
      // Browser or Node.js runtime
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        keys.push(key)
      }
    }
    else if (typeof DriveApp !== "undefined") {
      // Google Apps Script runtime        
      const dataFolder = uDB.getDataFolder();
      const fileExtension = ".json";
      const fileIterator = dataFolder.getFiles();
      if (fileIterator.hasNext()) {
        const file = fileIterator.next().getName();
        if (file.endsWith(fileExtension)) keys.push(file.slice(0, file.length - fileExtension.length));
      }
    }
    else {
      throw new Error("Unknown JavaScript runtime!");
    }
    // Filter out other files or localStorage keys
    let stores = []
    const storePrefix = "uDB_";
    keys.forEach(key => {
      if (key.startsWith(storePrefix))
        stores.push(key.slice(storePrefix.length))
    });
    return stores;
  }

  constructor(store) {
    store = `uDB_${store}`;

    // Private functions
    const throwNotImplemented = () => { throw new Error("Not implemented."); };
    var generateId = throwNotImplemented;
    var doWithLock = throwNotImplemented;
    var getAll = throwNotImplemented;
    var putAll = throwNotImplemented;

    if (typeof window !== "undefined" || typeof process !== "undefined") {
      // Browser or Node.js runtime
      generateId = () => crypto.randomUUID();
      doWithLock = (func) => func(); // No need for locking in non-concurrent environments
      getAll = () => {
        let docs = localStorage.getItem(store);
        if (docs == null || docs.length === 0) docs = "[]";
        return JSON.parse(docs);
      };
      putAll = (docs) => {
        if (docs.length > 0)
          localStorage.setItem(store, JSON.stringify(docs));
        else localStorage.removeItem(store);
        return docs;
      };
    }
    else if (typeof DriveApp !== "undefined") {
      // Google Apps Script runtime
      generateId = () => Utilities.getUuid();

      doWithLock = (func) => {
        const lockTimeoutMs = 1000;
        const lock = LockService.getScriptLock();
        if (lock.hasLock) return func(); // Avoid deadlock in nested calls (e.g. doWithLock(() => doWithLock(...));)
        lock.waitLock(lockTimeoutMs);
        try {
          return func();
        }
        finally {
          lock.releaseLock();
        }
      };

      const fileExtension = ".json";
      const mimeType = "application/json";
      let file = store;
      if (!file.endsWith(fileExtension)) file += fileExtension;

      getAll = () => doWithLock(() => {
        const fileIterator = uDB.getDataFolder().getFilesByName(file);
        if (!fileIterator.hasNext()) return [];
        const json = fileIterator.next().getAs(mimeType).getDataAsString();
        return JSON.parse(json);
      });

      putAll = (docs) => doWithLock(() => {
        const json = JSON.stringify(docs);
        const dataFolder = uDB.getDataFolder();
        const fileIterator = dataFolder.getFilesByName(file);
        if (fileIterator.hasNext()) {
          const file = fileIterator.next();
          if (docs.length > 0) file.setContent(json);
          else file.setTrashed(true);
        }
        else {
          dataFolder.createFile(file, json, mimeType);
        }
        return docs;
      });
    }
    else {
      throw new Error("Unknown JavaScript runtime!");
    }

    // Public functions
    this.getAll = () => getAll();

    this.get = (id) => doWithLock(() => {
      const docs = this.getAll();
      for (let i = 0; i < docs.length; i++)
        if (docs[i].hasOwnProperty("_id") && docs[i]._id === id)
          return docs[i];
      return null;
    });

    this.put = (doc) => doWithLock(() => {
      if (typeof doc !== "object") throw Error('Document must be of type "object"')
      const doc2 = JSON.parse(JSON.stringify(doc)); // Deep copy to avoid side effects
      if (!doc2.hasOwnProperty("_id")) doc2._id = generateId();
      else this.delete(doc2._id);
      let docs = this.getAll();
      docs.push(doc2);
      putAll(docs);
      return doc2;
    });

    this.delete = (id) => doWithLock(() => {
      let docs = this.getAll();
      let newDocs = [];
      docs.forEach(doc => {
        if (!doc.hasOwnProperty("_id")) doc._id = generateId();
        if (doc._id !== id) newDocs.push(doc);
      });
      return putAll(newDocs);
    });

    this.clear = () => doWithLock(() => putAll([]));

    return this;
  }
};

if (typeof process !== "undefined") module.exports = uDB;
