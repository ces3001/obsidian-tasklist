# Tasklist
Show all tasks for a note and any associated links elsewhere in vault. 
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
- `summary`: if true, show "From <x>: 25 tasks" or "No available tasks." summary line (e.g. turn off (set to false) when doing concatenating task lists from various files)

In the code itself, you can customize `avoidFolders` to hide tasks in notes from particular folders.

# Known Issues
- If a page has a task with a tag, even if completed, then all tasks on that page will be seen when `tasksFromTaggedPages=True` in a query from the "master" page of that tag. The desired result would be that only that task be recognized as tagged, not the whole page (and thus every task). This can be mitigated by using the `#ignoretasks` and `#multiproject` tags on the note with the tasks.
- Sometimes, the `Tasks.md` page momentarily looses track of the page you are on. If so, then click in the note you want to use, and invoke the command `Dataview: Force refresh all views and blocks`. I suggest you map `Cmd-R` to the command.
- Dataview refreshes automatically every time you update a file (even as you type), and this can be annoying and loose your view on the current file. The Dataview author is aware of this limitation, and is working on an major rewrite. To mitigate this: use `Tasks.md` in the sidebar, or create a header above the tasklist code-block in the current note, and fold the header collapsed until needed.

# History

| Version | Date | Description |
| -- | -- | - |
|  1.0.10 | 2024-09-28 | Added link to section display |
|  1.0.9 | 2024-05-06 | Bug fix aliases, if `aliases: x` is used instead of `aliases: [x]` |
|  1.0.8 | 2024-04-16 | Add `avoidFolders`, and set default to `["templates"]` |
|  1.0.7 | 2024-04-14 | Fixed a bug in catching tasks with aliases (now uses myAliases instead of thispage.aliases). Also, now include page title as an honorary alias. |
|  1.0.6 | 2024-03-06 | Minor fix for below when no date in SectionName |
|  1.0.5 | 2024-02-22 | Cleaner display of sections for my style '## SectionName - Date at Time' to remove Time (or Date by changing `elimAfterLast`) |
|  1.0.4 | 2024-02-01 | Improved detection of aliases in tasks (and fixes bug for when alias appears at beginning of task text that wasn't getting recognized) |
|  1.0.3 | 2024-01-10 | Added greater support for `#ignoretasks` tag in pages |
|  1.0.2 | 2023-10-03 | Bug for files that don't have a header before the first task |
|  1.0.1 | 2023-08-14 | Don't display section if the same as filename to avoid duplicating display if only top-level section == filename exists |
|  1.0 |  | 2023-08-12 | Added grouping by section |
|  0.9.13 | 2023-07-11 | Tweaks to summary, to include `tasksFromTaggedPages` indicator |
|  0.9.12 | 2023-06-25 | Added "summary" parameter to show or hide "From x: 25 tasks" or "No available tasks." summary line (e.g. turn off when doing concatenating task lists from various files) |
|  0.9.11 | 2023-06-12 | Added sort by priorities using the following emojis (used by Tasks plug-in): 🔺,⏫,🔼,(no priority),🔽,⏬. Tasks with same priority level are sorted by line number (which, if using reverse-chronological entries like I do, sorts by date of entry, most recent first) |
|  0.9.10 | 2023-05-12 | Added parameter `ifTaskTaggedThenOnlyIfOurTag` to make the modification on version 0.9.7 optional |
|  0.9.9 | 2023-05-10 | Quick bug fix for pages that have aliases, but no #tag alias |
|  0.9.8 | 2023-04-23 | `tasksFromThisPage` now reinstated to perform as expected when false. It will avoid all tasks from `thisPage` even if tagged with myTag. (Previously a speed optimization disabled the false state) |
|  0.9.7 | 2023-04-21 | Added the tweak to avoid tasks that match some non-tag alias, if they contain a different tag.  |
|  0.9.6 | 2023-04-01 | Bug fix: made sure tag and string matching is non-case-sensitive. Also, for `excludeTasksWith`, force inclusion if the myTag (first alias) is present. |
|  0.9.5 | 2023-03-30 | Added `excludeTasksWith::` field. Excludes tasks that contain any of a set of strings. Ex: `excludeTasksWith:: "exclude me"` Ex: `excludeTasksWith:: "exclude me", "and me"`. <br> Changed "No tasks" to "No available tasks." |
|  0.9.4 | 2023-03-03 | Replaced "defer" with "start" for task field to comply with standard. |
|  0.9.3 | 2023-02-27 | Fixed an error when `includeTasksFrom` field references non-existent files |
|  0.9.2 | 2023-02-17 | Minor cosmetic touches when being passed a file |
|  0.9.1 | 2023-02-16 | Fix a bug when there are no aliases specified |
|  0.9 |  | 2023-02-07 | Added the parameter to specify a page (thePage) to pull the tasks from |
|  0.8.6 | 2023-01-08 | Added the feature to ignore pages with `#ignoretasks` tag (similar to ignoring pages with `#multiproject`) in the `tasksFromTaggedPages` section |
|  0.8.5 | 2022-12-22 | Bug fix myAliases |
|  0.8.4 | 2022-12-16 | Output "No tasks" if no tasks. |
|  0.8.3 | 2022-12-03 | bug fixes: if not a tag in aliases, or no aliases (so that we can still use this in any page, not just projects or people) |
|  0.8.2 | 2022-11-18 | bug fixes: `tasksFromIncludedPages` can now handle none, single, and a list |
|  0.8.1 | 2022-11-17 | bug fixes: `tasksFromIncludedPages`, can now handle inline and frontmatter fields.  |
|  0.8 |  | 2022-10-31 | Updated `tasksFromIncludedPages` per https://github.com/blacksmithgu/obsidian-dataview/discussions/1509#discussioncomment-3985539 |
|  0.7.3 | 2022-10-26 | Changed defaults, and added optimization notes and changed behavior taggedTasksFromAnywhere to include current page in an optimization compromise. <br> Currently, tasksFromIncludedPages only works from frontmatter, and is really slow. I thought I had gotten it to work with inline syntax, but no longer works.  |
|  0.7.2 | 2022-08-01 | Added capacity to look at `[includeTasksFrom:: [[link]],[[link2]]]` so that links update in page when destination file is renamed. Previously, was static string in the frontmatter. |
|  0.7.1 | 2022-07-22 | First version to be standalone js file and not embedded dataviewjs code in notes. |
