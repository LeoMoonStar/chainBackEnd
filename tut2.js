var docusign = require('docusign-node');
var async = require('async');


var integratorKey 		    = "0396bb35-f814-4cd4-8462-6ac9093de12b", //Integrator Key associated with your DocuSign Integration
		email 		        = "jyang@nobul.com", //Email for your DocuSign Account
		password	        = "June2018!", //Password for your DocuSign Account
		docusignEnv		    = "***", //DocuSign Environment generally demo for testing purposes
		fullName		    = "", //Recipient's Full Name
		recipientEmail		= "***", //Recipient's Email
		templateId		    = "***", //ID of the Template you with to create the Envelope with
		templateRoleName	= "***"; //Role Name of the Template

var templateRoles = [{
	email: email,
	name: fullName,
	roleName: tempalteRoleName,
}]

async.waterfall([
    //**********************************************************************************
    // Step 1 - Initialize DocuSign Object with Integratory Key and Desired Environment
    //**********************************************************************************
	function init(next){
		docusign.init(integratorKey, docusignEnv, debug, function(response){
			if(response.message === 'succesfully initialized'){
				next(null);
			} else {
				return;
			}
		});
	},

    //**********************************************************************************
    // Step 2 - Create a DocuSign Client Object
    //**********************************************************************************
	function createClient(next){
		docusign.client(email, password, function(response){
			if('error' in response){
				console.log('Error: ' + response.error);
				return;
			}
			next(null, response);
		});
	},

    //**********************************************************************************
    // Step 3 - Request Signature via Template
    //**********************************************************************************
	function sendTemplate(client, next){
      client.envelopes.sendEnvelope('Sent from a Template', templateId, templateRoles, function(err, response){
        if(response.error){
      	  console.log('Error: ' + response.error);
      	  return;
        }
        console.log('The envelope information of the created envelope is: \n' + JSON.stringify(response));
        next(null, client);
      });
    },

    //**********************************************************************************
    // Step 4 - Revoke OAuth Token for Logout
    //**********************************************************************************
    function logOut(client, next){
      client.logOut(function(err, response){
        if(!err){
      	  next(null);	
        } else {
      	  console.log(err);
        }
      });
    },

]);