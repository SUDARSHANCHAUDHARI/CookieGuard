import { execFileSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "README.md",
  "AGENTS.md",
  "CHANGELOG.md",
  "SECURITY.md",
  "LICENSE",
  "favicon.svg",
  ".nojekyll",
  ".gitignore",
  "package.json",
];

const checks = [];

function check(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
  checks.push(message);
}

for (const file of requiredFiles) {
  await access(resolve(projectRoot, file));
  checks.push(`Found ${file}`);
}

execFileSync(process.execPath, ["--check", resolve(projectRoot, "script.js")], {
  stdio: "pipe",
});
checks.push("JavaScript syntax is valid");

const [html, css, script, packageJson, gitignore, readme] = await Promise.all([
  readFile(resolve(projectRoot, "index.html"), "utf8"),
  readFile(resolve(projectRoot, "styles.css"), "utf8"),
  readFile(resolve(projectRoot, "script.js"), "utf8"),
  readFile(resolve(projectRoot, "package.json"), "utf8"),
  readFile(resolve(projectRoot, ".gitignore"), "utf8"),
  readFile(resolve(projectRoot, "README.md"), "utf8"),
]);

const localReferences = [...html.matchAll(/(?:href|src)="([^"#]+)"/g)]
  .map((match) => match[1])
  .filter((reference) => !/^(?:https?:|data:|mailto:|tel:)/.test(reference));

for (const reference of localReferences) {
  await access(resolve(projectRoot, reference));
  checks.push(`Local asset resolves: ${reference}`);
}

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
check(new Set(ids).size === ids.length, "HTML element IDs are unique");
check(/<main\s+id="game"/.test(html), "The game uses a semantic main landmark");
check(/http-equiv="Content-Security-Policy"/.test(html), "A Content Security Policy is declared");
check(/script-src 'self'/.test(html) && /connect-src 'none'/.test(html), "The security policy blocks remote scripts and network connections");
check(/name="referrer" content="no-referrer"/.test(html), "The page disables referrer disclosure");
check(/id="liveRegion"[^>]+aria-live="assertive"/.test(html), "Assertive game announcements are available");
check(/role="progressbar"/.test(html), "Attempt progress exposes an accessible progressbar");
check(/id="soundToggle"[^>]+aria-pressed="true"/.test(html), "Sound control exposes pressed state");
check(/id="cookie"[\s\S]*?type="button"[\s\S]*?aria-label=/.test(html), "Cookie is a keyboard-accessible native button");
check(/id="cookie"[\s\S]*?aria-describedby="gameInstructions"/.test(html), "Cookie references its interaction instructions");
check(/@media \(prefers-reduced-motion: reduce\)/.test(css), "Reduced-motion styles are present");
check(/touch-action:\s*none/.test(css), "Touch dragging has an explicit gesture boundary");
check(/\.kitchen-scene\s*\{[\s\S]*?touch-action:\s*pan-y/.test(css), "The scene preserves vertical page scrolling on touch screens");
check(!/inset-bottom|inset-top|inset-left|inset-right/.test(css), "CSS does not contain invalid inset-side properties");
check(/pointerdown/.test(script) && /pointermove/.test(script) && /pointerup/.test(script), "Pointer click, tap, and drag events are handled");
check(/AudioContext/.test(script) && /createOscillator/.test(script), "Sound is generated with the Web Audio API");
check(!/innerHTML|outerHTML|insertAdjacentHTML|document\.write|\beval\s*\(|new Function/.test(script), "JavaScript avoids unsafe HTML and dynamic-code sinks");
check(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(script), "The game makes no network requests");
check(/this\.attempts\s*===\s*10/.test(script), "Attempt 10 triggers the half-cookie milestone");
check(/this\.attempts\s*>=\s*15/.test(script), "Attempt 15 triggers the complete-cookie milestone");

const defenseIds = ["lid", "pull", "move", "arms", "broccoli", "under", "warning", "empty", "fakes", "hand"];
for (const defenseId of defenseIds) {
  check(new RegExp(`id:\\s*"${defenseId}"`).test(script), `Defense is implemented: ${defenseId}`);
  check(new RegExp(`data-defense="${defenseId}"`).test(html), `Defense is listed in the interface: ${defenseId}`);
}

const parsedPackage = JSON.parse(packageJson);
check(parsedPackage.private === true, "Package is marked private to prevent accidental publishing");
check(!parsedPackage.dependencies && !parsedPackage.devDependencies, "Project has no runtime or development dependencies");
check(parsedPackage.engines?.node === ">=18", "The supported Node.js version is declared");
check(parsedPackage.repository?.url.includes("SUDARSHANCHAUDHARI/CookieGuard"), "Package metadata points to the canonical repository");
check(parsedPackage.author?.name === "Sudarshan Chaudhari", "Package metadata identifies the author");
check(parsedPackage.author?.url === "https://github.com/SUDARSHANCHAUDHARI", "Package metadata links the author's GitHub profile");

const requiredIgnorePatterns = [
  "node_modules/",
  "dist/",
  "coverage/",
  ".env",
  "local.properties",
  "auth.json",
  "*.pem",
  "*.jks",
  ".idea/",
];
for (const pattern of requiredIgnorePatterns) {
  check(gitignore.includes(pattern), `Git ignore covers: ${pattern}`);
}

check(/pnpm check/.test(readme), "README documents the production verification command");
check(/Keep the GitHub repository private/.test(readme), "README documents the private-until-release policy");
check(/## Author/.test(readme) && /Sudarshan Chaudhari/.test(readme), "README includes the author section");
check(/SudarshanTechLabs/.test(readme) && /SUDARSHANCHAUDHARI/.test(readme), "README includes studio and GitHub author details");

const externalRuntimeReferences = [...`${html}\n${css}\n${script}`.matchAll(/https?:\/\/[^\s"')]+/g)];
check(externalRuntimeReferences.length === 0, "Runtime source contains no third-party network references");

const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
const openingBraces = (cssWithoutComments.match(/\{/g) || []).length;
const closingBraces = (cssWithoutComments.match(/\}/g) || []).length;
check(openingBraces === closingBraces, "CSS block braces are balanced");

console.log(`CookieGuard verification passed (${checks.length} checks).`);
