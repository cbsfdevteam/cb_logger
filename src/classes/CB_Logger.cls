public with sharing class CB_Logger {

    private static List<CB_LoggerPE__e> logEvents = new List<CB_LoggerPE__e>();
    private static Integer logCount = 0;

    public static void CleanLogList(){
        logEvents = new List<CB_LoggerPE__e>();
    } 

    public static void live(String Subject, Object Body){
        DateTime now = datetime.now();
        logEvents.add(new CB_LoggerPE__e(
            Type__c = 'LIVE',
            User__c = UserInfo.getUserId(), 
            Subject__c = Subject,
            Date__c = now,
            Message__c = String.valueOf(Body),
            Count__c = logCount++
        ));
        publish();
    }

    public static void success(String Subject, Object Body){
        log(LogType.SUCCESS, Subject,String.valueOf(Body));
    }

    public static void alert(String Subject, Object Body){
        log(LogType.ALERT, Subject,String.valueOf(Body));
    }

    public static void error(String Subject, Object Body){
        log(LogType.ERROR, Subject,String.valueOf(Body));
    }

    public static void log(String Subject, Object Body){
        log(LogType.LOG, Subject,String.valueOf(Body));
    }

    //wont be shown in the UI, no subject.
    public static void log(LogType type, String Body){
        log(type, null, Body);
    }

    @InvocableMethod(label='InvocableLog' description='Create logs from flow, this method will publish the platform event immediately. send type,subject and body in the same String value seperated by "~".')
    public static void InvocableLog(List<String> params){
        DateTime now = datetime.now();
        for (String stringlog : params) {
            List<String> splittedParams = stringlog.split('~');
            if(splittedParams.size() != 3){
                error('InvocableLog','Error when seperating the String parameter, please make sure you seperated the topic,subject and body with "~" correctly. <br/> Failed on String: '+stringlog);
            }else{
                logEvents.add(new CB_LoggerPE__e(
                    Type__c = splittedParams[0],
                    User__c = UserInfo.getUserId(), 
                    Subject__c = splittedParams[1],
                    Date__c = now,
                    Message__c = splittedParams[2],
                    Count__c = logCount++
                ));
            }
        }
        publish();
    }
    
    public static void log(LogType type, String subject, String Body){
        DateTime now = datetime.now();
        logEvents.add(new CB_LoggerPE__e(
            Type__c = type.Name(),
            User__c = UserInfo.getUserId(), 
            Subject__c = subject,
            Date__c = now,
            Message__c = Body,
            Count__c = logCount++
        ));
    }

    public static void publish(){
        publish(logEvents);
    }
    
    public static void publish(List<sObject> eventList){
        if(eventList.isEmpty() || Test.isRunningTest()){ return; }
        List<Database.SaveResult> listSr = EventBus.publish(eventList);
        for (Database.SaveResult sr : listSr) {
            if (sr.isSuccess()) {
                System.debug('Successfully published event.');
            } else {
                for(Database.Error err : sr.getErrors()) {
                    String error = 'Error returned: ' +err.getStatusCode() +' - ' + err.getMessage();
                    System.debug(error);
                }
            }
        }
        eventList.clear();
    }
}