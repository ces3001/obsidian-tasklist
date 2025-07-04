const ver = "1.4b"
// Documentation: https://github.com/ces3001/tasklist/blob/main/README_tasklist.md
// to include in pages (simplest): 
// ```dataviewjs
// await dv.view("tasklist");
// ```
// to include in pages (with all options, all optional):
// ```dataviewjs
// await dv.view("tasklist", {thePage: "Optional page name", tasksFromThisPage:true, taggedTasksFromAnywhere:true, tasksFromTaggedPages:true, tasksFromIncludedPages:true, tasksFromChildrenPages:true, ifTaskTaggedThenOnlyIfOurTag:true, includeSection:true, summary:true});
// ```

// defaults
let debug = false;
let thisPage = await dv.current();
let tasksFromThisPage = true;
let taggedTasksFromAnywhere = true;
let tasksFromTaggedPages = true;
let tasksFromIncludedPages = true; 
let tasksFromChildrenPages = true;
let tasksFromLinkedPages = false;
let ifTaskTaggedThenOnlyIfOurTag = true;
let avoidFolders = ["templates","Health"]; // default list of folders to avoid looking for tasks
let excludeTasksWith = thisPage.excludeTasksWith || []; // list of strings that prevents a task from being included 
let excludeTasksFrom = thisPage.excludeTasksFrom || [];
let includeSection = true; // in the output, include section where the task lives
let summary = true;
// override any defaults from parameters passed
if (typeof input !== "undefined") {
	if (typeof input.summary !== "undefined") { summary = input.summary }
	if (typeof input.debug !== "undefined") { debug = input.debug }
	if (typeof input.tasksFromThisPage !== "undefined") { tasksFromThisPage = input.tasksFromThisPage }
	if (typeof input.taggedTasksFromAnywhere !== "undefined") { taggedTasksFromAnywhere = input.taggedTasksFromAnywhere }
	if (typeof input.tasksFromTaggedPages !== "undefined") { tasksFromTaggedPages = input.tasksFromTaggedPages }
	if (typeof input.tasksFromIncludedPages !== "undefined") { tasksFromIncludedPages = input.tasksFromIncludedPages }
	if (typeof input.tasksFromChildrenPages !== "undefined") { tasksFromChildrenPages = input.tasksFromChildrenPages }
	if (typeof input.tasksFromLinkedPages !== "undefined") { tasksFromLinkedPages = input.tasksFromLinkedPages }
	if (typeof input.ifTaskTaggedThenOnlyIfOurTag !== "undefined") { ifTaskTaggedThenOnlyIfOurTag = input.ifTaskTaggedThenOnlyIfOurTag }
	if (typeof input.avoidFolders !== "undefined") { avoidFolders = input.avoidFolders }
	if (typeof input.excludeTasksWith !== "undefined") { excludeTasksWith = input.excludeTasksWith }
	if (typeof input.excludeTasksFrom !== "undefined") { excludeTasksFrom = input.excludeTasksFrom }	
	if (typeof input.includeSection !== "undefined") { includeSection = input.includeSection }
	if (typeof input.thePage !== "undefined") { 
		thisPage = dv.page(input.thePage)
		if (!thisPage) {
			dv.span(`**ERROR** No page ${input.thePage}`);
			return 
		}
		if (summary) { dv.header(2,"From " + thisPage.file.link + " " + 
						(tasksFromTaggedPages?"plus tagged":"") + ": \n") } 
	}
}

if (debug) { dv.span(">[!DEBUG]\n") }

// Initialize myAliases and myTag
let myAliases = []
let myTag = null
try{ 
	if (thisPage.aliases) {
		if (Array.isArray(thisPage.aliases)) {
			myAliases = thisPage.aliases 
		} else {
			myAliases = Array(thisPage.aliases) 
		}
		for (let i = 0; i < myAliases.length; i++) {
			if (myAliases[i] == null) {
				dv.paragraph("One of the aliases is *null*, please check to make sure tags are in quotes in the `aliases:` property.")
			}
			if (String(myAliases[i]).startsWith("#")) {
				myTag = String(myAliases[i]);
				break;
			}
		}
	}
} catch(e) { 
	if (debug) { dv.span(`Error caught ok. No aliases. ${e}`) }
	myAliases = []
	myTag = null
}

// Add note name as an alias
if (!myAliases.includes(thisPage.file.name)) {
    myAliases.push(thisPage.file.name); 
}
if (debug) { dv.span("> myAliases:" + myAliases + " myTag: " + myTag + "\n") }

function isWordInString(word, str) {
  const pattern = new RegExp(`(^|\\s|[\\p{P}])${word}(\\s|[\\p{P}]|$)`, 'ui');
  return pattern.test(str);
}

// Function to extract task ID from text (format: 🆔 jyqcuu or 🆔jyqcuu)
function getTaskId(task) {
	const match = task.text.match(/🆔\s*([a-zA-Z0-9]{6})/);
	return match ? match[1] : null;
}

// Function to extract blocked task ID from text (format: ⛔ s1d3dn or ⛔s1d3dn)
function getBlockedById(task) {
	const match = task.text.match(/⛔\s*([a-zA-Z0-9]{6})/);
	return match ? match[1] : null;
}

// Function to check if a task is blocked by incomplete tasks
function isTaskBlocked(task, incompleteTaskList) {
	const blockedById = getBlockedById(task);
	if (!blockedById) return false; // Not blocked if no ⛔ indicator
	
	// Check if the blocking task ID exists in the incomplete task list
	for (let itask of incompleteTaskList) {
		let itaskId = getTaskId(itask);
		if (itaskId === blockedById) {
			return true; // Blocked because dependency is still incomplete
		}
	}
	return false; // Not blocked - dependency either completed or doesn't exist
}

let taskList = dv.array([])

// Tasks from this page
if (tasksFromThisPage && !thisPage.file.etags.includes("#ignoretasks")) { 
	try { // in a try loop in case no tasks.
	  tasksToAdd = thisPage.file.tasks
		.where(t => !t.completed &&
			dv.date(t.start) <= dv.date('today'))
	  taskList = taskList.concat(tasksToAdd)
	}
	finally {}
}

// tasks from other pages listed in `includeTasksFrom`
if (tasksFromIncludedPages && thisPage.includeTasksFrom) {
	for (let page of dv.array(thisPage.includeTasksFrom)) {
		let includeFile = dv.page(String(page).replace(/[\[\]]/g,"").replace(/\|(.+)/g,""))
		if (typeof(includeFile) !== "undefined") {
			if (!includeFile.file.etags.includes("#ignoretasks")) {
				taskList = taskList.concat(includeFile
					.file.tasks.where(t => !t.completed && dv.date(t.start) <= dv.date('today')));
			}
		} else {
			if (debug) { dv.span("<br>(Cannot include from '" + page + "', as it is not a file.)") }
		}
	}
}

// tasks from children pages (pages that have this page in their children property)
if (tasksFromChildrenPages && thisPage.children) {
	for (let page of dv.array(thisPage.children)) {
		let includeFile = dv.page(String(page).replace(/[\[\]]/g,"").replace(/\|(.+)/g,""))
		if (typeof(includeFile) !== "undefined") {
			if (!includeFile.file.etags.includes("#ignoretasks")) {
				taskList = taskList.concat(includeFile
					.file.tasks.where(t => !t.completed && dv.date(t.start) <= dv.date('today')));
			}
		} else {
			if (debug) { dv.span("<br>(Cannot include from '" + page + "', as it is not a file.)") }
		}
	}
}

// tasks in notes linked to from thisPage (outlinks)
if (tasksFromLinkedPages) {
	let outlinks = thisPage.file.outlinks
	if (outlinks) {
		for (let page of dv.array(outlinks)) {
			let includeFile = dv.page(String(page).replace(/[\[\]]/g,"").replace(/\|(.+)/g,""))
			if (typeof(includeFile) !== "undefined") {
				if (!includeFile.file.etags.includes("#ignoretasks")) {
					taskList = taskList.concat(includeFile
						.file.tasks.where(t => !t.completed && dv.date(t.start) <= dv.date('today')));
				}
			} else {
				if (debug) { dv.span("<br>(Cannot include from '" + page + "', as it is not a file.)") }
			}
		}
	}
}

// tasks including this tag or alias from this or other pages, except if page tagged #ignoretasks
if (taggedTasksFromAnywhere && myAliases) {
	taskList = taskList.concat(  
		dv.pages("-#ignoretasks") // ignore pages with #ignoretasks
		.where(p => (p.file.path != thisPage.file.path)) 
		.file.tasks.where(t => {
			if (t.completed || dv.date(t.start) > dv.date('today')) {
				return false; }
			if (ifTaskTaggedThenOnlyIfOurTag && t.text.includes('#') && myTag != null) { 
				// if it has a tag, only include this task if it has "our" tag, not tasks tagged with some other tag, even if it may match another non-tag alias of thePage.
				return t.text.toLowerCase().includes(myTag.toLowerCase());
			} else {
				return (myAliases.some(alias => isWordInString(alias,t.text)))
			}
		})
	)
}

// tasks from any page which contains this tag, except if tagged #multiproject or #ignoretasks
if (tasksFromTaggedPages && myTag != null) {  
  taskList = taskList.concat( 
	dv.pages(myTag + " and (-#multiproject and -#ignoretasks)")
		.where(p => (p.file.path != thisPage.file.path))
		//.sort(p => p.file.mtime, "desc")
		.file.tasks
			.where(t => !t.completed &&
				dv.date(t.start) <= dv.date('today')))}

// Remove those with any part in list of strings to exclude, unless it includes myTag
if (debug) { dv.span("Exclude: " + thisPage.excludeTasksWith) }
if (excludeTasksWith) {
	if (excludeTasksWith.length > 0) {
	// Loop through objects and remove elements where their .text attribute contains any of the strings to exclude, unless it includes myTag
		taskList = taskList.filter(t => {
			let myTagPresent = ((myTag != null) && (t.text.toLowerCase().includes(myTag.toLowerCase())));  // exclude (return false) depending on presence of myTag (present = true = don't exclude)
			if (myTagPresent) return true; // keep any task with myTag. Otherwise, check for exclusions to elim:
			for (let i = 0; i < excludeTasksWith.length; i++) {
				if (t.text.toLowerCase().includes(excludeTasksWith[i].toLowerCase())) { // we found exclusion string, "return false" (since myTag not present) to filter out of list					
					if (debug) { dv.paragraph(t.text + (myTagPresent?" -> exclusion candidate ("+excludeTasksWith[i]+") but included because myTag present":" -> excluded due to ("+excludeTasksWith[i]+") and myTag NOT present.")) }
					return false;
				}
			}
			if (debug) { dv.paragraph(t.text + " included.") }
			return true; // if we got here, no exclusions found, therefore include (return true to filter)
		});
	}
}

// Remove those from the list of excludeTasksFrom pages, unless it includes myTag
if (excludeTasksFrom) {
    taskList = taskList.filter(t => {
        // Keep task if it has myTag
        let myTagPresent = ((myTag != null) && (t.text.toLowerCase().includes(myTag.toLowerCase())));
        if (myTagPresent) return true;
        
        // Check if task's page is in the excludeTasksFrom list
        for (let page of dv.array(thisPage.excludeTasksFrom)) {
            let excludeFile = String(page).replace(/[\[\]]/g,"").replace(/\|(.+)/g,"")
            if (t.path === excludeFile) {
                if (debug) { dv.paragraph(`Task "${t.text}" excluded from ${excludeFile}`) }
                return false;
            }
        }
        return true;
    });
}

// Filter out blocked tasks
if (taskList.length > 0) {
	taskList = taskList.filter(t => !isTaskBlocked(t, taskList))
}

// OUTPUT
let base_header_num = 2
// print them out, make sure no dups, and sort by appearance in note
let count = 0;
if (taskList.length > 0) {
	// use the earliest line number as a sorting algorithm, since I generally use reverse chronological order in my notes.
	// And override with Priority indicators from Tasks plug-in (no field is associated with these in dataview, so must check text string)
	if (avoidFolders) {
	  taskList = taskList.filter(t => !avoidFolders.some(folder => t.path.includes(folder + "/")));
	}
	taskList = taskList
		.distinct(t => t)
		.sort(t => t.line)
		.sort(t => t.text.contains("🔺")?0:t.text.contains("⏫")?1:t.text.contains("🔼")?2:t.text.contains("🔽")?4:t.text.contains("⏬")?5:3) 
		.sort(t => -dv.page(t.path)?.file.mday)
		.sort(t => dv.page(t.path).file.name==thisPage.file.name?0:1);
		
	if (summary) { dv.span("*" + taskList.length + " tasks*\n") }
	if (includeSection) {
		const regex = /> ([^\]]+)/; // Default render for section is 'PAGENAME > SECTION'. Get the second part after '>' so we don't include the name of the document again.
		let section = null
		let page = null
		let sectionTaskList = []
		for (let t of taskList) {
			if ((sectionTaskList.length > 0) && 
			    ((page != t.path.toString()) || (section != t.section.toString()))) { // 
			    //dv.paragraph('Tasks thru #' + count)
				dv.taskList(sectionTaskList,false) // false = don't group by file
			}
			if (page != t.path.toString()) { // new page
				dv.header(base_header_num,dv.page(t.path).file.name + (dv.page(t.path).file.name==thisPage.file.name?" (this page)":""))
				page = t.path.toString()
				sectionTaskList = []
			}
			if (section != t.section.toString()) { // new section
				sectionTaskList = []
				section = t.section.toString()
				if (section.match(regex) != null) {
					let sectionname = section.match(regex)[1]
					let filename = dv.page(t.path).file.name
					if (filename.replace(":"," ").replace("."," ") != sectionname) { // If file only has top-level section, don't include as *for me* it's always the same as the filename
						let elimAfterLast = ' at ' // ' at ' removes time. ' - ' removes date
						let lastIndex = sectionname.lastIndexOf(elimAfterLast); 
						let link =  " [[" + filename + "#"+ sectionname + "|→]]"
						dv.header(base_header_num + 2, (lastIndex>-1?sectionname.substring(0, lastIndex):sectionname) + link)
					}
				} else {
					dv.header(base_header_num + 1, "No section")
				}
			}
			sectionTaskList = sectionTaskList.concat(t);
			count += 1;
		}
		dv.taskList(sectionTaskList,false)
	} else {
		dv.taskList(taskList,true) } // true = divide by file
} else {
	if (summary) { dv.span("*No available tasks*") }
}
