const { ObjectID } = require('bson');
const {MongoClient} = require('mongodb');
const ATLAS_URI= "mongodb+srv://jelthomas:learnosity_proj@learnositydata.hvfbn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const platformData = require('../backend/models/platformData.model');

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

  it('should insert a platformData into collection', async () => {
    const platformData_objs = db.collection('platformData_objs');

    const user_id = "606556550d47a14250708a5e";
    const platform_id = "5ab9cbfa3639ab715d42129f";
    const completed_pages = [];
    const is_favorited = true;
    const is_completed = false;
    const recently_played = Date.parse("2021-03-07T21:23:23.727+00:00");

    const newplatformData = new platformData({
        user_id, 
        platform_id,
        completed_pages,
        is_favorited, 
        is_completed,
        recently_played
    });

    await platformData_objs.insertOne(newplatformData);

    const insertedPlatData = await platformData_objs.findOne({user_id: ObjectID('606556550d47a14250708a5e'), platform_id: ObjectID("5ab9cbfa3639ab715d42129f")});
    expect(insertedPlatData.user_id).toEqual(newplatformData.user_id);
  });
});