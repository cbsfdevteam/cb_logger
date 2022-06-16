import {LightningElement,track,api} from 'lwc';
import getData from '@salesforce/apex/CB_LoggerUI_Ctrl.getLoggerData';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import getTypeList from '@salesforce/apex/CB_LoggerUI_Ctrl.getTypes';
import SendmyEmail from '@salesforce/apex/CB_LoggerUI_Ctrl.SendEmail';
import getLoggerMetadata from '@salesforce/apex/CB_LoggerUI_Ctrl.getLoggerMetadata';
import PremittedEmails from '@salesforce/label/c.cbLogger_Permitted_Emails';
import queryAmount from '@salesforce/label/c.cbLogger_Query_Amount';
import  *  as Navigation from './navigation';
import  *  as constData from './constData';
import  *  as tableManager  from './tableManager';
import { subscribe, unsubscribe} from 'lightning/empApi';
import userId from '@salesforce/user/Id';

export default class CBLogger extends LightningElement {
    @track data = [];
    @track Backdata = [];
    @track backupSubjectOptions = [];
    @track typeOptions;
    @track subjectOptions4Lookup = [];
    @track userOptions4Lookup = [];
    @track showOnlySubject = [];
    @track showOnlyUser = [];
    @track findValue = [];
    @api currentPageNumber = 1;
    get tableColums(){return constData.tableColumns;}
    get dateoflogtype() {return `show  ${this.ChosenType} logs on specific date:`;}
    get isTypeToday() {return this.ChosenType === "";}
    comboBoxOptions = [{ label: '10', value: 10 }, { label: '20', value: 20 }, { label: '50', value: 50 }, ];
    header = [{ label: 'Logger', value: 'Logger' },{ label: 'Big Object', value: 'Big Object' } ];
    channelName = '/event/CB_LoggerPE__e';
    subscription = {};
    isLive = false;
    label = {queryAmount};
    modalmaintitle = "Title";
    chosenLogObj = "CB_LoggerBO__b";
    ModalBody = "";
    tempfindValue = "";
    disabledDateTip = "Please Choose a Type first.";
    areDetailsVisible = false;
    hideclosebutton = false;
    disabledDate = true;
    disabledTime = true;
    isFirstPage = true;
    isLastPage = true;
    BodyisHTML = false;
    ClickedSend2Email = false;
    newType = "";
    ClientEmailvalue = "";
    newDate = "";
    Pages = 0;
    loaded = false;
    ChosenType = "";
    newEndTime = "";
    newStartTime = "";
    sortedBy = 'Date__c';
    recordsPerPage = 10;
    defaultSortDirection = -1;
    sortDirection = -1;
    settingsURL
    liveIsActive
    Number_Of_Records_Per_Type
    personalScope = false;

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

    //connectedCallback - gather types from server, then calls server again for the unfiltered data.
    async connectedCallback() {

        getLoggerMetadata().then((res) =>{
            this.settingsURL = '/'+res.Id;
            this.liveIsActive = res.Live_is_Active__c;
            this.Number_Of_Records_Per_Type = res.Number_Of_Records_Per_Type__c;
        })

        getTypeList().then((res) => {
            var NewOptions = [{label: "Today",value: ""}];
            res.forEach(type => {
                const option = {label: type,value: type};
                NewOptions.push(option)
            });
            this.typeOptions = NewOptions;
            this.updateData(false);
        })
    }

    //evaluateFilter - if rowValue isnt included in values2Keep, return true so this row will be skipped.
    evaluateFilter(Filters,rowValue){
        let doesNotMeetFilters = false;
        if(Filters.length != 0){
            Filters.forEach(filter => {
                if (doesNotMeetFilters == false && rowValue != undefined && rowValue[filter.name] != undefined && rowValue[filter.name].includes(filter.value)) {
                    doesNotMeetFilters = false;
                }else{
                    doesNotMeetFilters = true;
                }
            });
        }
        return doesNotMeetFilters;
    }
    
    //for Html calls.
    refresh(){
        this.refreshData(false);
    }

    //for JS calls
    refreshData(FrontData){
        this.updateData(FrontData);
    }


    sortDateFilter(){
        if(this.valueIsEmpty(this.newDate)){
            return '';
        }else{
            return this.newDate +' '+this.newStartTime+' '+this.newEndTime;
        }
    }

    sortFilters(){
        let Filters=[];
        if(this.checkFilterSubject() != null){
            Filters.push(this.checkFilterSubject());
        }
        if(this.checkUserSubject() != null){
            Filters.push(this.checkUserSubject());
        }
        if(this.checkFindMessage() != null){
            Filters.push(this.checkFindMessage());
        }
        return Filters;
    }

    /**
     * updateData - manipulate data on datatable.
     * @param FrontData - Use the data that already exists or call backend for new data.
     */
    async updateData(FrontData) {
        let Filters = this.sortFilters();
        this.StartLoading();
        let tableData = [];
        if(FrontData){
            tableData = this.Backdata;
        }else{
            let dateFilter = this.sortDateFilter();
            let finished = false;
            let amount = parseInt(queryAmount);
            while(!finished){
                try {
                    tableData = await getData({look4Type: this.newType,look4Date: dateFilter, bigObjectType: this.chosenLogObj, queryAmount: amount});
                    finished = true;
                } catch (e) {
                    console.error(e);
                    console.log(e.body.message);
                    if(e.body.message.includes('Apex heap size too large')){
                        this.showToast("Logs size too large","changing query amount from "+amount+" to "+amount/2,"warning");
                        amount= amount/2;
                    }else{
                        this.showToast("Error has occurred",JSON.stringify(e),"error");
                        finished = true;
                    }
                }
            }
        }
        this.data = [];
        this.currentPageNumber = 1;
        let currentData = [];
        tableData.forEach((row) => {
            if (this.evaluateFilter(Filters,row)){
                return;
            }
            currentData.push(tableManager.buildRow(row));
        });
        this.subjectOptions4Lookup = tableManager.getSubjectArray();
        this.userOptions4Lookup = tableManager.getUserArray();
        currentData =  tableManager.sortTableBy(currentData,this.sortedBy);
        this.Backdata = currentData;
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

    //onchangeofFind - updates the message filter's value.
    onchangeofFind(event){
        this.tempfindValue = event.target.value;
        if(this.tempfindValue == '' || this.tempfindValue == undefined){
            this.findValue = [];
            this.updateData(false);
        }
    }

    //findinMessages - execute message filtering.
    findinMessages(){
        this.findValue.push(this.tempfindValue);
        this.updateData(true);
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

    //clearLives - clear live logs
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
        this.updateData(false);
    }

    //checkFilterSubject - returns null if no Subject was selected else returns the value to filter based.
    checkFindMessage(){
        return this.findValue.length == 0 ? null:{value: this.findValue[0], name: "Message__c"};
    }
    //checkFilterSubject - returns null if no Subject was selected else returns the value to filter based.
    checkFilterSubject(){
        return this.showOnlySubject.length == 0 ? null:{value: this.showOnlySubject[0], name: "Subject__c"};
    }

    //checkFilterSubject - returns null if no User was selected else returns the value to filter based.
    checkUserSubject(){
        return this.showOnlyUser.length == 0 ? null:{value: this.showOnlyUser[0], name: "User__c"};
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
        this.updateData(false);
    }

    //getDataDateStartTimeBased - refresh table's data based on date. *Note: works only if a log type was selected.
    getDataDateStartTimeBased(event){
        this.newStartTime = event.detail;
        this.updateData(false);
    }

    getDataDateEndTimeBased(event){
        this.newEndTime = event.detail;
        this.updateData(false);
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
            let currentData = this.data;
            if(this.isLive && response.data.payload.Type__c != 'LIVE'){
                return;
            }
            let newRow = tableManager.buildRow(response.data.payload);
            if(this.personalScope && newRow.User__c != userId){
                return;
            }
            currentData.push(newRow);
            // currentData.push(tableManager.buildRow(response.data.payload));
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
            this.handleUnsubscribe();
            this.switchHeader("Live Mode","Big Object");
            this.updateData(false);
        }else{
            this.isLive = true;
            this.data = [];
            this.Backdata = [];
            this.switchHeader("Big Object","Live Mode");
            this.handleSubscribe();
        }
    }

    // switch between Live Mode Personal Scope (only logs related to userId) or All.
    switchLiveScope(event){
        if(event.detail === true){
            this.personalScope = true;
        }else{
            this.personalScope = false;
        }
    }

    getLatestMetadataSettings(){
        this.StartLoading();
        getLoggerMetadata().then((res) =>{
            this.EndLoading();
            this.settingsURL = '/'+res.Id;
            this.liveIsActive = res.Live_is_Active__c;
            this.Number_Of_Records_Per_Type = res.Number_Of_Records_Per_Type__c;
        })
    }
}