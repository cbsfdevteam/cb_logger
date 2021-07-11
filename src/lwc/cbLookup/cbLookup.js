import { LightningElement, track,api } from 'lwc';

export default class cbLookup extends LightningElement {
    
 @track plabel='';
 @api placeholder='';
 @track pvalue='';
 @api listdata=[];
 @track Filteroptions= this.listdata;
 @track showSearchedValues = false;

    searchHandleClick(event){
    }

    searchHandleKeyChange(event){ 
        this.plabel = event.target.value;
        if(this.plabel.length < 3){
            this.showSearchedValues = false;
        }else{
            this.showSearchedValues = true;
            this.searchfiltersubject();
        }
    }

    parentHandleAction(event){        
        this.showSearchedValues = false;
        this.plabel =  event.target.dataset.label;      
        this.pvalue =  event.target.dataset.value;      
        let data = {label:this.plabel , value: this.pvalue}
        const selectedEvent = new CustomEvent('selected', { detail: data });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);    
    }

    searchfiltersubject(){
        let wantedSubject = this.plabel;
        let data = this.listdata;
        if(wantedSubject != ''){
            let currentData = [];
            data.forEach((row) => {
                if (row.label.toUpperCase().includes(wantedSubject.toUpperCase())) {
                    let compatibaleSubject = row;
                    currentData.push(compatibaleSubject);
                };
            });
            this.Filteroptions = currentData;
        }else{
            this.Filteroptions = data;
        }

    }

    speicalHandle(){
        if(this.plabel == ""){
            let data = {label:"" , value: ""}
            const selectedEvent = new CustomEvent('selected', { detail: data });
            // Dispatches the event.
            this.dispatchEvent(selectedEvent); 
        }
    }

}