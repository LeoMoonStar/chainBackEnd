module.exports=helpers;

helpers.createAndSaveInBlockchain=function(req,envelopeId){
    var envelopesApi=new docusign.EnvelopesApi();
    envelopesApi.getEnvelope(app.config.auth.AccountId,envelopeId,{include:false},function(error,envelopeSummary,response){
        envelopesApi.listDocuments(app.config.auth.AccountId,envelopeId,function(error,documents,response){
            if(error){
                console.log('Error:'+error);
                return;
            }
            envelopesApi.listRecipients(app.config.auth.AccountId,envelopeId,function(error,recipients,response){
                if(error){
                    console.log('Error:'+error);
                    return;
                }

            })
        })
    })
    return
}








helpers.removeEmptyAndNulls = function removeEmptyAndNulls(obj, hideBase64){
    // the API does not allow null values in many places
    var removed = false;
    if (obj) {
      var isArray = obj instanceof Array;
      Object.keys(obj).forEach(function(k) {
        if (_.isEmpty(obj[k])){
          if(isArray){
            obj.splice(k, 1);
            removed = true;
          } else {
            delete obj[k];
            removed = true;
          }
        } else if (typeof obj[k] === "object"){
          removeEmptyAndNulls(obj[k], hideBase64);
        }
        if (isArray && obj.length === k){
          removeEmptyAndNulls(obj, hideBase64);
        }
      });
    }
    if(removed){
      // run again
      removeEmptyAndNulls(obj, hideBase64);
    }
    return obj;
  }