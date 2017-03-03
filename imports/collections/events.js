import "babel-polyfill";
import SimpleSchema from "simpl-schema";

Schema = {};
const Events = new Mongo.Collection("events");

Schema.Card = new SimpleSchema({
  name: {
    type: String,
    max: 100
  }
});

Schema.Events = new SimpleSchema({
  name: {
    type: String,
    max: 100
  },
  subtitle: {
    type: String,
    optional: true,
    max: 100
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  allDay: {
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
    type: Schema.Card
  }
});

Events.attachSchema(Schema.Events);

export default Events