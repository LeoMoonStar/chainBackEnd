const express = require('express')
    , passport = require('passport')
    , session = require('express-session')
    , docusign = require('docusign-esign')
    , moment = require('moment')
    , fs = require('fs-extra')
    , path = require('path')
    , {promisify} = require('util') // http://2ality.com/2017/05/util-promisify.html
    ;

const app = express()
    , port = process.env.PORT || 3000
    , host = process.env.HOST || 'localhost'
    , hostUrl = 'http://' + host + ':' + port
    , clientID = process.env.DS_CLIENT_ID || '{CLIENT_ID}'
    , clientSecret = process.env.DS_CLIENT_SECRET || '{CLIENT_SECRET}'
    , signerEmail = process.env.DS_SIGNER_EMAIL || '{USER_EMAIL}'
    , signerName = process.env.DS_SIGNER_NAME || '{USER_NAME}'
    , templateId = process.env.DS_TEMPLATE_ID || '{TEMPLATE_ID}'
    , baseUriSuffix = '/restapi'
    , testDocumentPath = '../demo_documents/test.pdf'
    , test2DocumentPath = '../demo_documents/battle_plan.docx'
    ;

let apiClient // The DocuSign API object
  , accountId // The DocuSign account that will be used
  , baseUri // the DocuSign platform base uri for the account.
  , eg // The example that's been requested
  ;

// Configure Passport
passport.use(new docusign.OAuthClient({
    sandbox: true,
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: hostUrl + '/auth/callback',
    state: true // automatic CSRF protection.
    // See https://github.com/jaredhanson/passport-oauth2/blob/master/lib/state/session.js
  },
  function (accessToken, refreshToken, params, user, done) {
    // The params arg will be passed additional parameters of the grant.
    // See https://github.com/jaredhanson/passport-oauth2/pull/84
    //
    // Here we're just assigning the tokens to the user profile object but we
    // could be using session storage or any other form of transient-ish storage
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    user.expiresIn = params.expires_in;
    // Calculate the time that the token will expire
    user.expires = moment().add(user.expiresIn, 's');
    return done(null, user);
  }
));

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete GitHub profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {done(null, user)});
passport.deserializeUser(function(obj, done) {done(null, obj)});

// Configure the webserver
app.use(session({
  secret: 'secret token',
  resave: true,
  saveUninitialized: true
}))
.use(passport.initialize())
.use(passport.session())
/* Home page */
.get('/', function (req, res) {
  res.send(`<h2>Home page</h2>
<h3><a href="/go?eg=1">Send Envelope via email</a></h3>
<h3><a href="/go?eg=2">Embeddded Signing Ceremony</a></h3>
<h3><a href="/go?eg=3">Send envelope using a template</a></h3>
<h3><a href="/go?eg=4">Embedded Sending</a></h3>
<h3><a href="/go?eg=5">Embedded DocuSign console</a></h3>
<h3><a href="/go?eg=6">List multiple envelopes' status</a></h3>
<h3><a href="/go?eg=7">Get an envelope's status</a></h3>
<h3><a href="/go?eg=8">List an envelope's recipients</a></h3>
<h3><a href="/go?eg=9">Download an envelope's document(s)</a></h3>
`)})
// ########################################################
// ########################################################
/* Page for starting OAuth Authorization Code Grant */
.get('/auth', function (req, res, next) {
  passport.authenticate('docusign')(req, res, next);
})
/* Page for handling OAuth Authorization Code Grant callback */
.get('/auth/callback', [dsLoginCB1, dsLoginCB2])
/* Page to receive pings from the DocuSign embedded Signing Ceremony */
.get('/dsping', dsPingController)
/* Middleware: ensure that we have a DocuSign token. Obtain one if not. */
/*             checkToken will apply to all subsequent routes. */
.use(checkToken)
/* Page to execute an example */
.get('/go', goPageController)

/* Start the web server */
if (clientID === '{CLIENT_ID}') {
  console.log(`PROBLEM: You need to set the Client_ID (Integrator Key), and perhaps other settings as well. You can set them in the source or set environment variables.`);
} else {
  app.listen(port, host, function (err) {
    if (err) {
      throw err;
    }
    console.log(`Ready! Open ${hostUrl}`);
  });
}