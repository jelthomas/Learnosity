const {MongoClient} = require('mongodb');
const ATLAS_URI= "mongodb+srv://jelthomas:learnosity_proj@learnositydata.hvfbn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const pageFormat = require('../backend/models/pageFormat.model');

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

  it('should insert a pageFormat into collection', async () => {
    const pageFormats = db.collection('pageFormats');

    const type = "Multiple Choice";
    const prompt = "What is the most popular soda brand in the United States?";
    const audio_file = "";
    const page_title = "Best Soda Brand";
    const multiple_choices = ["Dr. Pepper", "Pepsi", "Fanta"];
    const multiple_choice_answer = "Coca Cola";

    const newpageFormat = new pageFormat({
        type,
        prompt,
        audio_file,
        page_title,
        multiple_choices,
        multiple_choice_answer
    });

    await pageFormats.insertOne(newpageFormat);

    const insertedPageFormat = await pageFormats.findOne({prompt:'What is the most popular soda brand in the United States?'});
    expect(insertedPageFormat.prompt).toEqual(newpageFormat.prompt);
  });
});