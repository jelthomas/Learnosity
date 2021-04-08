const {MongoClient} = require('mongodb');
const ATLAS_URI= "mongodb+srv://jelthomas:learnosity_proj@learnositydata.hvfbn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const pageFormat = require('../backend/models/pageFormat.model');

describe('delete', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    db = await connection.db("TestCollection");
  });

  afterAll(async () => {
    await connection.close();
    await db.close();
  });

  it('should delete a page format document from the collection', async () => {
    const pageFormats = db.collection('pageFormats');


    await pageFormats.deleteOne({prompt:'What is the most popular soda brand in the United States?'});
    const pageFormat = await pageFormats.findOne({prompt:'What is the most popular soda brand in the United States?'});
    expect(pageFormat).toEqual(null);
  });
});