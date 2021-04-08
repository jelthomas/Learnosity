const {MongoClient} = require('mongodb');

describe('update', () => {
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

  it('should update a doc from the collection', async () => {
    const users = db.collection('users');

    const testUser = {username: 'TestJohn'};
    await users.insertOne(testUser);
    const mockUser = {username: 'Newname'};
    const testUser2 = await users.findOne({username: 'TestJohn'})
        .then(testUser2 => {
            testUser2.username = "Newname";
            expect(testUser2.username).toEqual(mockUser.username);
        })
  });
});