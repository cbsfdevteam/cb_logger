let subjectArray = [];
let userArray = [];

function sortBy(field, reverse, primer) {
    const key = primer ?
        function (x) {
            return primer(x[field]);
        } :
        function (x) {
            return x[field];
        };

    return function (a, b) {
        a = key(a);
        b = key(b);
        return reverse * ((a > b) - (b > a));
    };
}

export function sortTableBy(res,sortedBy){
    const cloneData = [...res];
    cloneData.sort(sortBy(sortedBy, -1));
    return cloneData;
}

export function getSubjectArray(){
    let copyOfsubjectArray = subjectArray;
    subjectArray = [];
    return copyOfsubjectArray;
}

export function getUserArray(){
    let copyOfuserArrayArray = userArray;
    userArray = [];
    return copyOfuserArrayArray;
}

export function buildRow(row){
    let rowData = {};
    rowData.Type__c = row.Type__c;
    rowData.Subject__c = row.Subject__c;
    addSubject2List(rowData.Subject__c);
    rowData.Message__c = row.Message__c;
    rowData.Date__c = row.Date__c;
    rowData.CSSClass = GetTypeColor(row.Type__c);
    if (row.User__r != undefined) {
        let name = row.User__r.Name;
        let nameid = row.User__r.Id;
        if (name != undefined && nameid != undefined) {
            rowData.User__c = name + "/" + nameid;
        } else {
            rowData.User__c = "";
        }
    } else {
        rowData.User__c = "";
    }
    rowData.User__r = row.User__r;
    addUser2List(rowData.User__c);

    return rowData;
}

function addSubject2List(subject){
    
    const option = {
        label: subject,
        value: subject
    };
    if (subjectArray.filter(o => o.value === option.value).length === 0) {
        subjectArray.push(option);
    }
}

function addUser2List(user){
    
    const option = {
        label: user,
        value: user
    };
    if (userArray.filter(o => o.value === option.value).length === 0) {
        userArray.push(option);
    }
}

function GetTypeColor(type) {
    switch (type) {
        case 'LOG':
            return 'slds-icon-custom-custom9';

        case 'ERROR':
            return 'slds-icon-custom-custom100';

        case 'FAIL':
            return 'slds-icon-custom-custom102';

        case 'SUCCESS':
            return 'slds-icon-custom-custom79';

        case 'CALLOUT_FAIL':
            return 'slds-color__background_gray-7';

        case 'CALLOUT_SUCCESS':
            return 'slds-icon-custom-custom20';
    }
}