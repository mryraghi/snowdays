Schema = {};
Surveys = new Mongo.Collection("surveys");

Schema.Surveys = new SimpleSchema({
  _id: {
    type: String
  },
  experience: {
    type: Number
  },
  problems: {
    type: String,
    optional: true
  },
  suggestions: {
    type: String,
    optional: true
  }
});


Surveys.attachSchema(Schema.Surveys);