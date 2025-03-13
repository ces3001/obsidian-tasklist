---
cssclasses: smaller-right
taggedPages: true
---
# Tasks
Include Tagged pages `INPUT[toggle:taggedPages]`
```dataviewjs
let tasksFromTaggedPages = dv.page("Tasks").file.frontmatter["taggedPages"];
let activeFile = app.workspace.getActiveFile()?.name;
if (!activeFile || activeFile == "Tasks.md") {
	// track the previously active File, when we (Tasks.md) become the active file 
	//   (for example, when a task is checked off).
	activeFile = app.workspace.getLastOpenFiles()[0];
}
await dv.view("tasklist", {thePage: activeFile,
	tasksFromThisPage:true, 
	taggedTasksFromAnywhere:true, 
	tasksFromTaggedPages:tasksFromTaggedPages,
	tasksFromIncludedPages:true});
```
