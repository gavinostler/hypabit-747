!!! created with claude... i dont want to spend 900 years building a custom 747 !!!

# Hypabit 747

An enhancement mod for the stock Boeing 747-8 in Microsoft Flight Simulator 2024.

Instead of replacing the aircraft, Hypabit 747 adds apps to the stock 747-8's EFB tablet. The aircraft itself (model, flight model, systems and Working Title avionics) stays exactly as Microsoft and Working Title ship it, so updates to the stock aircraft keep working.

## Apps

| App | Status | What it does |
|---|---|---|
| Weather | In progress | METAR, TAF and ATIS from real-world and network sources (VATSIM, IVAO, PilotEdge, FAA, aviationweather.gov) as well as the simulator |
| CG Envelope | Planned | Live gross weight, zero fuel weight and CG plotted against the 747-8 envelope |
| Charts | Planned | Navigraph airport and enroute charts with the SimBrief route drawn on; needs a Navigraph Charts subscription |

## Installation

Download the latest release and unzip it into your MSFS 2024 Community folder, then restart the simulator. The apps appear on the 747-8's EFB tablet.

## Building

Requires Node.js 18 or newer.

```
npm install
npm run build
```

The finished Community package is written to `build/hypabit-747`.

## Credits and license

Hypabit 747 ports features from the [Salty Simulations 747-8](https://github.com/saltysimulations/salty-747) EFB and is distributed under the GNU General Public License version 3, the same license as the Salty 747. See [LICENSE](LICENSE).

Microsoft Flight Simulator © Microsoft Corporation. Hypabit 747 was created under Microsoft's "Game Content Usage Rules" and is not endorsed by or affiliated with Microsoft.
