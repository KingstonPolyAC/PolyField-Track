# PolyField Track

**Results display software for athletics competitions.**

Developed by [PolyField](https://www.polyfield.co.uk) part of [Kingston Athletic Club and Polytechnic Harriers (KACPH)](https://www.kingstonandpoly.org), PolyField Track connects to FinishLynx and Timetronics photo finish systems and distributes live results to browser-based display screens across a local network — no additional software required on the display device.

---

## Key Features

- **Live results distribution** — watches FinishLynx `.lif` files and Timetronics `.res`/`.txt` files, pushing updates to connected screens in real time
- **Layout Builder** — drag-and-drop canvas with 17 configurable widget types; build and save multiple layouts for different events
- **Live Scoreboard** — dedicated full-screen scoreboard page accessible on any LAN device at `/scoreboard`
- **Screen Registry** — assign specific layouts to individual screens; manage all connected displays from the desktop panel
- **Running Clock** — integrates with FinishLynx via the LSS UDP protocol (port 5001) for live race clock and event name display
- **Start List support** — imports athlete start lists from FinishLynx `.evt` schedule files
- **RAZA Scoring** — built-in disability athletics scoring (2026 WPA formula) linked to `.evt` athlete classification data
- **Remote Control** — browser-based remote panel at `/remote` for controlling display mode from anywhere on the network
- **Display Modes** — results, text overlay, image, and clock-only modes switchable from the desktop or remote panel
- **Club Abbreviations** — customisable club acronym table for clean scoreboard display
- **Multi-language** — localised result labels (EN, FR, ES)
- **macOS and Windows** — single native binary, no installer required

---

## Download

See the [Releases](https://github.com/KingstonPolyAC/PolyField-Track/releases) page for the latest version.

Each release includes:
- `PolyField-Track-mac.zip` — macOS application
- `PolyField-Track.exe` — Windows executable
- `polyfield.lss` — FinishLynx LSS script for running clock integration
- `polyfield-wind.lss` — FinishLynx LSS script for wind integration

---

## Requirements

- FinishLynx or Timetronics photo finish system on the same network
- macOS 12+ or Windows 10/11
- Display devices require only a modern web browser

---

## Licence

PolyField Track is free for **non-commercial use** under the [CC BY-NC 4.0](./LICENSE) licence.

**Commercial use** — including timing companies, event management businesses, and commercial results or broadcast services — requires a separate commercial licence.

For commercial licensing enquiries: [support@polyfield.co.uk](mailto:support@polyfield.co.uk)

---

*PolyField Track is developed and maintained by PolyField by KACPH (Kingston Athletic Club and Polytechnic Harriers).*
