var _ = require("underscore");
var Path = require("path");
var Request = require("request");
var Os = require("os");
var Fs = require("fs");
var Path = require("path");
var Mkdirp = require("mkdirp");
var ChildProcess = require("child_process");
var AlopexConfigHandler = require("./alopex_config_handler");
var UglifyJS = require("uglify-js");
var Zip = require("adm-zip");

var Server = require("./server");
/*
 * generator는 server가 떠 있는지 보고,
 * 안떠있으면 server를 띄운다.
 * 
 * server에 
 * alopex_config.xml에 있는 페이지들을 요청하여 결과 html들을 uidef에 저장한다.
 * 서버를 안띄우고 EJS 템플릿팅을 할 수는 없나?
 * 나머지 www내의 모든 파일들은 모두 복사한다.(제외할 확장자만 빼고)
 * 
 */
module.exports = {

	pathsToSkip: [],
	//TODO config
	destinationPath: '/Users/pj/Documents/workspace/lagopus-test/test/sample-project-build',

	destinationWWWPath: '/Users/pj/Documents/workspace/lagopus-test/test/sample-project-build/www',

	templateRequestFileExtension: 'view',
	
	setup: function(config){
		console.log('generator setup. config = ' + config);
	},

	init: function(callback){
	  console.log('step1');
	  //check server....
	  //TODO 만약 템플릿을 사용하지 않는다면 서버 자체를 띄울 필요도 없다. 파일 복사로 해결된다.
	  
	  return callback();
	},
	
   
   generateStaticAsset: function(callback){
    
    
    var generator = this;
    
    console.log('step2');
    //리소스 복사해놓기...
    
    var copy_command;
    //TODO project root에서 수행하는지 조사
    
    //www의 모든 파일이 복사되므로 uidef까지 복사된다.(템플릿을 사용하지 않을 경우 여기서 다 복사되므로 따로 할일은 없다)
    var source_path = Path.join(process.cwd(), 'public', 'www');
    var destinationPath = generator.destinationWWWPath;

    
    //TODO: asset_handler가 있는 경우. 그냥 복사하면 안되고 읽어서 써야 한다.
    //결국 아래와 같은 copy명령어 보다는...다 읽고 쓰는 것으로 짜야 한다.
    
    if (Os.platform() === "win32") {
      copy_command = "ROBOCOPY " + source_path + " " + destinationPath + " *.* /E";
    } else {
      copy_command = "cp -R " + source_path + "/* " + destinationPath;
    }
    
    console.log('copy_command = ' + copy_command);

    ChildProcess.exec(copy_command, function(err, stdout, stderr) {
      if (err && Os.platform() === "win32" && err.code <= 3) {
      } else if(err) {
        console.log('copy error: ' + err);
        throw err;
      }

      console.log('copy completed');
      
      
      //Prototype으로 UglifyJS로 압축/난독화하는 것 테스트.(하드코딩)
      //js/app/main.js를 대상으로 해 보자.
      //TODO: 설정을 이용한 asset handling
      var samplePath = Path.join(destinationPath,'js/app/main.js');
      var minifiedCode = UglifyJS.minify(samplePath).code;
      Fs.writeFile(samplePath, minifiedCode, function(e){
        console.log(samplePath + ' minified success');
      });
      
      
      
      //이건 generation이 다 끝난 이후. zip으로 묶어보기(generate에서 해야 할 지 publish로 봐야할지?)
      //www를 묶어서 단순히 zip으로 만들기
      //TODO 만들어지기는 하지만 풀리지 않음;;;
      var zip = new Zip();
      var zipFilePath = Path.join( generator.destinationPath, 'www.zip');
      console.log('addLocalFolder: ' +generator.destinationWWWPath)
      zip.addLocalFolder( generator.destinationWWWPath);
     // zip.addLocalFile( '/Users/pj/Documents/workspace/lagopus/lib/generator.js');
      zip.writeZip(zipFilePath);
      
    });
    
  
    
    
    return callback();
  },
  
//TODO 
  generateFile : function(filePath, content){
    // var originalPath = response.request.path.substring(1);//remove first slash
     console.log('GENERATE FILE...' + filePath);
       //output에 기록하기...
     
     var fileDir = filePath.substring(0, filePath.lastIndexOf('/'));
     console.log('fileDir..' + fileDir);
     Mkdirp(fileDir, function(e) {
         Fs.writeFile(filePath, content, function(e){
           console.log(filePath + ' write success');
         });
     });
   },
   
   //template page의 랜더링을 하기 위해서는 필요함.
   //TODO 할 것!
   requestTemplatePages: function(pageList){
     
     var generator = this;
     
     _.each(pageList, function(page){ //page is loop-safe variable
       
       //pageUrl = /uidef/main.html
       var pageUrl = page.$.uri;
       
     //pageUrlWithoutFiileExtension = /uidef/main
       var pageUrlWithoutFileExtension = pageUrl.substring(0, pageUrl.lastIndexOf('.'));
       
        //서버에 해당 페이지 요청. TODO 아래 하드코딩 수정
        Request({
          //TODO .view요청은 위에 주석에서 얘기한대로 템플릿을 사용할 경우에만 해당된다. 
          //템플릿을 사용하지 않는다면, HTTP요청같은 것을 할 필요가 없다.
          //아니다. 
          //url example:
            url:'http://localhost:3000' + pageUrlWithoutFileExtension + '.' + generator.templateRequestFileExtension
        }, function(error, response, body){
          console.log('###AJAX RESPONSE: requested pageUrl = ' + pageUrl);
          
          //destination path = /User/.../test/www
          var destinationFilePath = Path.join(generator.destinationWWWPath, pageUrl);
          
          console.log('destinationFilePath=' + destinationFilePath);
          
          generator.generateFile(destinationFilePath, body);
        });
     });
   
   },
     
	//template을 사용하는 경우에만 해당함.
  generateHTMLbyTemplate: function(callback){
    
    //TODO 템플릿을 사용하지 않는다면 바로 리턴
    
    var generator = this;
    
    console.log('step3');
    //템플릿 랜더링하기...
    
    //TODO alopex-config.xml 파싱하기. 아래는 샘플
   // var page_config = [{id:'main', url:'main'}, {id:'page1', url:'foo/bar/page1'}];
     
    //TODO alopex config path
    var alopex_config_path = Path.join(process.cwd(), 'public', 'www', 'alopexconfig.xml');
    AlopexConfigHandler.getConfig(alopex_config_path, function(config){
    //  console.log('config.alopexconfig = ' + JSON.stringify(config.alopexconfig.pageList));
      pageList = config.alopexconfig.pageList[0].page;
      console.log('pageList = ' + JSON.stringify(pageList));
      generator.requestTemplatePages(pageList);
    });
    
    
    return callback();
  },

	
	
  runGeneratorHooks: function(complete){
	    console.log('runGeneratorHooks: ' + complete);
	},
	
	generate: function(complete) {
		var self = this;

		var steps = [
			self.init,
			self.generateStaticAsset,
			self.generateHTMLbyTemplate
		];

		var run_next_step = function(result) {
		  console.log('run_next_step function has been called');
		  //run_next_step 자체가 콜백함수임. 이건 스텝 끝날때마다 불림...
			var method_args = [run_next_step];

			if (result) {
				method_args.unshift(result);
			}
			if (steps.length) {//남아 있으면 다음 스텝으로..
				return steps.shift().apply(self, method_args);
			} else { //끝나면 generator hook 호출...
				var run_generator_hooks = function(complete) {
					return self.runGeneratorHooks(null, { finished: true }, complete);
				};

				return run_generator_hooks(complete);
			}
		};

		return run_next_step();
	}

};
