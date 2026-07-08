# Test Reporting Desktop

Electron + React interface for the **Execution Reporting** page.

## Run

```powershell
cd .\TestReporting\desktop
npm install
npm run desktop
```

## Features

- Load multiple `JsonReport.json` files from the desktop app.
- Merge execution results into one reporting table.
- Search by testcase ID or testcase name.
- Filter by execution status.
- Sort, paginate, expand rows, and view step details.
- Edit only `Tester Conclusion` and `Analysis Status`.
- Preserve source filename for each loaded execution.
- Includes a collapsible AI Assistant placeholder panel.
