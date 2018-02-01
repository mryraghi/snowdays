import './register.html'

Template.RegisterPage.onCreated(function () {
  this.currentTab = new ReactiveVar('RegisterFormSection');
  this.showButtons = new ReactiveVar(true);
});

Template.RegisterPage.events({
  'click #host': function (event, template) {
    template.currentTab.set('RegisterPageHost');
    template.showButtons.set(false)
  },
  'click #normale': function (event, template) {
    template.currentTab.set('RegisterPageNormal');
    template.showButtons.set(false)

  }
});

Template.RegisterPage.helpers({
  showButtons: function () {
    return Template.instance().showButtons.get();
  },
  tab: function () {
    return Template.instance().currentTab.get();
  }
});