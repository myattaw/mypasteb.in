const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();

// Connection URL
const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'mypastebin';

async function main() {
  console.log('before connect');
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('pastes');

    // the following code examples can be pasted here...
    
    return 'done.';
  } catch (error) {
    console.error(error);
    throw error;
  }
}

const port = 3000;
app.listen(port, async () => {
  try {
    const result = await main();
    console.log(result);
    console.log(`Server is running on port ${port}`);
    // Keep the server running
  } catch (error) {
    console.error(error);
  } finally {
    client.close();
  }
});

app.get('/', (req, res) => {
  res.send('Express test');
});