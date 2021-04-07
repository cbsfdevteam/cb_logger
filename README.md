# Recoding custom logs with Platform Events
Salesforce logging tool powered by Platform Events and Big Objects.

Documentation
-------------
A log based on Big Objects that is called from apex for a variety of log needs.
“SUCCESS”, “FAIL”, “LOG”, “CALLOUT_RETRY”, “EXCEPTION” and more….
In apex we can use the CB_Logger class and by calling a simple method to determine the log type, subject and body.
The log is initially a platform event which is added to a list of event logs, and we either publish immediately or at the end of the transaction (inside our trigger framework using a single call to the publish method per transaction).
Once the event is published, the event trigger picks it up and one at a time we convert them into big objects. At this point, we make sure to add a sequence number for each log in the list, because big objects can be considered duplicates and overwrite each other if the index fields are not unique.
The reason for publishing a platform event and not writing directly to the big object is because you cannot mix dml of sObjects with big objects. By creating a platform event, this starts a new transaction where we can commit the big objects without receiving such dml errors.
Once the objects are committed, we can then go to the logger UI, and filter by date, log type, or subject.
You can expand the message to view all the details, and if there is something that needs to be shared with a team member you can use the email button in the UI to choose the recipient from a pre-determined list (managed via custom label) and send them a copy.


Install CB_Logger
-------------
<a href="https://login.salesforce.com/packaging/installPackage.apexp?p0=04t4L000000gawa">
Install Package.
</a>

Why we made this
-------------
We, the Salesforce developers team at Cellebrite, are working very hard to develop solutions and frameworks for our users (internal users and external customers). As you all know, Salesforce platform has evolved immensely in the past years, and continue to evolve and add new features with each release.
One issue we had issues with and didn’t evolve too much was logging.
Mainly answering these questions:
-What is happening in my org? Are the main business processes working without issues?
-Are there any errors?
-Who was the logged-in user?
-What record was being created/updated when it happened?
-Did our scheduled job finish?
-Did a callout was successful?
And many more

Apex logs are useful but you will need to activate a debug log for each user, there is a limit of 24 hours per activation and there is a limit on log file size. Moreover, you will need to be experienced in log reading to get value from it.

Enter our own “CB_Logger”.

