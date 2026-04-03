# PolyField Track

**Results display software for athletics competitions.**

Developed by [Kingston Athletic Club and Polytechnic Harriers (KACPH)](https://www.kacph.org.uk), PolyField Track connects to FinishLynx and Timetronics photo finish systems and distributes live results to browser-based display screens across a local network — no additional software required on the display device.

---

## Key Features

- **Live results distribution** — watches FinishLynx `.lif` files and Timetronics `.res`/`.txt` files, pushing updates to connected screens in real time
- **Layout Builder** — drag-and-drop canvas with 17 configurable widget types; build and save multiple layouts for different events
- **Live Scoreboard** — dedicated full-screen scoreboard page accessible on any LAN device at `/scoreboard`
- **Screen Registry** — assign specific layouts to individual screens; manage all connected displays from the desktop panel
- **Running Clock** — integrates with FinishLynx via the LSS UDP protocol (port 5001) for live race clock and event name display
- **Start List support** — imports athlete start lists from FinishLynx `.evt` schedule files
- **RAZA Scoring** — built-in wheelchair athletics scoring (2025 WPA formula) linked to `.evt` athlete classification data
- **Remote Control** — browser-based remote panel at `/remote` for controlling display mode from anywhere on the network
- **Display Modes** — results, text overlay, image, and clock-only modes switchable from the desktop or remote panel
- **Club Abbreviations** — customisable club acronym table for clean scoreboard display
- **Multi-language** — localised result labels (EN, FR, DE, ES, IT, NL, PT, SV, DA, NB, FI, PL, CS, SK, RO)
- **macOS and Windows** — single native binary, no installer required

---

## Download

See the [Releases](https://github.com/KingstonPolyAC/PolyField-Track/releases) page for the latest version.

Each release includes:
- `PolyField-Track-mac.zip` — macOS application
- `PolyField-Track.exe` — Windows executable
- `polyfield.lss` — FinishLynx LSS script for running clock integration

---

## Documentation

The full user guide is included in this repository: [PolyField-Track-Manual.pdf](./PolyField-Track-Manual.pdf)

---

## Requirements

- FinishLynx or Timetronics photo finish system on the same network
- macOS 12+ or Windows 10/11
- Display devices require only a modern web browser

---

*PolyField Track is developed and maintained by Kingston Athletic Club and Polytechnic Harriers (KACPH).*
