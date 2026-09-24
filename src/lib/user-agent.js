// Just enough user-agent parsing to tell sessions apart ("Chrome on macOS"),
// without pulling in a dependency. Order matters: Edge and Opera also claim
// to be Chrome, Chrome claims to be Safari, and iOS claims to be macOS.
const BROWSERS = [
  ["Edge", /Edg(e|A|iOS)?\//],
  ["Opera", /OPR\/|Opera/],
  ["Firefox", /Firefox\/|FxiOS\//],
  ["Chrome", /Chrome\/|CriOS\//],
  ["Safari", /Safari\//],
];

const SYSTEMS = [
  ["iOS", /iPhone|iPad|iPod/],
  ["Android", /Android/],
  ["Windows", /Windows/],
  ["macOS", /Mac OS X|Macintosh/],
  ["ChromeOS", /CrOS/],
  ["Linux", /Linux/],
];

const match = (list, ua) => list.find(([, pattern]) => pattern.test(ua))?.[0];

export function describeUserAgent(ua) {
  if (!ua) return "Unknown device";

  const browser = match(BROWSERS, ua);
  const system = match(SYSTEMS, ua);

  if (browser && system) return `${browser} on ${system}`;
  // Anything else (curl, an API client, …) is better shown as-is than as
  // "Unknown", but trimmed so it doesn't swamp the row.
  return browser ?? system ?? ua.slice(0, 60);
}
