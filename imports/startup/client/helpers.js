import _ from "lodash";
import moment from "moment";

Template.registerHelper('equals', function (a, b) {
  return a === b;
});

Template.registerHelper('not_equals', (a1, a2) => {
  return a1 !== a2;
});

Template.registerHelper('gender', (gender) => {
  let user = Meteor.user();
  if (user) return !!(_.isEqual(user.profile.gender, gender))
});

Template.registerHelper('incremented', function (index) {
  index++;
  return index;
});

Template.registerHelper("objectToPairs", function (array) {
  let result = [];

  _.forEach(array, function (object) {
    _.map(object, function (operator, field) {


      let operation = Object.keys(operator)[0];
      let value = operator[operation];

      result.push({
        field: field,
        operation: operation,
        value: value
      })
    });
  });

  return result
});

Template.registerHelper('$or', function (a, b) {
  return a || b;
});

Template.registerHelper('$and', function (a, b) {
  return a && b;
});

Template.registerHelper('moment', function (date, format) {
  if (_.isUndefined(date)) return;
  return moment(date).format(format)
});

Template.registerHelper('objectToArray', function (obj) {
  return objToArray(obj)
});

function objToArray(obj, array = [], prefix = '') {
  _.forEach(obj, function (value, key) {
    if (_.isObject(value)) objToArray(value, array, key + '.');
    else {
      let item = {};
      item[prefix + key] = value;
      array.push(item);
    }
  });
  return array
}

Template.registerHelper('getKey', function (obj) {
  return _.keys(obj)[0];
});

Template.registerHelper('getValue', function (obj) {
  return _.toString(_.values(obj)[0]);
});

Template.registerHelper('toStr', function (value) {
  return _.toString(value);
});

Template.registerHelper("selectedIf", function (left, right) {
  return left == right ? "selected" : "";
});

Template.registerHelper("boolToColor", function (boolean) {
  return boolean ? "sn-cell-green" : "sn-cell-red";
});

Template.registerHelper("isEmpty", function (array) {
  check(array, Array);
  return _.isEmpty(array);
});

