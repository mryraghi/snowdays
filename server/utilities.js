/**
 * @author Romeo Bellon
 */

import _ from 'lodash'

export function checkMasterPassword(password) {
  return _.isEqual(password, Meteor.settings.masterPassword);
}