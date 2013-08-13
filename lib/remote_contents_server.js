
var Zip = require("adm-zip");
var Path = require('path');
var Fs = require('fs');
var Mkdirp = require("mkdirp");
var FileUtils = require("./utils/file-utils");

module.exports = {
    
    /*
     * apps/service
     * 
     * method:POST
     * 
     * request(form data)
     * 
    {'serviceid':'appstore.rcversion','userid':'09990374','appid':'com.skcc.alopex.v2'}:
     * 
     * response
     * 
     *  appversion: "102"
        error_msg: ""
        minversion: "102"
        return_code: "APP000"
        serviceid: "appstore.rcversion"
        token: "648b691583a63909"
        userid: "09990374"
     * 
     * 
     * 
     */
    service: function(serviceId, callback){
      
      var result = {};
      
      //public dir에 있는 파일 중 가장 최신의 timestamp return
      
      if (serviceId === 'appstore.rcversion'){
        console.log('appstore.rcversion');
        //app id check
        
        
        //sample json
        result.appversion = "102";
        result.error_msg = "";
        result.minversion = "102";
        result.return_code = "APP000";
        result.serviceid = "appstore.rcversion";
        result.token = "648b691583a63909";
        result.userid = "09990374";
       
        
        callback(result);
        
        
      } else{
        
        //TODO
        console.log('unknown service:' + serviceId);
        result.error_msg = 'unknown service:' + serviceId;
        callback(result);
      }
      
      
      
    },
    
    /*
     * apps/download
     * 
     * method:POST
     * 
     * request(form data)
     * 
     * appid:com.skcc.alopex.v2
      key:ddace28566455468a802cdd527378b0f22c7bf00db89748f0bc1797dda080eb3
     * 
     * 
     * response
     * 

     * 
     * 
     */
    download: function(appId, key, version, callback){
      
      //client버전 기준으로 public dir중에 client버전보다 큰 리소스들을 가져옴
      
      
      
      
      
      //해당 리소스들에 대해서 generate수행(결국 generate는 리소스별로 수행할 수 있어야 함)
    

      
      //수행 결과를 temp디렉토리에 저장(public 아래에 있어야 서비스 가능)
      
      //하드코딩..dir temp
      var tempDirRoot = '/Users/pj/Documents/workspace/lagopus-test/test/temp-download';
      
      //tempDir이름도 unique해야 함(요청이 섞일 수 있음)
      
      //key로 dir생성
      var tempDir = Path.join(tempDirRoot, key);
      var tempWWWDir = Path.join(tempDir, 'www');
      
      var createZip = function(){
        //temp를 압축해서 리턴함
        //zip이름은 unique하게 가져가야 server가 서비스 후에 이것을 지울 수 있음.

        var zip = new Zip();
        
        var fileName =  key + '.zip';
        
        //public에 직접 쓴다.
        var zipFilePath = Path.join( tempDir, fileName);
        
        //www를 묶는다.
        zip.addLocalFolder(tempWWWDir);
        zip.writeZip(zipFilePath);
        
        
        var onFinishDownload = function(){
          //download가 끝나면 디렉토리 삭제(tempDirRoot)
          console.log('onFinishDownload tempDirRoot = ' + tempDir);
          console.log('FileUtils = ' + FileUtils.deleteFolderRecursive);
          FileUtils.deleteFolderRecursive(tempDir);
        };
        
        callback(fileName, onFinishDownload);
        
      };
      
      Mkdirp(tempWWWDir, function(e) {
        createZip();
      });
    
      
    }
};