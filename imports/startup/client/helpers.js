import _ from 'lodash'

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