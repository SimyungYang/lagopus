/* 
* Copyright (c) 2012 SK C&C Co., Ltd. All rights reserved. 
* 
* This software is the confidential and proprietary information of SK C&C. 
* You shall not disclose such confidential information and shall use it 
* only in accordance with the terms of the license agreement you entered into 
* with SK C&C. 
*/
/**
 * @version 2.3.0
 */
 
window.onerror=function(msg, url, linenumber) {
	log.log("Javascript Error Message");
	log.log("msg : " + msg);
	log.log("url : " + url);
	log.log("linenumber : " + linenumber);
	return true;
};

var _anomFunkMap = {};
var _anomFunkMapNextId = 0;

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

if(typeof(DeviceInfo) != "object"){
	DeviceInfo = {};
}

onload = function() { document.readyState = "loaded"; };

function notSupported(functionName) {
	log.log(functionName + " is not supported on " + device.platformName);
}

Alopex = {
	queue : {
		ready : true,
		commands : [],
		timer : null
	}, _constructors : []
};

Alopex.addConstructor = function(func) {
	var state = document.readyState;
	
	if((state == 'loaded' || state == 'complete'))
		func();
	else
		Alopex._constructors.push(func);
};

(function() {
	var timer = setInterval(function() {
		var state = document.readyState;
		
		if((state == "loaded" || state == "complete") && (DeviceInfo.deviceId != null)) 
		{
			clearInterval(timer); // stop looking
			// run our constructors list
			while(Alopex._constructors.length > 0) {
				var constructor = Alopex._constructors.shift();
				
				if(window.isSimulator){
					constructor();
				}else {
					try {
						constructor();
					} catch(e) {
						if(typeof(debug)!="undefined" && typeof(debug['log']) == 'function')
							debug.log("Failed to run constructor: " + debug.processMessage(e));
						else
							log.error("Failed to run constructor: " + e.message + e);
					}
				}
			}
			
			// all constructors run, now fire the deviceready event
			var e = document.createEvent('Events');
			e.initEvent('deviceready', true, true);
			document.dispatchEvent(e);
		}
	}, 1);
})();

Alopex.exec = function() {
	Alopex.queue.commands.push(arguments);
	
	if(Alopex.queue.timer == null){
		Alopex.queue.timer = setInterval(Alopex.run_command, 10);
	}
};

Alopex.run_command = function() {
	if(!Alopex.available || !Alopex.queue.ready)
		return;
	
	Alopex.queue.ready = false;
	
	var args = Alopex.queue.commands.shift();
	
	if(Alopex.queue.commands.length == 0) {
		clearInterval(Alopex.queue.timer);
		Alopex.queue.timer = null;
	}
	
	var uri = [];
	var dict = null;
	
	for(var i = 1; i < args.length; i++) {
		var arg = args[i];
		
		if(arg == undefined || arg == null)
			arg = '';
			
		if(typeof(arg) == 'object')
			dict = arg;
		else
			uri.push(encodeURIComponent(arg));
	}
	
	var url = "alopex://" + args[0] + "/" + uri.join("/");
	
	if(dict != null) {
		var query_args = [];
		
		for(var name in dict) {
			if(typeof(name) != 'string')
				continue;
			
			query_args.push(encodeURIComponent(name) + "=" + encodeURIComponent(dict[name]));
		}
		
		if(query_args.length > 0)
			url += "?" + query_args.join("&");
	}
	
	document.location = url;
};

function AlopexController() {
	this.parameters = null;
	this.results = null;
	this.pageId = null;
}

AlopexController.prototype.back = function(results) {
	if(results)
		Alopex.exec("Alopex.back" , JSON.stringify(results));
	else
		Alopex.exec("Alopex.back");
};

AlopexController.prototype.backTo = function(navigationRule) {
	if(isValid(navigationRule)) {
		if(navigationRule.pageId == undefined) {
			log.error("Page id is not defined in the navigation rule object.");
			
			return;
		}
		
		this.results = null;
		Alopex.exec("Alopex.backTo", JSON.stringify(navigationRule));
	}
};

AlopexController.prototype.backToOrNavigate = function(navigationRule) {
	if(isValid(navigationRule)) {
		if(typeof(navigationRule)=="string"){
	        var pageInfo = {};
	        pageInfo.pageId = navigationRule;
	        navigationRule = pageInfo;
		}
		
		if(navigationRule.pageId == undefined) {
			log.error("Page id is not defined in the navigation rule object.");
			
			return;
		}
		
		this.results = null;
		Alopex.exec("Alopex.backTo", JSON.stringify(navigationRule));
	}
};

AlopexController.prototype.dismissLoadImage = function() {
	Alopex.exec("Alopex.dismissLoadImage");
};

AlopexController.prototype.dismissLoadingView = function() {
    Alopex.exec("Alopex.dismissLoadingView");
};

AlopexController.prototype.exit = function() {
	notSupported("Alopex.exit");
};

AlopexController.prototype.goHome = function() {
	Alopex.exec("Alopex.goHome");
};

AlopexController.prototype.initPreferences = function() {
	Alopex.exec("Preference.initPreferences");
	Alopex.exec("MemoryPreference.initPreferences");
	Alopex.exec("GlobalPreference.initPreferences");
};

AlopexController.prototype.navigate = function(navigationRule) {
	if(isValid(navigationRule)) {	
		if(typeof(navigationRule)=="string"){
	        var pageInfo = {};
	        pageInfo.pageId = navigationRule;
	        navigationRule = pageInfo;
		}
		
		if(navigationRule.pageId == undefined) {
			log.error("Page id is not defined in the navigation rule object.");
			return;
		}
		
		this.results = null;
		Alopex.exec("Alopex.navigate", JSON.stringify(navigationRule));
	}
};

AlopexController.prototype.setCustomizedBack = function(callback){
	notSupported("AlopexController.setCustomizedBack");
};

AlopexController.prototype.setOnPause = function(callback) {
	if(isValid(callback))
		Alopex.exec("Alopex.setOnPause" ,GetFunctionName(callback));
};

AlopexController.prototype.setOnResume = function(callback) {
	if(isValid(callback))
		Alopex.exec("Alopex.setOnResume" ,GetFunctionName(callback));
};

AlopexController.prototype.setOnScreenTouch = function(callback) {
	if(isValid(callback))
		Alopex.exec("Alopex.setOnScreenTouch" ,GetFunctionName(callback));
};

AlopexController.prototype.start = function(initHandler) {
	if(isValid(initHandler)) {
		this.initPreferences();
		
		if(typeof(initHandler) == "function")
			Alopex.exec("Alopex.initParameters", GetFunctionName(initHandler));
		else if(typeof(initHandler) == "string")
			Alopex.exec("Alopex.initParameters", initHandler);
	}
};

var alopexController;

Alopex.addConstructor(function() {
	alopexController = new AlopexController();
});

function Application() {
	this.appId = DeviceInfo.appId;
	this.appVersion = DeviceInfo.appVersion;
	this.contentVersion = DeviceInfo.contentVersion;
}

Application.prototype.getVersion = function(identifier) {
	if(isValid(identifier))
		return globalPreference.get(identifier);
};

Application.prototype.hasApp = function(identifier,callback) {
	if(isValid(identifier) && isValid(callback)){
		if(typeof(callback) == "function")
			Alopex.exec("Application.hasApp", identifier, GetFunctionName(callback));
		else if(typeof(callback) == "string")
			Alopex.exec("Application.hasApp", identifier, callback);
	}
};

Application.prototype.installApplication = function(filePath){
	notSupported("Application.installApplication");
};

Application.prototype.startApplication = function(identifier , parameters) {
	if(isValid(identifier)) {
		if(isValid(parameters))
			Alopex.exec("Application.startApplication", identifier, JSON.stringify(parameters));
		else
			Alopex.exec("Application.startApplication", identifier); 
	}
};

Application.prototype.startAlopexApplication = function(identifier, pageId, parameters) {
	if(isValid(identifier) && isValid(pageId)) {
		if(isValid(parameters))
			Alopex.exec("Application.startAlopexApplication", identifier, pageId, JSON.stringify(parameters));
		else
			Alopex.exec("Application.startAlopexApplication", identifier, pageId);
	}
};

Application.prototype.startWebBrowser = function(url) {
	if(isValid(url))
		Alopex.exec("Application.startWebBrowser", url);
};

var application;

Alopex.addConstructor(function() {
	application = new Application();
});

function Contact() {}

Contact.prototype.add = function(contactInfo, successCallback, errorCallback) {
	if(isValid(contactInfo) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("Contact.add",  JSON.stringify(contactInfo), GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Contact.prototype.get = function(contactId, successCallback, errorCallback) {
	if(isValid(contactId) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("Contact.get", contactId, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Contact.prototype.remove = function(contactId, successCallback, errorCallback) {
	if(isValid(contactId) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("Contact.remove", contactId, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Contact.prototype.search = function(option, successCallback, errorCallback) {
	if(isValid(option)) {
		if(isValid(successCallback) && isValid(errorCallback))
			Alopex.exec("Contact.search", JSON.stringify(option), GetFunctionName(successCallback), GetFunctionName(errorCallback));
	}
	else {
		if(isValid(successCallback) && isValid(errorCallback))
			Alopex.exec("Contact.search", GetFunctionName(successCallback), GetFunctionName(errorCallback));
	}
};

Contact.prototype.update = function(contactInfo, successCallback, errorCallback) {
	if(isValid(contactInfo) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("Contact.update", JSON.stringify(contactInfo), GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

var contact;

Alopex.addConstructor(function() {
	contact = new Contact();
});

function Database() {
	this.resultSet;
	this.resultRaw;
}

Database.prototype.commit = function(databaseName, successCallback, errorCallback) {
	if(isValid(databaseName) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("Database.commit", databaseName, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Database.prototype.deleteRow = function(query) {
	if(isValid(query))
		Alopex.exec("Database.deleteRow", JSON.stringify(query));
};

Database.prototype.execQuery = function(query) {
	if(isValid(query))
		Alopex.exec("Database.execQuery", JSON.stringify(query));
};

Database.prototype.insert = function(query) {
	if(isValid(query))
		Alopex.exec("Database.insert", JSON.stringify(query));
};

Database.prototype.select = function(databaseName, query, successCallback, errorCallback) {
	if(isValid(databaseName) && isValid(query) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("Database.select", databaseName, JSON.stringify(query), GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Database.prototype.update = function(query) {
	if(isValid(query))
		Alopex.exec("Database.update", JSON.stringify(query));
};

var database;

Alopex.addConstructor(function() {
	database = new Database();
});

function Device() {
	this.isTablet = DeviceInfo.isTablet;
	this.isTV = DeviceInfo.isTV;
	this.platform = DeviceInfo.platform;
	this.deviceId = DeviceInfo.deviceId;
	this.osVersion = DeviceInfo.osVersion;
	this.deviceModel = DeviceInfo.deviceModel;
	this.deviceManufacturer = "apple";
	this.mobileEquipmentId = DeviceInfo.deviceId;
	
	if(this.platform != null && (this.platform.indexOf("iPhone") != -1 || this.platform.indexOf("iPad") != -1))
		this.platformName = "iPhone";
	
	this.available = Alopex.available = this.deviceId != null;
}

Device.prototype.getDeviceDpi = function() {
	notSupported("Device.getDeviceDpi");
};

Device.prototype.getLanguage = function(callback) {
	if(isValid(callback))
		Alopex.exec("Device.getLanguage", GetFunctionName(callback));
};

Device.prototype.getNetworkType = function(callback) {
	if(isValid(callback))
		Alopex.exec("Device.getNetworkType", GetFunctionName(callback));
};

var device;

Alopex.addConstructor(function() {
	device = window.device = new Device();
});

function File(){}

File.prototype.copy = function (from, to, callback){
    if(isValid(from) && isValid(to) && isValid(callback))
        Alopex.exec("File.copy", from, to, GetFunctionName(callback));
}
                                                      
File.prototype.createNewFile = function (path, callback){
    if(isValid(path) && isValid(callback))
        Alopex.exec("File.createNewFile", path, GetFunctionName(callback));
}
                                                      
File.prototype.deleteFile = function (from, callback){
    if(isValid(from) && isValid(callback))
        Alopex.exec("File.deleteFile", from, GetFunctionName(callback));
}

File.prototype.exists = function (path, callback){
    if(isValid(path) && isValid(callback))
        Alopex.exec("File.exists", path, GetFunctionName(callback));
}
                                                      
File.prototype.getStoragePath = function (callback, onPrivate){
    if(isValid(callback) && isValid(onPrivate))
        Alopex.exec("File.getStoragePath", GetFunctionName(callback), onPrivate);
}

File.prototype.isDirectory = function (path, callback){
    if(isValid(path) && isValid(callback))
        Alopex.exec("File.isDirectory", path, GetFunctionName(callback));
}

File.prototype.mkdirs = function (path, callback){
    if(isValid(path) && isValid(callback))
        Alopex.exec("File.mkdirs", path, GetFunctionName(callback));
}
                                                      
File.prototype.move = function (from, to, callback){
    if(isValid(from) && isValid(to) && isValid(callback))
        Alopex.exec("File.move", from, to, GetFunctionName(callback));
}

File.prototype.rename = function (path, name, callback){
    if(isValid(path) && isValid(callback))
        Alopex.exec("File.rename", path, name, GetFunctionName(callback));
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
		}
		else {
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
	geolocation = new Geolocation();
});

function GlobalPreference() {
	this.preferences = new Object();
}

GlobalPreference.prototype.contains = function(key) {
	if(isValid(key)) {
		if(isValid(this.preferences[key]))
			return true;
		else
			return false;
	}
};

GlobalPreference.prototype.get = function(key) {
	if(isValid(key)) {
		var val = this.preferences[key];
		
		if(isValid(val))
			return val;
		else
			return undefined;
	}
	else
		return undefined;
};

GlobalPreference.prototype.put = function(key, value) {
	if(isValid(key) && isValid(value)) {
		this.preferences[key] = value;
		Alopex.exec("GlobalPreference.put", key, value);
	}
};

GlobalPreference.prototype.remove = function(key) {
	if(isValid(key)) {
		delete this.preferences[key];
		Alopex.exec("GlobalPreference.remove", key);
	}
};

var globalPreference;

Alopex.addConstructor(function() {
	globalPreference = new GlobalPreference();
});

var httpObjects = new Array();

function Http() {
	this.errorCode = -1;
	this.errorMessage = null;
	this.response = null;
	this.responseHeader = {};
	httpObjects.push(this);
	this.index = httpObjects.length - 1;
}

Http.prototype.cancelDownload = function() {
	Alopex.exec("Http.cancelDownload", this.index);
};

Http.prototype.cancelRequest = function() {
	Alopex.exec("Http.cancelRequest", this.index);
};

Http.prototype.cancelUpload = function() {
	Alopex.exec("Http.cancelUpload", this.index);
};

Http.prototype.download = function(entity, successCallback, errorCallback, progressCallback, cancelCallback) {
	if(isValid(entity) && isValid(successCallback) && isValid(errorCallback) && isValid(progressCallback) && isValid(cancelCallback)){
		if(typeof(successCallback) == "function" && typeof(errorCallback) == "function" && typeof(progressCallback) == "function" && typeof(cancelCallback) == "function")
			Alopex.exec("Http.download", this.index, JSON.stringify(entity), GetFunctionName(successCallback), GetFunctionName(errorCallback), GetFunctionName(progressCallback),GetFunctionName(cancelCallback));
		else if(typeof(successCallback) == "string" && typeof(errorCallback) == "string" && typeof(progressCallback) == "string" && typeof(cancelCallback) == "string")
			Alopex.exec("Http.download", this.index, JSON.stringify(entity), successCallback, errorCallback, progressCallback, cancelCallback);
	}
};

Http.prototype.getResponseHeader = function(header) {
	if(isValid(header))
		return this.responseHeader[header];
};

Http.prototype.request = function(entity, successCallback, errorCallback ,delegateClassName) {
	if(isValid(entity) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("Http.request", this.index, JSON.stringify(entity), GetFunctionName(successCallback), GetFunctionName(errorCallback) ,delegateClassName);
};

Http.prototype.setRequestHeader = function(header, value) {
	if(isValid(header) && isValid(value))
		Alopex.exec("Http.setRequestHeader", this.index, header, value);
};

Http.prototype.setTimeout = function(timeout) {
	if(isValid(timeout)) {
		if(!isNaN(timeout))
			Alopex.exec("Http.setTimeout", this.index ,timeout);
	}
};

Http.prototype.upload = function(entity, successCallback, errorCallback, progressCallback, cancelCallback) {
	if(isValid(entity) && isValid(successCallback) && isValid(errorCallback) && isValid(progressCallback) && isValid(cancelCallback)){
		if(typeof(successCallback) == "function" && typeof(errorCallback) == "function" && typeof(progressCallback) == "function" && typeof(cancelCallback) == "function")
			Alopex.exec("Http.upload", this.index, JSON.stringify(entity), GetFunctionName(successCallback), GetFunctionName(errorCallback), GetFunctionName(progressCallback),GetFunctionName(cancelCallback));
		else if(typeof(successCallback) == "string" && typeof(errorCallback) == "string" && typeof(progressCallback) == "string" && typeof(cancelCallback) == "string")
			Alopex.exec("Http.upload", this.index, JSON.stringify(entity), successCallback, errorCallback, progressCallback, cancelCallback);
	}
};

function LocalNotification() {}

LocalNotification.prototype.addNotification = function(id, time, action) {
	if(isValid(id) && isValid(time) && isValid(action))
		Alopex.exec("LocalNotification.addNotification", id, JSON.stringify(time), JSON.stringify(action));
};

LocalNotification.prototype.getUnreadNotifications = function(callback) {
    if(isValid(callback))
		Alopex.exec("LocalNotification.getUnreadNotifications", GetFunctionName(callback));

};

LocalNotification.prototype.deleteAllUnreadNotifications = function() {
	Alopex.exec("LocalNotification.deleteAllUnreadNotifications");
};

LocalNotification.prototype.deleteUnreadNotification = function(index) {
	if(isValid(index))
		Alopex.exec("LocalNotification.deleteUnreadNotification", index);
};

LocalNotification.prototype.removeNotification = function(id) {
	if(isValid(id))
		Alopex.exec("LocalNotification.removeNotification", id);
};

LocalNotification.prototype.useImmediateForegroundNotification = function(use) {
	if(isValid(id))
		Alopex.exec("LocalNotification.useImmediateForegroundNotification", use);
};

var localNotification;

Alopex.addConstructor(function() {
	localNotification = new LocalNotification();
});

function Log() {
	this.show = true;
}

Log.prototype.error = function(message) {
	if(isValid(message)) {
		if(!this.show)
			return;
		
		if(Alopex.available)
			Alopex.exec("DebugConsole.log", message, {logLevel: "ERROR"});
	}
};

Log.prototype.log = function(message) {
	if(isValid(message)) {
		if(!this.show)
			return;
		
		if(Alopex.available)
			Alopex.exec("DebugConsole.log", message, {logLevel: "INFO"});
	}
};

Log.prototype.warn = function(message) {
	if(isValid(message)) {
		if(!this.show)
			return;
		
		if(Alopex.available)
			Alopex.exec("DebugConsole.log", message, {logLevel: "WARN"});
	}
};

var log;

Alopex.addConstructor(function() {
	log = new Log();
});

function MemoryPreference(){
	this.preferences = null;
}

MemoryPreference.prototype.contains = function(key) {
	if(isValid(key)) {
		if(isValid(this.preferences[key]))
			return true;
		else
			return false;
	}
};

MemoryPreference.prototype.get = function(key) {
	if(isValid(key)) {
		var val = this.preferences[key];
		
		if(isValid(val))
			return val;
		else
			return undefined;
	}
	else
		return undefined;
};

MemoryPreference.prototype.put = function(key, value) {
	if(isValid(key) && isValid(value)){
		this.preferences[key] = value;
		Alopex.exec("MemoryPreference.put", key, value);
	}
};

MemoryPreference.prototype.remove = function(key) {
	if(isValid(key)){
		delete this.preferences[key];
		Alopex.exec("MemoryPreference.remove", key);
	}
};

MemoryPreference.prototype.removeAll = function() {
	this.preferences = null;
	this.preferences = new Object();
	Alopex.exec("MemoryPreference.removeAll");
};

var memoryPreference;

Alopex.addConstructor(function() {
	memoryPreference = new MemoryPreference();
});

function Multimedia() {}

Multimedia.prototype.deleteImage = function(path, successCallback, errorCallback) {
	if(isValid(path) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("Multimedia.deleteImage", path, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Multimedia.prototype.getImageOrientation = function(imagePath, callback) {
	if(isValid(imagePath) && isValid(callback)){
		if(typeof(callback) == "function")
			Alopex.exec("Multimedia.getImageOrientation", imagePath, GetFunctionName(callback));
		else if(typeof(callback) == "string")
			Alopex.exec("Multimedia.getImageOrientation", imagePath, callback);
	}
};

Multimedia.prototype.getPicture = function(successCallback, errorCallback, option) {
	if(isValid(option)) {
		if(isValid(successCallback) && isValid(errorCallback))
			Alopex.exec("Multimedia.getPicture", GetFunctionName(successCallback), GetFunctionName(errorCallback), JSON.stringify(option));
	}
	else {
		if(isValid(successCallback) && isValid(errorCallback))
			Alopex.exec("Multimedia.getPicture", GetFunctionName(successCallback), GetFunctionName(errorCallback));
	}
};

Multimedia.prototype.resizePicture = function(pictureInfo, callback) {
	if(isValid(pictureInfo) && isValid(callback)){
		if(typeof(callback) == "function")
			Alopex.exec("Multimedia.resizePicture", JSON.stringify(pictureInfo), GetFunctionName(callback));
		else if(typeof(callback) == "string")
			Alopex.exec("Multimedia.resizePicture", JSON.stringify(pictureInfo), callback);
	}
};

Multimedia.prototype.rotateImage = function(imageInfo , callback) {
	if(isValid(imageInfo) && isValid(callback))
		Alopex.exec("Multimedia.rotateImage", JSON.stringify(imageInfo), GetFunctionName(callback));
};

Multimedia.prototype.saveImage = function(path, successCallback, errorCallback) {
	if(isValid(path) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("Multimedia.saveImage", path, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Multimedia.prototype.takePicture = function(successCallback, errorCallback) {
	if(isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("Camera.takePicture", GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

var multimedia;

Alopex.addConstructor(function() {
	multimedia = new Multimedia();
});

function NativeUI() {}

NativeUI.prototype.dismissProgressBarDialog = function() {
	Alopex.exec("NativeUI.dismissProgressBarDialog");
};

NativeUI.prototype.dismissProgressDialog = function() {
	Alopex.exec("NativeUI.dismissProgressDialog");
};

NativeUI.prototype.dismissSoftKeyboard = function(callback){
	if(isValid(callback))
		Alopex.exec("NativeUI.dismissSoftKeyboard", GetFunctionName(callback));
	else
		Alopex.exec("NativeUI.dismissSoftKeyboard");
};

NativeUI.prototype.isKeyboardShowing = function(callback){
	if(isValid(callback))
		Alopex.exec("NativeUI.keyboardShown" , GetFunctionName(callback));  
};

NativeUI.prototype.setOptionMenu = function(menuItems) {
	log.log("NativeUI.setOptionMenu is not supported on iOS platform");
};

NativeUI.prototype.setProgress = function(progress) {
	if(isValid(progress)) {
		if(progress >= 0 && progress <= 100)
			Alopex.exec("NativeUI.setProgress", progress);
	}
};

NativeUI.prototype.setOptionMenu = function setOptionMenuItems(menuItems) {
	notSupported("NativeUI.setOptionMenu");
};

NativeUI.prototype.showContextMenu = function(menuItems, option) {
	if(isValid(menuItems)) {
		if(isValid(option))
			Alopex.exec("NativeUI.showContextMenu", JSON.stringify(menuItems), JSON.stringify(option));
		else
			Alopex.exec("NativeUI.showContextMenu", JSON.stringify(menuItems));
	}
};

NativeUI.prototype.showDatePicker = function(callback, option) {
	if(isValid(callback)) {
		if(isValid(option))
			Alopex.exec("NativeUI.showDatePicker", GetFunctionName(callback), JSON.stringify(option));
		else
			Alopex.exec("NativeUI.showDatePicker", GetFunctionName(callback));
	}
};

NativeUI.prototype.showDatePickerWithData = function(date, callback, option) {
	if(isValid(date) && isValid(callback)) {
		if(date.year < 1900) {
			log.warn("Set year to 1900 since " + date.year + " is not valid year.");
			date.year = 1900;
		}
		else if(date.year > 2100) {
			log.warn("Set year to 2100 since " + date.year + " is not valid year.");
			date.year = 2100;
		}
		
		if(date.month < 1) {
			log.warn("Set month to 1 since " + date.month + " is not valid month.");
			date.month = 1;
		}
		else if(date.month > 12) {
			log.warn("Set month to 12 since " + date.month + " is not valid month.");
			date.month = 12;
		}
		
		if(date.day < 1) {
			log.warn("Set day to 1 since " + date.day + " is not valid day.");
			date.day = 1;
		}
		else {
			if(date.month == 2) {
				if(date.year % 4 != 0) {
					if(date.day > 28) {
						log.warn("Set day to 28 since " + date.day + " is not valid day.");
						date.day = 28;
					}
				}
				else {
					if(date.day > 29) {
						log.warn("Set day to 29 since " + date.day + " is not valid day.");
						date.day = 29;
					}
				}
			}
			else if(date.month == 4 || date.month == 6 || date.month == 9 || date.month == 11) {
				if(date.day > 30) {
					log.warn("Set day to 30 since " + date.day + " is not valid day.");
					date.day = 30;
				}
			}
			else {
				if(date.day > 31) {
					log.warn("Set day to 31 since " + date.day + " is not valid day.");
					date.day = 31;
				}
			}
		}
		
	if(isValid(option))
		Alopex.exec("NativeUI.showDatePickerWithData", JSON.stringify(date), GetFunctionName(callback), JSON.stringify(option));
	else
		Alopex.exec("NativeUI.showDatePickerWithData", JSON.stringify(date), GetFunctionName(callback));
	}
};

NativeUI.prototype.showMultiSelect = function(selection) {
	if(isValid(selection))
		Alopex.exec("NativeUI.showMultiSelect", JSON.stringify(selection));
};

NativeUI.prototype.showProgressBarDialog = function(option) {
	if(isValid(option))
		Alopex.exec("NativeUI.showProgressBarDialog", JSON.stringify(option));
	else
		Alopex.exec("NativeUI.showProgressBarDialog");
};

NativeUI.prototype.showProgressDialog = function(option) {
	if(isValid(option))
		Alopex.exec("NativeUI.showProgressDialog", JSON.stringify(option));
	else
		Alopex.exec("NativeUI.showProgressDialog");  
};

NativeUI.prototype.showSingleSelect = function(selection) {
	if(isValid(selection))
		Alopex.exec("NativeUI.showSingleSelect", JSON.stringify(selection));
};

NativeUI.prototype.showTimePicker = function(callback,option) {
	if(isValid(callback)) {
		if(isValid(option))
			Alopex.exec("NativeUI.showTimePicker", GetFunctionName(callback), JSON.stringify(option));
		else
			Alopex.exec("NativeUI.showTimePicker", GetFunctionName(callback));
	}
};

NativeUI.prototype.showTimePickerWithData = function(time, callback, option) {
	if(isValid(time) && isValid(callback)) {
		if(time.ampm != "AM" && time.ampm != "am" && time.ampm != "PM" && time.ampm != "pm") {
			log.error("Insert AM, am, PM, or pm.");
			
			return;
		}
		 
		if(time.hour < 1) {
			log.warn("Set hour to 1 since " + time.hour + " is not valid hour.");
			time.hour = 1;
		}
		else if(time.hour > 12) {
			log.warn("Set hour to 11 since " + time.hour + " is not valid hour.");
			time.hour = 12;
		}
		
		if(time.minute < 0) {
			log.warn("Set min to 0 since " + time.minute + " is not valid min.");
			time.minute = 0;
		}
		else if(time.minute > 59) {
			log.warn("Set min to 59 since " + time.minute + " is not valid min.");
			time.minute = 59;
		}
		
		if(isValid(option))
			Alopex.exec("NativeUI.showTimePickerWithData", JSON.stringify(time), GetFunctionName(callback), JSON.stringify(option));
		else
			Alopex.exec("NativeUI.showTimePickerWithData", JSON.stringify(time), GetFunctionName(callback));
	}
};

var nativeUI;

Alopex.addConstructor(function() {
	nativeUI = new NativeUI();
});

function Phone() {}

Phone.prototype.call = function(number) {
	if(isValid(number))
		Alopex.exec("Phone.call", number);
};

Phone.prototype.sendEmail = function(mail) {
	if(isValid(mail))
 		Alopex.exec("Phone.sendEmail", JSON.stringify(mail));
};

Phone.prototype.sendSMS = function(sms) {
	if(isValid(sms))
		Alopex.exec("Phone.sendSMS", JSON.stringify(sms));
};

var phone;

Alopex.addConstructor(function() {
	phone = new Phone();
});

function Preference() {
	this.preferences = new Object();
}

Preference.prototype.contains = function(key) {
	if(isValid(key)) {
		if(isValid(this.preferences[key]))
			return true;
		else
			return false;
	}
};

Preference.prototype.get = function(key) {
	if(isValid(key)) {
		var val = this.preferences[key];
		
		if(isValid(val))
			return val;
		else
			return undefined;
	}
	else
		return undefined;
};

Preference.prototype.put = function(key, value) {
	if(isValid(key) && isValid(value)) {
		this.preferences[key] = value;
		Alopex.exec("Preference.put", key, value);
	}
};

Preference.prototype.remove = function(key) {
	if(isValid(key)) {
		delete this.preferences[key];
		Alopex.exec("Preference.remove", key);
	}
};

Preference.prototype.removeAll = function() {
	this.preferences = null;
	this.preferences = new Object();
	Alopex.exec("Preference.removeAll");
};

var preference;

Alopex.addConstructor(function() {
	preference = new Preference();
});

function PushNotification() {}

PushNotification.prototype.deleteAllUnreadNotifications = function() {
	Alopex.exec("PushNotification.deleteAllUnreadNotifications");
};

PushNotification.prototype.deleteUnreadNotification = function(index) {
	if(isValid(index))
		Alopex.exec("PushNotification.deleteUnreadNotification", index);
};

PushNotification.prototype.getRegistrationId = function(callback) {
	if(isValid(callback))
		Alopex.exec("PushNotification.getRegistrationId", GetFunctionName(callback));
};

PushNotification.prototype.getUnreadNotifications = function(callback) {
	if(isValid(callback))
		Alopex.exec("PushNotification.getUnreadNotifications", GetFunctionName(callback));
};

PushNotification.prototype.register = function(senderId) {
	notSupported("PushNotification.register");
};

PushNotification.prototype.unregister = function() {
	notSupported("PushNotification.unregister");
};

PushNotification.prototype.useImmediateForegroundNotification = function(use) {
	if(isValid(use))
		Alopex.exec("PushNotification.useImmediateForegroundNotification", use);
};

var pushNotification;

Alopex.addConstructor(function() {
	pushNotification = new PushNotification();
});

function Resource() {}

Resource.prototype.cancelGetContent = function() {
	Alopex.exec("Resource.cancelGetContent");
};

Resource.prototype.getContent = function(pageId, successCallback, errorCallback) {
	if(isValid(pageId) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("Resource.getContent", pageId, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Resource.prototype.getPageUri = function(pageId, callback) {
	if(isValid(pageId) && isValid(callback))
		Alopex.exec("Resource.getPageUri", pageId, GetFunctionName(callback));
};

var resource;

Alopex.addConstructor(function() {
	resource = new Resource();
});

function Timer() {}

Timer.prototype.initializeTimer = function() {
	Alopex.exec("Timer.initializeTimer");
};

Timer.prototype.setOffTimer = function() {
	Alopex.exec("Timer.setOffTimer");
};

Timer.prototype.setOnTimer = function(timerOption, callback) {
	if(isValid(timerOption) && isValid(callback))
		Alopex.exec("Timer.setOnTimer", JSON.stringify(timerOption), GetFunctionName(callback));
};

var timer;

Alopex.addConstructor(function() {
	timer = new Timer();
});