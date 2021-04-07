const {MongoClient} = require('mongodb');
const bcrypt = require("bcrypt");

describe('hash', () => {
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

  it('should hash a password and use compareSynch to verify password', async () => {
    const mockUser = {username: 'TestJohn', password: 'test_password'};
    hashed_password = bcrypt.hash(mockUser.password, 10);
    
    expect(bcrypt.compareSync(mockUser.password, hashed_password)).toEqual(true);
  });
});