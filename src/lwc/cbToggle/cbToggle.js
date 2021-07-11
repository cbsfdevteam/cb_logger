import { LightningElement,api,track } from 'lwc';

export default class cbToggle extends LightningElement {
    @api truename = '';
    @api falsename = '';
    @api label = '';
    @api helptext = '';
    @api value = false;

    // let checkboxes = this.template.querySelectorAll('[data-id="checkbox"]')
    renderedCallback() {
        let checkboxes = this.template.querySelector('[data-id="checkbox"]');
        if(this.value === 'true'){
            checkboxes.checked = true;
        }else{
            checkboxes.checked = false;
        }
    }
    handleChange(event) {
        if(this.value){
            this.value = false;
        }else{
            this.value = true;
        }
        // Creates the event with the data.
        const selectedEvent = new CustomEvent("change", {
        detail: this.value
        });

        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }


}