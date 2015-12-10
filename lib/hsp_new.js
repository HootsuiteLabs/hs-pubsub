var hsp = {};
(function () {
    function HSAPI() {
        var BASE_URL = 'https://hootsuite.com';
        var JSONJS_URL = 'https://d2l6uygi1pgnys.cloudfront.net/jsapi/json2.js';
        var STYLE_URL = 'https://d2l6uygi1pgnys.cloudfront.net/jsapi/2-0/assets/css/ad_default.css';
        var eventBindings = ['initapp', 'gettwitteraccounts', 'refresh', 'dropuser', 'sendtoapp', 'sendcommenttoapp', 'sendprofiletoapp', 'closepopup', 'sendcomposedmsgtoapp', 'sendassignmentupdates', 'getauth', 'getmemberinfo', 'savedata', 'getdata', 'pubsub', 'savemessagetoapp', 'echo'];
        var self = this;

        var fnRequireJsonLib = function (callback) {
            if (!callback) {
                callback = function () {};
            }

            var timeout = null;
            if (typeof JSON === 'undefined') {
                // include json2.js
                var jsonjs = document.createElement('script');
                jsonjs.type = 'text/javascript';
                jsonjs.async = true;
                jsonjs.src = JSONJS_URL;
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(jsonjs, s);

                // check to see when we can call our callback
                var fnCheck = function () {
                    if (typeof JSON !== 'undefined') {
                        callback();
                        timeout = null;
                    } else {
                        timeout = setTimeout(fnCheck, 100);
                    }
                };
                timeout = setTimeout(fnCheck, 100);
            } else {
                callback();
            }
        };

        this.messageSender = function (msg) {
            msg.url = window.location.href;
            msg.windowName = window.name;
            var dashboard = window.parent;
            fnRequireJsonLib(function () {
                var msgString = JSON.stringify(msg);
                dashboard.postMessage(msgString, BASE_URL);
            });
        };

        this.messageListener = function (event) {
            if (event.origin === BASE_URL) {
                var msgString = event.data;

                fnRequireJsonLib(function () {
                    var msgObj = JSON.parse(msgString);

                    //Dispatch event
                    var event = msgObj.event;
                    var params = msgObj.params;
                    var functionToRun = 'bind' + event;
                    if (eventBindings.indexOf(event) >= 0) {
                        var fn = self[functionToRun];
                        if (typeof fn !== 'undefined') {
                            fn.apply(null, params);
                        }
                    }
                });
            }
        };

        //API calls
        this.init = function (params) {

            if (window.addEventListener) {
                window.addEventListener("message", hsp.messageListener, false);
            } else {
                window.attachEvent('onmessage', hsp.messageListener);
            }

            if (params) {

                if (params.callBack) {
                    self.bind('initapp', params.callBack);
                }

                if (params.useTheme && params.useTheme !== 'false' && params.useTheme !== '0') {
                    applyTheme(params);
                }
            }

            var msg = {
                action: 'initApp',
                sendToAppDisableList: params.sendToAppDisableList,
                sendProfileToAppDisableList: params.sendProfileToAppDisableList
            };

            hsp.messageSender(msg);

            return self;
        };


        //API functions
        this.trigger = function (action, params) {
            fnMakeCall('trigger', action, params);
        };


        this.composeMessage = function (message, params) {
            var shortenLinks, scheduleTimestamp, twitterReplyToId;
            if (typeof params == 'undefined') {
                params = {};
            }
            fnMakeCall('compose', message, params);
            return self;
        };

        this.attachFileToMessage = function (file) {
            fnMakeCall('attachfiletomessage', file);
            return self;
        };

        this.retweet = function (id, screenName) {
            fnMakeCall('retweet', id, screenName);
            return self;
        };

        this.showUser = function (twitterHandle) {
            twitterHandle = twitterHandle.replace('@', '');
            fnMakeCall('userinfo', twitterHandle);
            return self;
        };
        this.quickSearch = function (query) {
            fnMakeCall('quicksearch', query);
            return self;
        };
        this.showTrends = function () {
            fnMakeCall('trends');
            return self;
        };
        this.showStatusMessage = function (message, type) {
            fnMakeCall('statusmsg', message, type, null, 'status');
            return self;
        };
        this.clearStatusMessage = function () {
            fnMakeCall('statusmsgclear', null, null, null, 'status');
            return self;
        };
        this.showFollowDialog = function (twitterHandle, isFollow) {
            fnMakeCall('showfollowdialog', twitterHandle, isFollow);
            return self;
        };
        this.customUserInfo = function (data) {
            fnRequireJsonLib(function () {
                var dataStr = JSON.stringify(data);
                fnMakeCall('customuserinfo', dataStr);
            });
            return self;
        };
        this.showImagePreview = function (src, externalUrl) {
            fnMakeCall('showimagepreview', src, externalUrl);
            return self;
        };

        this.startAppTokenAuth = function () {
            fnMakeCall('startapptokenauth');
        };

        this.editAppAuth = function () {
            fnMakeCall('editappauth');
        };

        this.reloadApp = function (str) {
            fnMakeCall('reloadapp');
        };

        this.updatePlacementSubtitle = function (str) {
            fnMakeCall('updateplacementsubtitle', str, null, null, 'bg');
        };


        this.saveData = function (data, callback) {
            if (typeof callback != 'undefined') {
                self.bindsavedata = function (data) {
                    callback(data);
                };
            }
            fnMakeCall('savedata', data);
        };

        this.publish = function (data) {
            fnMakeCall('publish', data);
        };

        this.getData = function (callback) {
            if (typeof callback != 'undefined') {
                self.bindgetdata = function (data) {
                    callback(data);
                };
            }
            fnMakeCall('getdata');
        };

        this.assignItem = function (data) {
            fnRequireJsonLib(function () {
                var dataStr = JSON.stringify(data);
                dataStr && fnMakeCall('assignItem', dataStr);
            });
            return self;
        };
        this.resolveItem = function (data) {
            fnRequireJsonLib(function () {
                var dataStr = JSON.stringify(data);
                dataStr && fnMakeCall('resolveItem', dataStr);
            });
            return self;
        };

        this.showCustomPopup = function (url, title, w, h) {
            var parameterEnum = {
                url: url,
                title: title,
                w: w,
                h: h
            };

            fnRequireJsonLib(function () {
                var parameterEnumString = JSON.stringify(parameterEnum);
                fnMakeCall('showCustomPopup', parameterEnumString);
            });
        };

        this.closeCustomPopupFn = function () {
            fnMakeCall('closeCustomPopup');
        };

        this.closeCustomPopup = function (apiKey, pid) {
            parent.frames[apiKey + '_' + pid].hsp.closeCustomPopupFn();
        };

        this.getTwitterAccounts = function (callback) {

            self.bindgettwitteraccounts = function (accounts) {
                callback(accounts);
            };
            fnMakeCall('gettwitteraccounts', null, null, null, 'bg');
        };

        this.getAuth = function (callback) {
            self.bindgetauth = function (accounts) {
                callback(accounts);
            };
            fnMakeCall('getAuth');
        };

        this.getMemberInfo = function (callback) {
            self.bindgetmemberinfo = function (memberInfo) {
                callback(memberInfo);
            };
            fnMakeCall('getmemberinfo');
        };


        this.bind = function (eventName, fn) {

            if (eventName && fn && typeof fn !== 'undefined' && eventBindings.indexOf(eventName) >= 0) {
                var strEventName = eventName.toLowerCase();
                self['bind' + strEventName] = fn;
            }


            var msg = {
                action: 'bind',
                event: eventName
            };

            hsp.messageSender(msg);
            return self;
        };


        // SDK 0.6 to SDK 1.0 adapter
        var fnMakeCall = function (action, p1, p2, forceNewIframe, q) {
            //messageSender
            var msg = {
                action: action,
                p1: p1,
                p2: p2
            };

            hsp.messageSender(msg);
        };

        //CSS functions
        var applyTheme = function (params) {
            // prepare theme loaded check
            var timeout = null;
            var div = null;
            var maxTries = 10;
            var counter = 0;
            var fnOnThemeLoad = params.onThemeLoad ? params.onThemeLoad : function () {
            };
            var fnGetStyle = function (el, styleProp) {
                // code from a 4 year old Quirksmode article: http://www.quirksmode.org/dom/getstyles.html
                var x = document.getElementById(el);
                var y;

                if (x.currentStyle) {
                    y = x.currentStyle[styleProp];
                } else if (window.getComputedStyle) {
                    y = document.defaultView.getComputedStyle(x, null).getPropertyValue(styleProp);
                }

                return y;
            };

            var fnDone = function () {
                fnOnThemeLoad();
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                if (div) {
                    document.body.removeChild(div);
                    div = null;
                }
            };
            var fnCheck = function () {
                counter++;
                if (fnGetStyle(elId, 'position') == 'fixed' || counter >= maxTries) {
                    fnDone();
                } else {
                    timeout = setTimeout(fnCheck, 100);
                }
            };

            // create theme css
            var style = document.createElement('link');
            style.type = 'text/css';
            style.rel = 'stylesheet';
            style.href = STYLE_URL;
            style.onload = function () {        // only IE supports this, which is good cause checking style doesn't work
                fnDone();
            };
            var domHead = document.getElementsByTagName('head');
            if (domHead.length) {
                domHead[0].appendChild(style);
            }

            // handle theme loaded check
            if (params.onThemeLoad) {
                // check for theme loaded, works in all but IE
                // looking for: div#hsLoadCheck { position: fixed; }
                var elId = 'hsLoadCheck';

                div = document.createElement('div');
                div.id = elId;
                div.style.cssText = 'display:none;';
                document.body.appendChild(div);

                // check to see when we can call our callback
                timeout = setTimeout(fnCheck, 100);
            }
        };
    }

    hsp = new HSAPI();
})();
