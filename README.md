# Hypabit 747

An enhancement mod for the stock Boeing 747-8 in Microsoft Flight Simulator 2024.

Hypabit 747 keeps the stock aircraft and patches only what the community most often complains about. It also adds apps to the 747's EFB tablet.

## EFB apps

| App | What it does |
|---|---|
| Weather | METAR, TAF and ATIS from the simulator and real-world or network sources: VATSIM, IVAO, PilotEdge, FAA and aviationweather.gov |
| Ground | Payload and fuel loading with a CG envelope chart, target ZFW CG, SimBrief import, door controls and cabin lights |

## Aircraft fixes

| Area | Fix |
|---|---|
| CDU | The W&B page uses the aircraft's real empty weight instead of a hardcoded 211.9 t, so ZFW matches the sim. It also re-reads the loading when opened and no longer shows passengers on the 747-8F. |
| EICAS | A door that is a fraction of a percent open no longer keeps its door message up |
| Cameras | ClosePilot frames the instruments and LandingPilot sits higher, looking over the nose; the default eye point is slightly higher; both variants use the same views |
| Cockpit lighting | Flood, pedestal and dome lights are warmer and dimmer |
| Displays | The PFD, ND and CDU use less saturated green, magenta, cyan, blue and sky colors |
| Cabin | The 747-8i passenger cabin gets ceiling lights, dimmable from the Ground app |

The cabin light positions are estimated from the aircraft's door layout and may need adjusting. Hypabit replaces some stock files with patched copies, so a sim update to those files will be hidden until Hypabit is rebuilt against the new version.

## Installation

Download the latest release and unzip it into your MSFS 2024 Community folder, then restart the simulator.

## Building

Requires Node.js 18 or newer.

```
npm install
node scripts/extract-stock.mjs "<path to the asobo-aircraft-b7478i package>"
npm run build
```

The extract step copies the readable stock 747 files into `stock/`, which the build patches. Without it, only the EFB apps are built. The finished Community package is written to `build/hypabit-747`.

## Credits and license

Hypabit 747 ports features from the [Salty Simulations 747-8](https://github.com/saltysimulations/salty-747) EFB, and the CG envelope data comes from FlyByWire Simulations. It is distributed under the GNU General Public License version 3, the same license as the Salty 747. See [LICENSE](LICENSE).

Microsoft Flight Simulator © Microsoft Corporation. Hypabit 747 was created under Microsoft's "Game Content Usage Rules" and is not endorsed by or affiliated with Microsoft.
