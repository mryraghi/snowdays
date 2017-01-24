import 'babel-polyfill'
import SimpleSchema from 'simpl-schema';

const Schema = {};

Schema.Profile = new SimpleSchema({
  firstName: {
    type: String,
    index: 1,
    optional: true
  },
  lastName: {
    type: String,
    index: 1,
    optional: true
  },
  gender: {
    type: String,
    allowedValues: ['M', 'F'],
    optional: true
  },
  university: {
    type: String,
    label: "University",
    optional: true
  },
  token: {
    type: String,
    max: 128,
    min: 128,
    optional: true
  },
  allowedParticipants: {
    type: Number
  },
  survey: {
    type: Boolean,
    defaultValue: false
  }
});

Schema.User = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  username: {
    type: String,
    index: 1,
    optional: true
  },
  emails: {
    type: Array,
    // For accounts-password, either emails or username is required, but not both. It is OK to make this
    // optional here because the accounts-password package does its own validation.
    // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
    optional: true
  },
  "emails.$": {
    type: Object
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  "emails.$.verified": {
    type: Boolean
  },
  createdAt: {
    type: Date,
    defaultValue: new Date()
  },
  profile: {
    type: Schema.Profile,
    optional: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  createParticipant: {
    type: Boolean,
    defaultValue: true
  },
  roles: {
    type: Array,
    optional: true
  },
  'roles.$': {
    type: String
  },
  // Avoid an 'Exception in setInterval callback'
  heartbeat: {
    type: Date,
    optional: true
  }
});

Meteor.users.attachSchema(Schema.User);