/**
 * The object library: reusable, higher-level building blocks for lessons.
 * Import from `#library`. To add an object, see `README.md` in this folder.
 *
 * Keep this list alphabetical within each category.
 */

// math
export { axes } from './math/axes';
export { functionGraph } from './math/function-graph';
export { grid } from './math/grid';
export { infiniteLine } from './math/infinite-line';
export { plot } from './math/plot';
export { signChart } from './math/sign-chart';
export { vector } from './math/vector';

// physics
export { block } from './physics/block';
export { battery, capacitor, resistor } from './physics/circuit';
export { spring } from './physics/spring';
export { wall } from './physics/wall';

// ui
export { picker } from './ui/picker';
export { slider } from './ui/slider';

// helpers (plain functions, not drawable objects)
export { signChanges, signRuns, type SignRun } from './math/function-graph';
export { plotTransform } from './math/plot';
