public without sharing class CB_LoggerUI_Ctrl {

    @AuraEnabled
    public static List<SObject> getLoggerData(String look4Type, String look4Date, String bigObjectType,Integer queryAmount){
        Integer limitOfRecords = queryAmount;
        string logQuery = '';
        Date myfixedDate;
        Datetime myfixedDateAndStartTime;
        Datetime myfixedDateAndEndTime;
        List<String> splittedlook4Date;
        Date myfixedDateNoTime;
        List<SObject> lgs = new List<SObject>();
        if(!String.isBlank(look4Type) && !String.isBlank(look4Date)){
            if(look4Date.split(' ').size() == 1){
                myfixedDate = Date.ValueOf(look4Date);
                logQuery = 'SELECT id,Date__c,Type__c,Message__c,Subject__c, User__r.Name FROM '+bigObjectType+'  WHERE Type__c =: look4Type AND Date__c >: myfixedDate AND Date__c <: myfixedDate.addDays(1) LIMIT : limitOfRecords';
            }else if(look4Date.split(' ').size() == 2) {
                splittedlook4Date = look4Date.split(' ');
                myfixedDateAndStartTime = DateTime.newInstance(Date.valueOf(splittedlook4Date[0]).year(), Date.valueOf(splittedlook4Date[0]).month(), Date.valueOf(splittedlook4Date[0]).day(), Integer.valueOf(splittedlook4Date[1].split(':')[0])-2, Integer.valueOf(splittedlook4Date[1].split(':')[1]), 0);
                myfixedDateNoTime = Date.ValueOf(splittedlook4Date[0]);
                logQuery = 'SELECT id,Date__c,Type__c,Message__c,Subject__c, User__r.Name FROM '+bigObjectType+'  WHERE Type__c =: look4Type AND Date__c >: myfixedDateAndStartTime AND Date__c <: myfixedDateNoTime.addDays(1) LIMIT : limitOfRecords';
            }else{
                splittedlook4Date = look4Date.split(' ');
                if(!String.isBlank(splittedlook4Date[1])){
                     myfixedDateAndStartTime = DateTime.newInstance(Date.valueOf(splittedlook4Date[0]).year(), Date.valueOf(splittedlook4Date[0]).month(), Date.valueOf(splittedlook4Date[0]).day(), Integer.valueOf(splittedlook4Date[1].split(':')[0])-2, Integer.valueOf(splittedlook4Date[1].split(':')[1]), 0);
                }else{
                     myfixedDateAndStartTime = DateTime.newInstance(Date.valueOf(splittedlook4Date[0]).year(), Date.valueOf(splittedlook4Date[0]).month(), Date.valueOf(splittedlook4Date[0]).day(), 0, 0, 0);
                }
                myfixedDateAndEndTime = DateTime.newInstance(Date.valueOf(splittedlook4Date[0]).year(), Date.valueOf(splittedlook4Date[0]).month(), Date.valueOf(splittedlook4Date[0]).day(), Integer.valueOf(splittedlook4Date[2].split(':')[0])-2, Integer.valueOf(splittedlook4Date[2].split(':')[1]), 0);
                logQuery = 'SELECT id,Date__c,Type__c,Message__c,Subject__c, User__r.Name FROM '+bigObjectType+'  WHERE Type__c =: look4Type AND Date__c >: myfixedDateAndStartTime AND Date__c <: myfixedDateAndEndTime LIMIT : limitOfRecords';
            }
        }else if(!String.isBlank(look4Type) ){
            logQuery = 'SELECT id,Date__c,Type__c,Message__c,Subject__c, User__r.Name FROM '+bigObjectType+' WHERE Type__c =: look4Type LIMIT : limitOfRecords';
        }else{
            return lgs = getTodayData(bigObjectType,limitOfRecords);
        }
        lgs = Database.query(logQuery);

        return lgs;
    }

    public static List<SObject> getTodayData(String bigObjectType,Integer queryAmount){
        Integer limitOfRecords = queryAmount;
        Date mydate = Date.today();
        List<SObject> daylogs = new List<SObject>();
        for (String type : getTypes()) {
            string myquery = 'SELECT id,Date__c,Type__c,Message__c,Subject__c, User__r.Name FROM '+bigObjectType+'  WHERE Type__c =:type AND Date__c >=: mydate LIMIT : limitOfRecords';
            List<SObject> typelogs = Database.query(myquery);
            if(!typelogs.isEmpty()) {
                daylogs.addAll(typelogs);
            }
        }
        return daylogs;
    }

    @AuraEnabled
    public static List<String> getTypes(){
        List<String> typeNames = new List<String>();
        for(LogType l : LogType.values()){
            typeNames.add(l.Name());
        }
        return typeNames;
    }

    @AuraEnabled
    public static CB_Logger_Settings__mdt getLoggerMetadata(){
        return [SELECT Live_is_Active__c,Number_Of_Records_Per_Type__c FROM CB_Logger_Settings__mdt WHERE DeveloperName=:'Settings'];
    }

    @AuraEnabled
    public static Boolean SendEmail(String subject, String body,String email){
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new List<String>{email});
        mail.setSubject(subject);
        mail.setHtmlBody(body);
        mail.setPlainTextBody(body);
        return send(mail).isSuccess();
    } 

    public static Messaging.SendEmailResult send(Messaging.SingleEmailMessage email){
        return Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{email}).get(0);
    }
}