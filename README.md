# Tasklist
Show all tasks for a note and any associated tasks elsewhere in vault. 
A note can represent an entire project (or person, or anything), which can have tasks in other pages, subnotes, or subprojects.

## What you get
- A single place with all the tasks related to a note (or project) consolidated from the entire vault.

# Install
## Requirements
- [dataview](https://blacksmithgu.github.io/obsidian-dataview/) plug-in
- Not required, but highly recommended, [tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) plug-in.
- [meta-bind](https://github.com/mProjectsCode/obsidian-meta-bind-plugin) plugin required for easy toggle of “Include Tagged Pages”, but not necessary.
## Files
- Copy `tasklist.js` into your vault
	- I suggest you put it in a folder named `scripts` or wherever you like.
- If you want the right-hand sidebar render to be smaller, install `smaller_class.css` as an Obsidian *CSS snippet*.
- Optional, but this is my preferred usage: Copy `Tasks.md` into your vault.
	- And *pin* it in the right-hand sidebar (and select *Reading View* mode).
 	- This will then show the tasks related to the note in the main panel. 
# Usage
## Simplest usage
Include a `dataviewjs` code-block in the note like so, and it’ll show you the tasks associated with the current note.
````
```dataviewjs
await dv.view("tasklist");
```
````

Or, you can use the provided `Tasks.md` file, and pin it on the right-hand sidebar in Reading View mode. That will show all tasks (and associated tasks from the vault) for any note you are on, and keep easy access.
## Conventions
You must adhere to these conventions for this to work:
- `aliases` within the note’s properties should be:
	- first, the note's identifier tag. e.g. `#projects/myproject`
	- second, any number of words that identify the note, e.g. `My Project`
	- Frontmatter ("Properties") example: `aliases: ["#projects/myproject", "My Project", "other additional", "aliases ok"]`, where the first alias is the tag that identifies this project or person. (tag can also not be first, but that may break other things)
- Tasks from across the vault (in any note) containing any of the aliases will be included
	- `- [ ] Call so-and-so #projects/myproject`
	- `- [ ] Call so-and-so for My Project`
- All tasks in any note containing the tag or alias will be included, unless that note contains the tag `#ignoretasks` or `#multiproject`
- Tasks can have standard formatting, with the following feature:
	-  Any of the following "priority" emojis will affect the sorting: 🔺,⏫,🔼,(no emoji=no priority),🔽,⏬.
- If a task contains multiple aliases, using a tag in the tasks will supercede the non-tag aliases, and only be shown in the tasklist for that tag. (This helps if you have aliases that are too generic and catch many undesired tasks).
### Including or excluding tasks
Optional frontmatter or inline fields `includeTasksFrom` and `excludeTasksWith`
- `includeTasksFrom <note>[,...]`
    - syntax in frontmatter (note outer brackets and links in quotes): `includeTasksFrom: ["[[link1]]","[[link2]]"]`
    - syntax inline (note double `:`, and no outer brackets or quotes): `includeTasksFrom:: [[link1]],[[link2]]`
- `excludeTasksWith <str>[,...]`
    - syntax in frontmatter (note outer brackets): `excludeTasksWith: ["str1","str2"]`
    - syntax inline (note double `:`, and no outer brackets): `excludeTasksWith:: "str1","str2"`
- Notes with tag `#ignoretasks` will prevent any task on that page to be listed.
- Notes with tag `#multiproject` will hide all its tasks, except those tagged with our tag.

## Usage with customization parameters
Include a `dataviewjs` code-block in the note (with all options, all optional):
````
```dataviewjs
await dv.view("tasklist", {thePage: "Optional page name", 
	tasksFromThisPage:true, taggedTasksFromAnywhere:true, 
	tasksFromTaggedPages:true, tasksFromIncludedPages:true, 
	ifTaskTaggedThenOnlyIfOurTag:true, includeSection:true, summary:true});
```
````

### Customization
All parameters are optional (defaults to current page, and all the rest of the params to true if not included)
- `thePage`: name of the note to use as source of information to collect tasks, if omitted, defaults to current page.
- `tasksFromThisPage`: if true, include tasks from the thePage itself
- `taggedTasksFromAnywhere`: if true, include tasks from all other pages, where the task's text matches any of the aliases of thePage, which ought to include a tag, and also could include any string
- `tasksFromTaggedPages`: if true, bring in all tasks from any page that contains thePage's associated tag (the first alias with `#`), unless they contain either #multiproject or #ignoretasks tags. 
	- Note!! If any task on a page is marked with our tag, it will bring in ALL tasks from that page (unless the note contains either #multiproject or #ignoretasks tags).
- `tasksFromIncludedPages`: if true, look at includeTasksFrom field, and pull tasks in from those pages.
- `ifTaskTaggedThenOnlyIfOurTag`: if true, will only include a task if a) it contains our tag, or b) contains no tag, and matches one of our aliases. This allows us to filter out tasks that may match our non-tag alias by accident. 
	- For example, say I have the following task: 
	  `- [ ] Call George Clooney #project/MyBigMovie` 
		- "George" is an alias to my brother, but I don't want that match the tasks having to do with "George Clooney", so I tag the George Clooney tasks with a tag for that project #project/MyBigMovie, and it will no longer show up in my brother's tasklist because he has a different tag (e.g. #family/brother). 
	- In other words, if a task has been found which matches a non-tag alias (simple words) of thePage, it will be ignored if it contains a tag that isn't thePage's tag. 
- `includeSection`: if true, will group tasks by section, as well as file 
- `summary`: if true, show "From (Page): 25 tasks" or "No available tasks." summary line (e.g. turn off (set to false) when doing concatenating task lists from various files)

In the code itself, you can customize `avoidFolders` to hide tasks in notes from particular folders.

# Known Issues
- If a page has a task with a tag, even if completed, then all tasks on that page will be seen when `tasksFromTaggedPages=True` in a query from the "master" page of that tag. The desired result would be that only that task be recognized as tagged, not the whole page (and thus every task). This can be mitigated by using the `#ignoretasks` and `#multiproject` tags on the note with the tasks.
- Sometimes, the `Tasks.md` page momentarily looses track of the page you are on. If so, then click in the note you want to use, and invoke the command `Dataview: Force refresh all views and blocks`. I suggest you map `Cmd-R` to the command.
- Dataview refreshes automatically every time you update a file (even as you type), and this can be annoying and loose your view on the current file. The Dataview author is aware of this limitation, and is working on an major rewrite. To mitigate this: use `Tasks.md` in the sidebar, or create a header above the tasklist code-block in the current note, and fold the header collapsed until needed.
