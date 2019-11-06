export let utils = {
    generateId: function (prefix, suffix){
        return prefix.toString() + "=" + suffix.toString();
    },

    getApiKey: function () {
        var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                console.log(xhr.response);
                return xhr.response
            }
        };
        xhr.open('GET', '/api_key', true);
        xhr.withCredentials = true;
        xhr.send(null);

    }

};