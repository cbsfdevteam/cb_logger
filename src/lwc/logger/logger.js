import {LightningElement,track,api} from 'lwc';
import getData from '@salesforce/apex/CB_LoggerUI_Ctrl.getLoggerData';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import getTypeList from '@salesforce/apex/CB_LoggerUI_Ctrl.getTypes';
import deleteByType from '@salesforce/apex/CB_LoggerUI_Ctrl.clearBigObjByType';
import SendmyEmail from '@salesforce/apex/CB_LoggerUI_Ctrl.SendEmail';
import PremittedEmails from '@salesforce/label/c.Logger_Permitted_Emails';
import queryAmount from '@salesforce/label/c.Logger_Query_Amount';
import  *  as Navigation from './navigation';
import  *  as constData from './constData';
import  *  as tableManager  from './tableManager';

export default class Logger extends LightningElement {

    get tableColums(){return constData.tableColumns;}
    get dateoflogtype() {return `show  ${this.ChosenType} logs on specific date:`;}
    get isTypeToday() {return this.ChosenType === "";}
    get header() {return [{ label: 'Logger', value: 'Logger' } ];}

    label = {
        queryAmount
    };
    @track data = [];
    @track modalmaintitle = "Title";
    @track ModalBody = "";
    @track areDetailsVisible = false;
    @track hideclosebutton = false;
    @track disabledDate = true;
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
            tableData = await getData({look4Type: this.newType,look4Date: this.newDate});
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

    //getDataTypeBased - tells server to limit records to selected certain type.
    getDataTypeBased(event) {
        this.ChosenType = event.target.value;
        this.newType = this.ChosenType;
        if (this.newType != "") {
            this.disabledDate = false;
            this.disabledDateTip = "";
        } else {
            this.disabledDate = true;
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
        const elm = this.template.querySelector('c-lwc-modal');
        elm.openmodal();
        this.ModalBody = row.Message__c;

        //this.User = row.User__r.Name;
        this.modalmaintitle = row.Type__c+'-'+row.Subject__c;
    }

    //getDataDateBased - refresh table's data based on date. *Note: works only if a log type was selected.
    getDataDateBased(event) {
        this.newDate = event.target.value;
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
}