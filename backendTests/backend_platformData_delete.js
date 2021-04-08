const {MongoClient} = require('mongodb');
const ATLAS_URI= "mongodb+srv://jelthomas:learnosity_proj@learnositydata.hvfbn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const { ObjectID } = require('bson');
const platformData = require('../backend/models/platformData.model');

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

  it('should delete a platform data document from the collection', async () => {
    const platformDatas = db.collection('platformData_objs');


    await platformDatas.deleteOne({user_id: ObjectID('606556550d47a14250708a5e')});
    const platData = await platformDatas.findOne({user_id: ObjectID('606556550d47a14250708a5e')});
    expect(platData).toEqual(null);
  });
});