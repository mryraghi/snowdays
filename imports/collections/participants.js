import "babel-polyfill";
import SimpleSchema from "simpl-schema";
import _ from "lodash";
import moment from 'moment'

const Participants = new Mongo.Collection("participants");
const Schemas = {};

// firstName and lastName have index: 1
// See https://github.com/aldeed/meteor-schema-index

// put # at the end so client will drop what will be appended
SimpleSchema.setDefaultMessages({
  messages: {
    en: {
      "invalidInternalEmail": "'{{{value}}}' is not a valid email: only @unibz.it and @stud.claudiana.bz.it are allowed #",
      "mustBeHelperOrHost": "Registrations are allowed only to helpers and hosts until the 21st #",
      "maxOneHostInDorm": "Since you live in a dorm only 1 guest is allowed #",
      "maxAllowedHelperReached": "The helper category you've chosen is complete. Please chose another one or host some. #"
    },
  },
});

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
  meal1: {
    type: Boolean,
    defaultValue: false,
    label: "(Day 1) Meal 1",
    optional: true
    // todo: return if external or not
    // only for externals in UniMensa
  },
  meal2: {
    type: Boolean,
    defaultValue: false,
    label: "(Day 1) Meal 1",
    optional: true
    // todo: return if external or not
    // only for externals in UniMensa
  }
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
  meal1: {
    type: Boolean,
    defaultValue: false,
    label: "(Day 2) Meal 1",
    optional: true
  },
  meal2: {
    type: Boolean,
    defaultValue: false,
    label: "(Day 2) Meal 2",
    optional: true
  },

  hasSkipass: {
    type: Boolean,
    defaultValue: false,
    label: "(Day 2) Has ski pass",
    optional: true
  },

  // todo: check if already true
  // if dressed up
  drink1: {
    type: Boolean,
    defaultValue: false,
    label: "(Day 2) Drink 1",
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

Schemas.Requestor = new SimpleSchema({
  university: {
    type: String,
    optional: true
  },
  request_capacity: {
    type: String,
    optional: true
  }
});

Schemas.Info = new SimpleSchema({
  requesting_number: {
    type: String,
    optional: true
  },
  accommodation: {
    type: String,
    optional: true
  },
  room: {
    type: String,
    optional: true,
    custom: function () {
      let accommodationType = this.field('accommodationType').value;

      if (_.isEqual(accommodationType, 'dorm')) {
        // inserts
        if (!this.operator) {
          if (!this.isSet || this.value === null || this.value === "") return "required";
        }

        // updates
        else if (this.isSet) {
          if (this.operator === "$set" && this.value === null || this.value === "") return "required";
          if (this.operator === "$unset") return "required";
          if (this.operator === "$rename") return "required";
        }
      }
    }
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
    type: String,
    max: 10,
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
    max: 40,
    optional: true,
    custom: function () {
      if (this.field('isHost').value || this.field('isHelper').value) {
        let pattern = /^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?(unibz|stud\.claudiana\.bz)\.it$/g;

        if (!pattern.test(this.value)) {
          return "invalidInternalEmail"
        }
      }
    }
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

  // ACTIVITIES
  course: {
    type: Boolean,
    defaultValue: false,
    label: "Ski Course",
    optional: true
  },
  rental: {
    type: Boolean,
    defaultValue: false,
    label: "Ski Rental",
    optional: true
  },
  activity: {
    type: Boolean,
    defaultValue: false,
    label: "Ski/Snowboard",
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

  // DOCUMENTS
  hasPersonalIDFront: {
    label: 'hasPersonalIDFront',
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  hasPersonalIDBack: {
    label: 'hasPersonalIDBack',
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  hasValidPersonalID: {
    label: 'Has valid personal ID',
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  hasStudentIDFront: {
    label: 'hasStudentIDFront',
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  hasStudentIDBack: {
    label: 'hasStudentIDBack',
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  hasValidStudentID: {
    label: 'Has valid student ID',
    type: Boolean,
    defaultValue: false,
    optional: true
  },

  // PAYMENT
  paymentID: {
    label: 'Payment ID',
    type: String,
    unique: true,
    optional: true
  },
  hasPaid: {
    label: 'Has paid',
    type: Boolean,
    defaultValue: false
  },
  amountToPay: {
    label: 'Amount to pay',
    type: Number,
    optional: true
  },

  // PREFERENCES
  foodAllergies: {
    type: String,
    max: 30,
    defaultValue: '-',
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
  height: {
    label: 'Height',
    type: Number,
    max: 230,
    optional: true
  },
  weight: {
    label: 'Weight',
    type: Number,
    max: 200,
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

  // HOST
  isHost: {
    type: Boolean,
    label: 'isHost',
    defaultValue: false,
    optional: true,
    custom: function () {
      let shouldBeRequired = moment().isBetween('2018-01-01', '2018-01-21');

      if (shouldBeRequired
        && !this.field('isHelper').value
        && !this.value
        && this.field('hasStudentIDBack').value
        && this.field('hasStudentIDFront').value
        && this.field('hasPersonalIDBack').value
        && this.field('hasPersonalIDFront').value) {
        return "mustBeHelperOrHost"
      }
    }
  },
  accommodationType: {
    type: String,
    label: 'Accommodation type',
    allowedValues: ['private', 'dorm'],
    optional: true,
    custom: function () {
      let shouldBeRequired = this.field('isHost').value;

      // check whether he/she is in a dorm
      // if yes max is 1
      if (_.isEqual(this.value, 'dorm') && this.field('noOfGuests').value > 1) {
        return "maxOneHostInDorm"
      }

      if (shouldBeRequired) {
        // inserts
        if (!this.operator) {
          if (!this.isSet || this.value === null || this.value === "") return "required";
        }

        // updates
        else if (this.isSet) {
          if (this.operator === "$set" && this.value === null || this.value === "") return "required";
          if (this.operator === "$unset") return "required";
          if (this.operator === "$rename") return "required";
        }
      }
    }
  },
  studentDorm: {
    type: String,
    label: 'Accommodation type',
    allowedValues: ['rigler', 'hsb', 'univercity', 'rainerum', 'dante'],
    optional: true,
    custom: function () {
      let shouldBeRequired = this.field('isHost').value && _.isEqual(this.field('accommodationType'), 'dorm');

      if (shouldBeRequired) {
        // inserts
        if (!this.operator) {
          if (!this.isSet || this.value === null || this.value === "") return "required";
        }

        // updates
        else if (this.isSet) {
          if (this.operator === "$set" && this.value === null || this.value === "") return "required";
          if (this.operator === "$unset") return "required";
          if (this.operator === "$rename") return "required";
        }
      }
    }
  },
  guestPreference: {
    type: String,
    label: 'Guest preference',
    allowedValues: ['-', 'M', 'F'],
    optional: true,
    custom: function () {
      let shouldBeRequired = this.field('isHost').value;

      if (shouldBeRequired) {
        // inserts
        if (!this.operator) {
          if (!this.isSet || this.value === null || this.value === "") return "required";
        }

        // updates
        else if (this.isSet) {
          if (this.operator === "$set" && this.value === null || this.value === "") return "required";
          if (this.operator === "$unset") return "required";
          if (this.operator === "$rename") return "required";
        }
      }
    }
  },
  noOfGuests: {
    type: Number,
    label: 'Number of guests',
    min: 0,
    max: 7,
    optional: true,
    custom: function () {
      let shouldBeRequired = this.field('isHost').value;

      // check whether he/she is in a dorm
      // if yes max is 1
      if (_.isEqual(this.field('accommodationType').value, 'dorm') && this.value > 1) {
        return "maxOneHostInDorm"
      }

      if (shouldBeRequired) {
        // inserts
        if (!this.operator) {
          if (!this.isSet || this.value === null || this.value === "") return "required";
        }

        // updates
        else if (this.isSet) {
          if (this.operator === "$set" && this.value === null || this.value === "") return "required";
          if (this.operator === "$unset") return "required";
          if (this.operator === "$rename") return "required";
        }
      }
    }
  },

  // HELPER
  isHelper: {
    type: Boolean,
    label: 'isHelper',
    defaultValue: false,
    optional: true,
    custom: function () {
      let shouldBeRequired = moment().isBetween('2018-01-01', '2018-01-21');

      if (shouldBeRequired
        && !this.field('isHost').value
        && !this.value
        && this.field('hasStudentIDBack').value
        && this.field('hasStudentIDFront').value
        && this.field('hasPersonalIDBack').value
        && this.field('hasPersonalIDFront').value) {
        return "mustBeHelperOrHost"
      }
    }
  },
  helperCategory: {
    type: String,
    label: 'Helper category',
    optional: true,
    allowedValues: ['sport', 'catering', 'party', 'logistics', 'it'],
    custom: function () {
      let shouldBeRequired = this.field('isHelper').value;

      // TODO: no hardcoded
      let max = {
        sport: 30,
        catering: 35,
        party: 30,
        logistics: 10,
        it: 0
      };

      let maxAllowed = max[this.value];
      let count = Participants.find({
        $and: [
          {_id: {$ne: this.field('_id').value}},
          {helperCategory: this.value}
        ]
      }).count() - 1;

      // can't be -1
      if (count < 0) count = 0;

      // throw error if max has been reached
      if (count > maxAllowed)
        return "maxAllowedHelperReached";

      if (shouldBeRequired) {
        // inserts
        if (!this.operator) {
          if (!this.isSet || this.value === null || this.value === "") return "required";
        }

        // updates
        else if (this.isSet) {
          if (this.operator === "$set" && this.value === null || this.value === "") return "required";
          if (this.operator === "$unset") return "required";
          if (this.operator === "$rename") return "required";
        }
      }
    }
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
    // denyUpdate: true,
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
    if (_.isEqual(value, doc[key])) delete $set[key];

    // MongoDB does not accept dots in keys so substitute all dots
    if (_.includes(key, '.')) {
      // delete old key value
      delete $set[key];
      // replace dots with underscores
      let newKey = _.replace(key, '.', '_');
      $set[newKey] = value
    }
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
    'day2.rental', 'tshirt', 'hasAcceptedTandC', 'hasPaid', 'isHost', 'accommodationType', 'studentDorm',
    'guestPreference', 'noOfGuests', 'helperCategory', 'isHelper'];

  // check if every field is set
  _.forEach(fields, function (field) {
    if (_.isUndefined(_.get(doc, field)) && _.isUndefined(_.get($set, field))) {
      result = false
    }
  });

  // get settings
  // Meteor.call('settings.get', userId, function (error, settings) {
  //   if (settings && settings.form && settings.form.doNotAsk) {
  //     let formSettings = settings.form.doNotAsk;
  //
  //     // check if hasPersonalID
  //     if (formSettings.indexOf('hasPersonalID') === -1 && !(doc['hasPersonalID'] || $set['hasPersonalID'])) {
  //       result = false
  //     }
  //
  //     // check if hasStudentID
  //     if (formSettings.indexOf('hasStudentID') === -1 && !(doc['hasStudentID'] || $set['hasStudentID'])) {
  //       result = false
  //     }
  //
  //   }
  // });

  // finally, if result is true then update statusComplete
  if (result) modifier.$set.statusComplete = true;
});

export default Participants