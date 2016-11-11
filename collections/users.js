Schema = {};

Schema.UserProfile = new SimpleSchema({
  first_name: {
    type: String
  },
  last_name: {
    type: String
  },
  birthday: {
    type: Date,
    optional: true
  },
  gender: {
    type: String,
    allowedValues: ['Male', 'Female'],
    optional: true
  },
  university: {
    type: String,
    label: "University",
    optional: true
  },
  team_volley: {
    type: Boolean,
    label: "Team Snowvolley",
    optional: true
  },
  allowed_participants: {
    type: Number
  }
});

Schema.User = new SimpleSchema({
  username: {
    type: String
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
    type: Schema.UserProfile,
    optional: true
  },
  // Make sure this services field is in your schema if you're using any of the accounts packages
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  roles: {
    type: Array,
    optional: true
  },
  'roles.$': {
    type: String
  },
  survey: {
    type: Boolean,
    defaultValue: false
  },
  // In order to avoid an 'Exception in setInterval callback' from Meteor
  heartbeat: {
    type: Date,
    optional: true
  }
});

Meteor.users.attachSchema(Schema.User);