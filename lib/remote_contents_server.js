
var Zip = require("adm-zip");
var Path = require('path');
var Fs = require('fs');
var Mkdirp = require("mkdirp");

module.exports = {
    
    getRecentVersion: function(){
      
      //public dir에 있는 파일 중 가장 최신의 timestamp return
      
    },
    
    createDeltaPackage: function(uuid, clientVersion, callback){
      
      //client버전 기준으로 public dir중에 client버전보다 큰 리소스들을 가져옴
      
      
      
      
      
      //해당 리소스들에 대해서 generate수행(결국 generate는 리소스별로 수행할 수 있어야 함)
    

      
      //수행 결과를 temp디렉토리에 저장(public 아래에 있어야 서비스 가능)
      
      //하드코딩..dir temp
      var publicDir = '/Users/pj/Documents/workspace/lagopus/boilerplates/default/public';
      
      //tempDir이름도 unique해야 함(요청이 섞일 수 있음)
      
      
      var tempDir = Path.join(publicDir, 'temp-' + uuid);
      var tempWWWDir = Path.join(tempDir, 'www');
      
      
      var createZip = function(){
        //temp를 압축해서 리턴함
        //zip이름은 unique하게 가져가야 server가 서비스 후에 이것을 지울 수 있음.

        var zip = new Zip();
        
        var deltaPackageName =  'www_' + uuid + '.zip';
        
        //public에 직접 쓴다.
        var zipFilePath = Path.join( publicDir, deltaPackageName);
        zip.addLocalFolder( tempDir);
        zip.writeZip(zipFilePath);
        
        
        //temp디렉토리 삭제
        
        
        
        
        
        
        callback(deltaPackageName);
      };
      
      Mkdirp(tempWWWDir, function(e) {
        createZip();
      });
      
      
    
      
    }
    
};