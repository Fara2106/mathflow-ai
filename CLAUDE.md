# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**MathFlow AI** — a static, single-page web app (no build step, no framework, no
package.json) that generates Italian-language math exercises on demand using an
LLM. The user picks a topic and difficulty; the app prompts a free LLM provider
to return a JSON exercise (theory, text, result, step-by-step solution, and an
optional graph spec), then renders it. All UI text is in Italian.

There is no test suite, linter, or bundler. The files are served as-is.

## Running & deploying

- **Run locally:** open `index.html` directly, or serve the folder (e.g.
  `python3 -m http.server`). Any static server works.
- **Deploy:** the project is a GitHub repo (`Fara2106/mathflow-ai`, private).
  `./deploy.command` simply commits and pushes the working tree. Hosting is via
  GitHub Pages, which only works once the repo is public (free plan) — when
  ready, enable it with
  `gh api -X POST repos/Fara2106/mathflow-ai/pages -f source[branch]=main -f source[path]=/`
  and the site will be served at `https://fara2106.github.io/mathflow-ai`
  (already set as the OpenRouter `HTTP-Referer` in `gemini.js`).

## Architecture

Scripts load in this order (see bottom of `index.html`) and communicate via
globals on `window` — there are no modules/imports:

1. **`topics.js`** → `window.TOPICS`: the catalog of built-in topics, each
   `{ level, topic, icon, graphHint }`. `graphHint` decides which graph type the
   LLM is asked to produce (and the renderer to use). Levels are exactly
   `Elementari`, `Medie`, `Superiori`, `Università` (this ordering is hardcoded
   in several places).
2. **`graph.js`** → `window.MathGraph` (public API: `render(canvas, graphData)`).
   A from-scratch Canvas 2D plotting engine. One private `renderX` function per
   graph type (linear, quadratic, trigonometric, exponential, system,
   derivative, integral, bar-chart, fraction-pie, custom, geometry); `render`
   dispatches on `graphData.type`. Some types are interactive (zoom/pan/drag) via
   `INTERACTIVE_TYPES`. `func`-based types evaluate JS expression strings (e.g.
   `"x*x*x - 3*x"`, `"Math.log(x)"`) supplied by the LLM.
3. **`gemini.js`** → `window.GeminiAPI`: the LLM client. **Despite the filename
   and the `GeminiAPI` global, this does NOT use Gemini** — it talks to Groq
   (default) or OpenRouter via their OpenAI-compatible chat-completions
   endpoints. Provider config lives in the `PROVIDERS` map. Owns: API-key
   storage (localStorage, per provider), the big Italian system prompt
   (`buildSystemPrompt`), per-`graphHint` graph-spec instructions
   (`getGraphInstructions`), and `generateExercise(...)` with exponential-backoff
   retry on HTTP 429.
4. **`app.js`** → IIFE, the UI controller. Holds all DOM refs and app state
   (`currentLevel`, `currentTopic`, `currentDifficulty`, `isGenerating`),
   renders topic cards + the search dropdown + the "Altro" custom-topic card,
   handles the API-key modal, calls `GeminiAPI.generateExercise`, displays the
   result, and wires PDF export (html2pdf, loaded from CDN).

### Data flow for generating an exercise

`app.openTopic(topic)` → `app.generateExercise()` →
`GeminiAPI.generateExercise(level, topic, graphHint, onStatus, difficulty)` →
HTTP POST to provider → JSON parsed & validated (must have `theory`,
`exerciseText`, `result`, `solution`) → `app.showExercise()` renders the four
HTML sections; if `exercise.graph.type` is present, the graph is lazily rendered
by `MathGraph.render` the first time the graph panel is expanded.

## Important conventions & gotchas

- **The LLM is instructed to output HTML with Unicode math symbols, NOT LaTeX.**
  The system prompt in `gemini.js` explicitly forbids LaTeX. Despite that,
  `cleanMathHtml()` in `app.js` is a large defensive post-processor that strips
  leftover LaTeX (`\frac`, `\sqrt`, `$...$`, `\begin{pmatrix}`, etc.) and
  converts it to the app's HTML conventions. If you change the math-output
  format, both the prompt (`gemini.js`) and `cleanMathHtml` (`app.js`) must stay
  in sync.
- **Math HTML conventions** the rest of the code depends on: fractions are
  `<span class="fraction"><span class="num">…</span><span class="den">…</span></span>`,
  matrices are `<div class="math-matrix matrix-paren"><table>…</table></div>`,
  formulas are `<p class="math-formula">…</p>`, exponents use `<sup>`. These
  classes are styled in `style.css`.
- **Adding a new graph type** requires three coordinated changes: a `graphHint`
  value in `topics.js`, a `case` + instruction block in
  `getGraphInstructions` (`gemini.js`), and a `renderX` function + `case` in
  `renderInternal`/`render` (`graph.js`).
- **`exercises.js` (`window.EXERCISES_DATA`) is dead code** — a large static
  database of pre-written exercises that is **not** loaded by `index.html`. The
  app generates everything live. Don't assume it's wired in; treat it as legacy
  unless you deliberately re-introduce it.
- API keys live only in the browser's localStorage (keys
  `mathflow_groq_key`, `mathflow_openrouter_key`, `mathflow_provider`).
- Error handling uses sentinel `Error` messages (`API_KEY_MISSING`,
  `API_KEY_INVALID`, `RATE_LIMIT`) that `app.handleError` maps to Italian
  user-facing text.
