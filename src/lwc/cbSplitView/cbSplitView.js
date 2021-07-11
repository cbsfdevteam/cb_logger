import { LightningElement,api,track } from 'lwc';

export default class cbSplitView extends LightningElement {
    @api title = "Title";
    @track openclose = "slds-split-view_container slds-is-closed";

    ShowHide() {
        this.template.querySelector('.slds-split-view_container').classList.toggle('slds-is-closed');
        this.template.querySelector('.slds-split-view_container').classList.toggle('slds-is-open');
        if (this.template.querySelector('.splitview').style.width == "20rem")
        {
            this.template.querySelector('.splitview').style.width = "0";
        }else{
            this.template.querySelector('.splitview').style.width = "20rem";
        }
    }

}