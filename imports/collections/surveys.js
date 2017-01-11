import 'babel-polyfill'
import SimpleSchema from 'simpl-schema';

Schema = {};
const Surveys = new Mongo.Collection("surveys");

Schema.Surveys = new SimpleSchema({
  _id: {
    type: String
  },
  experience: {
    type: Number
  },
  problems: {
    type: String,
    max: 1000,
    optional: true
  },
  suggestions: {
    type: String,
    max: 1000,
    optional: true
  }
});

Surveys.attachSchema(Schema.Surveys);

export default Surveys