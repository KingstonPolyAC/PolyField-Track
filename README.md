# PolyField Track

A results viewing and display software package for FinishLynx and TimeTronics Photo Finish systems.

- Runs on **Windows** and **Mac** as a desktop device linked to your photo finish results folder.
- Enables a **web based user interface** for any device on the network to display results in multiple formats and a **self service kiosk mode** for athletes to search their own results.
- Keeps the operator in control, only displaying once a result is saved to ensure positive validation of results prior to display. Multiple saves are supported, enabling early display of athletes in distance races, or display once the top 3 athletes have performances assigned.
- Available in **English, French and Spanish**.

**Download from** - [www.polyfield.co.uk](https://www.polyfield.co.uk)
**PDF Manual:** - [docs/PolyField-Track-Manual.pdf](docs/PolyField-Track-Manual.pdf)


## How It Works

1. **Set the results directory** - this is the folder FinishLynx or TimeTronics will save your results into (LIF etc). Click the button in the top right corner, **"Select Results Folder"**.
2. Once set, the web user interface will build and access details will be displayed.
3. You only need **one instance** of the software to be running - multiple displays are supported, with the maximum determined by your network and the computer running the software.
4. You can change the results folder at any time by clicking **"Change Folder"** in the top right.

## Control Panel

Whilst the desktop app can perform all functions, it is advisable to leave it on the control panel screen and use a separate device or second screen connected to the web interface, leaving you in control of the Screensaver and Text display functions.

### Display Text & Screensaver

These enable you to display graphics or text messages on all connected displays, engaging your spectators. Sponsor graphics etc. can be shown this way.

- **Link Image** - attach a custom screensaver image (PNG format preferred)
- **Screensaver** - activate image display mode
- **Display** - send text messages to all connected screens
- **Clear** - cancel the graphics, or wait for the next result file save which will automatically override the graphics and return to result displays

### Text Size

The default text size can be adjusted with the **+** and **-** buttons.

### Rotation Mode

Determines how results with more than 8 competitors will display:

| Mode | Behaviour |
|------|-----------|
| **Scroll** | Top 3 rows are locked, rows 4+ will scroll through the remaining competitors |
| **Page** | Results will paginate showing 1-8, then 9-16, etc. on a rotation basis |
| **Scroll All** | All 8 rows will scroll through the competitors with no locked positions |

### Full Screen

- **Full Screen Table** - maximise results on the desktop display
- **Full Screen App** - maximise the entire window
- Press **Esc** to exit either mode

### Web Views

The web views are best accessed through the web interface using the access details provided at the top of the desktop app.

- **Multi Result Mode** - open the multi-result grid view
- **Athlete Search** - open the self-service athlete kiosk

### Language

The interface language can be changed at any time from the control panel. Currently supported languages:

| Language | Code |
|----------|------|
| English  | EN   |
| French   | FR   |
| Spanish  | ES   |

## Multi Result View

The multi result view displays results in a **2x2** or **3x2** matrix layout.

- Can be configured to show the **latest results** or **rotate** through all available results
- Text size can be adapted
- **Full screen mode** hides the toolbar - any mouse movement will temporarily show the toolbar before hiding on inactivity again
- Results will paginate with a display of the current page at the top for tracking
- The **search icon** will take you to the self-service results kiosk

This can also be accessed by directly browsing to `http://<IP-ADDRESS>:3000/results`

## Athlete Search (Kiosk Mode)

A self-service screen where athletes can look up their own results.

1. The screen displays a **search bar** where an athlete can search by **name** or **bib number**, populating a dropdown list
2. Clicking on any name will display **all performances** of that athlete in the current results directory
3. Clicking on any **result card** will display that result in **full screen** for photo opportunities
4. **Reset** will clear the current search
5. The **Back** button in the top left will return to the search field

Access directly at `http://<IP-ADDRESS>:3000/athlete`

## Speed Dashboard

The speed dashboard calculates and displays the **average speed** of each athlete based on the event distance and their recorded time. Ideal for sprints and hurdles.

- Displays each athlete's speed in **km/h** alongside a visual bar chart
- **Men's and Women's World Record** pace bars are shown for reference, allowing instant comparison
- Select any race from the dropdown to view its speed breakdown
- Accessible from the clock icon in the Results navigation bar, or directly at `http://<IP-ADDRESS>:3000/speed`

## Live Running Clock

PolyField Track can display the **FinishLynx running clock** live on all connected screens, updated in real time as the race progresses. The clock shows hundredths of a second, interpolated smoothly between packets so the display never stutters.

### How it works

- FinishLynx sends the current run time and event name to PolyField via **UDP** using a custom scoreboard script
- The desktop app receives packets on **port 5001** and serves the current state via its local API
- All web-connected displays poll this API and interpolate forward at ~60fps for a smooth hundredths display
- When the photocell fires, the clock freezes at the **exact finish time**
- The clock reverts automatically to results display when the next LIF file is saved

### FinishLynx Setup

1. Copy `polyfield-clock.lss` (included in each release) to your FinishLynx machine at `C:\Lynx\`
2. In FinishLynx, add a new **Scoreboard** entry with the following settings:

| Setting | Value |
|---------|-------|
| Script | `polyfield-clock.lss` |
| Port | Network (UDP) |
| IP Address | PolyField machine IP (or `255.255.255.255` to broadcast on LAN) |
| Port Number | `5001` |
| Running Time | Normal |
| Results | Off |

> **Note:** Requires the **NCP (Network COM Port)** plugin — bundled free with FinishLynx 13.00 and later.

### Displaying the clock

- **Desktop:** Use the **Clock Show** button in the control panel to display the clock in the scoreboard preview window. It behaves like the screensaver — new results automatically switch back to the results display.
- **Web / LAN displays:** Click the **🕰 clock button** in the bottom navigation bar of the Results view to open the full-screen clock page, or browse directly to `http://<IP-ADDRESS>:3000/clock`. This page is also suitable for use as an **OBS browser source** overlay.

The clock page displays:
- Event name
- Running time in **hundredths of a second** (e.g. `12.45`, `1:03.27`)
- **UNOFFICIAL TIME** label pinned to the bottom

## Building from Source

### Prerequisites

- [Go](https://golang.org/dl/) (1.19 or later)
- [Node.js](https://nodejs.org/) (16 or later)
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)

### Build Commands

**macOS (universal — Intel + Apple Silicon):**
```bash
wails build -platform darwin/universal -o PolyField-Track-mac
```

**Windows:**
```bash
wails build -platform windows/amd64 -o PolyField-Track-windows
```

> Wails uses the new Go WebView2Loader by default on Windows. If you encounter issues, add `-tags native_webview2loader` to use the legacy loader.

## Support

- **Website:** [www.polyfield.co.uk](https://www.polyfield.co.uk)
- **Email:** support@polyfield.co.uk
- **PDF Manual:** See [docs/PolyField-Track-Manual.pdf](docs/PolyField-Track-Manual.pdf)
