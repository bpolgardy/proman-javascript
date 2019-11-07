export let utils = {
    generateId: function (prefix, suffix) {
        return prefix.toString() + "=" + suffix.toString();
    },

    getApiKey: function () {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                console.log(xhr.response);
                sessionStorage.setItem("apiKey", xhr.response.toString());
            }
        };
        xhr.open('GET', '/api_key', true);
        xhr.withCredentials = true;
        xhr.send(null);

    },

    isIterable: function (obj) {
        if (obj == null) {
            return false;
        }
        return typeof obj[Symbol.iterator] === 'function';
    },

    addEventListenerTo: function (object, event, callback) {
        if (utils.isIterable(object)) {
            for (const element of object) {
                element.addEventListener(event, callback);
            }
            ;
        } else {
            object.addEventListener(event, callback);
        }
    },

    isEmpty: function (object) {
        for (const key in object) {
            if (object.hasOwnProperty(key))
                return false;
        }
        return true;
    }
};