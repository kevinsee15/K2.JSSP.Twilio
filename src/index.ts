import '@k2oss/k2-broker-core';

const SMSObjectName = "SMS";
const SMSDisplayName = "SMS";
const SMSDescription = "A JSSP based Twilio connector for K2 Nexus.";

const SMSMethodSendSMS = "sendSMS";

const SMSPropertyTo = "to";
const SMSPropertyFrom = "from";
const SMSPropertyBody = "body";
const SMSPropertyMediaUrl = "mediaUrl";
const SMSPropertyStatus = "status";

let _smsAccountId: string;
let _smsDefaultFrom: string;

metadata = {
    systemName: "twilio.javascriptbroker.k2nexus",
    displayName: "Twilio Javascript Broker",
    description: "A JSSP based Twilio connector for K2 Nexus.",
    configuration: {
        "Account ID": {
            "displayName": "Account Id",
            "type": "string",
            "required": true
        },
        "Default From": {
            "displayName": "Default 'From' Phone Number",
            "type": "string"
        }
    }
};

ondescribe = async function({configuration}): Promise<void> {
    postSchema({
        objects: {
            [SMSObjectName]: {
                displayName: SMSDisplayName,
                description: SMSDescription,
                properties: {
                    [SMSPropertyTo]: {
                        displayName: "To",
                        type: "string"
                    },
                    [SMSPropertyFrom]: {
                        displayName: "From",
                        type: "string"
                    },
                    [SMSPropertyBody]: {
                        displayName: "Body",
                        type: "string"
                    },
                    [SMSPropertyMediaUrl]: {
                        displayName: "Media URL",
                        type: "string"
                    },
                    [SMSPropertyStatus]: {
                        displayName: "Status",
                        type: "string"
                    }
                },
                methods: {
                    [SMSMethodSendSMS]: {
                        displayName: "Send SMS",
                        type: "execute",
                        inputs: [SMSPropertyTo, SMSPropertyFrom, SMSPropertyBody, SMSPropertyMediaUrl],
                        requiredInputs: [SMSPropertyTo, SMSPropertyBody],
                        outputs: [SMSPropertyStatus]
                    }
                }
            }
        }
    });
}

onexecute = async function({objectName, methodName, parameters, properties, configuration, schema}): Promise<void> {
    _smsAccountId = <string>configuration["Account ID"];
    _smsDefaultFrom = <string>configuration["Default From"];

    switch (objectName)
    {
        case SMSObjectName: 
            await onExecuteSMS(methodName, properties); 
            break;
        default: 
            throw new Error("The object " + objectName + " is not supported.");
    }
}
async function onExecuteSMS(methodName: string, properties: SingleRecord): Promise<void> {
    switch (methodName)
    {
        case SMSMethodSendSMS:
            await onExecuteSMSSendSMS(properties);
            break;
    }
}

async function onExecuteSMSSendSMS(properties: SingleRecord): Promise<void> {
    return new Promise<void>((resolve, reject) =>
    {
        let useFromNumber:string = _getFromNumber(properties);
        
        var data : {[key: string]: string} = {
            "To": <string> properties[SMSPropertyTo],
            "From": useFromNumber,
            "Body": <string> properties[SMSPropertyBody]
        };

        let url = "https://api.twilio.com/2010-04-01/Accounts/" + _smsAccountId + "/Messages.json";
        
        _executeXHRRequest(url, data, "POST", function(responseObj) {
            postResult({
                [SMSPropertyStatus]: responseObj["status"]
            });
            resolve();
        });
    });
}

function _executeXHRRequest(url: string, data: {[key: string]: string}, requestType: string, cb) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4)
            return;
        if (xhr.status == 201 || xhr.status == 200) {
            var obj = JSON.parse(xhr.responseText);
            if (typeof cb === 'function')
                cb(obj);
        }
        else if (xhr.status == 400 || xhr.status == 404) {
            var obj = JSON.parse(xhr.responseText);
            throw new Error(obj.code + ": " + obj.message + ". Data: " + data);
        }
        else {
            postResult({
            });
            var obj = JSON.parse(xhr.responseText);
            throw new Error(obj.code + ": " + obj.message + ". Data: " + data);
        }
    };
    
    var body = _encodeQueryData(data);

    xhr.open(requestType.toUpperCase(), url);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.send(body);
}

/* Helpers */
function _encodeQueryData(data: {[key: string]: string}) {
    const ret = [];
    for(let key in data){
        let value = data[key];
        ret.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
    return ret.join('&');
}

function _getFromNumber(properties: SingleRecord): string {
    if(!properties[SMSPropertyFrom] && !_smsDefaultFrom) {
        throw new Error("Missing 'From' contact number. Specify as a SmartObject property or Service Intance key.");
    }

    if(properties[SMSPropertyFrom]) {
        return <string>properties[SMSPropertyFrom];
    } else {
        return _smsDefaultFrom;
    }
}
