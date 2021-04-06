const {MongoClient} = require('mongodb');

describe('delete', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    db = await connection.db(global.__MONGO_DB_NAME__);
  });

  afterAll(async () => {
    await connection.close();
    await db.close();
  });

  it('should delete a doc from the collection', async () => {
    const users = db.collection('users');

    const mockUser = {username: 'TestJohn'};
    await users.insertOne(mockUser);

    const insertedUser = await users.findOne({username: 'TestJohn'});
    await users.deleteOne(mockUser);
    const user = await users.findOne({username: 'TestJohn'});
    console.log(user);
    expect(user).toEqual(null);
  });
});