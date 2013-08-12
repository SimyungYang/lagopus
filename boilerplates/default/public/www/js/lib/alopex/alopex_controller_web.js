/* 
* Copyright (c) 2012 SK C&C Co., Ltd. All rights reserved. 
* 
* This software is the confidential and proprietary information of SK C&C. 
* You shall not disclose such confidential information and shall use it 
* only in accordance with the terms of the license agreement you entered into 
* with SK C&C. 
* 
* @version Alopex Controller Simulator : 2.0.11
* This is compatible with the Android 2.3.0 
* This is compatible with the iOS 2.3.0
* Change Log:
* - 2.0.10
	28127	13. 1. 7. 오후 4:52		yoon-sangjun	File delegate - getStoragePath 함수 추가
* - 2.0.9
	20121227 ahn-seoyoung	File Delegate 추가
* - 2.0.8
	20121113 yoon-sangjun  	Device class에 isTV, mobileEquipmentId class variable 추가
	20121113 yoon-sangjun	isValid에서 "" check 제외(숫자 0이 인자로 넘어 올 경우 0=""로 인식 되어서)
    20121113 yoon-sangjun	Database select, commit method에 databaseName 인자 값 추가 
    20121113 yoon-sangjun	Local notification method 추가(Push notification과 동일)
    20121113 yoon-sangjun	Push notification method 추가(didReceiveLocalNotification, deleteAllUnreadNotifications, deleteUnreadNotification,
* - 2.0.7
	20120816 im-jihyun	 	GeoLocation delegator 추가
* - 2.0.6
	20120816 yoon-sangjun   PushNotification.getRegistrationId 함수 log 처리
	20120816 yoon-sangjun   Database delegator log 처리
* - 2.0.5
  	20120816 im-jihyun   	added device.model and device.manufacturer
*  - 2.0.4
  	20120726 yoon-sangjun	contact, localNotification, pushNotification 추가 및 log 처리
  	20120726 yoon-sangjun	mutimedia method 추가 및 log 처리
*  - 2.0.3
  	20120628 leejunseok  	수정 및 svn에 배포
*  - 2.0.2
	20120628 leejunseok  	수정 및 svn에 배포
*  - 2.0.1
    20120608 leejunseok  	수정 및 svn에 배포
*/

var isSimulator = true;
var _anomFunkMap = {};
var _anomFunkMapNextId = 0;
var backFlag = false;

function anomToNameFunk(fun) {
	var funkId = "f" + _anomFunkMapNextId++;
	var funk = function() {
		_anomFunkMap[funkId].apply(this, arguments);
		_anomFunkMap[funkId] = null;
		delete _anomFunkMap[funkId];
	};
	
	_anomFunkMap[funkId] = funk;
	return "_anomFunkMap." + funkId;
}

function GetFunctionName(fn) {
	if(fn) {
		var m = fn.toString().match(/^\s*function\s+([^\s\(]+)/);
		return m ? m[1] : anomToNameFunk(fn);
	}else{
		return null;
	}
}

function isValid(arg) {
	if(arg == undefined || arg == null) {
		log.warn("There are invalid arguements.");
		
		var caller = arguments.callee;
		
		while(true) {
			caller = caller.caller;
			
			if(caller == null){
				break;
			}
			
			if(caller.name != ""){
				log.warn("Caller : " + caller.name);
			}
		}
		
		return false;
	}else{
		return true;
	}
}

//document load finish
window.onload = function(){	
	//alert("window.onload");
    if (backFlag) {
    	if (onScreenBack() != null && typeof onScreenBack() != "undefined") {
    		onScreenBack();
    	}
    }else{
    	//alert("deviceready trigger");
    	// all constructors run, now fire the deviceready event
    	var e = document.createEvent('Events');
    	e.initEvent('deviceready', true, true);
    	document.dispatchEvent(e);    	
    }
};

Alopex = {};

Alopex.addConstructor = function(func) {
	func();
};

function AlopexController() {
	this.parameters = null;
	this.results = null;
	this.platform = "";
	backFlag = false;
	
	function getQueryVariable(variable) {
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i=0;i<vars.length;i++) {
			var pair = vars[i].split("=");
			if (pair[0] == variable) {
				return pair[1];
			}
		} 
	}
	
	if (getQueryVariable("parameters") != null) {
		this.parameters = JSON.parse(decodeURI(getQueryVariable("parameters")));
	}
	
	if (getQueryVariable("results") != null) {
		this.results = JSON.parse(decodeURI(getQueryVariable("results")));
	}
	
	if (getQueryVariable("platform") != null) {
		this.platform = getQueryVariable("platform");
	}

	if (getQueryVariable("backFlag") != null) {
		backFlag = getQueryVariable("backFlag");
	}
	
}

AlopexController.prototype.back = function(results) {
	console.log("[AlopexControllerD/back]");
	
	if (window.customBack != null && typeof window.customBack != "undefined") {
		eval(GetFunctionName(window.customBack) + "()");
	}
	
	if(results != null && typeof results != "undefined") {
		this.results = results;
		
		if (window.location.href.indexOf("?") == -1) {
			if (window.location.href.indexOf("results") == -1) {
				window.location.href = document.referrer + "?results="+JSON.stringify(results) + "&backFlag=true";
			}
		} else {
			if (window.location.href.indexOf("results") == -1) {
				window.location.href = document.referrer + "&results="+JSON.stringify(results) + "&backFlag=true";
			}
		}
	} else {
		window.location.href = document.referrer + "?backFlag=true";
	}
};

AlopexController.prototype.backTo = function(navigationRule) {
	this.navigate(navigationRule);
};

AlopexController.prototype.dismissLoadImage = function(){
	console.log("[AlopexController/dismissLoadImage] *not supported by simulator");
};

AlopexController.prototype.exit = function() {
    console.log("[AlopexControllerD/exit]");
    window.history.go((history.length-1)*-1);
};

AlopexController.prototype.goHome = function() {
    console.log("[AlopexControllerD/goHome]");
    window.history.go((history.length-1)*-1);
};

AlopexController.prototype.initPreferences = function(){
	console.log("[AlopexController/initPreferences] *not supported by simulator");
};

AlopexController.prototype.navigate = function(navRule) {
	if(navRule.pageId == undefined) {
		log.error("Page id is not defined in the navigation rule JSON object.");
		return;
	}
	if(isValid(navRule)) {
	    var contextRoot = window.location.href.substring(window.location.href.indexOf("/", window.location.href.indexOf("//")+2));
	    contextRoot = window.location.href.substring(0,window.location.href.indexOf("/",8)) + contextRoot.substring(0, contextRoot.indexOf("/", 1));
	    var httpObj = new XMLHttpRequest();
	    httpObj.open("GET", contextRoot+"/simulator?id="+navRule["pageId"]+"&platform="+this.platform ,false);
	    httpObj.send(null);
	    
	    if (httpObj.responseText != null && httpObj.responseText != "" ) {
		    if (navRule["parameters"] != null) {
		    	window.location.href=contextRoot+httpObj.responseText+"&parameters="+JSON.stringify(navRule["parameters"]);
		    } else {
		    	window.location.href=contextRoot+httpObj.responseText;	
		    }
	    } else {
	    	console.log("[AlopexControllerD/navigate] Page ID not found: " + navRule["pageId"]);
	    }
	}
};

AlopexController.prototype.setCustomizedBack = function(callback) {
	console.log("[AlopexControllerD/setCustomizedBack]");
	if(isValid(callback)) {
	    window.customBack = callback;
	}
};

AlopexController.prototype.setOnPause = function(callback) {
	console.log("[AlopexControllerD/setOnPause] *not supported by simulator");
};

AlopexController.prototype.setOnResume = function(callback) {
	console.log("[AlopexControllerD/setOnResume] *not supported by simulator");
};

AlopexController.prototype.setOnScreenTouch = function(callback) {
	console.log("[AlopexController/setOnScreenTouch] *not supported by simulator");
};

AlopexController.prototype.start = function(initHandler) {
	 console.log("[AlopexControllerD/start] :" + initHandler);
	    if (isValid(initHandler)) {
	    	eval(initHandler)();
	    }
};

var alopexController;

Alopex.addConstructor(function() {
	if(typeof alopexController == "undefined")
		alopexController = new AlopexController();
});

function Application() {
	this.appId = "Simulator Application"
	this.appVersion = "Simulator Application appVersion";
	this.contentVersion = "Simulator Application contentVersion";
}

Application.prototype.getVersion = function(identifier) {
	console.log("[Application/getVersion] *not supported by simulator");
};

Application.prototype.hasApp = function(identifier, callback) {
    console.log("[Application/hasApp]");
    if (isValid(identifier)) {
        console.log("vv Identifier vv");
        console.log(identifier);
    }
    callback(false);
};

Application.prototype.installApplication = function(filePath) {
	console.log("[Application/installApplication] *not supported by simulator");
};

Application.prototype.startApplication = function(identifier, parameters) {
    console.log("[Application/startApplication] *not supported by simulator");
    if (isValid(identifier)) {
        console.log("vv Identifier vv");
        console.log(identifier);
        if (isValid(parameters)) {
            console.log("vv Parameters vv");
            console.log(parameters);
        }
    }
};

Application.prototype.startAlopexApplication = function(identifier, pageId, parameters) {
    console.log("[Application/startAlopexApplication] *not supported by simulator");
    if (isValid(identifier) && isValid(pageId)) {
        console.log("vv PageId vv");
        console.log(pageId);
        console.log("vv Identifier vv");
        console.log(identifier);
        if (isValid(parameters)) {
            console.log("vv Parameters vv");
            console.log(parameters);
        }
    }
};

Application.prototype.startWebBrowser = function(url) {
    console.log("[Application/startWebBrowser]");
    if (isValid(url)) {
        console.log("vv URL vv");
        console.log(url);
        window.location = url;
    }
};

var application;

Alopex.addConstructor(function() {
	if(typeof application == "undefined")
		application = new Application();
});

function Contact() {}

Contact.prototype.add = function(contactInfo, successCallback, errorCallback) {
	console.log("[Contact/add] *not supported by simulator");
};

Contact.prototype.get = function(contactInfo, successCallback, errorCallback) {
	console.log("[Contact/get] *not supported by simulator");
};

Contact.prototype.remove = function(contactId, successCallback, errorCallback) {
	console.log("[Contact/remove] *not supported by simulator");
};

Contact.prototype.search = function(filter, successCallback, errorCallback) {
	console.log("[Contact/search] *not supported by simulator");
};

Contact.prototype.update = function(contactInfo, successCallback, errorCallback) {
	console.log("[Contact/update] *not supported by simulator");
};

var contact;

Alopex.addConstructor(function() {
	if (typeof contact == "undefined")
		contact = new Contact();
});

function Database() {
	var resultSet;
	var resultRaw;
}

Database.prototype.commit = function(databaseName, successCallback, errorCallback) {
	console.log("[Database/commit] *not supported by simulator");
};

Database.prototype.deleteRow = function(query) {
	console.log("[Database/deleteRow] *not supported by simulator");
};

Database.prototype.execQuery = function(query) {
	console.log("[Database/execQuery] *not supported by simulator");
};

Database.prototype.insert = function(query) {
	console.log("[Database/insert] *not supported by simulator");
};

Database.prototype.open = function(databaseName, successCallback, errorCallback) {
	console.log("[Database/open] *not supported by simulator");
};

Database.prototype.select = function(databaseName, query, successCallback, errorCallback) {
	console.log("[Database/select] *not supported by simulator");
};

Database.prototype.update = function(query) {
	console.log("[Database/update] *not supported by simulator");
};

var database;

Alopex.addConstructor(function() {
	if(typeof database == "undefined")
		database = new Database();
});

function Device() {
	this.isTablet = false;
    this.isTV = false;
	this.platformName = "Simulator";
	this.deviceId = "ALOPEXSIMULATOR";
	this.osVersion = "Simulator OS";
	this.deviceModel = "ALOPEXSIMULATOR";
	this.deviceManufacturer = "SK C&C";
	this.mobileEquipmentId = "ALOPEXSIMULATOR";
}

Device.prototype.getDeviceDpi = function() {
	return null;
};

Device.prototype.getLanguage = function(callback) {
    console.log("[Device/getLanguage]");
    if (isValid(callback)) {
        var language = "en";
        if (navigator.language) {
            language = navigator.language;
        }
        else if (navigator.browserLanguage) {
            language = navigator.browserLanguage;
        }
        else if (navigator.systemLanguage) {
            language = navigator.systemLanguage;
        }
        else if (navigator.userLanguage) {
            language = navigator.userLanguage;
        }
        callback(language);
    }
};

Device.prototype.getNetworkType = function(callback) {
    console.log("[Device/getNetworkType]");

    if (isValid(callback)) {
        callback("wifi");
    }
};

var device;

Alopex.addConstructor(function() {
	device = window.device = new Device();
});

function File(){}

File.prototype.copy = function (from, to, callback){
	console.log("[File/copy] *not supported by simulator");
}

File.prototype.createNewFile = function (path, callback){
	console.log("[File/createNewFile] *not supported by simulator");
}

File.prototype.deleteFile = function (from, callback){
	console.log("[File/deleteFile] *not supported by simulator");
}

File.prototype.exists = function (path, callback){
	console.log("[File/exists] *not supported by simulator");
}

File.prototype.getStoragePath = function (callback, onPrivate){
	console.log("[File/getStoragePath] *not supported by simulator");
}

File.prototype.isDirectory = function (path, callback){
	console.log("[File/isDirectory] *not supported by simulator");
}

File.prototype.mkdirs = function (path, callback){
    console.log("[File/mkdirs] *not supported by simulator");
}

File.prototype.move = function (from, to, callback){
    console.log("[File/move] *not supported by simulator");
}

File.prototype.rename = function (path, name, callback){
    console.log("[File/rename] *not supported by simulator");
}
                                                      
var file;

Alopex.addConstructor(function() {
	file = new File();
});

function Geolocation() {
      this.geolocationError = {};
      this.geolocationError.NETWORK_UNAVAILABLE = 998;
      this.geolocationError.DEVICE_NOT_SUPPORTED = 999;
      this.successCallback;
      this.errorCallback;
}
 
Geolocation.prototype.getLocation = function(successCallback, errorCallback) {
      if(isValid(successCallback) && isValid(errorCallback)) {
            if(navigator.geolocation) {
                  this.successCallback = successCallback;
                  this.errorCallback = errorCallback;
                  device.getNetworkType(AlopexGeolocationNetworkCheckCallback);
            }else {
                  this.geolocationError.code = this.geolocationError.DEVICE_NOT_SUPPORTED;
                  errorCallback(this.geolocationError);
            }
      }
};
 
function AlopexGeolocationNetworkCheckCallback(networkType){
      if(networkType != "null")
            navigator.geolocation.getCurrentPosition(geolocation.successCallback, geolocation.errorCallback);
      else {
            geolocation.geolocationError.code = geolocation.geolocationError.NETWORK_UNAVAILABLE;
            errorCallback(geolocation.geolocationError);
      }
}
 
var geolocation;
 
Alopex.addConstructor(function() {
      if(typeof geolocation == "undefined")
            geolocation = new Geolocation();
});

function GlobalPreference() {}

GlobalPreference.prototype.contains = function(key) {
	console.log("[GlobalPreferenceD/contains]");
    if (isValid(key)) {
        console.log("vv Key vv");
        console.log(key);
        if (window.parent.name.indexOf("ù") != -1) {
            var keys = window.parent.name.split("ù")[0];
            var keyArray = keys.split("♠");

            for (var i = 0; i < keyArray.length; i++) {
                if (keyArray[i] == "gp-" + key) {
                	console.log("[GlobalPreferenceD/contains] TRUE");
                    return true;
                }
            }
        }
        console.log("[GlobalPreferenceD/contains] FALSE");
        return false;
    }
};

GlobalPreference.prototype.get = function(key) {
    console.log("[GlobalPreferenceD/get]");

    if (isValid(key)) {
        console.log("vv Key vv");
        console.log(key);
        
        if (window.parent.name.indexOf("ù") != -1) {
            var keys = window.parent.name.split("ù")[0];
            var values = window.parent.name.split("ù")[1];
            var keyArray = keys.split("♠");
            var valueArray = values.split("♠");
            
            for (var i = 0; i < keyArray.length; i++) {
                if (keyArray[i] == "gp-" + key) {
                	console.log("[GlobalPreferenceD/get] "+valueArray[i]);
                    return valueArray[i];
                }
            }
        }
        console.log("[GlobalPreferenceD/get] No Return Value");
        return "";
    } else{
    	console.log("[GlobalPreferenceD/get] No Return Value");
        return undefined;
    }
};

GlobalPreference.prototype.put = function(key, value) {
    console.log("[GlobalPreferenceD/put]");
    if (isValid(key) && isValid(value)) {
        console.log("vv Key vv");
        console.log(key);
        console.log("vv Value vv");
        console.log(value);

        if (window.parent.name.indexOf("ù") != -1) {
            var keys = window.parent.name.split("ù")[0];
            var values = window.parent.name.split("ù")[1];
            var keyArray = keys.split("♠");
            var valueArray = values.split("♠");

            for (var i = 0; i < keyArray.length; i++) {
                if (keyArray[i] == "gp-" + key) {
                    valueArray[i] = value;
                    window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
                    return;
                }
            }
            keyArray.push("gp-" + key);
            valueArray.push(value);

            window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
        } else {
            window.parent.name = "gp-" + key + "ù" + value;
        }
    }
};

GlobalPreference.prototype.remove = function(key) {
    console.log("[GlobalPreferenceD/remove]");
    if (isValid(key)) {
        console.log("vv Key vv");
        console.log(key);

        var keys = window.parent.name.split("ù")[0];
        var values = window.parent.name.split("ù")[1];
        
        if (keys != null && values != null) {
            var keyArray = keys.split("♠");
            var valueArray = values.split("♠");

            for (var i = 0; i < keyArray.length; i++) {
                if (keyArray[i] == "gp-" + key) {
                    keyArray.splice(i, 1);
                    valueArray.splice(i, 1);
                    window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
                    return;
                }
            }
        }
    }
};

var globalPreference;

Alopex.addConstructor(function() {
	if(typeof globalPreference == "undefined")
		globalPreference = new GlobalPreference();
});

var httpObjects = new Array();

function Http() {
	this.errorCode = -1;
	this.errorMessage = null;
	this.response = null;
	this.responseHeader = null;
	httpObjects.push(this);
	this.index = httpObjects.length - 1;
    this.httpRequestKeys = [];
    this.httpRequestValues = [];
    this.httpObject;
}

Http.prototype.cancelDownload = function() {
    console.log("[HttpD/cancelDownload]");
    if (this.httpObject != null)
    	this.httpObject.abort();
};

Http.prototype.cancelRequest = function() {
    console.log("[HttpD/cancelRequest]");
    if (this.httpObject != null)
    	this.httpObject.abort();
};

Http.prototype.cancelUpload = function() {
    console.log("[HttpD/cancelUpload]");
    if (this.httpObject != null)
    	this.httpObject.abort();
};

Http.prototype.download = function(entity, successCallback, errorCallback, progressCallback, cancelCallback) {
    console.log("[HttpD/download] *not supported on simulator");
};

Http.prototype.getResponseHeader = function(header) {
    console.log("[HttpD/getResponseHeader]");
    if (this.httpObject != null) {
    	return this.httpObject.getResponseHeader(header);
    } else {
    	return null;
    }
};

Http.prototype.request = function(entity, successCallback, errorCallback) {
	console.log("[HttpD/request]");
	
	if(isValid(entity) && isValid(successCallback) || isValid(errorCallback)) {
		entity.index = this.index;
		var http = {};
		var paramString = "";

		if (entity["parameters"] != null) {
			paramString = "?";
			for (var j in entity["parameters"])
				paramString = paramString + "&" + j + "=" + entity["parameters"][j]; 
			paramString = paramString.substring(0, 1) + paramString.substring(2); 
		}

		console.log("[HttpD/request] Method: " + entity["method"] + "/ URL: " + entity["url"]);
		
		this.httpObject = new XMLHttpRequest();
	    this.httpObject.open(entity["method"],entity["url"],false);

	    this.httpObject.setRequestHeader("Content-Type","UTF-8");
	    
	    for (var i = 0; i < this.httpRequestKeys.length; i++) {
			this.httpObject.setRequestHeader(this.httpRequestKeys[i], this.httpRequestValues[i]);
	    }
	    if (entity["onBody"]) {
	    	console.log("[HttpD/request] Content: " + entity["content"]);
	    	this.httpObject.send(entity["content"]);	
	    } else {
	    	console.log("[HttpD/request] Method: " + entity["parameters"]);
	    	this.httpObject.send(entity["parameters"]);
	    }
	    
	    this.httpRequestKeys = [];
	    this.httpRequestValues = [];
	    
	    if (this.httpObject.status == 200) {
	    	console.log("[HttpD/request] Success!");
	    	http.response = this.httpObject.responseText;
	    	successCallback(http);
	    } else {
	    	console.log("[HttpD/request] Error: " + this.httpObject.status + ": " + this.httpObject.statusText);
	    	http.error = this.httpObject.status;
	    	http.errorMessage = this.httpObject.statusText;
	    	errorCallback(http);
	    }
	}
};

Http.prototype.setRequestHeader = function(header, value) {
	console.log("[HttpD/setRequestHeader] " + "Header: " + header + " / Value: " + value);
	if(isValid(header) && isValid(value)) {
	    this.httpRequestKeys.push(header);
	    this.httpRequestValues.push(value);
	}
};

Http.prototype.setTimeout = function(timeout) {
    console.log("[HttpD/setTimeout] *not supported on simulator");
};

Http.prototype.upload = function(entity, successCallback, errorCallback, progressCallback, cancelCallback) {
	   console.log("[HttpD/upload] *not supported on simulator");
};

function LocalNotification() {}

LocalNotification.prototype.addNotification = function(id, time, action) {
	console.log("[LocalNotification/addNotification] *not supported by simulator");
};

LocalNotification.prototype.deleteAllUnreadNotifications = function() {
	console.log("[LocalNotification/deleteAllUnreadNotifications] *not supported by simulator");
};

LocalNotification.prototype.deleteUnreadNotification = function(index) {
    console.log("[LocalNotification/deleteUnreadNotification] *not supported by simulator");
};

LocalNotification.prototype.getUnreadNotifications = function(callback) {
	console.log("[LocalNotification/getUnreadNotifications] *not supported by simulator");
};

LocalNotification.prototype.removeNotification = function(id) {
	console.log("[LocalNotification/removeNotification] *not supported by simulator");
};

LocalNotification.prototype.useImmediateForegroundNotification = function(use) {
    console.log("[LocalNotification/useImmediateForegroundNotification] *not supported by simulator");
};

var localNotification;

Alopex.addConstructor(function() {
	if(typeof localNotification == "undefined")
		localNotification = new LocalNotification();
});

function Log() {}

Log.prototype.error = function(message) {
    if (isValid(message))
        console.log("[LogD/error] " + message);
};

Log.prototype.log = function(message) {
    if (isValid(message))
        console.log("[LogD/log] " + message);
};

Log.prototype.warn = function(message) {
    if (isValid(message))
        console.log("[LogD/warn] " + message);
};

var log;

Alopex.addConstructor(function() {
	if(typeof log == "undefined")
		log = new Log();
});

function MemoryPreference() {}

MemoryPreference.prototype.contains = function(key) {
    console.log("[MemoryPreferenceD/contains]");

    if (isValid(key)) {
        console.log("vv Key vv");
        console.log(key);
        if (window.parent.name.indexOf("ù") != -1) {
            var keys = window.parent.name.split("ù")[0];
            var keyArray = keys.split("♠");

            for (var i = 0; i < keyArray.length; i++) {
                if (keyArray[i] == "mp-" + key) {
                    return true;
                }
            }
        }
        return false;
    }
};

MemoryPreference.prototype.get = function(key) {
    console.log("[MemoryPreferenceD/get]");

    if (isValid(key)) {
        console.log("vv Key vv");
        console.log(key);
        if (window.parent.name.indexOf("ù") != -1) {
            var keys = window.parent.name.split("ù")[0];
            var values = window.parent.name.split("ù")[1];
            var keyArray = keys.split("♠");
            var valueArray = values.split("♠");

            for (var i = 0; i < keyArray.length; i++) {
                if (keyArray[i] == "mp-" + key) {
                	console.log("[MemoryPreferenceD/get] "+valueArray[i]);
                    return valueArray[i];
                }
            }
        }
        console.log("[MemoryPreferenceD/get] No Return Value");
        return "";
    } else{
    	console.log("[MemoryPreferenceD/get] No Return Value");
        return undefined;
    }
};

MemoryPreference.prototype.put = function(key, value) {
    console.log("[MemoryPreferenceD/put]");
    if (isValid(key) && isValid(value)) {
        console.log("vv Key vv");
        console.log(key);
        console.log("vv Value vv");
        console.log(value);

        if (window.parent.name.indexOf("ù") != -1) {
            var keys = window.parent.name.split("ù")[0];
            var values = window.parent.name.split("ù")[1];
            var keyArray = keys.split("♠");
            var valueArray = values.split("♠");

            for (var i = 0; i < keyArray.length; i++) {
                if (keyArray[i] == "mp-" + key) {
                    valueArray[i] = value;
                    window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
                    return;
                }
            }
            keyArray.push("mp-" + key);
            valueArray.push(value);

            window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
        } else {
            window.parent.name = "mp-" + key + "ù" + value;
        }
    }
};

MemoryPreference.prototype.remove = function(key) {
	console.log("[MemoryPreferenceD/remove]");
	if (isValid(key)) {
	    console.log("vv Key vv");
	    console.log(key);

	    var keys = window.parent.name.split("ù")[0];
	    var values = window.parent.name.split("ù")[1];
	    
	    if (keys != null && values != null) {
	        var keyArray = keys.split("♠");
	        var valueArray = values.split("♠");

	        for (var i = 0; i < keyArray.length; i++) {
	            if (keyArray[i] == "mp-" + key) {
	                keyArray.splice(i, 1);
	                valueArray.splice(i, 1);
	                window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
	                return;
	            }
	        }
	    }
	}
};

MemoryPreference.prototype.removeAll = function() {
	console.log("[MemoryPreferenceD/removeAll]");

	var keys = window.parent.name.split("ù")[0];
	var values = window.parent.name.split("ù")[1];

	if (keys != null && values != null) {
	    var keyArray = keys.split("♠");
	    var valueArray = values.split("♠");
	    
	    var len = keyArray.length;
	    for (var i = 0; i < len; i++) {
	    	if (keyArray[i] != null) {
	            if (keyArray[i].substring(0, 3) == "mp-") {
	                keyArray.splice(i, 1);
	                valueArray.splice(i, 1);
	                i--;
	                len--;
	            }
	    	}
	    }
	    window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
	}
};

var memoryPreference;

Alopex.addConstructor(function() {
	if(typeof memoryPreference == "undefined")
		memoryPreference = new MemoryPreference();
});

function Multimedia() {}

Multimedia.prototype.deleteImage = function(path, successCallback, errorCallback) {
	console.log("[MultimediaD/deleteImage] * not supported in simulator");
};

Multimedia.prototype.getImageOrientation = function(imagePath, callback) {
	console.log("[MultimediaD/getImageOrientation] * not supported in simulator");
};

Multimedia.prototype.getPicture = function(successCallback, errorCallback, option) {
	console.log("[MultimediaD/getPicture] * not supported in simulator");
};

Multimedia.prototype.resizePicture = function(imageInfo, callback) {
	console.log("[MultimediaD/resizePicture] * not supported in simulator");
};

Multimedia.prototype.rotateImage = function(imageInfo, callback) {
	console.log("[MultimediaD/rotateImage] * not supported in simulator");
};

Multimedia.prototype.saveImage = function(path, successCallback, errorCallback) {
	console.log("[MultimediaD/saveImage] * not supported in simulator");
};

Multimedia.prototype.takePicture = function(successCallback, errorCallback) {
	console.log("[MultimediaD/takePicture] * not supported in simulator");
};

var multimedia;

Alopex.addConstructor(function() {
	if(typeof multimedia == "undefined")
		multimedia = new Multimedia();
});

function NativeUI() {}

NativeUI.prototype.dismissProgressBarDialog = function() {
    console.log("[NativeUID/dismissProgressBarDialog]");
};

NativeUI.prototype.dismissProgressDialog = function() {
    console.log("[NativeUID/dismissProgressDialog]");
};

NativeUI.prototype.dismissSoftKeyboard = function(callback) {
    console.log("[NativeUID/dismissSoftKeyboard] *not supported by simulator");
};

NativeUI.prototype.isKeyboardShowing = function(callback) {
	console.log("[NativeUID/isKeyboardShowing] *not supported by simulator");
};

NativeUI.prototype.setOptionMenu = function(menuItems) {
	console.log("[NativeUID/setOptionMenu] *not supported by simulator");
};

NativeUI.prototype.setProgress = function(progress) {
    console.log("[NativeUID/setProgress]");
    if (isValid(progress)) {
        console.log("vv Progress vv");
        console.log(progress);
    }
};

NativeUI.prototype.showContextMenu = function(menuItems, option) {
    console.log("[NativeUID/showContextMenu]");
};

NativeUI.prototype.showDatePicker = function(callback, option) {
    console.log("[NativeUID/showDatePicker]");
    showDatePickerOnSimulator(callback, null);
};

NativeUI.prototype.showDatePickerWithData = function(date, callback, option) {
    console.log("[NativeUID/showDatePickerWithData]");
    showDatePickerOnSimulator(callback, date);
};

NativeUI.prototype.showMultiSelect = function(selection) {
    console.log("[NativeUID/showMultiSelect]");
    initMultiSelectDialogView(selection.title, selection.items, eval(selection.callback));
	$("#multiselectDialogDiv").dialog("open");
};

NativeUI.prototype.showProgressBarDialog = function(option) {
    console.log("[NativeUID/showProgressBarDialog]");
};

NativeUI.prototype.showProgressDialog = function(option) {
    console.log("[NativeUID/showProgressDialog]");
};

NativeUI.prototype.showSingleSelect = function(selection) {
    console.log("[NativeUID/showSingleSelect]");
    
    var title = selection.title;
	var initData = selection.items;
	var defaultSelection = selection.defValue;
	
	initSelectDialogView(title, initData, defaultSelection, eval(selection.callback));
	$("#selectDialogDiv").dialog("open");
};

NativeUI.prototype.showTimePicker = function(callback, option) {
    console.log("[NativeUID/showTimePicker]");
};

NativeUI.prototype.showTimePickerWithData = function(time, callback, option) {
    console.log("[NativeUID/showTimePickerWithData]");
};

var nativeUI;

Alopex.addConstructor(function() {
	if(typeof nativeUI == "undefined")
		nativeUI = new NativeUI();
});

function Phone() {}

Phone.prototype.call = function(number) {
    console.log("[PhoneD/call]");
    if (isValid(number)) {
        console.log("vv Number vv");
        console.log(number);
        window.location.href = "tel:" + number;
    }
};

Phone.prototype.sendEmail = function(mail) {
    console.log("[PhoneD/sendEmail]");
    if (isValid(mail)) {

        console.log("vv Mail vv");
        console.log(mail);

        var toList = "";
        var ccList = "";
        var bccList = "";

        for (var i = 0; i < mail["to"].length; i++)
            toList = toList + mail["to"][i] + ",";
        toList = toList.substring(0, toList.length - 1);

        for (var i = 0; i < mail["cc"].length; i++)
            ccList = ccList + mail["cc"][i] + ",";
        ccList = ccList.substring(0, ccList.length - 1);

        for (var i = 0; i < mail["bcc"].length; i++)
            bccList = bccList + mail["bcc"][i] + ",";
        bccList = bccList.substring(0, bccList.length - 1);

        var link = "mailto:" + toList
            + "?cc= " + ccList
            + "&subject=" + escape(mail["title"])
            + "&body=" + escape(mail["body"]);

        window.location.href = link;
    }
};

Phone.prototype.sendSMS = function(sms) {
    console.log("[PhoneD/sendSMS]");
};

var phone;

Alopex.addConstructor(function() {
	if(typeof phone == "undefined")
		phone = new Phone();
});

function Preference() {}

Preference.prototype.contains = function(key) {
    console.log("[PreferenceD/contains]");

    if (isValid(key)) {
        console.log("vv Key vv");
        console.log(key);
        if (window.parent.name.indexOf("ù") != -1) {
            var keys = window.parent.name.split("ù")[0];
            var keyArray = keys.split("♠");

            for (var i = 0; i < keyArray.length; i++) {
                if (keyArray[i] == "pp-" + key) {
                    return true;
                }
            }
        }
        return false;
    }
};

Preference.prototype.get = function(key) {
    console.log("[PreferenceD/get]");

    if (isValid(key)) {
        console.log("vv Key vv");
        console.log(key);
        if (window.parent.name.indexOf("ù") != -1) {
            var keys = window.parent.name.split("ù")[0];
            var values = window.parent.name.split("ù")[1];
            var keyArray = keys.split("♠");
            var valueArray = values.split("♠");

            for (var i = 0; i < keyArray.length; i++) {
                if (keyArray[i] == "pp-" + key) {
                	console.log("[PreferenceD/get] "+valueArray[i]);
                    return valueArray[i];
                }
            }
        }
        console.log("[PreferenceD/get] No Return Value");
        return "";
    } else{
    	console.log("[PreferenceD/get] No Return Value");
        return undefined;
    }
};

Preference.prototype.put = function(key, value) {
    console.log("[PreferenceD/put]");
    if (isValid(key) && isValid(value)) {
        console.log("vv Key vv");
        console.log(key);
        console.log("vv Value vv");
        console.log(value);

        if (window.parent.name.indexOf("ù") != -1) {
            var keys = window.parent.name.split("ù")[0];
            var values = window.parent.name.split("ù")[1];
            var keyArray = keys.split("♠");
            var valueArray = values.split("♠");

            for (var i = 0; i < keyArray.length; i++) {
                if (keyArray[i] == "pp-" + key) {
                    valueArray[i] = value;
                    window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
                    return;
                }
            }
            keyArray.push("pp-" + key);
            valueArray.push(value);

            window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
        } else {
            window.parent.name = "pp-" + key + "ù" + value;
        }
    }
};

Preference.prototype.remove = function(key) {
	console.log("[PreferenceD/remove]");
	if (isValid(key)) {
	    console.log("vv Key vv");
	    console.log(key);

	    var keys = window.parent.name.split("ù")[0];
	    var values = window.parent.name.split("ù")[1];
	    
	    if (keys != null && values != null) {
	        var keyArray = keys.split("♠");
	        var valueArray = values.split("♠");

	        for (var i = 0; i < keyArray.length; i++) {
	            if (keyArray[i] == "pp-" + key) {
	                keyArray.splice(i, 1);
	                valueArray.splice(i, 1);
	                window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
	                return;
	            }
	        }
	    }
	}
};

Preference.prototype.removeAll = function() {
	console.log("[PreferenceD/removeAll]");

	var keys = window.parent.name.split("ù")[0];
	var values = window.parent.name.split("ù")[1];

	if (keys != null && values != null) {
	    var keyArray = keys.split("♠");
	    var valueArray = values.split("♠");
	    
	    var len = keyArray.length;
	    for (var i = 0; i < len; i++) {
	    	if (keyArray[i] != null) {
	            if (keyArray[i].substring(0, 3) == "pp-") {
	                keyArray.splice(i, 1);
	                valueArray.splice(i, 1);
	                i--;
	                len--;
	            }
	    	}
	    }
	    window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
	}
};

var preference;

Alopex.addConstructor(function() {
	if(typeof preference == "undefined")
		preference = new Preference();
});

function PushNotification() {}

PushNotification.prototype.deleteAllUnreadNotifications = function() {
	console.log("[PushNotification/deleteAllUnreadNotifications] *not supported on simulator");
};

PushNotification.prototype.deleteUnreadNotification = function(index) {
	console.log("[PushNotification/deleteUnreadNotification] *not supported on simulator");
};

PushNotification.prototype.getRegistrationId = function() {
	console.log("[PushNotification/getRegistrationId] *not supported on simulator");
};

PushNotification.prototype.getUnreadNotifications = function(callback) {
	console.log("[PushNotification/getUnreadNotifications] *not supported on simulator");
};

PushNotification.prototype.register = function(sendersID) {
	console.log("[PushNotification/register] *not supported on simulator");
};

PushNotification.prototype.unregister = function() {
	console.log("[PushNotification/unregister] *not supported on simulator");
};

PushNotification.prototype.useImmediateForegroundNotification = function(use) {
	console.log("[PushNotification/useImmediateForegroundNotification] *not supported on simulator");
};

var pushNotification;

Alopex.addConstructor(function() {
	if(typeof pushNotification == "undefined")
		pushNotification = new PushNotification();
});

function returnTemplate(data) {
	log.log("returnTemplate : " + data);
	
	return data;
}

function initDynamicDatePicker(callback) {
	$.datepicker.setDefaults({
	    //monthNames: ['년 1월','년 2월','년 3월','년 4월','년 5월','년 6월','년 7월','년 8월','년 9월','년 10월','년 11월','년 12월'],
	    //dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
	    //showMonthAfterYear:true,
	    dateFormat: 'yy-mm-dd',
	    buttonImageOnly: true,
	});
	
    $("#dynamicDiv").datepicker({
        inline: true,
        onSelect: function(date) { 
        	var dateArray = date.split('-');
        	var dateJSON = {};
        	dateJSON.year = dateArray[0];
        	dateJSON.month = dateArray[1];
        	dateJSON.day = dateArray[2];
        	
            if (typeof callback == 'function') {
            	callback(dateJSON);
            }
        	
        	$( "#dialogDiv" ).dialog("close"); 
        }
    });
}

function showDatePickerOnSimulator(callback, initialDate) {
	var dialogDiv = document.getElementById("dialogDiv");
	if (dialogDiv == null) {
		$( '<div id="dialogDiv"/>' ).html('<div id="dynamicDiv"/>').dialog({
			autoOpen: false,
			height: 380,
			width: 350,
			modal: true		
		});
		initDynamicDatePicker(callback);
	}

	if (initialDate != null) {
		$("#dynamicDiv").datepicker().datepicker("setDate", new Date(initialDate.year, initialDate.month -1, initialDate.day));
	} else {
		$("#dynamicDiv").datepicker().datepicker("setDate", new Date());
	}
	
	$("#dialogDiv").dialog("open");
}

function initSelectDialogView(titleStr, initData, defaultSelection, callback) {
	var dialogDiv = document.getElementById("selectDialogDiv");
	if (dialogDiv == null) {
		$( '<div id="selectDialogDiv"/>' ).html('<ol id="selectable"/>').dialog({
			buttons: {
				Ok: function() {
					var index = -1;
					$( ".ui-selected", this ).each(function() {
						index = $( "#selectable li" ).index( this );
					});
					
					if (typeof callback == 'function') {
						callback(index);
					}
					
					$( this ).dialog( "close" );
				}
			},
			autoOpen: false,
			height: 380,
			width: 350,
			title: titleStr,
			modal: true		
		});
		
		$( "#selectable" ).selectable({
			 selected : function(event, ui) {
				 $(ui.selected).siblings().removeClass("ui-selected");
			 }
		});
	} else {
		$("#selectDialogDiv").dialog({ title : titleStr });
	}
	
	initializeSelectData(initData, defaultSelection);
}

function initializeSelectData(initData, defaultSelection) {
	$('#selectable').html('');
	
	if (initData != null) {
		var i=0;
		
		var current;
		for (i=0; i < initData.length; i++) {
			current = initData[i];
			$('#selectable').append('<li class="ui-widget-content">' + current + '</li>');
		}
		
		if (defaultSelection != null) {
			var count = 0;

			$( "#selectable li" ).each(function(i) {
				if (count == defaultSelection) {
					$(this).addClass("ui-selected");
				}
				
				count++;
			});
		}
	}
}

function initMultiSelectDialogView(titleStr, initData, callback) {
	var dialogDiv = document.getElementById("multiselectDialogDiv");
	if (dialogDiv == null) {
		$( '<div id="multiselectDialogDiv"/>' ).html('<ol id="mselectable"/>').dialog({
			buttons: {
				Ok: function() {
					var resArr = new Array();
					var count = 0;
					$( ".ui-selected", this ).each(function() {
						resArr[count] = $( this ).text();
						count++;
					});

					if (typeof callback == 'function') {
						callback(resArr);
					}
					
					$( this ).dialog( "close" );
				}
			},
			autoOpen: false,
			height: 380,
			width: 350,
			title: titleStr,
			modal: true		
		});
		
		$( "#mselectable" ).selectable();
	} else {
		$("#multiselectDialogDiv").dialog({ title : titleStr });
	}
	
	initializeMultiSelectData(initData);
}

function initializeMultiSelectData(initData) {
	$('#mselectable').html('');
	
	if (initData != null) {
		var keys = new Array();
		var values = new Array();
		var valMap = initData;
		
		for(var i = 0 ; i < valMap.length ; i++){
		    for(var key in valMap[i]){
		    	keys[i] = key;
		    	values[i] = valMap[i][key];
		    }
		}
		
		var i=0;
		
		var current;
		var flag;
		for (i=0; i < valMap.length; i++) {
			current = keys[i];
			flag = values[i];
			
			if (flag) {
				$('#mselectable').append('<li class="ui-widget-content ui-selected">' + current + '</li>');
			} else {
				$('#mselectable').append('<li class="ui-widget-content">' + current + '</li>');
			}
			
		}
	}
}

initScripts();

function initScripts() {
	var tHead = document.getElementsByTagName("head")[0];
	if (tHead != null) {
		var tScript = document.createElement('script');
		tScript.setAttribute('charset', 'utf-8');
		tScript.setAttribute('type', 'text/javascript');
		tScript.setAttribute('src', getContextPath() + '/alopex/jquery/jquery-1.6.2.min.js');
		document.head.appendChild(tScript);
		
		tScript = document.createElement('script');
		tScript.setAttribute('charset', 'utf-8');
		tScript.setAttribute('type', 'text/javascript');
		tScript.setAttribute('src', getContextPath() + '/alopex/jquery/jquery-ui-1.8.16.custom.min.js');
		document.head.appendChild(tScript);
		
		var tLink = document.createElement('link');
		tLink.setAttribute('rel', 'stylesheet');
		tLink.setAttribute('charset', 'utf-8');
		tLink.setAttribute('type', 'text/css');
		tLink.setAttribute('href', getContextPath() + '/alopex/jquery/css/start/jquery-ui-1.8.16.custom.css');
		document.head.appendChild(tLink);
		
		tLink = document.createElement('link');
		tLink.setAttribute('rel', 'stylesheet');
		tLink.setAttribute('charset', 'utf-8');
		tLink.setAttribute('type', 'text/css');
		tLink.setAttribute('href', getContextPath() + '/alopex/jquery/css/native.css');
		document.head.appendChild(tLink);
	}
}

function getContextPath() {
    var base = document.URL;
    var baseSubPath = base.substr(base.indexOf("//") + 2, base.length);
    var subPath = baseSubPath.substr(baseSubPath.indexOf("/"), baseSubPath.length);
    var path = subPath.substr(0, subPath.indexOf("/", 1));
    
    return path;
};

function getContextPath() {
    var base = document.getElementsByTagName('base')[0];
    if (base && base.href && (base.href.length > 0)) {
        base = base.href;
    } else {
        base = document.URL;
    }
    return base.substr(0,
        base.indexOf("/", base.indexOf("/", base.indexOf("//") + 2) + 1));
};