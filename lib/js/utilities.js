import base64url from 'base64url'
let CryptoJS = require("crypto-js");
import Participants from '/imports/collections/participants'
import SimpleSchema from 'simpl-schema';

/**
 * Picks only fields with value = 1
 * @param {Object} o - Object
 * @returns {{Object}}
 */
export function deepPick(o) {
  return _.forEach(o, function (v, k) {
    if (_.isObject(v)) deepPick(v);
    // remove property if != 1 && != obj || obj && !empty
    if ((!_.isEqual(v, 1) && !_.isObject(v)) || (_.isObject(v) && _.isEmpty(v))) delete o[k];
  });
}

/**
 * Flattens object
 * @returns {{Object}}
 * @param data
 */
export function flatten(data) {
  let result = {};

  function recurse(cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      let l;
      for (let i = 0, l = cur.length; i < l; i++)
        recurse(cur[i], prop + "[" + i + "]");
      if (l == 0)
        result[prop] = [];
    } else {
      let isEmpty = true;
      for (let p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + "." + p : p);
      }
      if (isEmpty && prop)
        result[prop] = {};
    }
  }

  recurse(data, "");
  return result;
}

export function unflatten(data) {
  "use strict";
  if (Object(data) !== data || Array.isArray(data))
    return data;
  let regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
    resultholder = {};
  for (let p in data) {
    let cur = resultholder,
      prop = "",
      m;
    while (m = regex.exec(p)) {
      cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
      prop = m[2] || m[1];
    }
    cur[prop] = data[p];
  }
  return resultholder[""] || resultholder;
}

/**
 * Returns value of given string key of the form 'key1.key2.key3' given an object
 * @param {Object} o - Deep object
 * @param {String} s - Key of the form 'key1.key2.key3'
 * @returns {String} v - Value, if any
 */
export function deepFind(o, s) {
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, '');           // strip a leading dot
  let a = s.split('.');
  for (let i = 0, n = a.length; i < n; ++i) {
    let k = a[i];
    if (k in o) {
      o = o[k];
    } else {
      return;
    }
  }
  return o;
}

export function checkToken(token, hash) {
  let _idRegex = SimpleSchema.RegEx.Id;
  let _id;

  // if one is null do nothing
  if (!_.isNull(token) && !_.isUndefined(hash)) {
    let decodedToken = base64url.decode(token);

    // decrypt token with hash as password
    let bytes = CryptoJS.AES.decrypt(decodedToken, hash);

    try {
      _id = bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      // do nothing
    }

    // subscribe only if _id matches _id regex
    if (_idRegex.test(_id)) return _id;
    else swal('Error', 'Invalid password or token', 'error');
  }
}