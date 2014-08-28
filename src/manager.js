/*
 * Browser info manager module: webiste info persistence
 */
(function($, Cookies, WhatBrowser, Parse) {
    'use strict';

    Parse.initialize("WxMn71WOwf2RM6s6vYR57Th1rsfRplumcDDaWQxF", "aomlkmdE6QrVTF0FRoX4XgyJFqR2FP2W4QtLJg7A");
    var WhatBrowserInfo = Parse.Object.extend("WhatBrowser");

    /**
     * Get browser info id from url hash or from cookies
     */
    function get_id() {
        function get_id_url() {
            var hash = window.location.hash;
            if (hash && hash.substr(0,2) === '#!') {
                return { value: hash.substr(2), own: false };
            }
            return null;
        }
        function get_id_cookies() {
            if (Cookies.enabled) {
                var id = Cookies.get('whatbrowser')
                if (id) {
                    return { value: id, own: true };
                }
            }
            return null;
        }
        return get_id_url() || get_id_cookies();
    }

    /**
     * Persist new browser info to DB.
     */
    function create() {
        var whatbrowser = new WhatBrowser(null, { geo: true }),
            info = new WhatBrowserInfo(),
            promise = $.Deferred();
        info.save(whatbrowser).then(
            function(info) {
                whatbrowser.id = info.id;
                whatbrowser.link = 'http://whatbrowser.ru/#!' + whatbrowser.id;
                // save id to cookies to load it later on page refresh
                if (Cookies.enabled) {
                    Cookies.set('whatbrowser', whatbrowser.id, { expires: 28800 });
                }
                promise.resolve(whatbrowser);
            },
            function(error) {
                promise.reject(whatbrowser, error);  
            }
        );
        return promise;
    }

    /**
     * Load browser info from DB.
     */
    function load(id) {
        var query = new Parse.Query(WhatBrowserInfo),
            promise = $.Deferred();
        query.get(id).then(
            function(info) {
                var whatbrowser = new WhatBrowser(info.attributes, { geo: true });
                whatbrowser.id = info.id;
                whatbrowser.link = 'http://whatbrowser.ru/#!' + whatbrowser.id;
                promise.resolve(whatbrowser);
            },
            function(error) {
                promise.reject(error);  
            }
        );
        return promise;
    }

    window.WhatBrowserManager = {
        get_id: get_id,
        create: create,
        load: load
    }
    return window.WhatBrowserManager;

})(window.jQuery, window.Cookies, window.WhatBrowser, window.Parse);