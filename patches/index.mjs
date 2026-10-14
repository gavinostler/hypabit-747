import cameras from "./cameras.mjs";
import effects from "./effects.mjs";
import presets from "./presets.mjs";
import wt from "./wt.mjs";

export default [...wt, ...cameras, ...effects, ...presets];
