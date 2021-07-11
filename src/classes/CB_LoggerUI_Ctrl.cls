public without sharing class CB_LoggerUI_Ctrl {

    @AuraEnabled
    public static List<CB_LoggerBO__b> getLoggerData(String look4Type, String look4Date){
        List<CB_LoggerBO__b> lgs = new List<CB_LoggerBO__b>();
        if(!String.isBlank(look4Type) && !String.isBlank(look4Date)){
            if(look4Date.split(' ').size() == 1){
                Date myfixedDate = Date.ValueOf(look4Date);
                lgs = [SELECT id,Date__c,Type__c,Message__c,Subject__c, User__r.Name FROM CB_LoggerBO__b  WHERE Type__c =: look4Type AND Date__c >: myfixedDate AND Date__c <: myfixedDate.addDays(1) LIMIT : Integer.valueOf(Label.Logger_Query_Amount)];
            }else if(look4Date.split(' ').size() == 2) {
                List<String> splittedlook4Date = look4Date.split(' ');
                Datetime myfixedDateAndStartTime = DateTime.newInstance(Date.valueOf(splittedlook4Date[0]).year(), Date.valueOf(splittedlook4Date[0]).month(), Date.valueOf(splittedlook4Date[0]).day(), Integer.valueOf(splittedlook4Date[1].split(':')[0])-2, Integer.valueOf(splittedlook4Date[1].split(':')[1]), 0);
                Date myfixedDateNoTime = Date.ValueOf(splittedlook4Date[0]);
                lgs = [SELECT id,Date__c,Type__c,Message__c,Subject__c, User__r.Name FROM CB_LoggerBO__b  WHERE Type__c =: look4Type AND Date__c >: myfixedDateAndStartTime AND Date__c <: myfixedDateNoTime.addDays(1) LIMIT : Integer.valueOf(Label.Logger_Query_Amount)];
            }else{
                List<String> splittedlook4Date = look4Date.split(' ');
                Datetime myfixedDateAndStartTime;
                if(!String.isBlank(splittedlook4Date[1])){
                     myfixedDateAndStartTime = DateTime.newInstance(Date.valueOf(splittedlook4Date[0]).year(), Date.valueOf(splittedlook4Date[0]).month(), Date.valueOf(splittedlook4Date[0]).day(), Integer.valueOf(splittedlook4Date[1].split(':')[0])-2, Integer.valueOf(splittedlook4Date[1].split(':')[1]), 0);
                }else{
                     myfixedDateAndStartTime = DateTime.newInstance(Date.valueOf(splittedlook4Date[0]).year(), Date.valueOf(splittedlook4Date[0]).month(), Date.valueOf(splittedlook4Date[0]).day(), 0, 0, 0);
                }
                Datetime myfixedDateAndEndTime = DateTime.newInstance(Date.valueOf(splittedlook4Date[0]).year(), Date.valueOf(splittedlook4Date[0]).month(), Date.valueOf(splittedlook4Date[0]).day(), Integer.valueOf(splittedlook4Date[2].split(':')[0])-2, Integer.valueOf(splittedlook4Date[2].split(':')[1]), 0);
                lgs = [SELECT id,Date__c,Type__c,Message__c,Subject__c, User__r.Name FROM CB_LoggerBO__b  WHERE Type__c =: look4Type AND Date__c >: myfixedDateAndStartTime AND Date__c <: myfixedDateAndEndTime LIMIT : Integer.valueOf(Label.Logger_Query_Amount)];
            }
          
        }else if(!String.isBlank(look4Type) ){
            lgs = [SELECT id,Date__c,Type__c,Message__c,Subject__c, User__r.Name FROM CB_LoggerBO__b WHERE Type__c =: look4Type LIMIT : Integer.valueOf(Label.Logger_Query_Amount)];
        }else{
            lgs = getTodayData();
        }
        return lgs;
    }

    public static List<CB_LoggerBO__b> getTodayData(){
        Date mydate = Date.today();
        List<CB_LoggerBO__b> daylogs = new List<CB_LoggerBO__b>();
        for (String type : getTypes()) {
            List<CB_LoggerBO__b> typelogs = [SELECT id,Date__c,Type__c,Message__c,Subject__c, User__r.Name FROM CB_LoggerBO__b  WHERE Type__c =:type AND Date__c >=: mydate LIMIT : Integer.valueOf(Label.Logger_Query_Amount)];
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