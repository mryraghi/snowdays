Accounts.emailTemplates.siteName = "Snowdays";
Accounts.emailTemplates.from = "Snowdays <support@snowdays.it>";

Accounts.emailTemplates.verifyEmail = {
  subject() {
    return "Confirm your email address";
  },
  text(user, url) {
    let emailAddress = user.emails[0].address;
    let urlWithoutHash = url.replace('#/', '');
    let supportEmail = "support@snowdays.it";
    let emailBody = `To verify your email address (${emailAddress}) visit the following link:\n\n${urlWithoutHash}\n\n
    If you did not request this verification, please ignore this email.
    If you feel something is wrong, please contact our support team: ${supportEmail}.`;

    return emailBody;
  }
};