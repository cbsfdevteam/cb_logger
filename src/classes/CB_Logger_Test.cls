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
    private static void test_quicklivelogs() {
        CB_Logger.live('test');
    }

    @isTest
    private static void test_alertlogs() {
        CB_Logger.alert('alert','test');
        CB_Logger.publish();
    }

    @isTest
    private static void test_livelogs() {
        CB_Logger.live('alert','test');
    }

    @isTest
    private static void test_Invocablelogs() {
        List<String> params = new List<String>();
        params.add('test~test1~test1');
        params.add('test~test2~test2');
        Test.startTest();
        CB_Logger.InvocableLog(params);
        Test.stopTest();
    }

    @isTest
    private static void test_errorlogs() {
        CB_Logger.error('error','test');
        CB_Logger.publish();
    }

    @isTest
    private static void test_shotLogsArchive() {
        CB_Logger.log('log 1','test');
        CB_Logger.log('log 1','test2');
        CB_Logger.log('log 1','test3');
        CB_Logger.publish();
    }


    @isTest
    private static void test_longLogsArchive() {
        CB_Logger.messageMaxLength = 500;
        CB_Logger.log('log 1','PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48aGFzcF9pbmZvPiAgPGhhc3BzY29wZT4gICAgPHZlbmRvciBpZD0iOTI2MDYiPiAgICAgIDxoYXNwIGlkPSI5MTg4MTU1MTkwNDM1MTEwOCIvPiAgICA8L3ZlbmRvcj4gIDwvaGFzcHNjb3BlPiAgPHYyYz5Zb0lkdEtDQ0hhdUFCSFowWXpLQmdnSW1vOF');
        CB_Logger.log('log 1','PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48aGFzcF9pbmZvPiAgPGhhc3BzY29wZT4gICAgPHZlbmRvciBpZD0iOTI2MDYiPiAgICAgIDxoYXNwIGlkPSI5MTg4MTU1MTkwNDM1MTEwOCIvPiAgICA8L3ZlbmRvcj4gIDwvaGFzcHNjb3BlPiAgPHYyYz5Zb0lkdEtDQ0hhdUFCSFowWXpLQmdnSW1vOF');
        CB_Logger.log('log 1','PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48aGFzcF9pbmZvPiAgPGhhc3BzY29wZT4gICAgPHZlbmRvciBpZD0iOTI2MDYiPiAgICAgIDxoYXNwIGlkPSI5MTg4MTU1MTkwNDM1MTEwOCIvPiAgICA8L3ZlbmRvcj4gIDwvaGFzcHNjb3BlPiAgPHYyYz5Zb0lkdEtDQ0hhdUFCSFowWXpLQmdnSW1vOF');
        CB_Logger.publish();
    }

    @isTest
    private static void test_loglogs() {
        CB_Logger.log('log','test');
        CB_Logger.publish();
    }
    
    @isTest
    private static void test_objectbodylogs() {
        CB_Logger.log(LogType.LOG,'test',(Object)'test');
        CB_Logger.publish();
    }

    @isTest
    private static void test_generallogs() {
        CB_Logger.log(LogType.LOG,'subject','message');
        CB_Logger.publish();
    }

    
    @isTest
    private static void test_generalWithCustomUserlogs() {
        CB_Logger.log(LogType.LOG,'subject','message',UserInfo.getUserId());
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