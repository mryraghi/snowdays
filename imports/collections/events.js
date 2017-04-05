import "babel-polyfill";
import SimpleSchema from "simpl-schema";

Schema = {};
const Events = new Mongo.Collection("events");

Schema.CSS = new SimpleSchema({
  width: {
    type: Number,
    optional: true
  },
  left: {
    type: Number,
    optional: true
  },
  height: {
    type: Number,
    optional: true
  },
  top: {
    type: Number,
    optional: true
  }
});

Schema.Events = new SimpleSchema({
  name: {
    type: String,
    max: 100
  },
  subtitle: {
    type: String,
    max: 100,
    optional: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  showInSchedule: {
    type: Boolean,
    defaultValue: false
  },
  type: {
    type: String,
    max: 100
  },
  description: {
    type: String,
    max: 1000,
    optional: true
  },
  checkRequired: {
    type: Boolean,
    defaultValue: false
  },
  checkAction: {
    type: String,
    optional: true
  },
  css: {
    type: Schema.CSS,
    optional: true
  }
});

Events.attachSchema(Schema.Events);

export default Events