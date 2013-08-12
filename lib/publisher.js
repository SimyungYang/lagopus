var Request = require("request");

module.exports = {
    
    //TODO file upload
  fileUpload: function(){
    
    
  }, 
    
    
  deploy: function(callback){
    //deploy
    /*
     * O&M sample
     * 
     * http://203.235.211.98:7010/onm/app-group/NMP_DEMO/ci/job/executeJobByParameters.do
     * 
     *  applicationGroupId:NMP_DEMO
        jobType:DEPLOY
        jobId:Android App
        projectId:Demo Android
        deployType:mobileApp
        requestType:upload
        validation:true
        deployRepository:0
        scheduleDate:2013-08-11
        scheduleHour:
        scheduleMinute:
        artifactFiles:C:/nmpdemo/deploy_temp/1.png
        baselineId:nobaseline
        requiredYn:on
        parentJobExecutionId:
        appVersionName:2
        appVersionCode:2
     * 
     */
    
    //Login
    
    var loginUrl = 'http://203.235.211.98:7010/onm/j_spring_security_check';
    
    console.log('############ LOGIN #############');
    
    Request.post(loginUrl,
      {qs: {j_username: "admin", j_password: "admin"}},
      function(err, res, body) {
        if(err) {
            return console.error(err);ßßß
        }
  
        console.log('err: ' + err);
      //  console.log('resp: ' + JSON.stringify(res));
        console.log('body: ' + body);
        
        //session때문에 잘안된다...
        
        console.log('############ DEPLOY #############');
        //deploy
        var url = 'http://203.235.211.98:7010/onm/app-group/NMP_DEMO/ci/job/executeJobByParameters.do';
        
        var param = {
            form: {}
        };
        
        Request.get(url, function(err, res, body){
            console.log('err: ' + err);
            console.log('resp: ' + res);
            console.log('body: ' + body.substring(0,100));
          console.log('post end');
          callback();
        });
  });
    
    
  }
    
   
    
};
