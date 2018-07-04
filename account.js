const docusign=require('docusign-esign');
const integratorKey='0396bb35-f814-4cd4-8462-6ac9093de12b';
var Q= require('q');



setup.Templates=function(next){
    var templatesApi= new docusign.TemplatesApi();
    templatesApi.listTemplates(app.config.auth.AccountId,function(error,templateList,response){
        var promises=[];
        _.each(app.config.templates,function(templateObj){
            var templateDef=Q.defer();
            promises.push(templateDef.promise);
            var template=_.find(templateList.enve)
        })
    })
}