# CB_Logger - Custom log framework
Salesforce logging tool powered by Platform Events and Big Objects.<br/>
[![Youtube Video](https://img.youtube.com/vi/5IjjTvt1Hlk/0.jpg)](https://www.youtube.com/watch?v=5IjjTvt1Hlk)

A log based on Big Objects that is called from apex for a variety of log needs.<br/>
“SUCCESS”, “FAIL”, “LOG”, “CALLOUT_RETRY”, “EXCEPTION” and more….<br/>
In apex we can use the CB_Logger class and by calling a simple method to determine the log type, subject and body.<br/>
The log is initially a platform event which is added to a list of event logs, and we either publish immediately or at the end of the transaction (inside our trigger framework using a single call to the publish method per transaction).<br/>
Once the event is published, the event trigger picks it up and one at a time we convert them into big objects.<br/> At this point, we make sure to add a sequence number for each log in the list, because big objects can be considered duplicates and overwrite each other if the index fields are not unique.<br/>
The reason for publishing a platform event and not writing directly to the big object is because you cannot mix dml of sObjects with big objects.<br/> By creating a platform event, this starts a new transaction where we can commit the big objects without receiving such dml errors.<br/>
Once the objects are committed, we can then go to the CB_Logger UI, and filter by date, log type, or subject.<br/>
You can expand the message to view all the details, and if there is something that needs to be shared with a team member you can use the email button in the UI to choose the recipient from a pre-determined list (managed via custom label) and send them a copy.<br/>

Install CB_Logger package in your org
-------------
<a href="https://login.salesforce.com/packaging/installPackage.apexp?p0=04t4L0000000tGh">
Install Package.
</a>

Documentation
-------------
To log a custom log, use the following method:
```javascript
CB_Logger.log(LogType,Subject,Body);
```

To publish saved logs, use the following method:
```javascript
CB_Logger.publish();
```
*this method will publish all the logs saved till this point in the running instance.
<br/><br/>
How to add/change log types:<br/>
Go to "LogType" class and add or change the log enum list.
<br/><br/>
The following log type are prebuilt:
<table>
	<thead>
		<th>Log type</th>
	</thead>
	<tbody>
		<tr>
			<td>
				LOG
			</td>
		</tr>
		<tr>
			<td>
				SUCCESS
			</td>
		</tr>	
		<tr>
			<td>
        FAIL
			</td>
		</tr>	
		<tr>
			<td>
        ALERT
			</td>
		</tr>
    		<tr>
			<td>
        CALLOUT_FAIL
			</td>
		</tr>
     <tr>
			<td>
        CALLOUT_SUCCESS
			</td>
		</tr>
	</tbody>
</table>
<br/>
The following log methods are available:
<table>
	<thead>
		<th>Type</th>
    <th>method</th>
<th>Comments</th>
	</thead>
	<tbody>
		<tr>
			<td>
				log
			</td>
			<td>
				log(LogType type, String subject, String Body);
			</td>
			<td>
				Adds a new platform event object to the prepublished list. *You can specify the log type.
			</td>
		</tr>
		<tr>
			<td>
				log
			</td>
			<td>
				log(String type, String Body);
			</td>
			<td>
				Adds a new platform event object with Type set to "LOG" to the prepublished list.
			</td>
		</tr>	
		<tr>
			<td>
        error
			</td>
			<td>
        - error(String Subject, Object Body);
								<br/>
- error(String Subject, Exception e);
			</td>
						<td>
				Adds a new platform event object with Type set to "ERROR" to the prepublished list.
			</td>
		</tr>	
		<tr>
			<td>
        alert
			</td>
			<td>
        alert(String Subject, Object Body);
			</td>
						<td>
				Adds a new platform event object with Type set to "ALERT" to the prepublished list.
			</td>
		</tr>
    		<tr>
			<td>
        success
			</td>
			<td>
        success(String Subject, Object Body);
			</td>
			<td>
				Adds a new platform event object with Type set to "SUCCESS" to the prepublished list.
			</td>
		</tr>
		    		<tr>
			<td>
        live
			</td>
			<td>
        - live(String Subject, Object Body);
				<br/>
- live(Object Body);
			</td>
			<td>
				Publish immediately a new Platform Event object with Type set to "LIVE". *for type "LIVE" logs,no Big Object record will be created.
			</td>
		</tr>
	<tr>
			<td>
        Invocable
			</td>
			<td>
        InvocableLog(List<String> params);
			</td>
			<td>
				An Invocable method that allows you to create logs from flows. In order to use this method, you send in the parameter a List of Strings, each String contains the following: <br/> [Type]~[Subject]~[Message]<br/> The method splits the String for each '~' and builds a Platform Event from the resulted list.
			</td>
		</tr>
		    		<tr>
			<td>
        publish
			</td>
			<td>
        publish();
			</td>
			<td>
				Publish immediately the prepublished list.
			</td>
		</tr>
	</tbody>
</table>
<br/>
How to get to the Logger after installing the package:<br/>
Go to the App Drawer -> Choose "CB_Logger".


New Features
-------------
Version 1.10:<br/>
* New log for exceptions.  <br/> CB_Logger.error(String Subject, Exception e)<br/>
* New short live log. <br/> CB_Logger.live(Object Body)<br/>
* New message filter option.
* Added support for multiple logs, now will join logs with the same subject, minimizing the amount of platform events used on single instance.

Version 1.7 - 1.9:<br/>
* Changed lwc names to include "cb" prefix.<br/>
* New "Time Filter" option when filtering via dates.<br/>

Version 1.6:<br/>
* New "Live Mode": a new mode in the logger, accessible via toggle button in UI, that displays platform event logs that arent been saved as big object records.
This feature allows you to get logs live, making debugging easier without the standard trace-log process.<br/>
* Invocable method: a new log type allows you to create a log in flows.<br/>


Why we made this
-------------
We, the Salesforce developers team at Cellebrite, are working very hard to develop solutions, tools and frameworks for our users (internal users and external customers). <br/>As you all know, Salesforce platform has evolved immensely in the past years, and continue to evolve and add new features with each release.<br/>
One issue we had issues with and didn’t evolve too much was logging.<br/>
Mainly answering these questions:<br/>
- What is happening in my org? Are the main business processes working without issues?
- Are there any errors?
- Who was the logged-in user?
- What record was being created/updated when it happened?
- Did our scheduled job finish?
- Did a callout was successful?
And many more

Apex logs are useful but you will need to activate a debug log for each user, there is a limit of 24 hours per activation and there is a limit on log file size. Moreover, you will need to be experienced in log reading to get value from it.

Enter our own “CB_Logger”.

