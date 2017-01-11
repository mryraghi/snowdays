// import ravenClient from 'raven-js'
//
// ravenClient.config('https://7b01834070004a4a91b5a7ed14c0b411:79de4d1bd9f24d1a93b78b18750afb54@sentry.io/126769', {
//   environment: Meteor.settings.public.environment
// }).install();
//
// Accounts.onLogin(function () {
//   let user = Meteor.user();
//   ravenClient.setUserContext({
//     id: user._id,
//     username: user.username
//   });
//
//   ravenClient.setExtraContext({
//     user: user
//   })
// });
//
// Accounts.onLogout(function () {
//   console.log('onLogout');
//   ravenClient.setUserContext();
// });
//
// export const wrapMeteorDebug = function () {
//   let originalMeteorDebug = Meteor._debug;
//   Meteor._debug = function (m, s) {
//     // We need to asign variables like this. Otherwise,
//     // we can't see proper error messages.
//     // See: https://github.com/meteorhacks/kadira/issues/193
//     let message = m;
//     let stack = s;
//
//     // We hate Meteor._debug (no single usage pattern)
//     if (message instanceof Error) {
//       ravenClient.captureException(message);
//     } else if (typeof message === 'string') {
//       let extra = {level: "error"};
//       //meteor._debug never seems to receive a stack here but just in case let's add it as context.
//       if (stack) {
//         extra.stack = stack;
//       } else {
//         //otherwise let's generate a stack trace
//         extra.stacktrace = true;
//       }
//       ravenClient.captureMessage(message, extra);
//     }
//     return originalMeteorDebug.apply(this, arguments);
//   };
// };