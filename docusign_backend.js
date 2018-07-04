var express=require('express');
var router=express.Router();
var fs=require('fs');
var path=require('path');
var _=require('lodash');
var marke=require('marked');
var config=require('./config.js');
var app=express();
var docusign=require('docusign-esign');

router.get('/',function (req,res,next) {
    console.log(app.config);
    res.render('index'),{title:'NobulAgreementSigningBackEnd'};
});
/**
 * Need to consider remote and Embedded
 * about body in req, 
 *    optional:
 *             accessCode
 *    mandatory:
 *             broker company name
 *             broker email information
 *             agent firstName, agent lastName
 *              
 */

router.post('/sign/referralAgreement',function(req,res,next){
    //referralAgreement only happen between nobul and broker 
    var body=req.body;
    
    var agreementId=config.findRightAgreement(referralAgreement);
    //create an envelope that will store the documents(s),field(s),and recipient(s)
    var envDef=new docusign.EnvelopeDefinition();
    envDef.setEmailSubject('RefeeralAgreement Sent from Nobul');
    envDef.setEmailBlurb('The deal rgarding with agent '+body.agentFirstName+' '+body.agentLastName/
     +' is closed, we are fowarding this emaill with all of our sincercity');
    envDef.setTemplateId(agreementId);
    var broker=new docusign.TemplateRole();
    broker=setRoleName('Broker');
    broker.setName(body.agentFirstName+' '+body.agentLastName);
    broker.setEmail(body.brokerEmail)
    if(body.accessCode!='null'){// No preset for accessCode
        //All user shall have have access to the documents with accessCode
        agent.setAccessCode(body.accessCode);
    }
    //must be signed remotely
    broker.setClientUserId(null);
    // recipientEmailNotififaction contains [string]emailbody ,[string]emailSubject and [string]supportedLanguage
    
    var envelopesApi=new docusign.EnvelopesApi();
    app.helpers.removeEmptyAndNulls(envDef);
    envelopesApi.createEnvelope(app.config.auth.AccountId,envDef,null,function(error,envelopeSummary,response){
        if(error){
            console.error('Error: '+response);
            console.error(envelopeSummary);
            res.send('Error creating envelope,please try again');
            return;
        }
    })
    /**
     * Create and save the the compy in blockchain
    */
   app.helpers.createAndSaveInBlockchain(req,envelopeSummary.envelopeId).then(
       function(){

       }
   );

})

router.post('/sign/buyerRepresentationAgreement',function(req,res,next){

})

router.post('sign/sellerRepresentationAgreement',function(res,req,next){

})

function collectRequestData(request, callback) {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    //console.log(request);
    if(request.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        request.on('data', chunk => {
            //console.log(chunk.toString());
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}
module.exports='docusign_backend';