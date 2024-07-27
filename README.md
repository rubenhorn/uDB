# &#181;DB

&#181;DB or (uDB) is a tiny document database for browsers, Node.js, and [Google Apps Script](https://www.google.com/script/start/) (GAS), but for micro projects only.

**Note!** On GAS it is extreeeemly slow.

## Usage

```js
console.log(`Existing stores: ${uDB.getStores()}`);
const db = new uDB("my-docs-store"); // For Node.js and GAS, a corresponding JSON file is created in a data/ folder located next to the (uDB) script.
const doc = { foo: "bar" };
let insertedDoc = db.put(doc);
console.log(`Inserted: ${db.get(insertedDoc._id)}`);
insertedDoc.foo = "bazz";
console.log(`Updated: ${db.put(insertedDoc)}`);
console.log(`All documents: ${db.getAll()}`);
console.log(
    `All documents after deleting ${insertedDoc._id}: ${db.delete(insertedDoc._id)}`
);
```

## API

The [GAS API](./api.gs) and [Node.js API](./api.js) responses comply with the [JSend specification](https://github.com/omniti-labs/jsend) and can be used with the provided [client](./client.js).

```js
const apiUrl = `${baseUrl}?api_key=${apiKey}`;
console.log(`Existing stores: ${await new uDBClient(apiUrl).getStores()}`);
const db = new uDBClient(apiUrl).store("my-docs-store");
const doc = { foo: "bar" };
let insertedDoc = await db.put(doc);
console.log(`Inserted: ${await db.get(insertedDoc._id)}`);
insertedDoc.foo = "bazz";
console.log(`Updated: ${await db.put(insertedDoc)}`);
console.log(`All documents: ${await db.getAll()}`);
console.log(
    `All documents after deleting ${insertedDoc._id}: ${await db.delete(insertedDoc._id)}`
);
```

To deploy on GAS, create a new project using [appsscript.json](./appsscript.json) and add the code [uDB.js](./uDB.js) and [api.gs](./api.gs).

## Testing

**Node.js:** Run `npm install && npm test`. To test the API, use `npm run testApi`, which starts both the server using `npm start` and runs the client tests.  
**Browser:** Launch [uDB.test.html](./uDB.test.html) and open the console or use [client.test.html](./client.test.html) for the API client instead.  
**GAS:** Add [uDB.js](./uDB.js) and [uDB.test.gs](./uDB.test.gs) to the project and run the `runTests` function.

## Documentation

The code is simple enough to not need documentation.  
Although I am planning to add some more helpful comments. &#128521;
