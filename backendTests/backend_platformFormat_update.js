const {MongoClient} = require('mongodb');
const ATLAS_URI= "mongodb+srv://jelthomas:learnosity_proj@learnositydata.hvfbn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const platformFormat = require('../backend/models/platformFormat.model');

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

  it('should update a platformFormat from a collection', async () => {
    const platformFormats = db.collection('platformFormats');

    await platformFormats.updateOne({plat_name: "Test platform name"},{$set:{is_public: false, privacy_password: "JBuckets"}})

    const insertedPlatFormat = await platformFormats.findOne({plat_name:'Test platform name', owner: "test name"});
    expect(insertedPlatFormat.is_public).toEqual(false);
  });
});