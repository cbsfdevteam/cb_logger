trigger CB_LoggerPE_Trigger on CB_LoggerPE__e (after insert) {
    List<CB_LoggerBO__b> Logger2insert = new List<CB_LoggerBO__b>();

    for (CB_LoggerPE__e event : Trigger.New) {
        Logger2insert.add(new CB_LoggerBO__b(
            Subject__c 	= event.Subject__c,
            Message__c 	= event.Message__c,
            Type__c  	= event.Type__c,
            Date__c 	= event.Date__c,
            User__c 	= event.User__c,
            Count__c 	= event.Count__c
        ));
    }
    if(!Test.isRunningTest()){
        List<Database.SaveResult> saveResult = Database.insertImmediate(Logger2insert);
        System.debug('saveResult: ' + saveResult);
        for (Database.SaveResult res : saveResult) {
            System.debug(' success ' + res.isSuccess() + ', ' + res);
        }
        System.debug('saveResult: ' + saveResult);
    }

}