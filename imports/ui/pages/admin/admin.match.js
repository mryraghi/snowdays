
import "./admin.match.html";

Template.AdminMatchSection.onCreated(function () {
  Session.set('showMap',false);
  });

  Template.AdminMatchSection.onRendered(function () {

  });

  Template.AdminMatchSection.helpers({
    showTheMapHelper:function(){
        return Session.get('showMap');
    }
})

  Template.AdminMatchSection.events({

    'click #matchingBus': function (event, template) {

      
      var elem = document.getElementById("myBar");   
      var width = 10;
      var id = setInterval(frame, 10);
      function frame() {
          if (width >= 100) {
          clearInterval(id);
          //alert("Hi I'm an alert!")
          Session.set('showMap',true);
          } else {
          width++; 
          elem.style.width = width + '%'; 
          elem.innerHTML = width * 1  + '%';
          }
      }
    }
  })