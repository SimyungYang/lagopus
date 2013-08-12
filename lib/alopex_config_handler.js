
var fs = require('fs');
var Xml2js = require('xml2js');

module.exports = {
    
    getConfig: function(configPath, callback){
      
      fs.readFile(configPath, 'ascii', function(err,data){
            Xml2js.parseString(data, function(err, result){
           //  console.log('result = ' + JSON.stringify(result.alopexconfig.pageList[0].page));
            callback(result);
          });
      });
    }
    
};