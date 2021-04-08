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

  it('should update a platformData from the collection', async () => {
    const platformData_objs = db.collection('platformData_objs');

    await platformData_objs.updateOne({user_id: ObjectID("606556550d47a14250708a5e")},{$set:{is_favorited: false}})

    const insertedPlatData = await platformData_objs.findOne({user_id: ObjectID("606556550d47a14250708a5e")});
    expect(insertedPlatData.is_favorited).toEqual(false);
  });
});