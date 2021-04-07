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
    private static void test_deletelogs() {
        CB_LoggerUI_Ctrl.clearBigObjByType('LOG');
    }

    @isTest
    private static void test_getlogTypes() {
        CB_LoggerUI_Ctrl.getTypes();
    }

    @isTest
    private static void test_getTodaylogs() {
        CB_LoggerUI_Ctrl.getTodayData();
    }

    @isTest
    private static void test_getlogs_logstoday() {
        CB_LoggerUI_Ctrl.getLoggerData('LOG',String.valueOf(Date.today()));
    }

    @isTest
    private static void test_getlogs_logs() {
        CB_LoggerUI_Ctrl.getLoggerData('LOG',null);
    }
}