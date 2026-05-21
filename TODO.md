# Open Todos
Code Agent Instructions:
This file contains all open todos, which include features and bugs. Once you have a resolved a task, please move them to completed todos.

## Features

### Small Effort
~~All complete~~

### Medium Effort
- Prios -> Give prios a due date & time and integrate them into the today section of Mission control. Also enable notifications, that also work for PWAs on iOS.

### Big Effort
- Overall app (Needs to be refined) -> Transform project into a expo project

### App (Big effort, still needs to be refined)
- Transform into Expo App
- App should still access the service on the web, but have a sync function, to also work offline

## Bugs
- Top Bar -> Make it possible to change the order of the shown contexts

## Misc
- Docs (every time) -> Update docs and CLAUDE.md
- Logo -> Update and make it look prettier
- Data storage -> Persistent storage folder / configurable DB path (Docker volume reliability)
- Calendar and Todos (Don't do ri) -> Give option to maybe connect to Services like Google Calendar or iCloud

# Completed Todos

### v0.3.0
- Multiple priority lists per context — named tabs in Priorities widget, Main tab for ungrouped todos, inline create/rename/delete.
- Backup & restore — export/import JSON from Settings panel.
- Stability — standardised auth checks, contextId ownership validation, race condition fix, AbortController in modal.

### v0.2.0
- Micro Context Page -> Create a peek feature (modal overlay, full widget dashboard, no promotion needed).
- Mission Control -> "Today" section — cross-context list of todos due today / overdue / high-priority, sortable.
- Macro Context -> Widget resize (half/full width toggle per widget).
- Macro Context -> Edit layout mode (drag/resize/toggle bar gated behind button).
- Macro Context -> Inline priority picker (H/M/L pills, no list-jumping).
- First-run signup flow — no manual DB inserts needed.

### v0.1.x — Small Effort (all)
- Macro Context -> Make prio list entries editable.
- Macro Context -> Give option for title of notes.
- Mission Control & Macro Context -> Have a Mantra Widget.
- Settings -> Show Version Number of software
- Macro Context -> Widget drag-to-reorder.

