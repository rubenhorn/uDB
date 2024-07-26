# &#181;DB
&#181;DB or (uDB) is a tiny document database for browsers, Node.js, and Google Apps Script (GAS), but for micro projects only.

**Note!** On GAS it is extreeeemly slow.

## Usage:
```js
console.log(`Existing stores: ${uDB.getStores()}`);
const db = new uDB("my-doc-store"); // For Node.js and GAS, a corresponding JSON file is created in a data/ folder located next to the (uDB) script.
const doc = { "foo": "bar" };
let insertedDoc = db.put(doc);
console.log(`Inserted: ${db.get(insertedDoc._id)}`);
insertedDoc.foo = "bazz";
console.log(`Updated: ${db.put(insertedDoc)}`);
console.log(`All documents: ${db.getAll()}`);
console.log(`All documents after deleting ${insertedDoc._id}: ${db.delete(insertedDoc._id)}`);
```

## API:
The [GAS](./api.gs) and [Node.js](./api.js) API responses comply with the [JSend specification](https://github.com/omniti-labs/jsend) and can be used with the provided [client](./client.js).

## Testing
**Node.js:** Run `npm install && npm test`.  
**Browser:** Launch [test.html](./test.html) and open the console.  
**GAS:** Add [uDB.js](./uDB.js) and [uDB.test.gs](./uDB.test.gs) to the project and run the `runTests` function.

## Documentation
The code is simple enough to not need documentation. Although I am planning to add some more helpful comments. &#128521;
