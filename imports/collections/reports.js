import "babel-polyfill";
import SimpleSchema from "simpl-schema";

const Reports = new Mongo.Collection("reports");

const Schema = {};

Schema.Reports = new SimpleSchema({
  userId: {
    type: SimpleSchema.RegEx.Id
  },
  message: {
    type: String,
    max: 1000
  },
  createdAt: {
    type: Date,
    defaultValue: new Date(),
    denyUpdate: true,
    optional: true
  }
});

Reports.attachSchema(Schema.Reports);

export default Reports