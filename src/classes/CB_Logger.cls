public with sharing class CB_Logger {

    private static Map<String,Map<String,CB_LoggerPE__e>> logEvents = new Map<String,Map<String,CB_LoggerPE__e>>();
    private static List<CB_LoggerPE__e> liveEvents = new List<CB_LoggerPE__e>();
    public static Integer messageMaxLength = 125000;

    private static Integer logCount = 0;
    private static Boolean LiveIsActive = [SELECT Live_is_Active__c,Number_Of_Records_Per_Type__c FROM CB_Logger_Settings__mdt WHERE DeveloperName=:'Settings'].Live_is_Active__c;

    public static void CleanLogList(){
        logEvents = new Map<String,Map<String,CB_LoggerPE__e>>();
    } 
    
    public static void live(Object Body){
        live('live '+logCount,Body);
    }
    public static void live(String Subject, Object Body){
        if(!LiveIsActive){
            return;
        }
        DateTime now = datetime.now();
        liveEvents.add(new CB_LoggerPE__e(
            Type__c = 'LIVE',
            User__c = UserInfo.getUserId(), 
            Subject__c = Subject,
            Date__c = now,
            Message__c = String.valueOf(Body),
            Count__c = logCount++
        ));
        
        publish(liveEvents);
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
    public static void error(String Subject, Exception e){
        log(LogType.ERROR, Subject,e+','+e.getStackTraceString());
    }

    public static void log(String Subject, Object Body){
        log(LogType.LOG, Subject,String.valueOf(Body));
    }


    @InvocableMethod(label='InvocableLog' description='Create logs from flow, this method will publish the platform event immediately. send type,subject and body in the same String value seperated by "~".')
    public static void InvocableLog(List<String> params){
        DateTime now = datetime.now();
        for (String stringlog : params) {
            List<String> splittedParams = stringlog.split('~');
            if(splittedParams.size() != 3){
                error('InvocableLog','Error when seperating the String parameter, please make sure you seperated the topic,subject and body with "~" correctly. <br/> Failed on String: '+stringlog);
            }else{
                addLog2EventList(new CB_LoggerPE__e(
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

    public static void log(LogType type, String subject, Object Body){
        log(type,subject,String.valueOf(Body));
    }
    
    public static void log(LogType type, String subject, String Body){
        DateTime now = datetime.now();
        addLog2EventList(new CB_LoggerPE__e(
            Type__c = type.Name(),
            User__c = UserInfo.getUserId(), 
            Subject__c = subject,
            Date__c = now,
            Message__c = Body,
            Count__c = logCount++
        ));
    }

    public static void log(LogType type, String subject, String Body,String User){
        DateTime now = datetime.now();
        addLog2EventList(new CB_LoggerPE__e(
            Type__c = type.Name(),
            User__c = User, 
            Subject__c = subject,
            Date__c = now,
            Message__c = Body,
            Count__c = logCount++
        ));
    }
    public static void log(LogType type, String subject, Exception e,String User){
        log(type, Subject,e+','+e.getStackTraceString(),User);
    }

    public static void publish(){
        // system.debug(Json.serialize(logEvents));
        // system.debug(logEvents);
        List<CB_LoggerPE__e> gatherAllPEs = new List<CB_LoggerPE__e>();
        for (String Subject : logEvents.keySet()) {
            for (String Type : logEvents.get(Subject).keySet()) {
                gatherAllPEs.add(logEvents.get(Subject).get(Type));
            }
        }
        publish(gatherAllPEs);
    }

    private static Boolean safe2CombineMessages(String oldMessage,String newMessage){
        if((oldMessage.length() + newMessage.length()) < messageMaxLength){
            return true;
        }else{
            return false;
        }
    }

    public static String getRecordData(List<sObject> records, List<String> fields){
        String recordIdString = '';
        if(fields != null){
            for(sObject rec : records){
                for(String field : fields){
                    recordIdString += rec.get(field) + ', ';
                }
                recordIdString += '\n';
            } 
            
        }else{
            for(sObject rec : records){
                recordIdString += rec + '\n';
            }
        }
        return recordIdString;
    }

    private static void archiveOldSubjectType(String Subject,String Type){
        for (Integer i = 1; i < logEvents.size(); i++) {
            if(!logEvents.get(Subject).containsKey(Type+' #'+i)){
                logEvents.get(Subject).put(Type+' #'+i,logEvents.get(Subject).get(Type));
                logEvents.get(Subject).remove(Type);
                break;
            }
        }
    }

    private static Boolean subjectTypeExistsAlready(String Subject,String Type){
        if(logEvents.get(Subject) != null && logEvents.get(Subject).containsKey(Type)){
            return true;
        }else{
            return false;
        }
    }

    private static void addNewType2Subject(CB_LoggerPE__e newPlatformEvent){
        logEvents.get(newPlatformEvent.Subject__c).put(newPlatformEvent.Type__c,newPlatformEvent);
    }

    private static void addLog2EventList(CB_LoggerPE__e newPlatformEvent){
            if(logEvents.containsKey(newPlatformEvent.Subject__c)){
                if(subjectTypeExistsAlready(newPlatformEvent.Subject__c,newPlatformEvent.Type__c)){
                    if(safe2CombineMessages(logEvents.get(newPlatformEvent.Subject__c).get(newPlatformEvent.Type__c).Message__c,newPlatformEvent.Message__c)){
                        logEvents.get(newPlatformEvent.Subject__c).get(newPlatformEvent.Type__c).Message__c = '<div style="background:lightgoldenrodyellow">'+newPlatformEvent.Message__c+'</div><div style="background:lightblue"><br/>--'+logEvents.get(newPlatformEvent.Subject__c).get(newPlatformEvent.Type__c).Date__c+'--<br/> '+logEvents.get(newPlatformEvent.Subject__c).get(newPlatformEvent.Type__c).Message__c+'<div/>';
                    }else{
                        archiveOldSubjectType(newPlatformEvent.Subject__c,newPlatformEvent.Type__c);
                        logEvents.get(newPlatformEvent.Subject__c).put(newPlatformEvent.Type__c,newPlatformEvent);
                    }
                }else{
                    addNewType2Subject(newPlatformEvent);
                }
            }else{
                logEvents.put(newPlatformEvent.Subject__c,new Map<String,CB_LoggerPE__e>());
                addNewType2Subject(newPlatformEvent);
            }
    }
    
    public static void publish(List<sObject> eventList){
        if(eventList.isEmpty()){ return; }
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
        CleanLogList();
    }
}