import "babel-polyfill";
import SimpleSchema from "simpl-schema";

const Settings = new Mongo.Collection("settings");

const Schema = {};

Schema.Form = new SimpleSchema({
  doNotAsk: {
    type: Array,
    optional: true
  },
  "doNotAsk.$": {
    type: String,
    optional: true
  }
});

Schema.Settings = new SimpleSchema({
  _id: {
    type: String
  },
  form: {
    type: Schema.Form,
    optional: true
  }
});

Settings.attachSchema(Schema.Settings);

export default Settings