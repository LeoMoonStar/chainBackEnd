const docusign=require('docusign-esign');
var envDef = new docusign.EnvelopeDefinition();
envDef.emailSubject = 'little sample';
envDef.templateId = '{TEMPLATE_ID}';

// create a template role with a valid templateId and roleName and assign signer info
var tRole = new docusign.TemplateRole();
tRole.roleName = '{ROLE}';
tRole.name = '{USER_NAME}';
tRole.email = '{USER_EMAIL}';

// set the clientUserId on the recipient to mark them as embedded (ie we will generate their signing link)
tRole.clientUserId = '1001';

// create a list of template roles and add our newly created role
var templateRolesList = [];
templateRolesList.push(tRole);

// assign template role(s) to the envelope
envDef.templateRoles = templateRolesList;

// send the envelope by setting |status| to 'sent'. To save as a draft set to 'created'
envDef.status = 'sent';

// use the |accountId| we retrieved through the Login API to create the Envelope
var accountId = accountId;

// instantiate a new EnvelopesApi object
var envelopesApi = new docusign.EnvelopesApi();

// call the createEnvelope() API
envelopesApi.createEnvelope(accountId, {'envelopeDefinition': envDef}, function (err, envelopeSummary, response) {
  if (err) {
    return next(err);
  }
  console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary));
});