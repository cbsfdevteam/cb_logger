@isTest
private class CB_Logger_Test {

    @testSetup
    private static void TestData() {
        
    }

    @isTest
    private static void test_PE() {
        List<CB_LoggerPE__e> eventList = new List<CB_LoggerPE__e>();
        DateTime now = datetime.now();
        CB_LoggerPE__e eve = new CB_LoggerPE__e(
            Type__c = 'LOG',
            User__c = UserInfo.getUserId(), 
            Subject__c = 'test',
            Date__c = now,
            Message__c = 'test',
            Count__c = 0
        );
        eventList.add(eve);
        Test.startTest();
        EventBus.publish(eve);
        Test.stopTest();
    }

    @isTest
    private static void test_successlogs() {
        CB_Logger.success('success','test');
        CB_Logger.publish();
    }

    @isTest
    private static void test_alertlogs() {
        CB_Logger.alert('alert','test');
        CB_Logger.publish();
    }

    @isTest
    private static void test_errorlogs() {
        CB_Logger.error('error','test');
        CB_Logger.publish();
    }

    @isTest
    private static void test_loglogs() {
        CB_Logger.log('log','test');
        CB_Logger.publish();
    }

    @isTest
    private static void test_loglogs_2() {
        CB_Logger.log(LogType.LOG,'log','test');
        CB_Logger.publish();
    }

    @isTest
    private static void test_cleanlogs() {
        CB_Logger.log(LogType.LOG,'log','test');
        CB_Logger.CleanLogList();
        CB_Logger.publish();
    }


}