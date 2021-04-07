public with sharing class CB_Logger {

    private static List<CB_LoggerBO__b> LoggerList = new List<CB_LoggerBO__b>();
    private static List<CB_LoggerPE__e> logEvents = new List<CB_LoggerPE__e>();
    private static Integer logCount = 0;

    public static void CleanLogList(){
        LoggerList = new List<CB_LoggerBO__b>();
        logEvents = new List<CB_LoggerPE__e>();
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
    
    public static void log(LogType type, String subject, String Body){
        DateTime now = datetime.now();
        LoggerList.add(new CB_LoggerBO__b(
            Subject__c = subject,
            Message__c = Body,
            Type__c  = type.Name(),
            Date__c = now,
            User__c = UserInfo.getUserId()
        ));
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