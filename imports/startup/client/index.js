import './routes.js';
import './helpers'
// import {wrapMeteorDebug} from './logging'

Meteor.startup(function () {
  // catch all client side exceptions and send them to Sentry.io
  // wrapMeteorDebug();
});