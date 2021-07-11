export const tableColumns = [{
    label: 'Type',
    type: 'text',
    fieldName: 'Type__c',
    cellAttributes: {
        class: {
            fieldName: 'CSSClass'
        }
    }
},
{
    label: 'Subject',
    fieldName: 'Subject__c'

},
{
    label: 'Message',
    fieldName: 'Message__c'
},
{
    label: 'Date',
    fieldName: 'Date__c',
    type: 'date',
    typeAttributes: {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    },
    sortable: true
},
{
    label: 'User',
    fieldName: 'User__c'
},
{
    label: 'ACT',
    type: 'action',
    typeAttributes: {
        rowActions: [{label: 'Details',name: 'show_details'}, ]
    }
},
];