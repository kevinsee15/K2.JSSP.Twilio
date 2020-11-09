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

ondescribe = async function ({ configuration }): Promise<void> {
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
                        parameters: {
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
                        },
                        requiredParameters: [SMSPropertyTo, SMSPropertyBody],
                        inputs: [SMSPropertyTo, SMSPropertyFrom, SMSPropertyBody, SMSPropertyMediaUrl],
                        requiredInputs: [SMSPropertyTo, SMSPropertyBody],
                        outputs: [SMSPropertyStatus]
                    }
                }
            }
        }
    });
}

onexecute = async function ({ objectName, methodName, parameters, properties, configuration, schema }): Promise<void> {
    _smsAccountId = <string>configuration["Account ID"];
    _smsDefaultFrom = <string>configuration["Default From"];

    switch (objectName) {
        case SMSObjectName:
            await onExecuteSMS(methodName, parameters, properties);
            break;
        default:
            throw new Error("The object " + objectName + " is not supported.");
    }
}
async function onExecuteSMS(methodName: string, parameters: SingleRecord, properties: SingleRecord): Promise<void> {
    switch (methodName) {
        case SMSMethodSendSMS:
            await onExecuteSMSSendSMS(parameters, properties);
            break;
    }
}

async function onExecuteSMSSendSMS(parameters: SingleRecord, properties: SingleRecord): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let toNumber: string = _getToNumber(parameters, properties);
        let fromNumber: string = _getFromNumber(parameters, properties);
        let body: string = _getBody(parameters, properties);

        var data: { [key: string]: string } = {
            "To": toNumber,
            "From": fromNumber,
            "Body": body
        };

        let url = "https://api.twilio.com/2010-04-01/Accounts/" + _smsAccountId + "/Messages.json";

        _executeXHRRequest(url, data, "POST", function (responseObj) {
            postResult({
                [SMSPropertyStatus]: responseObj["status"]
            });
            resolve();
        });
    });
}

function _executeXHRRequest(url: string, data: { [key: string]: string }, requestType: string, cb) {
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
function _encodeQueryData(data: { [key: string]: string }) {
    const ret = [];
    for (let key in data) {
        let value = data[key];
        ret.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
    return ret.join('&');
}

function _getFromNumber(parameters: SingleRecord, properties: SingleRecord): string {
    if (!properties[SMSPropertyFrom] && !parameters[SMSPropertyFrom] && !_smsDefaultFrom) {
        throw new Error("Missing 'From'. Specify as a method parameter, SmartObject property, or Service Intance key.");
    }

    if (parameters[SMSPropertyFrom]) {
        return <string>parameters[SMSPropertyFrom];
    } else if (properties[SMSPropertyFrom]) {
        return <string>properties[SMSPropertyFrom];
    } else {
        return _smsDefaultFrom;
    }
}

function _getToNumber(parameters: SingleRecord, properties: SingleRecord): string {
    if (!properties[SMSPropertyTo] && !parameters[SMSPropertyTo]) {
        throw new Error("Missing 'To'. Specify as a method parameter or SmartObject property.");
    }

    if (parameters[SMSPropertyTo]) {
        return <string>parameters[SMSPropertyTo];
    } else if (properties[SMSPropertyTo]) {
        return <string>properties[SMSPropertyTo];
    }

    throw new Error("Missing 'To'. Specify as a method parameter or SmartObject property.");
}

function _getBody(parameters: SingleRecord, properties: SingleRecord): string {
    if (!properties[SMSPropertyBody] && !parameters[SMSPropertyBody]) {
        throw new Error("Missing 'To'. Specify as a method parameter or SmartObject property.");
    }

    if (parameters[SMSPropertyBody]) {
        return <string>parameters[SMSPropertyBody];
    } else if (properties[SMSPropertyBody]) {
        return <string>properties[SMSPropertyBody];
    }

    throw new Error("Missing 'Body'. Specify as a method parameter or SmartObject property.");
}
