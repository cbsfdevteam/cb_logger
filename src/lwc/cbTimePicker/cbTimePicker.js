import { LightningElement,api } from 'lwc';

export default class CbTimePicker extends LightningElement {

    @api disabled = false;
    @api label = "";
    value = "";

    handleChange(event){
        this.value = event.target.value;
        this.updateparent(this.value);

    }

    updateparent(event){
        const selectedEvent = new CustomEvent('change', { detail: event});
        this.dispatchEvent(selectedEvent);
    }

}