import './thankyou.html'

Template.ThankYouPage.onCreated(function () {
  setTimeout(function () {
    Router.go('Home');
  }, 2000)
});