
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , ejs_engine = require('ejs-locals')
  , alopexConfigHandler = require('./alopex_config_handler')
  , remoteContentsServer = require('./remote_contents_server');
module.exports = {
    startServer: function(config){

      var app = express();

      // all environments
      app.set('port', process.env.PORT || 3000);
      
      //project root 경로 기준으로 동작
      //view가 들어있는 경로(템플릿)
      //아래 경로는 res.render호출 시에 경로의 기준이 된다.
      app.set('views', './public');
      
      app.use(express.favicon());
      app.use(express.logger('dev'));
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(app.router);
      
      //project root 경로 기준으로 동작하도록 함
      //그래서 public과 같이 하나의 directory가 더 필요함...
      app.use(express.static(path.join('./public'))); //./www까지 포함안함. www부터 경로로 들어감.

      app.engine('html', ejs_engine);


      // development only
      if ('development' == app.get('env')) {
        app.use(express.errorHandler());
      }

      app.get('/', function(req,res,next){
        
        //alopex config 불러오기
        
        //현재 app의 경로가 필요함.
        //test로 하드코딩. 
        var configPath = '/Users/pj/Documents/workspace/lagopus/boilerplates/default/public/www/alopexconfig.xml';
        
        alopexConfigHandler.getConfig(configPath, function(result){
          
          res.render('index.html',{
            alopexConfig: result
          });
          
        });
       
        
      });
      //index에서는 편의기능을 제공
    
      
      //app.get('/users', user.list);

      
      //TODO 다중 depth에서도 잘되는지 봐야 함
      //시뮬레이터 javascript에서 아예 *.view로 요청하는가? single-depth로?
      //그렇다면 아래로 충분하다.
      //경로의 문제는 정말 확실히 짚고 넘어가야 함(경로 때문에 지저분해지는 케이스 매우 많음)
      //시뮬레이터, 실제 앱 구동 시의 경로 관계를 문서화해서 정리할 필요가 있음
      //템플릿을 아예 사용하지 않을 경우도 고려(샘플로 몇 개 만들어 보는 경우에는 템플릿은 오히려 학습에 방해가 된다)
      
      
      
      
      
      
      //이걸 구조화해서 하고 싶은데...서블릿 매핑처럼...
      
      
      //apps는 서버를 따로 나눌것. public 디렉토리도 아예 분리할 것.
       
      app.post('/apps/getRecentVersion', function(req,res,next){
        console.log('getRecentVersion');
        var recentVersion = remoteContentsServer.getRecentVersion();
        
        //res. write recentVersion
      });
      
      app.get('/apps/getDeltaPackage', function(req,res,next){
        
        var clientVersion =   req.query.clientVersion;
        
        console.log('getDeltaPackage..client version is ' + clientVersion);
        
        //uuid생성 (정확히 unique하지는 않지만 mills단위)
        //TODO uuid generator로 변경할 것.
        var uuid = new Date().getTime();
        
        //zip
        remoteContentsServer.createDeltaPackage(uuid, clientVersion, function(deltaPackageName){
           //deltaPackageName을 res에 기록
          console.log('### ok! deltaPackageName created. name = ' + deltaPackageName);
          
        //  res.download(deltaPackageName);
          
          //이건 아마 단말에서도 zip download가 아닌 file명만 내려줄 듯???
          
          res.end('ok?', 'UTF-8');
          
          //끝나면 deltaPackage 삭제
          
        });
      });
    
      
      app.get('/www/uidef/:id.view',function(req,res,next){
        console.log('HTML request id = ' + req.params.id);
        res.render('template/uidef/' + req.params.id + '.html',{_layoutFile:'layout'});
      });
      
      app.get('/www/uidef/:dir/:id.view',function(req,res,next){
        console.log('2depth HTML request id = ' + req.params.id);
        res.render('template/uidef/' + req.params.dir + '/' + req.params.id + '.html',{_layoutFile:'../layout'});
      });
      
      app.get('/www/uidef/:dir0/:dir1/:id.view',function(req,res,next){
        console.log('2depth HTML request id = ' + req.params.id);
        res.render('template/uidef/' + req.params.dir0 + '/' + req.params.dir1 + '/' +req.params.id + '.html',{_layoutFile:'../../layout'});
      });
      
      app.get('/www/uidef/:dir0/:dir1/:dir2/:id.view',function(req,res,next){
        console.log('3depth HTML request id = ' + req.params.id);
        res.render('template/uidef/' + req.params.dir0 + '/' + req.params.dir1 + '/' + req.params.dir2 + '/' + req.params.id + '.html',{_layoutFile:'../../../layout'});
      });
      
     

      http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
      });
    }
};

