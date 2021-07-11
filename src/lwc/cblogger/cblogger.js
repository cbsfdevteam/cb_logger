import {LightningElement,track,api} from 'lwc';
import getData from '@salesforce/apex/CB_LoggerUI_Ctrl.getLoggerData';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import getTypeList from '@salesforce/apex/CB_LoggerUI_Ctrl.getTypes';
import deleteByType from '@salesforce/apex/CB_LoggerUI_Ctrl.clearBigObjByType';
import SendmyEmail from '@salesforce/apex/CB_LoggerUI_Ctrl.SendEmail';
import PremittedEmails from '@salesforce/label/c.cbLogger_Permitted_Emails';
import queryAmount from '@salesforce/label/c.cbLogger_Query_Amount';
import  *  as Navigation from './navigation';
import  *  as constData from './constData';
import  *  as tableManager  from './tableManager';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';
export default class CBLogger extends LightningElement {
    liveButtonText = "Go Live Logger"
    get tableColums(){return constData.tableColumns;}
    get dateoflogtype() {return `show  ${this.ChosenType} logs on specific date:`;}
    get isTypeToday() {return this.ChosenType === "";}
    header = [{ label: 'Logger', value: 'Logger' },{ label: 'Big Object', value: 'Big Object' } ];
    channelName = '/event/CB_LoggerPE__e';
    subscription = {};
    @track isLive = false;
    label = {
        queryAmount
    };
    @track data = [];
    @track modalmaintitle = "Title";
    @track ModalBody = "";
    @track areDetailsVisible = false;
    @track hideclosebutton = false;
    @track disabledDate = true;
    @track disabledTime = true;
    @track disabledDateTip = "Please Choose a Type first.";
    @track isFirstPage = true;
    @track isLastPage = true;
    @track BodyisHTML = false;
    @track ClickedSend2Email = false;
    @api currentPageNumber = 1;
    @track newType = "";
    @track ClientEmailvalue = "";
    @track newDate = "";
    @track Pages = 0;
    @track Backdata = [];
    @track backupSubjectOptions = [];
    @track loaded = false;
    @track ChosenType = "";
    @track newEndTime = "";
    @track newStartTime = "";
    @track sortedBy = 'Date__c';
    @track recordsPerPage = 10;
    @track defaultSortDirection = -1;
    @track sortDirection = -1;
    @track comboBoxOptions = [{
            label: '10',
            value: 10
        },
        {
            label: '20',
            value: 20
        },
        {
            label: '50',
            value: 50
        },
    ];
    @track typeOptions;
    @track subjectOptions4Lookup = [];
    @track userOptions4Lookup = [];
    @track showOnlySubject = [];
    @track showOnlyUser = [];

    //FilterSubjects - if e.detail.value == "", then no Subject was selected to focus on. else refresh data based on the filtered value.
    FilterSubjects(e) {
        if(e.detail.value == ""){
            this.showOnlySubject = [];
        }else{
            this.showOnlySubject = [e.detail.value];
        }
        this.refreshData(this.showOnlySubject.length != 0);
    }

    //FilterUser - if e.detail.value == "", then no User was selected to focus on. else refresh data based on the filtered value.
    FilterUser(e) {
        if(e.detail.value == ""){
            this.showOnlyUser = [];
        }else{
            this.showOnlyUser = [e.detail.value];
        }
        this.refreshData(this.showOnlyUser.length != 0);
    }

    //deleteByType - deletes from the database all big objects that their type__c = this.newType.
    deleteByType() {
        this.StartLoading();
        deleteByType({
            type: this.newType
        }).then(() => {
            this.EndLoading();
            this.areDetailsVisible = true;
            this.newType = this.ChosenType;
            this.updateData(false,null,null);
        })
    }

    //connectedCallback - gather types from server, then calls server again for the unfiltered data.
    async connectedCallback() {
        getTypeList().then((res) => {
            var NewOptions = [{
                label: "Today",
                value: ""
            }];
            res.forEach(type => {
                const option = {
                    label: type,
                    value: type
                };
                NewOptions.push(option)
            });
            this.typeOptions = NewOptions;
            this.updateData(false,null,null);
        })
    }

    //evaluateFilter - if rowValue isnt included in values2Keep, return true so this row will be skipped.
    evaluateFilter(values2Keep,rowValue){
        if (values2Keep != null && !values2Keep.includes(rowValue)) {
            return true;
        }else{
            return false;
        }
    }
    
    //for Html calls.
    refresh(){
        this.refreshData(false);
    }

    //for JS calls
    refreshData(FrontData){
        this.updateData(FrontData,this.checkFilterSubject(),this.checkUserSubject());
    }


    sortDateFilter(){
        if(this.valueIsEmpty(this.newDate)){
            return '';
        }else{
            return this.newDate +' '+this.newStartTime+' '+this.newEndTime;
        }
    }

    /**
     * updateData - manipulate data on datatable.
     * @param FrontData - Use the data that already exists or call backend for new data.
     * @param subjectFilter - Pass Subject filter value if exists to filter data.
     * @param userFilter - Pass User filter value if exists to filter data.
     */
    async updateData(FrontData,subjectFilter,userFilter) {
        this.StartLoading();
        let tableData = [];
        if(FrontData){
            tableData = this.Backdata;
        }else{
            let dateFilter = this.sortDateFilter();
            tableData = await getData({look4Type: this.newType,look4Date: dateFilter});
        }
        this.data = [];
        this.currentPageNumber = 1;
        let currentData = [];

        tableData.forEach((row) => {
            if (this.evaluateFilter(subjectFilter,row.Subject__c) || this.evaluateFilter(userFilter,row.User__r != undefined ? row.User__r.Name + "/" + row.User__r.Id : "")) {
                return;
            }
            currentData.push(tableManager.buildRow(row));
        });
        this.subjectOptions4Lookup = tableManager.getSubjectArray();
        this.userOptions4Lookup = tableManager.getUserArray();
        currentData =  tableManager.sortTableBy(currentData,this.sortedBy);
        this.Backdata = currentData;
        // if(!FrontData && subjectFilter == null){
        //     this.Backdata = currentData;
        // }
        this.Pages = Navigation.calculateNumOfPages(currentData.length,this.recordsPerPage);
        if (this.currentPageNumber * this.recordsPerPage < currentData.length) {
            this.data = currentData.slice(0, this.currentPageNumber * this.recordsPerPage);
        } else {
            this.data = currentData.slice(0, currentData.length);
        }
        if (currentData.length == 0) {
            this.TableMessage = "Found 0 Records...";
            this.isFirstPage = true;
            this.isLastPage = true;
        } else {
            this.TableMessage = "";
            this.isFirstPage = true;
            this.isLastPage = false;
        }
        this.EndLoading();
        this.areDetailsVisible = true;
    }

    //changeSumOfRecords - calculates the amount of records to show on each page.
    changeSumOfRecords(event) {
        this.currentPageNumber = 1;
        this.recordsPerPage = event.target.value;
        let pagenumbers = parseInt(this.Backdata.length / this.recordsPerPage);
        let n = this.Backdata.length % this.recordsPerPage;
        if (n > 0) {
            this.Pages = pagenumbers + 1
        } else if (pagenumbers == 0) {
            this.Pages = 1;
        } else {
            this.Pages = pagenumbers;
        }
        if (this.currentPageNumber * this.recordsPerPage < this.Backdata.length) {
            this.data = this.Backdata.slice(0, this.currentPageNumber * this.recordsPerPage);
        } else {
            this.data = this.Backdata.slice(0, this.Backdata.length);
        }
    }

    clearLives(){
        this.data = [];
    }

    //getDataTypeBased - tells server to limit records to selected certain type.
    getDataTypeBased(event) {
        this.ChosenType = event.target.value;
        this.newType = this.ChosenType;
        if (this.newType != "") {
            this.disabledDate = false;
            this.disabledTime = false;
            this.disabledDateTip = "";
        } else {
            this.disabledDate = true;
            this.disabledTime = true;
            this.disabledDateTip = "Please Choose a Type first.";
        }
        this.updateData(false,this.checkFilterSubject(),this.checkUserSubject());
    }

    //checkFilterSubject - returns null if no Subject was selected else returns the value to filter based.
    checkFilterSubject(){
        return this.showOnlySubject.length == 0 ? null:this.showOnlySubject;
    }

    //checkFilterSubject - returns null if no User was selected else returns the value to filter based.
    checkUserSubject(){
        return this.showOnlyUser.length == 0 ? null:this.showOnlyUser;
    }

    //showRowDetails - opens modal with the row's data if the table's action "Details" was selected.
    showRowDetails(row) {
        this.ClickedSend2Email = false;
        if (row.Message__c.includes("<br/>")) {
            this.BodyisHTML = true;
        } else {
            this.BodyisHTML = false;
        }
        const elm = this.template.querySelector('c-cb-modal');
        elm.openmodal();
        this.ModalBody = row.Message__c;

        //this.User = row.User__r.Name;
        this.modalmaintitle = row.Type__c+'-'+row.Subject__c;
    }
    
    valueIsEmpty(value){
        if(value == undefined || value== "" || value== null){
            return true;
        }else{
            return false;
        }
    }

    //getDataDateBased - refresh table's data based on date. *Note: works only if a log type was selected.
    getDataDateBased(event) {
        if(this.valueIsEmpty(event.target.value)){
            this.disabledTime = false;
        }
        this.newDate = event.target.value;
        this.updateData(false,null,null);
    }

    //getDataDateStartTimeBased - refresh table's data based on date. *Note: works only if a log type was selected.
    getDataDateStartTimeBased(event){
        console.log(event.detail);
        this.newStartTime = event.detail;
        this.updateData(false,null,null);
    }

    getDataDateEndTimeBased(event){
        console.log(event.detail);
        this.newEndTime = event.detail;
        this.updateData(false,null,null);
    }

    goLastPage() {
        let pagenumbers = parseInt(this.Backdata.length / this.recordsPerPage);
        this.currentPageNumber = pagenumbers+1;
            this.isLastPage = true;
            this.isFirstPage = false;
            this.data = this.Backdata.slice((this.currentPageNumber-1) * this.recordsPerPage, this.Backdata.length);
    }

    goNextPage() {
        this.currentPageNumber = ++this.currentPageNumber;
        if (this.currentPageNumber * this.recordsPerPage < this.Backdata.length) {
            this.isLastPage = false;
            if (this.currentPageNumber == 1) {
                this.isFirstPage = true;
            } else {
                this.isFirstPage = false;
            }
            this.data = this.Backdata.slice((this.currentPageNumber - 1) * this.recordsPerPage, this.currentPageNumber * this.recordsPerPage);
        } else {
            this.isLastPage = true;
            if (this.currentPageNumber == 1) {
                this.isFirstPage = true;
            } else {
                this.isFirstPage = false;
            }
            this.data = this.Backdata.slice((this.currentPageNumber - 1) * this.recordsPerPage, this.Backdata.length);
        }
    }

    goPrevPage() {
        this.currentPageNumber = --this.currentPageNumber;
        if (this.currentPageNumber * this.recordsPerPage < this.Backdata.length) {
            this.isLastPage = false;
            if (this.currentPageNumber == 1) {
                this.isFirstPage = true;
            } else {
                this.isFirstPage = false;
            }
            this.data = this.Backdata.slice((this.currentPageNumber - 1) * this.recordsPerPage, this.currentPageNumber * this.recordsPerPage);
        } else {
            this.isLastPage = true;
            if (this.currentPageNumber == 1) {
                this.isFirstPage = true;
            } else {
                this.isFirstPage = false;
            }
            this.data = this.Backdata.slice((this.currentPageNumber - 1) * this.recordsPerPage, this.Backdata.length);
        }
    }

    goFirstPage() {
        this.currentPageNumber = 1;
        this.isFirstPage = true;
        this.isLastPage = false;
        this.data = this.Backdata.slice((this.currentPageNumber - 1) * this.recordsPerPage, this.currentPageNumber * this.recordsPerPage);
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'show_details':
                this.showRowDetails(row);
                break;
            default:
        }
    }

    //Send2Email - open 'send email' option.
    Send2Email() {
        this.ClientEmailvalue = '';
        this.ClickedSend2Email = this.ClickedSend2Email ? false :true;
    }

    SendEmail() {
        if (this.ClientEmailvalue != '') {
            SendmyEmail({
                subject: "Email From Logger",
                body: this.ModalBody,
                email: this.ClientEmailvalue
            }).then(res => {
                if (res) {
                    this.showToast("Email", "Email Sent", "Success");
                    this.ClickedSend2Email = false;
                } else {
                    this.showToast("Email", "Email Failed", "Error");
                }
            }).catch(err =>{
                this.DisplayError(err);
            });
        } else {
            this.showToast("Validation Error", "Please choose an email", "Warning");
        }

    }

    //show error toast from server.
    DisplayError(err){
        console.log(err);
        if(err.body == undefined){
            this.showToast("Error has occurred",JSON.stringify(err),"Error");
        }else{
            this.showToast("Error has occurred",err.body.message,"Error");
        }
        this.EndLoading();
    }

    showToast(mytitle, mymessage, variant) {
        const event = new ShowToastEvent({
            title: mytitle,
            message: mymessage,
            variant: variant,
        });
        this.dispatchEvent(event);
    }

    EmailhandleChange(event) {
        this.ClientEmailvalue = event.detail.value;
    }

    // builds email list, based on 'PremittedEmails' Custom Label, of all eligible emails for sending logs to.
    get Emails() {
        let splittedemails = PremittedEmails.split(',');
        let emailOptions = [];
        splittedemails.forEach(email => {
            emailOptions.push({
                label: email.split("@")[0].replace(".", " "),
                value: email
            });
        });
        return emailOptions;
    }

    //start loading screen
    StartLoading(){
        this.loaded = false;
    }

    //end loading screen
    EndLoading(){
        this.loaded = true;
    }

    // Handles subscribe to platform event
    handleSubscribe() {
        // Callback invoked whenever a new event message is received
        const messageCallback = (response)=> {
            console.log('New message received: ', JSON.stringify(response));
            let currentData = this.data;
            currentData.push(tableManager.buildRow(response.data.payload));
            currentData =  tableManager.sortTableBy(currentData,this.sortedBy);
            this.data = JSON.parse(JSON.stringify(currentData));
        };

        // Invokes subscribe method of empApi.
        subscribe(this.channelName, -1, messageCallback).then(response => {
            this.showToast("Subscription", "Subscription request sent to: "+JSON.stringify(response.channel), "Success");
            this.subscription = response;
        });
    }

    // Handles unsubscribe to platform event
    handleUnsubscribe() {
        // Invokes unsubscribe method of empApi
        unsubscribe(this.subscription, response => {
        });
    }

    // updates blueCard cmp's header
    switchHeader(value2change,newvalue){
        let tempHeaders = [];
        this.header.forEach(head => {
            if(head.value === value2change){
                tempHeaders.push({label:newvalue,value:newvalue});
                return;
            }
            tempHeaders.push(head);
        });
        this.header = tempHeaders;
    }

    // switch between Live Mode to Big Object Mode.
    switchLoggerType(event){
        if(event.detail === true){
            this.isLive = false;
            this.liveButtonText = "Go Live Logger";
            this.handleUnsubscribe();
            this.switchHeader("Live Mode","Big Object");
            this.updateData(false,this.checkFilterSubject(),this.checkUserSubject());
        }else{
            this.isLive = true;
            this.liveButtonText = "Go Big Object Logger";
            this.data = [];
            this.Backdata = [];
            this.switchHeader("Big Object","Live Mode");
            this.handleSubscribe();
        }
    }
}