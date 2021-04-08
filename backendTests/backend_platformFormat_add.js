const {MongoClient} = require('mongodb');
const ATLAS_URI= "mongodb+srv://jelthomas:learnosity_proj@learnositydata.hvfbn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const platformFormat = require('../backend/models/platformFormat.model');

describe('insert', () => {
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

  it('should insert a platformFormat into collection', async () => {
    const platformFormats = db.collection('platformFormats');

    const plat_name = "Test platform name";
    const owner = "test name";
    const is_public = true;
    const privacy_password = "";
    const cover_photo = "";
    const pages = [];
    const is_published = true;

    const newPlatformFormat = new platformFormat({
     plat_name,
     owner,
     is_public,
     privacy_password,
     cover_photo,
     pages,
     is_published,
    });

    await platformFormats.insertOne(newPlatformFormat);

    const insertedPlatFormat = await platformFormats.findOne({plat_name:'Test platform name', owner: "test name"});
    expect(insertedPlatFormat.plat_name).toEqual(newPlatformFormat.plat_name);
  });
});