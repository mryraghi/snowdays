Schema = {};
Participants = new Mongo.Collection("participants");

import _ from 'lodash'

Schema.Participant = new SimpleSchema({
  _id: {
    type: String,
    optional: function () {
      // if owner field is
      return !!_.isNil(this.owner);
    }
  },
  owner: {
    type: String,
    optional: function () {
      // if owner field is
      return !!_.isNil(this._id);
    }
  },
  first_name: {
    type: String,
    label: "Your first name",
    max: 25
  },
  last_name: {
    type: String,
    label: "Your last name",
    max: 25
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  phone: {
    type: String,
    label: "Your phone",
    optional: true
  },
  university: {
    type: String,
    label: "University",
    optional: true
  },
  info: {
    type: Schema.Info,
    optional: true
  },
  birth: {
    type: Schema.Birth,
    optional: true
  },
  bank: {
    type: Schema.Bank,
    optional: true
  },
  friday: {
    type: Schema.Friday,
    optional: true
  },
  thursday: {
    type: Schema.Thursday,
    optional: true
  },
  food_allergies: {
    type: String,
    label: "Food Allergies",
    optional: true
  },
  t_shirt: {
    type: String,
    label: "T-Shirt Size",
    optional: true
  },
  is_volley_player: {
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  has_personal_id: {
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  has_student_id: {
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  createdAt: {
    type: Date,
    defaultValue: new Date(),
    optional: true
  }
});

Schema.Friday = new SimpleSchema({
  activity: {
    type: String,
    label: "The friday activity",
    optional: true
  },
  rental: {
    type: Boolean,
    label: "The rental",
    optional: true
  },
  race: {
    type: Boolean,
    label: "Race",
    optional: true
  },
  course: {
    type: Boolean,
    label: "Course",
    optional: true
  }
});

Schema.Thursday = new SimpleSchema({
  activity: {
    type: String,
    label: "The thursday activity",
    optional: true
  },
  rental: {
    type: Boolean,
    label: "The rental",
    optional: true
  }
});

Schema.Bank = new SimpleSchema({
  beneficiary: {
    type: String,
    label: "Beneficiary",
    optional: true
  },
  IBAN: {
    type: String,
    label: "IBAN",
    optional: true
  },
  name: {
    type: String,
    label: "Name Bank",
    optional: true
  },
  swift_bic: {
    type: String,
    label: "SWIFT/BIC",
    optional: true
  }
});

Schema.Info = new SimpleSchema({
  address: {
    type: String,
    label: "Your address",
    optional: true
  },
  city: {
    type: String,
    label: "Your city",
    optional: true
  },
  zip: {
    type: Number,
    label: "Your zip code",
    optional: true
  },
  province: {
    type: String,
    label: "Your province",
    optional: true
  },
  country: {
    type: String,
    label: "Your country",
    optional: true
  }
});

Schema.Birth = new SimpleSchema({
  date: {
    type: String,
    label: "Your date of birth",
    optional: true
  },
  country: {
    type: String,
    label: "Your country of birth",
    max: 40,
    optional: true
  }
});

Participants.attachSchema(Schema.Participant);