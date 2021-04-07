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
    hashed_password = bcrypt.hash('test_password', 10, (error, newHash) => {
                            if (error) {
                                return '';
                            }
                            return newHash;
                        })
    expect(bcrypt.compareSync('test_password', hashed_password)).toEqual(true);
  });
});