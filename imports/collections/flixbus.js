import SimpleSchema from 'simpl-schema';

let Schema = {};
const Flixbus = new Mongo.Collection("flixbus");

Schema.Flixbus = new SimpleSchema({
  _id: {
    type: String
  },
  code: {
    type: String,
    unique: true
  },
  redeemed: {
    type: Boolean,
    defaultValue: false
  }
});

Flixbus.attachSchema(Schema.Flixbus);

export default Flixbus