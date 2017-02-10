import "babel-polyfill";
import SimpleSchema from "simpl-schema";
import _ from "lodash";

const Participants = new Mongo.Collection("participants");
const Schemas = {};

// firstName and lastName have index: 1
// See https://github.com/aldeed/meteor-schema-index

// TODO: shoe size, height, weight

Schemas.Day1 = new SimpleSchema({
  bus1: {
    type: Boolean,
    defaultValue: false,
    label: "(Day 1) Bus 1",
    optional: true
  },
  bus2: {
    type: Boolean,
    defaultValue: false,
    label: "(Day 1) Bus 2",
    optional: true
  },
  activity: {
    type: String,
    label: "(Day 1) activity",
    allowedValues: ['relax', 'ski', 'snowboard', 'sledging'],
    optional: true
  },
  rental: {
    type: String,
    label: "(Day 1) rental",
    allowedValues: ['no', 'ski', 'snowboard', 'ski + boots', 'snowboard + boots', 'ski boots', 'snowboard boots', 'sledge'],
    optional: true
  },
});

Schemas.Day2 = new SimpleSchema({
  bus1: {
    type: Boolean,
    defaultValue: false,
    label: "(Day 2) Bus 1",
    optional: true
  },
  bus2: {
    type: Boolean,
    defaultValue: false,
    label: "(Day 2) Bus 2",
    optional: true
  },
  activity: {
    type: String,
    label: "(Day 2) Activity",
    allowedValues: ['relax', 'ski', 'snowboard', 'ski race', 'snowboard race', 'snowshoe hiking', 'cross country'],
    optional: true
  },
  rental: {
    type: String,
    label: "Day 2 rental",
    allowedValues: ['no', 'ski', 'snowboard', 'ski + boots', 'snowboard + boots', 'ski boots', 'snowboard boots', 'snow rackets', 'cross country ski'],
    optional: true
  },
  course: {
    type: Boolean,
    defaultValue: false,
    label: "Day 2 course",
    optional: true
  },
  meal1: {
    type: Boolean,
    defaultValue: false,
    label: "(Day 2) Meal 1",
    optional: true
  }
});

Schemas.Day3 = new SimpleSchema({
  bus1: {
    type: Boolean,
    defaultValue: false,
    label: "Day 3 Bus 1",
    optional: true
  },
  bus2: {
    type: Boolean,
    defaultValue: false,
    label: "Day 3 Bus 2",
    optional: true
  },
  meal1: {
    type: Boolean,
    defaultValue: false,
    label: "(Day 3) Meal 1",
    optional: true
  },
  meal2: {
    type: Boolean,
    defaultValue: false,
    label: "(Day 3) Meal 2",
    optional: true
  }
});

Schemas.Info = new SimpleSchema({
  accommodation: {
    type: String,
    optional: true
  },
  room: {
    type: String,
    optional: true
  },
  street: {
    type: String,
    max: 30,
    optional: true
  },
  number: {
    type: String,
    max: 10,
    optional: true
  },
  city: {
    type: String,
    max: 30,
    optional: true
  },
  zip: {
    type: Number,
    max: 9999999,
    optional: true
  },
  province: {
    type: String,
    max: 30,
    optional: true
  },
  country: {
    type: String,
    max: 30,
    optional: true
  }
});

Schemas.Host = new SimpleSchema({
  id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  firstName: {
    type: String,
    label: '[H] First name',
    optional: true
  },
  lastName: {
    type: String,
    label: '[H] Last name',
    optional: true
  },
  info: {
    type: Schemas.Info,
    label: '[H] ',
    optional: true
  }
});

Schemas.Birth = new SimpleSchema({
  date: {
    label: 'Birth date',
    type: String,
    regEx: /\d{4}(-)\d{2}(-)\d{2}/,
    max: 10,
    optional: true
  },
  country: {
    label: "Country of birth",
    type: String,
    max: 30,
    optional: true
  }
});

Schemas.Participant = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  firstName: {
    type: String,
    max: 30,
    index: 1,
    optional: true
  },
  lastName: {
    type: String,
    max: 30,
    index: 1,
    optional: true
  },
  gender: {
    type: String,
    allowedValues: ['M', 'F'],
    optional: true
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    max: 30,
    optional: true
  },
  // TODO: validate phone number
  phone: {
    type: String,
    max: 15,
    optional: true
  },
  university: {
    type: String,
    max: 40,
    optional: true
  },
  host: {
    type: Schemas.Host,
    optional: true
  },
  info: {
    type: Schemas.Info,
    optional: true
  },
  birth: {
    type: Schemas.Birth,
    optional: true
  },
  day1: {
    type: Schemas.Day1,
    optional: true
  },
  day2: {
    type: Schemas.Day2,
    optional: true
  },
  day3: {
    type: Schemas.Day3,
    optional: true
  },
  checkedIn: {
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  isVolleyPlayer: {
    label: 'isVolleyPlayer',
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  isFootballPlayer: {
    label: 'isFootballPlayer',
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  hasPersonalID: {
    label: 'hasPersonalID',
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  hasStudentID: {
    label: 'hasStudentID',
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  foodAllergies: {
    type: String,
    max: 30,
    defaultValue: 'None',
    optional: true
  },
  tshirt: {
    label: 'T-shirt',
    type: String,
    allowedValues: ['S', 'M', 'L', 'XL'],
    optional: true
  },
  shoeSize: {
    label: 'Shoe size',
    type: Number,
    max: 100,
    optional: true
  },
  history: {
    type: Array,
    optional: true,
    autoValue: function () {
      if (this.isUpdate) {
        return {
          $push: {
            date: new Date,
            updates: {}
          }
        };
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    }
  },
  'history.$': {
    type: Object,
  },
  'history.$.date': {
    type: Date,
    optional: true
  },
  'history.$.updates': {
    type: Object,
    optional: true
  },
  'history.$.updates.field': {
    type: String,
    optional: true
  },
  'history.$.updates.value': {
    type: String,
    optional: true
  },
  token: {
    type: String,
    optional: true
  },
  statusComplete: {
    type: Boolean,
    label: '',
    defaultValue: false,
    optional: true
  },
  hasAcceptedTandC: {
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  createdAt: {
    type: Date,
    defaultValue: new Date(),
    denyUpdate: true,
    optional: true
  },
  updatedAt: {
    type: Date,
    autoValue: function () {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true
  }
}, {
  clean: {
    filter: true,
    autoConvert: true,
    removeEmptyStrings: true,
    trimStrings: true,
    getAutoValues: true,
    removeNullsFromArrays: true,
  }
});

Participants.attachSchema(Schemas.Participant);

Participants.before.update(function (userId, doc, fieldNames, modifier) {
  // efficiently copy $set modifier
  let $set = JSON.parse(JSON.stringify(modifier.$set));

  // remove _id and updatedAt properties since not needed in history
  delete $set._id;
  delete $set.updatedAt;

  // check if property values are equal in the doc, if yes remove
  _.forEach($set, function (value, key) {
    if (_.isEqual(value, doc[key])) delete $set[key]
  });

  if (_.isEmpty($set)) {
    delete modifier.$push
  } else {
    // update history
    modifier.$push.history.updates = $set;
  }

  // then update statusComplete iff all fields are ok
  let result = true;

  // list of fields checked
  let fields = ['firstName', 'lastName', 'gender', 'email', 'phone', 'university',
    'info.street', 'info.number', 'info.zip', 'info.city', 'info.country', 'info.province',
    'birth.date', 'birth.country', 'day1.activity', 'day1.rental', 'day2.activity',
    'day2.rental', 'tshirt', 'hasAcceptedTandC'];

  // check if every field is set
  _.forEach(fields, function (field) {
    if (_.isUndefined(_.get(doc, field)) && _.isUndefined(_.get($set, field))) {
      result = false
    }
  });

  // get settings
  Meteor.call('settings.get', userId, function (error, settings) {
    if (settings && settings.form && settings.form.doNotAsk) {
      let formSettings = settings.form.doNotAsk;

      // check if hasPersonalID
      if (formSettings.indexOf('hasPersonalID') == -1 && !(doc['hasPersonalID'] || $set['hasPersonalID'])) {
        result = false
      }

      // check if hasStudentID
      if (formSettings.indexOf('hasStudentID') == -1 && !(doc['hasStudentID'] || $set['hasStudentID'])) {
        result = false
      }

    }
  });

  // finally, if result is true then update statusComplete
  if (result) modifier.$set.statusComplete = true;
});

export default Participants