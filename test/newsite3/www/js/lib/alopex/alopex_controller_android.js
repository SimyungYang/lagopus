﻿/*
	 * Copyright (c) 2012 SK C&C Co., Ltd. All rights reserved.
	 * 
	 * This software is the confidential and proprietary information of SK C&C.
	 * You shall not disclose such confidential information and shall use it
	 * only in accordance with the terms of the license agreement you entered
	 * into with SK C&C.
	 */
/**
 * @version 2.2.7
 */

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
	}
	else
		return null;
}

function isValid(arg) {
	var currentScreen = alopexControllerD.getCurrentScreen();
	
	if(ownerScreen != undefined) {
		if(ownerScreen != currentScreen) {
			logD.warn("ownerScreen = " + ownerScreen);
			logD.warn("getCurrentScreen = " + currentScreen);
			
			return false;
		}
	}
	
	if(arg == undefined || arg == null) {
		log.warn("There are invalid arguements.");
		
		var caller = arguments.callee;
		
		while(true) {
			caller = caller.caller;
			
			if(caller == null)
				break;
			
			if(caller.name != "")
				log.warn("Caller : " + caller.name);
		}
		
		return false;
	}
	else
		return true;
}

function notSupported(functionName) {
	log.log(functionName + " is not supported on " + device.platformName);
}
(function() {
	var timer = setInterval(function() {
		if(deviceReady == true) {
			clearInterval(timer);
			
			var e = document.createEvent('Events');
			e.initEvent('deviceready', true, true);
			document.dispatchEvent(e);
		}
	}, 1);
})();
			
Alopex = {};

Alopex.addConstructor = function(func) {
	func();
};

Alopex.exec = function() {
	alopexCommandInterpreterD.exec(arguments);
};

function AlopexController() {
	this.parameters = null;
	this.results = null;
}

AlopexController.prototype.back = function(results) {
	if(results)
		alopexControllerD.back(JSON.stringify(results));
	else
		alopexControllerD.back();
};

AlopexController.prototype.backTo = function(navigationRule) {
	if(isValid(navigationRule)) {
		if(navigationRule.pageId == undefined) {
			log.error("Page id is not defined in the navigation rule object.");
			
			return;
		}
		
		this.results = null;
		alopexControllerD.backTo(JSON.stringify(navigationRule));
	}
};

AlopexController.prototype.dismissLoadImage = function() {
	alopexControllerD.dismissLoadImage();
}

AlopexController.prototype.exit = function() {
	alopexControllerD.exit();
};

AlopexController.prototype.goHome = function() {
	alopexControllerD.goHome();
};

AlopexController.prototype.navigate = function(navigationRule) {
	if(isValid(navigationRule)) {
		if(navigationRule.pageId == undefined) {
			log.error("Page id is not defined in the navigation rule object.");
			
			return;
		}
		
		this.results = null;
		alopexControllerD.navigate(JSON.stringify(navigationRule));
	}
};

AlopexController.prototype.setCustomizedBack = function(callback) {
	if(isValid(callback))
		alopexControllerD.setCustomizedBack(GetFunctionName(callback));
};

AlopexController.prototype.setOnPause = function(callback) {
	if(isValid(callback))
		alopexControllerD.setOnPause(GetFunctionName(callback));
};

AlopexController.prototype.setOnResume = function(callback) {
	if(isValid(callback))
		alopexControllerD.setOnResume(GetFunctionName(callback));
};

AlopexController.prototype.setOnScreenTouch = function(callback) {
	if(isValid(callback))
		alopexControllerD.setOnScreenTouch(GetFunctionName(callback));
};

AlopexController.prototype.start = function(initHandler) {
	if(isValid(initHandler)) {
		if(typeof(initHandler) == "function")
			alopexControllerD.start(GetFunctionName(initHandler));
		else if(typeof(initHandler) == "string")
			alopexControllerD.start(initHandler);
	}
};

var alopexController = new AlopexController();

function Application() {
	this.appId = applicationD.getAppId();
	this.appVersion = applicationD.getAppVersion();
	this.contentVersion = applicationD.getContentVersion();
}

Application.prototype.getVersion = function(identifier) {
	if(isValid(identifier))
		return applicationD.getVersion(identifier);
};

Application.prototype.hasApp = function(identifier, callback) {
	if(isValid(identifier) && isValid(callback))
		applicationD.hasApp(identifier, GetFunctionName(callback));
};

Application.prototype.installApplication = function(filePath) {
	if(isValid(filePath))
		applicationD.installApplication(filePath);
};

Application.prototype.startApplication = function(identifier, parameters) {
	if(isValid(identifier)) {
		if(isValid(parameters))
			applicationD.startApplication(identifier, JSON.stringify(parameters));
		else
			applicationD.startApplication(identifier, null);
	}
};

Application.prototype.startAlopexApplication = function(identifier, pageId, parameters) {
	if(isValid(identifier) && isValid(pageId)) {
		if(isValid(parameters))
			applicationD.startAlopexApplication(identifier, pageId, JSON.stringify(parameters));
		else
			applicationD.startAlopexApplication(identifier, pageId, null);
	}
};

Application.prototype.startWebBrowser = function(url) {
	if(isValid(url))
		applicationD.startWebBrowser(url);
};

var application = new Application();

function Contact() {}

Contact.prototype.add = function(contactInfo, successCallback, errorCallback) {
	if(isValid(contactInfo) && isValid(successCallback) && isValid(errorCallback))
		contactD.add(JSON.stringify(contactInfo), GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Contact.prototype.get = function(contactId, successCallback, errorCallback) {
	if(isValid(contactId) && isValid(successCallback) && isValid(errorCallback))
		contactD.get(contactId, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Contact.prototype.remove = function(contactId, successCallback, errorCallback) {
	if(isValid(contactId) && isValid(successCallback) && isValid(errorCallback))
		contactD.remove(contactId, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Contact.prototype.search = function(option, successCallback, errorCallback) {
	if(isValid(option)) {
		if(isValid(successCallback) && isValid(errorCallback))
			contactD.search(JSON.stringify(option), GetFunctionName(successCallback), GetFunctionName(errorCallback));
	}
	else {
		if(isValid(successCallback) && isValid(errorCallback))
			contactD.search("", GetFunctionName(successCallback), GetFunctionName(errorCallback));
	}
};

Contact.prototype.update = function(contactInfo, successCallback, errorCallback) {
	if(isValid(contactInfo) && isValid(successCallback) && isValid(errorCallback))
		contactD.update(JSON.stringify(contactInfo), GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

var contact = new Contact();

function Database() {
	this.resultSet;
	this.resultRaw;
}

Database.prototype.commit = function(databaseName, successCallback, errorCallback) {
	if(isValid(databaseName) && isValid(successCallback) && isValid(errorCallback))
		databaseD.commit(databaseName, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Database.prototype.deleteRow = function(query) {
	if(isValid(query)) {
		query.queryType = "deleteRow";
		databaseD.registQuery(JSON.stringify(query));
	}
};

Database.prototype.execQuery = function(query) {
	if(isValid(query)) {
		query.queryType = "execQuery";
		databaseD.registQuery(JSON.stringify(query));
	}
};

Database.prototype.insert = function(query) {
	if(isValid(query)) {
		query.queryType = "insert";
		databaseD.registQuery(JSON.stringify(query));
	}
};

Database.prototype.select = function(databaseName, query, successCallback, errorCallback) {
	if(isValid(databaseName) && isValid(query) && isValid(successCallback) && isValid(errorCallback))
		databaseD.select(databaseName, JSON.stringify(query), GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Database.prototype.update = function(query) {
	if(isValid(query)) {
		query.queryType = "update";
		databaseD.registQuery(JSON.stringify(query));
	}
};

var database = new Database();

function Device() {
	this.isTablet = deviceD.isTablet();
	this.isTV = deviceD.isTV();
	this.platformName = "Android";
	this.deviceId = deviceD.getDeviceId();
	this.deviceModel = deviceD.getDeviceModel();
	this.deviceManufacturer = deviceD.getDeviceManufacturer();
	this.osVersion = deviceD.getOsVersion() + "";
	this.mobileEquipmentId = deviceD.getMobileEquipmentId();
}

Device.prototype.getDeviceDpi = function() {
	return deviceD.getDeviceDpi();
};

Device.prototype.getLanguage = function(callback) {
	if(isValid(callback))
		deviceD.getLanguage(GetFunctionName(callback));
};

Device.prototype.getNetworkType = function(callback) {
	if(isValid(callback))
		deviceD.getNetworkType(GetFunctionName(callback));
};

var device = new Device();

function File() {
}

File.prototype.copy = function(from, to, callback) {
	if(isValid(from) && isValid(to) && isValid(callback))
		fileD.copy(from, to, GetFunctionName(callback));
}

File.prototype.createNewFile = function(path, callback) {
	if(isValid(path) && isValid(callback))
		fileD.createNewFile(path, GetFunctionName(callback));
}

File.prototype.deleteFile = function(from, callback) {
	if(isValid(from) && isValid(callback))
		fileD.deleteFile(from, GetFunctionName(callback));
}

File.prototype.exists = function(path, callback) {
	if(isValid(path) && isValid(callback))
		fileD.exists(path, GetFunctionName(callback));
}

File.prototype.getStoragePath = function(callback, onPrivate) {
	if(isValid(onPrivate) && isValid(callback))
		fileD.getStoragePath(GetFunctionName(callback), onPrivate)
}

File.prototype.isDirectory = function(path, callback) {
	if(isValid(path) && isValid(callback))
		fileD.isDirectory(path, GetFunctionName(callback));
}

File.prototype.mkdirs = function(path, callback) {
	if(isValid(path) && isValid(callback))
		fileD.mkdirs(path, GetFunctionName(callback));
}

File.prototype.move = function(from, to, callback) {
	if(isValid(from) && isValid(to) && isValid(callback))
		fileD.move(from, to, GetFunctionName(callback));
}

File.prototype.rename = function(path, name, callback) {
	if(isValid(path) && isValid(name) && isValid(callback))
		fileD.rename(path, name, GetFunctionName(callback));
}

var file = new File();

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

var geolocation = new Geolocation();

function GlobalPreference() {}

GlobalPreference.prototype.contains = function(key) {
	if(isValid(key))
		return globalPreferenceD.contains(key);
};

GlobalPreference.prototype.get = function(key) {
	if(isValid(key))
		return globalPreferenceD.get(key);
	else
		return undefined;
};

GlobalPreference.prototype.put = function(key, value) {
	if(isValid(key) && isValid(value))
		globalPreferenceD.put(key, value);
};

GlobalPreference.prototype.remove = function(key) {
	if(isValid(key))
		globalPreferenceD.remove(key);
};

var globalPreference = new GlobalPreference();

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
	httpD.cancelDownload(this.index);
};

Http.prototype.cancelRequest = function() {
	httpD.cancelRequest(this.index);
};

Http.prototype.cancelUpload = function() {
	httpD.cancelUpload(this.index);
};

Http.prototype.download = function(entity, successCallback, errorCallback, progressCallback, cancelCallback) {
	if(isValid(entity) && isValid(successCallback) && isValid(errorCallback) && isValid(progressCallback) && isValid(cancelCallback))
		httpD.download(JSON.stringify(entity), GetFunctionName(successCallback), GetFunctionName(errorCallback), GetFunctionName(progressCallback), GetFunctionName(cancelCallback), this.index);
};

Http.prototype.getResponseHeader = function(header) {
	if(isValid(header))
		return this.responseHeader[header];
};

Http.prototype.request = function(entity, successCallback, errorCallback) {
	if(isValid(entity) && isValid(successCallback) && isValid(errorCallback))
		httpD.request(JSON.stringify(entity), GetFunctionName(successCallback), GetFunctionName(errorCallback), this.index);
};

Http.prototype.setRequestHeader = function(header, value) {
	if(isValid(header) && isValid(value))
		httpD.setRequestHeader(header, value, this.index);
};

Http.prototype.setTimeout = function(timeout) {
	if(isValid(timeout)) {
		if(!isNaN(timeout))
			httpD.setTimeout(timeout);
	}
};

Http.prototype.upload = function(entity, successCallback, errorCallback, progressCallback, cancelCallback) {
	if(isValid(entity) && isValid(successCallback) && isValid(errorCallback) && isValid(progressCallback) && isValid(cancelCallback))
		httpD.upload(JSON.stringify(entity), GetFunctionName(successCallback), GetFunctionName(errorCallback), GetFunctionName(progressCallback), GetFunctionName(cancelCallback), this.index);
};

function LocalNotification() {}

LocalNotification.prototype.addNotification = function(id, time, action) {
	if(isValid(id) && isValid(time) && isValid(action))
		localNotificationD.addNotification(id, JSON.stringify(time), JSON.stringify(action));
};

LocalNotification.prototype.getUnreadNotifications = function(callback) {
	if(isValid(callback))
		localNotificationD.getUnreadNotifications(GetFunctionName(callback));
};

LocalNotification.prototype.deleteAllUnreadNotifications = function() {
	localNotificationD.deleteAllUnreadNotifications();
};

LocalNotification.prototype.deleteUnreadNotification = function(index) {
	if(isValid(index))
		localNotificationD.deleteUnreadNotification(index);
};

LocalNotification.prototype.removeNotification = function(id) {
	if(isValid(id))
		localNotificationD.removeNotification(id);
};

LocalNotification.prototype.useImmediateForegroundNotification = function(use) {
	if(isValid(use))
		localNotificationD.useImmediateForegroundNotification(use);
};

var localNotification = new LocalNotification();

function Log() {}

Log.prototype.error = function(message) {
	if(isValid(message))
		logD.error(message + "");
};

Log.prototype.log = function(message) {
	if(isValid(message))
		logD.log(message + "");
};

Log.prototype.warn = function(message) {
	if(isValid(message))
		logD.warn(message + "");
};

var log = new Log();

function MemoryPreference() {}

MemoryPreference.prototype.contains = function(key) {
	if(isValid(key))
		return memoryPreferenceD.contains(key);
};

MemoryPreference.prototype.get = function(key) {
	if(isValid(key))
		return memoryPreferenceD.get(key);
	else
		return undefined;
};

MemoryPreference.prototype.put = function(key, value) {
	if(isValid(key) && isValid(value))
		memoryPreferenceD.put(key, value);
};

MemoryPreference.prototype.remove = function(key) {
	if(isValid(key))
		memoryPreferenceD.remove(key);
};

MemoryPreference.prototype.removeAll = function() {
	memoryPreferenceD.removeAll();
};

var memoryPreference = new MemoryPreference();

function Multimedia() {}

Multimedia.prototype.deleteImage = function(path, successCallback, errorCallback) {
	if(isValid(successCallback)) {
		notSupported("Multimedia.deleteImage");
	
		successCallback();
	}
}; 

Multimedia.prototype.getImageOrientation = function(imagePath, callback) {
	if(isValid(imagePath) && isValid(callback))
		multimediaD.getImageOrientation(imagePath, GetFunctionName(callback));
};

Multimedia.prototype.getPicture = function(successCallback, errorCallback, option) {
	if(isValid(successCallback) && isValid(errorCallback))
		multimediaD.getPicture(GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Multimedia.prototype.resizePicture = function(pictureInfo, callback) {
	if(isValid(pictureInfo) && isValid(callback))
		multimediaD.resizePicture(JSON.stringify(pictureInfo), GetFunctionName(callback));
};

Multimedia.prototype.rotateImage = function(imageInfo, callback) {
	if(isValid(imageInfo) && isValid(callback))
		multimediaD.rotateImage(JSON.stringify(imageInfo), GetFunctionName(callback));
};

Multimedia.prototype.saveImage = function(path, successCallback, errorCallback) {
	if(isValid(successCallback)) {
		notSupported("Multimedia.saveImage");
	
		successCallback();
	}
};

Multimedia.prototype.takePicture = function(successCallback, errorCallback) {
	if(isValid(successCallback) && isValid(errorCallback))
		multimediaD.takePicture(GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

var multimedia = new Multimedia();

function NativeUI() {}

NativeUI.prototype.dismissProgressBarDialog = function() {
	nativeUID.dismissProgressDialog();
};

NativeUI.prototype.dismissProgressDialog = function() {
	nativeUID.dismissProgressDialog();
};

NativeUI.prototype.dismissSoftKeyboard = function(callback) {
	if(isValid(callback))
		nativeUID.dismissSoftKeyboard(GetFunctionName(callback));
	else
		nativeUID.dismissSoftKeyboard(null);
};

NativeUI.prototype.isKeyboardShowing = function(callback) {
	if(isValid(callback))
		callback(true);
};

NativeUI.prototype.setProgress = function(progress) {
	if(isValid(progress)) {
		if(progress >= 0 && progress <= 100)
			nativeUID.setProgress(progress);
	}
};

NativeUI.prototype.setOptionMenu = function(menuItems) {
	if(isValid(menuItems))
		nativeUID.setOptionMenu(JSON.stringify(menuItems));
};

NativeUI.prototype.showContextMenu = function(menuItems, option) {
	if(isValid(menuItems)) {
		if(isValid(option))
			nativeUID.showContextMenu(JSON.stringify(menuItems), JSON.stringify(option));
		else
			nativeUID.showContextMenu(JSON.stringify(menuItems), null);
	}
};

NativeUI.prototype.showDatePicker = function(callback, option) {
	if(isValid(callback))
		nativeUID.showDatePicker(GetFunctionName(callback));
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
		
		nativeUID.showDatePickerWithData(JSON.stringify(date), GetFunctionName(callback));
	}
};

NativeUI.prototype.showMultiSelect = function(selection) {
	if(isValid(selection))
		nativeUID.showMultiSelect(JSON.stringify(selection));
};

NativeUI.prototype.showProgressBarDialog = function(option) {
	if(isValid(option))
		nativeUID.showProgressBarDialog(JSON.stringify(option));
	else
		nativeUID.showProgressBarDialog("");
};

NativeUI.prototype.showProgressDialog = function(option) {
	if(isValid(option))
		nativeUID.showProgressDialog(option.message, option.cancelable, option.cancelCallback);
	else
		nativeUID.showProgressDialog(null, true, "");
};

NativeUI.prototype.showSingleSelect = function(selection) {
	if(isValid(selection))
		nativeUID.showSingleSelect(JSON.stringify(selection));
};

NativeUI.prototype.showTimePicker = function(callback, option) {
	if(isValid(callback)) {
		if(isValid(option))
			nativeUID.showTimePicker(GetFunctionName(callback), JSON.stringify(option));
		else
			nativeUID.showTimePicker(GetFunctionName(callback), null);
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
			nativeUID.showTimePickerWithData(JSON.stringify(time), GetFunctionName(callback), JSON.stringify(option));
		else
			nativeUID.showTimePickerWithData(JSON.stringify(time), GetFunctionName(callback), null);
	}
};

var nativeUI = new NativeUI();

function Phone() {}

Phone.prototype.call = function(number) {
	if(isValid(number))
		phoneD.call(number);
};

Phone.prototype.sendEmail = function(mail) {
	if(isValid(mail))
		phoneD.sendEmail(JSON.stringify(mail));
};

Phone.prototype.sendSMS = function(sms) {
	if(isValid(sms))
		phoneD.sendSMS(JSON.stringify(sms));
};

var phone = new Phone();

function Preference() {}

Preference.prototype.contains = function(key) {
	if(isValid(key))
		return preferenceD.contains(key);
};

Preference.prototype.get = function(key) {
	if(isValid(key))
		return preferenceD.get(key);
	else
		return undefined;
};

Preference.prototype.put = function(key, value) {
	if(isValid(key) && isValid(value))
		preferenceD.put(key, value);
};

Preference.prototype.remove = function(key) {
	if(isValid(key))
		preferenceD.remove(key);
};

Preference.prototype.removeAll = function() {
	preferenceD.removeAll();
};

var preference = new Preference();

function PushNotification() {}

PushNotification.prototype.deleteAllUnreadNotifications = function() {
	pushNotificationD.deleteAllUnreadNotifications();
};

PushNotification.prototype.deleteUnreadNotification = function(index) {
	if(isValid(index))
		pushNotificationD.deleteUnreadNotification(index);
};

PushNotification.prototype.getRegistrationId = function(callback) {
	if(isValid(callback))
		pushNotificationD.getRegistrationId(GetFunctionName(callback));
};

PushNotification.prototype.getUnreadNotifications = function(callback) {
	if(isValid(callback))
		pushNotificationD.getUnreadNotifications(GetFunctionName(callback));
};

PushNotification.prototype.register = function(senderId) {
	if(isValid(senderId))
		pushNotificationD.register(senderId);
};

PushNotification.prototype.unregister = function() {
	pushNotificationD.unregister();
};

PushNotification.prototype.useImmediateForegroundNotification = function(use) {
	if(isValid(use))
		pushNotificationD.useImmediateForegroundNotification(use);
};


var pushNotification = new PushNotification();

function Resource() {}

Resource.prototype.cancelGetContent = function() {
	notSupported("Resource.cancelGetContent");
};

Resource.prototype.getContent = function(pageId, callback) {
	if(isValid(pageId) && isValid(callback))
		resourceD.getContent(pageId, callback);
};

Resource.prototype.getPageUri = function(pageId, callback) {
	if(isValid(pageId) && isValid(callback))
		resourceD.getPageUri(pageId, callback);
};

var resource = new Resource();

function Timer() {}

Timer.prototype.initializeTimer = function() {
	notSupported("Timer.initializeTimer");
};

Timer.prototype.setOffTimer = function() {
	notSupported("Timer.setOffTimer");
};

Timer.prototype.setOnTimer = function() {
	notSupported("Timer.setOnTimer");
};

var timer = new Timer();