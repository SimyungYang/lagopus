/*
Punch의 CLI의 구조를 차용
*/
var Path = require("path");
var ChildProcess = require("child_process");
var _ = require("underscore");

var ProjectCreator = require(Path.join(__dirname, "../lib/project_creator"));
var Generator = require(Path.join(__dirname, "../lib/generator"));
var Server = require(Path.join(__dirname, "../lib/server"));
var ConfigHandler = require(Path.join(__dirname, "../lib/config_handler"));
var Publisher = require(Path.join(__dirname, "../lib/publisher"));

module.exports = {

	notifyIfOutdated: function(callback) {
		//새로운 버전 조사
		ChildProcess.exec("npm outdated lagopus", function(err, stdout, stderr) {
			if (stdout.trim() !== "") {
				console.log("There's a new version of Lagopus available. You can upgrade to it by running `npm install -g lagopus`");
				console.log("[" + stdout + "]");
			}

			return callback();
		});
	},

  setup: function(args) {
		var self = this;

		self.notifyIfOutdated(function() {
			var template_path = null;

			_.any(args, function(arg, i) {
				if (arg === "-t" || arg === "--template") {
					template_path = args[i + 1];

					args.splice(i, 2);

					return true;
				} else {
					return false;
				}
			});

			if (template_path) {
				return ProjectCreator.createStructure(args.pop(), template_path);
			} else {
				return ProjectCreator.createStructure(args.pop());
			}
		});
	},

  server: function(args){
    console.log('###### lagopus server __dirname = ' + __dirname);
    console.log('###### lagopus server args[0] = ' + args[0]);
    
		var config_path, overriden_port;
		console.log(args[0]);
    if (args.length && args[0].match(/^\d+$/)) {
			config_path = null;
			overriden_port = parseInt(args[0], 10);
    } else {
      config_path = args[0];
      overriden_port = null;
    }
    console.log(config_path);
    var config;//temp
//    ConfigHandler.getConfig(config_path, function(config){
//      console.log(config);
//      if (overriden_port) {
//        config["server"]["port"] = overriden_port;
//      }

      return Server.startServer(config);
//    });
  },

  generate: function(args) {
		var config_path = ( args[0] !== "--blank" ) && args[0];

		var blank = ( args.indexOf("--blank") > -1 );

    ConfigHandler.getConfig(config_path, function(config){

			//config.generator.blank = config.generator.blank || blank;

      Generator.setup(config);

			console.log("Generating site...");
			var start_time = new Date();

      Generator.generate(function() {
				var end_time = new Date();
				var duration = ( (end_time - start_time) / 1000 );
				console.log("Completed site generation. (" + duration + " seconds)");
			});
    });
  },
  
  publish: function() {
    Publisher.deploy(function(){
      console.log('Completed deploy');
    });
  },

  version: function() {
		var self = this;

		self.notifyIfOutdated(function() {
			var package_meta = require("../package.json");
			console.log("Lagopus version " + package_meta.version);
		});
	},

  help: function() {
		var self = this;

		self.notifyIfOutdated(function() {
			console.log("Usage: lagopus COMMAND [ARGS]\n");
			console.log("You can use following commands:");
			console.log("  setup    - create a new site structure in the given path. (lagopus setup PATH [-t TEMPLATE_PATH])");
			console.log("  server   - start the Lagopus server. (punch s [PORT])");
			console.log("  generate - generate all pages in the site. (lagopus g)");
			console.log("  publish - publish to remote site");
			console.log("  version  - version of the Lagopus installation. (lagopus v)");
			console.log("  help     - show help. (lagopus h)\n");
			console.log("For more information about Lagopus visit: http://runtime.alopex.io");
		});
  },

  init: function(args) {
	var self = this;

    var commands = ["setup", "server", "generate", "help", "version"];

    var short_codes = { "s": "server", "g": "generate", "p": "publish",  "h": "help", "v": "version", "-v": "version" };

    var command = args.shift();

    if(_.include(commands, command)){
      return self[command](args);
    } else if(_.include(_.keys(short_codes), command)){
      return self[short_codes[command]](args);
    } else {
      return self["help"]();
    }
  }

};
