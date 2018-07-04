var docusign = require('docusign-esign');
var _ = require('loadsh');
var fs = require('fs');
var path = require('path');

var config = {};
var tempList = {};
/**
 * if file .env exist, load the .env with dotenv
 * */

 try {
    if (fs.statSync(path.join(_dirname, '.env')).isFile()) {
        require('dotenv').config();
    }
}
catch (err) {
    console.info('not including.env');
}

var docusignEnv = process.env.DOCUSIGN_ENVIRONMENT;
var docusignBaseUrl = 'https://' + docusignEnv + '.docusign.net/restapi';

config.auth = {
    Username: process.env.DOCUSIGN_USERNAME,
    AccountId:process.env.DOCUSIGN_ACCOUNTID,
    Password: process.env.DOCUSIGN_PASSWORD,
    IntegratorKey: process.env.DOCUSIGN_IK,
    EmployeeEmail: process.env.EMPLOYEE_EMAIL,
    EmployeeName: process.env.EMPLOYEE_NAME,
    LocalReturnUrl: process.env.LOCAL_RETURN_URL
};

config.brand_id = process.env.BRAND_ID;
config.default_email = process.env.DEFAULT_EMAIL;
config.force_https = process.env.FORCE_HTTPS == 'true' ? true : false;


config.loginToDocuSign = function (next) {
    //initialize the api client
    var apiClient = new docusign.ApiClient();
    apiClient.setBasePath(docusignBaseUrl);
    //create JSON formatted auth header
    var creds = JSON.stringify({
        Username: config.auth.Username,
        Password: config.auth.Password,
        IntegratorKey: config.auth.IntegratorKey
    });
    apiClient.addDefaultHeader('x-docusign-auth', creds);
    //assign api client to the configuration object
    docusign.Configuration.default.setDefaultApiClient(apiClient);
    // login has some optional parameters
    var authApi = new docusign.AuthenticationApi();
    //set optional parameters
    var loginOps = new authApi.LoginOptions();
    loginOps.setApiPassword('true');
    loginOps.setIncludeAccountIdGuid('true');
    authApi.login(loginOps, function (err, loginInfo, response) {
        if (err) {
            console.error(err.response ? err.reponse.err : err);
            next(err);
            return;
        }
        if (loginInfo) {
            //list of user accout(s)
            //not that a given user may be a member of multiple accounts
            var loginAccounts = loginInfo.getLoginAccounts();
            var found = _.find(loginAccounts, { accountId: auth.AccountId });
            if (!found) {
                found = _.find(loginAccounts, { accountIdGuid: config.auth.AccountId });
            }
            if (!found && config.auth.AccountId) {
                return next('Specified an AccountId that we could not find');
            } else {
                found = _.find(loginAccounts, { isDefault: "true" });
                if (!found) {
                    return next('No default Account found');
                }
            }
            config.auth.AccountId = found.accountId;
            var UserBaseUrl = found.baseUrl.substr(0, found.baseUrl.indexof('/restapi') + '/restapi'.length);
            //remove everthing after "/restapi"
            console.log('UserBaseUrl:'.UserBaseUrl);
            config.auth.Baseurl = UserBaseUrl;
            apiClient.setBasePath(UserBaseurl);
            docusign.Configuration.default.setDefaultApiClient(apiClient);

            //api.listTemplate(account,opts,callback)
            //return the list of template list under accountId account
            tempList = apiClient.listTemplates(accountId, '-asc', function (js) {
                // define the object of template
                var template = { templateId: 0, name: null, url: null, folderName: null, folderId: null, folderUri: null };
                var templateList=[];
                for (let i = 0; i < js.envelopeTemplates.length; i++) {
                    // can be optimized with lodash later 
                    var temp = js.envelopeTemplates[i];
                    template.templateId = temp.templateId;
                    template.name = temp.name;
                    template.url = temp.url;
                    template.folderName = temp.folderName;
                    template.folderId = temp.folderId;
                    template.folderUri = temp.folderUri;
                    templateList.push(template);
                }
                return templateList    
            })
            next(null);
        }
        else {
            console.error(response.body);
            next('No logingInfo');
        }
    })
}

config.findRightAgreement=function (agreementName) {
    for (let index = 0; index < tempList.length; index++) {
        if(tempList[index].name==agreementName){
            return tempList[index].templateId;
    }
}
}

module.exports = config;