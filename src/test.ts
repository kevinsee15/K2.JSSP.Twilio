

function run(url: string, data: string, requestType: string, cb) {
    var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4)
                return;
            if (xhr.status == 201) {
                //console.log("ExecuteRequest XHR status: " + xhr.status + "," + xhr.responseText);
                var obj = JSON.parse(xhr.responseText);
                if (typeof cb === 'function')
                    cb(obj);
            }
            else if (xhr.status == 204) {
                if (typeof cb === 'function')
                    cb(xhr.responseText);
            }
            else if (xhr.status == 200) {
                var obj = JSON.parse(xhr.responseText);
                //console.log("ExecuteRequest XHR status: " + xhr.status + "," + xhr.responseText);
                //console.log("ExecuteRequest cb type of: " + (typeof cb).toString());
                if (typeof cb === 'function')
                    cb(obj);
            }
            else if (xhr.status == 202) {
                if (typeof cb === 'function')
                    cb(null);
            }
            else if (xhr.status == 400) {
                // This is a bad request, return error to UI
                var obj = JSON.parse(xhr.responseText);
                throw new Error(obj.error.code + ": " + obj.error.message);
            }
            else if (xhr.status == 404) {
                var obj = JSON.parse(xhr.responseText);
                 // This is to supress an error that happens with team archive/unarchive
                var errorMessage = obj.error.message;            
                if (errorMessage.startswith == "No Team found with Group id") {
                    // do nothing - supress error
                }
                else {
                    throw new Error(obj.error.code + ": " + obj.error.message);
                }
                //console.log("MSTeamsConnector ExecuteRequest: Failed with 404 error.");
                //throw new Error(obj.error.code + " error: " + obj.error.message);
                //console.log("Failed with status " + xhr.status + " " + xhr.responseText);
            }
            else {
                
                var obj = JSON.parse(xhr.responseText);
                throw new Error(obj.error.code + ": " + obj.error.message);
            }
        };
        
        xhr.open(requestType.toUpperCase(), url);
        xhr.withCredentials = false;
        xhr.setRequestHeader("Accept", "application/json");
        if (requestType.toUpperCase() == "PUT" || requestType.toUpperCase() == "POST" || requestType.toUpperCase() == "PATCH") {
            xhr.setRequestHeader("Content-Type", "application/json");
        }
        xhr.send(data);
}

var data = JSON.stringify({
    "to": "+6598685580",
    "from": "",
    "body": "Hello World from Node.js!"
});

run("https://api.twilio.com/2010-04-01/Accounts/ACf9222edb22d1a89b604f81c77c64ffb1/Messages.json", data, "POST", function(responseObj) {
    console.log(responseObj);
});