const { ObjectID } = require('bson');
const {MongoClient} = require('mongodb');
const ATLAS_URI= "mongodb+srv://jelthomas:learnosity_proj@learnositydata.hvfbn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

describe('update', () => {
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

  it('should update a pageFormat from the collection', async () => {
    const pageFormats = db.collection('pageFormats');

    await pageFormats.updateOne({prompt: "What is the most popular soda brand in the United States?"},{$set:{page_title: "Most Popular Soda Company"}})

    const updatedPageFormat = await pageFormats.findOne({prompt: "What is the most popular soda brand in the United States?"});
    expect(updatedPageFormat.page_title).toEqual("Most Popular Soda Company");
  });
});