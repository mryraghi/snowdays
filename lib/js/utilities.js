/**
 * @author Romeo Bellon
 */

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
 * @param {Object} o - Object to be flattened
 * @param {String} [q = ""] - Optional prefix to all key strings
 * @param {Object} [r] - Optional object to merge
 * @param {Array} [a] - Optional array to merge
 * @returns {{Object}}
 */
export function deepFlatten(o, q = '', r = {}, a = []) {
  _.forEach(o, (v, k) => {
    let p = (q == '' ? q : q + '.');
    if (_.isEqual(k, 'history')) {
      // do nothing
    } else if (_.isArray(o)) {
      let i = deepFlatten(v, p, {}, a);
      a.push(i);
    }
    else if (_.isObject(v)) deepFlatten(v, p + k, r, a);
    else r[p + k] = v;
  });
  return (_.isArray(o) ? a : r)
}

// export function deepFlatten(o, q = '', r = {}) {
//   _.forEach(o, (v, k) => {
//     let p = (q == '' ? q : q + '.');
//     if (_.isObject(v)) deepFlatten(v, p + k, r);
//     else r[p + k] = v;
//   });
//   return r
// }

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