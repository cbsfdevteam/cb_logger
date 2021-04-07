public without sharing class CB_LoggerUI_Ctrl {

    @AuraEnabled
    public static List<CB_LoggerBO__b> getLoggerData(String look4Type, String look4Date){
        List<CB_LoggerBO__b> lgs = new List<CB_LoggerBO__b>();
        if(look4Type != null && look4Type != '' && look4Date != null &&  look4Date != ''){
            Date myfixedDate = Date.ValueOf(look4Date);
            lgs = [SELECT id,Date__c,Type__c,Message__c,Subject__c, User__r.Name FROM CB_LoggerBO__b  WHERE Type__c =: look4Type AND Date__c >: myfixedDate AND Date__c <: myfixedDate.addDays(1) LIMIT 500];
        }else if(look4Type != null && look4Type != ''){
            lgs = [SELECT id,Date__c,Type__c,Message__c,Subject__c, User__r.Name FROM CB_LoggerBO__b WHERE Type__c =: look4Type LIMIT 500];
        }else{
            lgs = getTodayData();
        }
        return lgs;
    }

    public static List<CB_LoggerBO__b> getTodayData(){
        Date mydate = Date.today();
        List<CB_LoggerBO__b> daylogs = new List<CB_LoggerBO__b>();
        for (String type : getTypes()) {
            List<CB_LoggerBO__b> typelogs = [SELECT id,Date__c,Type__c,Message__c,Subject__c, User__r.Name FROM CB_LoggerBO__b  WHERE Type__c =:type AND Date__c >=: mydate LIMIT 500];
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
    public static void clearBigObjByType(String type){
        List<CB_LoggerBO__b > cBO = new List<CB_LoggerBO__b >();
        cBO.addAll([SELECT Count__c,Date__c,Type__c FROM CB_LoggerBO__b WHERE Type__c = : type]);
        Database.deleteImmediate(cBO);
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