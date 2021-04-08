const {MongoClient} = require('mongodb');
const ATLAS_URI= "mongodb+srv://jelthomas:learnosity_proj@learnositydata.hvfbn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const platformFormat = require('../backend/models/platformFormat.model');

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

  it('should delete a platform format from the collection', async () => {
    const platformFormats = db.collection('platformFormats');


    await platformFormats.deleteOne({plat_name:'Test platform name'});
    const platFormat = await platformFormats.findOne({plat_name:'Test platform name'});
    expect(platFormat).toEqual(null);
  });
});