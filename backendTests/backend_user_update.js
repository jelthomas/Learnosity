const {MongoClient} = require('mongodb');
const ATLAS_URI= "mongodb+srv://jelthomas:learnosity_proj@learnositydata.hvfbn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const user = require('../backend/models/user.model');

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

  it('should update a user from the collection', async () => {
    const users = db.collection('users');

    await users.updateOne({username:'test name'},{$set:{password:'newPass'}})
    const insertedUser = await users.findOne({username:'test name'})
    expect(insertedUser.password).toEqual("newPass");

  });
});