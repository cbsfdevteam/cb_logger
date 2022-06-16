@isTest
private class CB_LoggerUI_Test {

    @testSetup
    private static void TestData() {
        
    }

    @isTest
    private static void test_sendEmail() {
        CB_LoggerUI_Ctrl.SendEmail('test','test','test@test.test');
    }

    @isTest
    private static void test_getlogTypes() {
        CB_LoggerUI_Ctrl.getTypes();
    }


    @isTest
    private static void test_getTodaylogs() {
        CB_LoggerUI_Ctrl.getTodayData('CB_LoggerBO__b',100);
    }

    @isTest
    private static void test_getlogs_logstodayTime() {
        CB_LoggerUI_Ctrl.getLoggerData('LOG',String.valueOf(Date.today())+' 18:00:00 12:00:12','CB_LoggerBO__b',100);
    }

    @isTest
    private static void test_getlogs_logs() {
        CB_LoggerUI_Ctrl.getLoggerData(null,null,'CB_LoggerBO__b',100);
    }

    @isTest
    private static void test_getlogs_logs2() {
        CB_LoggerUI_Ctrl.getLoggerData('LOG',null,'CB_LoggerBO__b',100);
    }
}