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

try {
	console.log("Android");
	deviceD.getOsName();
	var imported = document.createElement('script');
	var currentHtmlPath = location.pathname.replace("//", "/");
	imported.src = currentHtmlPath.substring(0, currentHtmlPath.indexOf("www") + 3) + "/alopex/script/alopex_controller_android.js";
	document.head.appendChild(imported);
} catch (e) {
	//Detect browser and write the corresponding name
	if (navigator.userAgent.search("MSIE") >= 0) {
		console.log("MS Internet Explorer");
	} else if (navigator.userAgent.search("Chrome") >= 0 || (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) ) {
		console.log("Google Chrome, Apple Safari");
		var imported = document.createElement('script');
		imported.src = location.pathname.substring(0, location.pathname.indexOf("www") + 3) + "/alopex/script/alopex_controller_web.js";
		document.head.appendChild(imported);
	} else if (navigator.userAgent.search("Firefox") >= 0) {
		console.log("Mozilla Firefox");
	} else if (navigator.userAgent.search("Opera") >= 0) {
		console.log("Opera");
	} else {
		console.log("iOS");
		(function() {
			var timer = setInterval(function() {
				if (DeviceInfo.osName != null) {
					clearInterval(timer); // stop looking

					if (DeviceInfo.osName == "iOS") {
						var imported = document.createElement('script');
						imported.src = location.pathname.substring(0, location.pathname.indexOf("www") + 3) + "/alopex/script/alopex_controller_ios.js";
						document.head.appendChild(imported);
					}
				}
			}, 1);
		})();
	}
}
