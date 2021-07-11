import { LightningElement, track,api } from 'lwc';

export default class cbModal extends LightningElement {
    @api openmodel = false;
    @api addscrolls = false;
    @api hideclosebutton = false;
    @api modaltitle = "";
    @api closebtntxt = "Close";
    @api modalsubtitle = "";
    @api FooterText = "";
    @api BodyText = "";
    @api modalsize = "slds-modal_large";
    modalclass = "slds-modal slds-fade-in-open slds-modal_large";

    @api openmodal() {
        this.openmodel = true
    }
    closeModal() {
        this.modalclose();
        this.openmodel = false
    } 

    @api closemodal() {
        this.openmodel = false
    }
    
    modalclose(){
        const selectedEvent = new CustomEvent("modalclose", {
            detail : "closed modal"
          });
          this.dispatchEvent(selectedEvent);
    }

}