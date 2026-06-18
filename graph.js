/**
 * MathFlow — Graph Rendering Engine v2.0
 * Draws mathematical graphs on a Canvas element with marked X/Y axes.
 * Features: robust error handling, interactive zoom/pan, point legend.
 */

window.MathGraph = (function () {
    'use strict';

    // ===== COLORS =====
    const COLORS = {
        bg: '#fafafa',
        grid: '#e8e8ed',
        axis: '#1d1d1f',
        axisLabel: '#6e6e73',
        primary: '#007AFF',
        secondary: '#AF52DE',
        tertiary: '#FF9500',
        fill: 'rgba(0, 122, 255, 0.12)',
        fillSecondary: 'rgba(175, 82, 222, 0.12)',
        green: '#34C759',
        red: '#FF3B30',
        tick: '#86868b',
        barColors: ['#007AFF', '#5856D6', '#AF52DE', '#FF9500', '#FF3B30', '#34C759', '#5AC8FA', '#FF2D55'],
        pieColors: ['#007AFF', '#e8e8ed'],
    };

    const DPR = window.devicePixelRatio || 1;

    // ===== PER-CANVAS STATE (zoom/pan) =====
    const canvasState = new WeakMap();

    /** Types that support interactive zoom/pan */
    const INTERACTIVE_TYPES = new Set([
        'linear', 'quadratic', 'trigonometric', 'exponential',
        'system', 'derivative', 'integral', 'custom'
    ]);

    /**
     * Get or create state for a canvas element
     */
    function getState(canvas) {
        if (!canvasState.has(canvas)) {
            canvasState.set(canvas, {
                offsetX: 0,
                offsetY: 0,
                zoom: 1,
                originalXRange: null,
                originalYRange: null,
                graphData: null,
                interactionsBound: false,
                isDragging: false,
                dragStartX: 0,
                dragStartY: 0,
                dragStartOffsetX: 0,
                dragStartOffsetY: 0,
                pinchStartDist: null,
                pinchStartZoom: 1,
            });
        }
        return canvasState.get(canvas);
    }

    // ===== VALIDATION HELPERS =====

    /** Ensure a value is a finite number, otherwise return the fallback */
    function num(val, fallback) {
        if (val === null || val === undefined || val === '') return fallback;
        const n = Number(val);
        return isFinite(n) ? n : fallback;
    }

    /** Validate xRange is a 2-element array with min < max */
    function validRange(range, fallback) {
        if (!Array.isArray(range) || range.length < 2) return fallback;
        const lo = num(range[0], fallback[0]);
        const hi = num(range[1], fallback[1]);
        if (lo >= hi) return fallback;
        return [lo, hi];
    }

    /** Safely validate a config object, returning at least an empty object */
    function safeConfig(config) {
        if (config && typeof config === 'object') return config;
        return {};
    }

    /**
     * Sanitize a math expression string from common AI mistakes.
     * Converts LaTeX-like, Python-like, and shorthand math into valid JavaScript.
     */
    function sanitizeExpression(expr) {
        if (typeof expr !== 'string') return 'x';
        let s = expr.trim();
        if (!s) return 'x';

        // Remove LaTeX delimiters
        s = s.replace(/^\$+|\$+$/g, '');
        s = s.replace(/\\left|\\right/g, '');

        // \frac{a}{b} → ((a)/(b))
        for (let i = 0; i < 5; i++) {
            s = s.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '(($1)/($2))');
        }

        // \sqrt{expr} → Math.sqrt(expr)
        s = s.replace(/\\sqrt\{([^}]*)\}/g, 'Math.sqrt($1)');
        s = s.replace(/√\(([^)]*)\)/g, 'Math.sqrt($1)');
        s = s.replace(/√(\w+)/g, 'Math.sqrt($1)');

        // LaTeX commands: \sin, \cos, \tan, \log, \ln, \exp, \pi, \cdot
        s = s.replace(/\\sin/g, 'Math.sin');
        s = s.replace(/\\cos/g, 'Math.cos');
        s = s.replace(/\\tan/g, 'Math.tan');
        s = s.replace(/\\log/g, 'Math.log');
        s = s.replace(/\\ln/g, 'Math.log');
        s = s.replace(/\\exp/g, 'Math.exp');
        s = s.replace(/\\pi\b/g, 'Math.PI');
        s = s.replace(/\\cdot/g, '*');
        s = s.replace(/\\times/g, '*');

        // Remove remaining LaTeX backslash commands (\text{}, \mathrm{}, etc.)
        s = s.replace(/\\text\{([^}]*)\}/g, '$1');
        s = s.replace(/\\mathrm\{([^}]*)\}/g, '$1');
        s = s.replace(/\\[a-zA-Z]+/g, '');

        // Remove LaTeX braces used for grouping (but not JS object/function braces)
        // Only remove isolated { } that don't look like function calls
        // This is tricky, so we do it carefully

        // Python-style ** → use Math.pow handled below via ^ logic
        // First handle ** (Python power)
        s = s.replace(/\*\*/g, '^');

        // Handle caret ^ (power operator) → Math.pow(base, exponent)
        // Pattern: base^{exponent} or base^exponent or base^(exponent)
        s = s.replace(/\^\{([^}]*)\}/g, '^($1)');  // Convert ^{...} to ^(...)
        // Repeated passes for nested powers
        for (let i = 0; i < 5; i++) {
            // Pattern: (expr)^(expr) → Math.pow((expr),(expr))
            s = s.replace(/\(([^()]+)\)\^\(([^()]+)\)/g, 'Math.pow(($1),($2))');
            // Pattern: identifier^(expr) → Math.pow(identifier,(expr))
            s = s.replace(/([a-zA-Z_]\w*(?:\.\w+)*)\^\(([^()]+)\)/g, 'Math.pow($1,($2))');
            // Pattern: number^(expr) → Math.pow(number,(expr))
            s = s.replace(/(\d+\.?\d*)\^\(([^()]+)\)/g, 'Math.pow($1,($2))');
            // Pattern: (expr)^number → Math.pow((expr),number)
            s = s.replace(/\(([^()]+)\)\^(\d+\.?\d*)/g, 'Math.pow(($1),$2)');
            // Pattern: identifier^number → Math.pow(identifier,number)
            s = s.replace(/([a-zA-Z_]\w*(?:\.\w+)*)\^(\d+\.?\d*)/g, 'Math.pow($1,$2)');
            // Pattern: number^number → Math.pow(number,number)
            s = s.replace(/(\d+\.?\d*)\^(\d+\.?\d*)/g, 'Math.pow($1,$2)');
        }

        // Bare trig/math functions → Math.xxx  (only if not already prefixed with Math.)
        s = s.replace(/(?<!Math\.)\bsin\s*\(/g, 'Math.sin(');
        s = s.replace(/(?<!Math\.)\bcos\s*\(/g, 'Math.cos(');
        s = s.replace(/(?<!Math\.)\btan\s*\(/g, 'Math.tan(');
        s = s.replace(/(?<!Math\.)\basin\s*\(/g, 'Math.asin(');
        s = s.replace(/(?<!Math\.)\bacos\s*\(/g, 'Math.acos(');
        s = s.replace(/(?<!Math\.)\batan\s*\(/g, 'Math.atan(');
        s = s.replace(/(?<!Math\.)\bsqrt\s*\(/g, 'Math.sqrt(');
        s = s.replace(/(?<!Math\.)\babs\s*\(/g, 'Math.abs(');
        s = s.replace(/(?<!Math\.)\blog\s*\(/g, 'Math.log(');
        s = s.replace(/(?<!Math\.)\bexp\s*\(/g, 'Math.exp(');
        s = s.replace(/(?<!Math\.)\bpow\s*\(/g, 'Math.pow(');
        s = s.replace(/(?<!Math\.)\bceil\s*\(/g, 'Math.ceil(');
        s = s.replace(/(?<!Math\.)\bfloor\s*\(/g, 'Math.floor(');

        // ln(...) → Math.log(...)
        s = s.replace(/(?<!Math\.)\bln\s*\(/g, 'Math.log(');

        // e^... → Math.exp(...) — handle 'e^x', 'e^(...)'
        s = s.replace(/\be\^\(/g, 'Math.exp(');
        s = s.replace(/\be\^([a-zA-Z_]\w*)/g, 'Math.exp($1)');
        s = s.replace(/\be\^(\d+\.?\d*)/g, 'Math.exp($1)');

        // Standalone constants
        s = s.replace(/(?<!Math\.)\bpi\b(?!\()/g, 'Math.PI');
        s = s.replace(/(?<![a-zA-Z_])\be\b(?!\w|\(|\^)/g, 'Math.E');
        s = s.replace(/(?<![\w.])PI\b(?!\.)/g, 'Math.PI');

        // Implicit multiplication: 2x → 2*x, 3sin → 3*sin, )x → )*x, )( → )*(
        s = s.replace(/(\d)([a-zA-Z(])/g, '$1*$2');  // 2x → 2*x, 3( → 3*(
        s = s.replace(/(\))([a-zA-Z0-9(])/g, '$1*$2');  // )x → )*x, )2 → )*2, )( → )*(
        // But fix cases where we broke Math.xxx: Math.*sin → Math.sin
        s = s.replace(/Math\s*\.\s*\*/g, 'Math.');
        // Fix Math.*pow etc that might have been garbled
        s = s.replace(/Math\.\s*\*\s*/g, 'Math.');

        // Unicode operators
        s = s.replace(/×/g, '*');
        s = s.replace(/÷/g, '/');
        s = s.replace(/−/g, '-');

        // Remove dangling LaTeX braces  { }
        s = s.replace(/[{}]/g, '');

        return s;
    }

    // ===== CANVAS SETUP =====

    function setupCanvas(canvas, width, height) {
        canvas.width = width * DPR;
        canvas.height = height * DPR;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        const ctx = canvas.getContext('2d');
        ctx.scale(DPR, DPR);
        return ctx;
    }

    // ===== AXES & GRID =====

    function drawAxesAndGrid(ctx, w, h, xRange, yRange, options) {
        const padding = { top: 30, right: 30, bottom: 50, left: 55 };
        const plotW = w - padding.left - padding.right;
        const plotH = h - padding.top - padding.bottom;

        function toCanvasX(x) {
            return padding.left + ((x - xRange[0]) / (xRange[1] - xRange[0])) * plotW;
        }
        function toCanvasY(y) {
            return padding.top + ((yRange[1] - y) / (yRange[1] - yRange[0])) * plotH;
        }
        function fromCanvasX(cx) {
            return xRange[0] + ((cx - padding.left) / plotW) * (xRange[1] - xRange[0]);
        }
        function fromCanvasY(cy) {
            return yRange[1] - ((cy - padding.top) / plotH) * (yRange[1] - yRange[0]);
        }

        // Background
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, w, h);

        // Nice tick spacing
        function niceStep(range) {
            const span = range[1] - range[0];
            if (span <= 0) return 1;
            const rough = span / 8;
            const pow10 = Math.pow(10, Math.floor(Math.log10(rough)));
            const fraction = rough / pow10;
            let nice;
            if (fraction <= 1.5) nice = 1;
            else if (fraction <= 3) nice = 2;
            else if (fraction <= 7) nice = 5;
            else nice = 10;
            return nice * pow10;
        }

        const xStep = niceStep(xRange);
        const yStep = niceStep(yRange);

        // Grid lines
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([]);

        // Vertical grid
        let x = Math.ceil(xRange[0] / xStep) * xStep;
        let safeCount = 0;
        while (x <= xRange[1] && safeCount < 200) {
            const cx = toCanvasX(x);
            ctx.beginPath();
            ctx.moveTo(cx, padding.top);
            ctx.lineTo(cx, h - padding.bottom);
            ctx.stroke();
            x += xStep;
            safeCount++;
        }

        // Horizontal grid
        let y = Math.ceil(yRange[0] / yStep) * yStep;
        safeCount = 0;
        while (y <= yRange[1] && safeCount < 200) {
            const cy = toCanvasY(y);
            ctx.beginPath();
            ctx.moveTo(padding.left, cy);
            ctx.lineTo(w - padding.right, cy);
            ctx.stroke();
            y += yStep;
            safeCount++;
        }

        // X Axis
        const xAxisY = Math.max(padding.top, Math.min(h - padding.bottom, toCanvasY(0)));
        ctx.strokeStyle = COLORS.axis;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padding.left, xAxisY);
        ctx.lineTo(w - padding.right, xAxisY);
        ctx.stroke();

        // Y Axis
        const yAxisX = Math.max(padding.left, Math.min(w - padding.right, toCanvasX(0)));
        ctx.beginPath();
        ctx.moveTo(yAxisX, padding.top);
        ctx.lineTo(yAxisX, h - padding.bottom);
        ctx.stroke();

        // Axis arrows
        ctx.fillStyle = COLORS.axis;
        // X arrow
        ctx.beginPath();
        ctx.moveTo(w - padding.right + 2, xAxisY);
        ctx.lineTo(w - padding.right - 6, xAxisY - 4);
        ctx.lineTo(w - padding.right - 6, xAxisY + 4);
        ctx.fill();
        // Y arrow
        ctx.beginPath();
        ctx.moveTo(yAxisX, padding.top - 2);
        ctx.lineTo(yAxisX - 4, padding.top + 6);
        ctx.lineTo(yAxisX + 4, padding.top + 6);
        ctx.fill();

        // Axis labels
        ctx.fillStyle = COLORS.axis;
        ctx.font = '600 14px Inter, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('x', w - padding.right + 16, xAxisY + 5);
        ctx.fillText('y', yAxisX, padding.top - 10);

        // Tick marks and labels
        ctx.font = '400 11px Inter, -apple-system, sans-serif';
        ctx.fillStyle = COLORS.tick;

        // X ticks
        x = Math.ceil(xRange[0] / xStep) * xStep;
        safeCount = 0;
        while (x <= xRange[1] && safeCount < 200) {
            if (Math.abs(x) > xStep * 0.01) {
                const cx = toCanvasX(x);
                ctx.strokeStyle = COLORS.axis;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(cx, xAxisY - 3);
                ctx.lineTo(cx, xAxisY + 3);
                ctx.stroke();
                ctx.textAlign = 'center';
                ctx.fillStyle = COLORS.tick;
                const label = Math.abs(x) < 0.001 ? '0' : (Number.isInteger(x) ? x.toString() : x.toFixed(1));
                ctx.fillText(label, cx, xAxisY + 18);
            }
            x += xStep;
            safeCount++;
        }

        // Y ticks
        y = Math.ceil(yRange[0] / yStep) * yStep;
        safeCount = 0;
        while (y <= yRange[1] && safeCount < 200) {
            if (Math.abs(y) > yStep * 0.01) {
                const cy = toCanvasY(y);
                ctx.strokeStyle = COLORS.axis;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(yAxisX - 3, cy);
                ctx.lineTo(yAxisX + 3, cy);
                ctx.stroke();
                ctx.textAlign = 'right';
                ctx.fillStyle = COLORS.tick;
                const label = Number.isInteger(y) ? y.toString() : y.toFixed(1);
                ctx.fillText(label, yAxisX - 8, cy + 4);
            }
            y += yStep;
            safeCount++;
        }

        // Origin label
        if (xRange[0] <= 0 && xRange[1] >= 0 && yRange[0] <= 0 && yRange[1] >= 0) {
            ctx.fillStyle = COLORS.tick;
            ctx.textAlign = 'right';
            ctx.fillText('O', yAxisX - 8, xAxisY + 18);
        }

        return { padding, plotW, plotH, toCanvasX, toCanvasY, fromCanvasX, fromCanvasY };
    }

    // ===== MATH HELPERS =====

    function evalFunc(expr, x) {
        try {
            const sanitized = sanitizeExpression(expr);
            const result = new Function('x', 'Math', 'return ' + sanitized)(x, Math);
            if (typeof result !== 'number') return NaN;
            return result;
        } catch {
            return NaN;
        }
    }

    function calcYRange(funcStr, xRange, padding) {
        if (padding === undefined) padding = 0.15;
        let minY = Infinity, maxY = -Infinity;
        const steps = 200;
        const dx = (xRange[1] - xRange[0]) / steps;
        for (let i = 0; i <= steps; i++) {
            const x = xRange[0] + i * dx;
            let y;
            try { y = evalFunc(funcStr, x); } catch { continue; }
            if (isFinite(y) && !isNaN(y)) {
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
        if (!isFinite(minY)) { minY = -5; maxY = 5; }
        const range = maxY - minY || 2;
        return [minY - range * padding, maxY + range * padding];
    }

    // ===== DRAWING HELPERS =====

    function drawCurve(ctx, plot, funcStr, xRange, color, lineWidth) {
        if (lineWidth === undefined) lineWidth = 2.5;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.setLineDash([]);
        ctx.beginPath();
        const steps = 500;
        const dx = (xRange[1] - xRange[0]) / steps;
        let started = false;
        let prevY = null;
        for (let i = 0; i <= steps; i++) {
            const x = xRange[0] + i * dx;
            let y;
            try { y = evalFunc(funcStr, x); } catch { y = NaN; }
            const cx = plot.toCanvasX(x);
            const cy = plot.toCanvasY(y);
            if (isFinite(y) && !isNaN(y)) {
                if (prevY !== null && Math.abs(y - prevY) > 50) {
                    ctx.stroke();
                    ctx.beginPath();
                    started = false;
                }
                if (!started) {
                    ctx.moveTo(cx, cy);
                    started = true;
                } else {
                    ctx.lineTo(cx, cy);
                }
                prevY = y;
            } else {
                if (started) {
                    ctx.stroke();
                    ctx.beginPath();
                    started = false;
                }
                prevY = null;
            }
        }
        ctx.stroke();
    }

    function drawFilledArea(ctx, plot, funcStr, a, b, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        const steps = 200;
        const dx = (b - a) / steps;
        ctx.moveTo(plot.toCanvasX(a), plot.toCanvasY(0));
        for (let i = 0; i <= steps; i++) {
            const x = a + i * dx;
            let y;
            try { y = evalFunc(funcStr, x); } catch { y = 0; }
            if (isFinite(y) && !isNaN(y)) {
                ctx.lineTo(plot.toCanvasX(x), plot.toCanvasY(y));
            }
        }
        ctx.lineTo(plot.toCanvasX(b), plot.toCanvasY(0));
        ctx.closePath();
        ctx.fill();
    }

    function drawPoint(ctx, plot, x, y, color, radius) {
        if (radius === undefined) radius = 5;
        if (!isFinite(x) || !isFinite(y)) return;
        const cx = plot.toCanvasX(x);
        const cy = plot.toCanvasY(y);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // ===== POINT LEGEND =====

    /**
     * Draw a legend box in the top-right corner listing special points.
     * Each entry: { label: string, x: number, y: number, color: string }
     */
    function drawPointLegend(ctx, w, h, points) {
        if (!points || points.length === 0) return;

        const padding = 12;
        const lineHeight = 20;
        const dotRadius = 5;
        const boxPadding = 10;
        const maxLabelWidth = 220;

        ctx.font = '500 12px Inter, -apple-system, sans-serif';

        // Measure text widths
        const entries = points.map(function (p) {
            const text = p.label + ' (' + p.x.toFixed(2) + ', ' + p.y.toFixed(2) + ')';
            return { text: text, color: p.color };
        });

        let maxW = 0;
        entries.forEach(function (e) {
            const m = ctx.measureText(e.text);
            if (m.width > maxW) maxW = m.width;
        });

        const boxW = Math.min(maxW + dotRadius * 2 + boxPadding * 2 + 12, maxLabelWidth + boxPadding * 2);
        const boxH = entries.length * lineHeight + boxPadding * 2;
        const boxX = w - boxW - padding;
        const boxY = padding;

        // Semi-transparent background
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = '#ffffff';
        const r = 8;
        ctx.beginPath();
        ctx.moveTo(boxX + r, boxY);
        ctx.lineTo(boxX + boxW - r, boxY);
        ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + r);
        ctx.lineTo(boxX + boxW, boxY + boxH - r);
        ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - r, boxY + boxH);
        ctx.lineTo(boxX + r, boxY + boxH);
        ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - r);
        ctx.lineTo(boxX, boxY + r);
        ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Border
        ctx.strokeStyle = '#d2d2d7';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Shadow effect (subtle)
        ctx.restore();

        // Draw entries
        ctx.font = '500 12px Inter, -apple-system, sans-serif';
        entries.forEach(function (entry, i) {
            const ex = boxX + boxPadding + dotRadius + 2;
            const ey = boxY + boxPadding + i * lineHeight + lineHeight / 2;

            // Colored dot
            ctx.fillStyle = entry.color;
            ctx.beginPath();
            ctx.arc(ex - 2, ey, dotRadius, 0, Math.PI * 2);
            ctx.fill();

            // Text
            ctx.fillStyle = COLORS.axis;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(entry.text, ex + dotRadius + 6, ey);
        });
    }

    // ===== RESET BUTTON =====

    /**
     * Draw a "Reset 🔄" button on the canvas when zoomed/panned.
     * Returns the hit region { x, y, w, h } for click detection.
     */
    function drawResetButton(ctx, w) {
        const btnText = 'Reset 🔄';
        ctx.font = '500 12px Inter, -apple-system, sans-serif';
        const tm = ctx.measureText(btnText);
        const btnW = tm.width + 16;
        const btnH = 26;
        const btnX = w - btnW - 12;
        const btnY = 4;
        const radius = 6;

        // Background pill
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.beginPath();
        ctx.moveTo(btnX + radius, btnY);
        ctx.lineTo(btnX + btnW - radius, btnY);
        ctx.quadraticCurveTo(btnX + btnW, btnY, btnX + btnW, btnY + radius);
        ctx.lineTo(btnX + btnW, btnY + btnH - radius);
        ctx.quadraticCurveTo(btnX + btnW, btnY + btnH, btnX + btnW - radius, btnY + btnH);
        ctx.lineTo(btnX + radius, btnY + btnH);
        ctx.quadraticCurveTo(btnX, btnY + btnH, btnX, btnY + btnH - radius);
        ctx.lineTo(btnX, btnY + radius);
        ctx.quadraticCurveTo(btnX, btnY, btnX + radius, btnY);
        ctx.closePath();
        ctx.fill();

        // Stroke
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Text
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btnText, btnX + btnW / 2, btnY + btnH / 2);

        return { x: btnX, y: btnY, w: btnW, h: btnH };
    }

    // ===== ZOOM / PAN RANGE CALCULATION =====

    /**
     * Given the original range for an axis, current zoom level, and pan offset,
     * compute the effective displayed range.
     */
    function computeRange(originalRange, zoom, offset) {
        const span = (originalRange[1] - originalRange[0]) / zoom;
        const center = (originalRange[0] + originalRange[1]) / 2 + offset;
        return [center - span / 2, center + span / 2];
    }

    // ===== INTERACTION BINDING =====

    function bindInteractions(canvas, state) {
        if (state.interactionsBound) return;
        state.interactionsBound = true;

        // Track the reset button hit region
        let resetBtnRegion = null;
        state._setResetBtnRegion = function (region) { resetBtnRegion = region; };
        state._getResetBtnRegion = function () { return resetBtnRegion; };

        function isZoomedOrPanned() {
            return Math.abs(state.zoom - 1) > 0.001 ||
                   Math.abs(state.offsetX) > 0.001 ||
                   Math.abs(state.offsetY) > 0.001;
        }

        function rerender() {
            if (state.graphData) {
                renderInternal(canvas, state.graphData, true);
            }
        }

        function getCanvasPos(e) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (e.clientX - rect.left),
                y: (e.clientY - rect.top)
            };
        }

        // ----- WHEEL ZOOM -----
        canvas.addEventListener('wheel', function (e) {
            e.preventDefault();
            if (!state.graphData || !INTERACTIVE_TYPES.has(state.graphData.type)) return;

            const pos = getCanvasPos(e);
            const ox = state.originalXRange;
            const oy = state.originalYRange;
            if (!ox || !oy) return;

            // Current ranges
            const curX = computeRange(ox, state.zoom, state.offsetX);
            const curY = computeRange(oy, state.zoom, state.offsetY);

            // Determine how far into the plot the cursor is (0..1)
            const padding = { left: 55, right: 30, top: 30, bottom: 50 };
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            const plotW = w - padding.left - padding.right;
            const plotH = h - padding.top - padding.bottom;
            const fracX = Math.max(0, Math.min(1, (pos.x - padding.left) / plotW));
            const fracY = Math.max(0, Math.min(1, (pos.y - padding.top) / plotH));

            // Math coords under cursor before zoom
            const mathX = curX[0] + fracX * (curX[1] - curX[0]);
            const mathY = curY[1] - fracY * (curY[1] - curY[0]);

            // Zoom factor
            const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
            const newZoom = Math.max(0.1, Math.min(100, state.zoom * zoomFactor));
            state.zoom = newZoom;

            // New ranges after zoom
            const newSpanX = (ox[1] - ox[0]) / newZoom;
            const newSpanY = (oy[1] - oy[0]) / newZoom;

            // Adjust offset so the math point under cursor stays in place
            const newCenterX = mathX - (fracX - 0.5) * newSpanX;
            const newCenterY = mathY + (fracY - 0.5) * newSpanY;
            state.offsetX = newCenterX - (ox[0] + ox[1]) / 2;
            state.offsetY = newCenterY - (oy[0] + oy[1]) / 2;

            rerender();
        }, { passive: false });

        // ----- MOUSE DRAG PAN -----
        canvas.addEventListener('mousedown', function (e) {
            if (!state.graphData || !INTERACTIVE_TYPES.has(state.graphData.type)) return;
            if (e.button !== 0) return; // left click only

            const pos = getCanvasPos(e);

            // Check if reset button clicked
            const btn = state._getResetBtnRegion();
            if (btn && pos.x >= btn.x && pos.x <= btn.x + btn.w &&
                pos.y >= btn.y && pos.y <= btn.y + btn.h) {
                state.zoom = 1;
                state.offsetX = 0;
                state.offsetY = 0;
                rerender();
                return;
            }

            state.isDragging = true;
            state.dragStartX = e.clientX;
            state.dragStartY = e.clientY;
            state.dragStartOffsetX = state.offsetX;
            state.dragStartOffsetY = state.offsetY;
            canvas.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', function (e) {
            if (!state.isDragging) return;

            const ox = state.originalXRange;
            const oy = state.originalYRange;
            if (!ox || !oy) return;

            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            const padding = { left: 55, right: 30, top: 30, bottom: 50 };
            const plotW = w - padding.left - padding.right;
            const plotH = h - padding.top - padding.bottom;

            const spanX = (ox[1] - ox[0]) / state.zoom;
            const spanY = (oy[1] - oy[0]) / state.zoom;

            const dxPx = e.clientX - state.dragStartX;
            const dyPx = e.clientY - state.dragStartY;

            state.offsetX = state.dragStartOffsetX - (dxPx / plotW) * spanX;
            state.offsetY = state.dragStartOffsetY + (dyPx / plotH) * spanY;

            rerender();
        });

        window.addEventListener('mouseup', function () {
            if (state.isDragging) {
                state.isDragging = false;
                canvas.style.cursor = '';
            }
        });

        // ----- DOUBLE-CLICK RESET -----
        canvas.addEventListener('dblclick', function (e) {
            if (!state.graphData || !INTERACTIVE_TYPES.has(state.graphData.type)) return;
            e.preventDefault();
            state.zoom = 1;
            state.offsetX = 0;
            state.offsetY = 0;
            rerender();
        });

        // ----- TOUCH: PAN + PINCH ZOOM -----
        let activeTouches = [];

        function getTouchDist(t1, t2) {
            const dx = t1.clientX - t2.clientX;
            const dy = t1.clientY - t2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        }

        canvas.addEventListener('touchstart', function (e) {
            if (!state.graphData || !INTERACTIVE_TYPES.has(state.graphData.type)) return;
            e.preventDefault();
            activeTouches = Array.from(e.touches);

            if (activeTouches.length === 1) {
                // Start panning
                state.isDragging = true;
                state.dragStartX = activeTouches[0].clientX;
                state.dragStartY = activeTouches[0].clientY;
                state.dragStartOffsetX = state.offsetX;
                state.dragStartOffsetY = state.offsetY;
            } else if (activeTouches.length === 2) {
                // Start pinch
                state.isDragging = false;
                state.pinchStartDist = getTouchDist(activeTouches[0], activeTouches[1]);
                state.pinchStartZoom = state.zoom;
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', function (e) {
            if (!state.graphData || !INTERACTIVE_TYPES.has(state.graphData.type)) return;
            e.preventDefault();
            const touches = Array.from(e.touches);

            if (touches.length === 1 && state.isDragging) {
                // Pan
                const ox = state.originalXRange;
                const oy = state.originalYRange;
                if (!ox || !oy) return;

                const w = canvas.clientWidth;
                const h = canvas.clientHeight;
                const padding = { left: 55, right: 30, top: 30, bottom: 50 };
                const plotW = w - padding.left - padding.right;
                const plotH = h - padding.top - padding.bottom;

                const spanX = (ox[1] - ox[0]) / state.zoom;
                const spanY = (oy[1] - oy[0]) / state.zoom;

                const dxPx = touches[0].clientX - state.dragStartX;
                const dyPx = touches[0].clientY - state.dragStartY;

                state.offsetX = state.dragStartOffsetX - (dxPx / plotW) * spanX;
                state.offsetY = state.dragStartOffsetY + (dyPx / plotH) * spanY;
                rerender();
            } else if (touches.length === 2 && state.pinchStartDist !== null) {
                // Pinch zoom
                const dist = getTouchDist(touches[0], touches[1]);
                const scale = dist / state.pinchStartDist;
                state.zoom = Math.max(0.1, Math.min(100, state.pinchStartZoom * scale));
                rerender();
            }
        }, { passive: false });

        canvas.addEventListener('touchend', function (e) {
            e.preventDefault();
            state.isDragging = false;
            state.pinchStartDist = null;
            activeTouches = Array.from(e.touches);
        }, { passive: false });

        // Set grab cursor for interactive canvases
        canvas.addEventListener('mouseenter', function () {
            if (state.graphData && INTERACTIVE_TYPES.has(state.graphData.type)) {
                canvas.style.cursor = 'grab';
            }
        });
        canvas.addEventListener('mouseleave', function () {
            canvas.style.cursor = '';
        });
    }

    // ===== GRAPH TYPE RENDERERS =====

    function renderLinear(canvas, config, isRerender) {
        config = safeConfig(config);
        const w = 700, h = 450;
        const ctx = setupCanvas(canvas, w, h);

        const slope = num(config.slope, 1);
        const intercept = num(config.intercept, 0);
        let xRange = validRange(config.xRange, [-10, 10]);

        // Zoom/pan
        const state = getState(canvas);
        if (!isRerender) {
            state.originalXRange = xRange.slice();
            state.zoom = 1; state.offsetX = 0; state.offsetY = 0;
        }
        if (state.originalXRange) {
            xRange = computeRange(state.originalXRange, state.zoom, state.offsetX);
        }

        const funcStr = slope + ' * x + (' + intercept + ')';
        let yRange = calcYRange(funcStr, xRange);

        // Apply Y pan
        if (state.originalYRange && isRerender) {
            yRange = computeRange(state.originalYRange, state.zoom, state.offsetY);
        } else {
            state.originalYRange = yRange.slice();
        }

        const plot = drawAxesAndGrid(ctx, w, h, xRange, yRange);
        drawCurve(ctx, plot, funcStr, xRange, COLORS.primary);

        // Points collection for legend
        const points = [];

        // Mark y-intercept
        if (xRange[0] <= 0 && xRange[1] >= 0) {
            drawPoint(ctx, plot, 0, intercept, COLORS.primary);
            points.push({ label: 'Intersezione y', x: 0, y: intercept, color: COLORS.primary });
        }

        // Mark x-intercept
        if (slope !== 0) {
            const xIntercept = -intercept / slope;
            if (isFinite(xIntercept) && xIntercept >= xRange[0] && xIntercept <= xRange[1]) {
                drawPoint(ctx, plot, xIntercept, 0, COLORS.secondary);
                points.push({ label: 'Intersezione x', x: xIntercept, y: 0, color: COLORS.secondary });
            }
        }

        // Label
        ctx.fillStyle = COLORS.primary;
        ctx.font = '600 13px Inter, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        const slopeStr = slope === 1 ? '' : slope === -1 ? '-' : String(slope);
        const label = 'y = ' + slopeStr + 'x' + (intercept >= 0 ? ' + ' + intercept : ' - ' + Math.abs(intercept));
        ctx.fillText(label, plot.padding.left + 10, plot.padding.top + 20);

        // Legend
        drawPointLegend(ctx, w, h, points);

        // Reset button
        if (isRerender || (Math.abs(state.zoom - 1) > 0.001 || Math.abs(state.offsetX) > 0.001 || Math.abs(state.offsetY) > 0.001)) {
            if (Math.abs(state.zoom - 1) > 0.001 || Math.abs(state.offsetX) > 0.001 || Math.abs(state.offsetY) > 0.001) {
                const btn = drawResetButton(ctx, w);
                state._setResetBtnRegion(btn);
            } else {
                state._setResetBtnRegion(null);
            }
        }
    }

    function renderQuadratic(canvas, config, isRerender) {
        config = safeConfig(config);
        const w = 700, h = 450;
        const ctx = setupCanvas(canvas, w, h);

        const a = num(config.a, 1);
        const b = num(config.b, 0);
        const c = num(config.c, 0);
        let xRange = validRange(config.xRange, [-10, 10]);

        // Zoom/pan
        const state = getState(canvas);
        if (!isRerender) {
            state.originalXRange = xRange.slice();
            state.zoom = 1; state.offsetX = 0; state.offsetY = 0;
        }
        if (state.originalXRange) {
            xRange = computeRange(state.originalXRange, state.zoom, state.offsetX);
        }

        const funcStr = a + ' * x * x + (' + b + ') * x + (' + c + ')';
        let yRange = calcYRange(funcStr, xRange);

        if (state.originalYRange && isRerender) {
            yRange = computeRange(state.originalYRange, state.zoom, state.offsetY);
        } else {
            state.originalYRange = yRange.slice();
        }

        const plot = drawAxesAndGrid(ctx, w, h, xRange, yRange);
        drawCurve(ctx, plot, funcStr, xRange, COLORS.primary);

        const points = [];

        // Vertex
        if (a !== 0) {
            const vx = -b / (2 * a);
            const vy = a * vx * vx + b * vx + c;
            if (isFinite(vx) && isFinite(vy) && vx >= xRange[0] && vx <= xRange[1]) {
                drawPoint(ctx, plot, vx, vy, COLORS.tertiary, 6);
                points.push({ label: 'Vertice', x: vx, y: vy, color: COLORS.tertiary });
            }

            // Roots
            const discriminant = b * b - 4 * a * c;
            if (discriminant >= 0) {
                const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
                const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
                if (isFinite(x1) && x1 >= xRange[0] && x1 <= xRange[1]) {
                    drawPoint(ctx, plot, x1, 0, COLORS.green, 5);
                    points.push({ label: 'Radice x₁', x: x1, y: 0, color: COLORS.green });
                }
                if (isFinite(x2) && x2 >= xRange[0] && x2 <= xRange[1] && Math.abs(x1 - x2) > 0.01) {
                    drawPoint(ctx, plot, x2, 0, COLORS.green, 5);
                    points.push({ label: 'Radice x₂', x: x2, y: 0, color: COLORS.green });
                }
            }
        }

        // Label
        ctx.fillStyle = COLORS.primary;
        ctx.font = '600 13px Inter, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        let label = 'y = ' + (a === 1 ? '' : a === -1 ? '-' : a) + 'x²';
        if (b !== 0) label += ' ' + (b > 0 ? '+' : '-') + ' ' + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'x';
        if (c !== 0) label += ' ' + (c > 0 ? '+' : '-') + ' ' + Math.abs(c);
        ctx.fillText(label, plot.padding.left + 10, plot.padding.top + 20);

        drawPointLegend(ctx, w, h, points);

        // Reset button
        if (Math.abs(state.zoom - 1) > 0.001 || Math.abs(state.offsetX) > 0.001 || Math.abs(state.offsetY) > 0.001) {
            const btn = drawResetButton(ctx, w);
            state._setResetBtnRegion(btn);
        } else {
            state._setResetBtnRegion(null);
        }
    }

    function renderTrigonometric(canvas, config, isRerender) {
        config = safeConfig(config);
        const w = 700, h = 450;
        const ctx = setupCanvas(canvas, w, h);

        const func = config.func || 'sin';
        const amp = num(config.amplitude, 1);
        const per = num(config.period, 1);
        const ph = num(config.phase, 0);
        let xRange = validRange(config.xRange, [-2 * Math.PI, 2 * Math.PI]);

        // Zoom/pan
        const state = getState(canvas);
        if (!isRerender) {
            state.originalXRange = xRange.slice();
            state.zoom = 1; state.offsetX = 0; state.offsetY = 0;
        }
        if (state.originalXRange) {
            xRange = computeRange(state.originalXRange, state.zoom, state.offsetX);
        }

        const funcStr = amp + ' * Math.' + func + '(' + per + ' * x + (' + ph + '))';
        let yRange = [-(Math.abs(amp) + 0.5), Math.abs(amp) + 0.5];
        if (func === 'tan') {
            yRange = [-5, 5];
        }

        if (state.originalYRange && isRerender) {
            yRange = computeRange(state.originalYRange, state.zoom, state.offsetY);
        } else {
            state.originalYRange = yRange.slice();
        }

        const plot = drawAxesAndGrid(ctx, w, h, xRange, yRange);
        drawCurve(ctx, plot, funcStr, xRange, COLORS.primary);

        // Label
        ctx.fillStyle = COLORS.primary;
        ctx.font = '600 13px Inter, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        let label = 'y = ';
        if (amp !== 1) label += amp;
        label += func + '(';
        if (per !== 1) label += per;
        label += 'x';
        if (ph !== 0) label += ' + ' + ph.toFixed(2);
        label += ')';
        ctx.fillText(label, plot.padding.left + 10, plot.padding.top + 20);

        // Reset button
        if (Math.abs(state.zoom - 1) > 0.001 || Math.abs(state.offsetX) > 0.001 || Math.abs(state.offsetY) > 0.001) {
            const btn = drawResetButton(ctx, w);
            state._setResetBtnRegion(btn);
        } else {
            state._setResetBtnRegion(null);
        }
    }

    function renderExponential(canvas, config, isRerender) {
        config = safeConfig(config);
        const w = 700, h = 450;
        const ctx = setupCanvas(canvas, w, h);

        const base = num(config.base, Math.E);
        let xRange = validRange(config.xRange, [-5, 5]);

        // Zoom/pan
        const state = getState(canvas);
        if (!isRerender) {
            state.originalXRange = xRange.slice();
            state.zoom = 1; state.offsetX = 0; state.offsetY = 0;
        }
        if (state.originalXRange) {
            xRange = computeRange(state.originalXRange, state.zoom, state.offsetX);
        }

        const funcStr = 'Math.pow(' + base + ', x)';
        let yRange = calcYRange(funcStr, xRange);

        if (state.originalYRange && isRerender) {
            yRange = computeRange(state.originalYRange, state.zoom, state.offsetY);
        } else {
            state.originalYRange = yRange.slice();
        }

        const plot = drawAxesAndGrid(ctx, w, h, xRange, yRange);
        drawCurve(ctx, plot, funcStr, xRange, COLORS.primary);

        const points = [];

        // Mark y-intercept (0, 1)
        if (xRange[0] <= 0 && xRange[1] >= 0) {
            drawPoint(ctx, plot, 0, 1, COLORS.primary);
            points.push({ label: 'Intersezione y', x: 0, y: 1, color: COLORS.primary });
        }

        ctx.fillStyle = COLORS.primary;
        ctx.font = '600 13px Inter, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('y = ' + base + 'ˣ', plot.padding.left + 10, plot.padding.top + 20);

        drawPointLegend(ctx, w, h, points);

        // Reset button
        if (Math.abs(state.zoom - 1) > 0.001 || Math.abs(state.offsetX) > 0.001 || Math.abs(state.offsetY) > 0.001) {
            const btn = drawResetButton(ctx, w);
            state._setResetBtnRegion(btn);
        } else {
            state._setResetBtnRegion(null);
        }
    }

    function renderSystem(canvas, config, isRerender) {
        config = safeConfig(config);
        const w = 700, h = 450;
        const ctx = setupCanvas(canvas, w, h);

        const eq1 = safeConfig(config.eq1);
        const eq2 = safeConfig(config.eq2);
        const slope1 = num(eq1.slope, 1);
        const intercept1 = num(eq1.intercept, 0);
        const slope2 = num(eq2.slope, -1);
        const intercept2 = num(eq2.intercept, 2);
        let xRange = validRange(config.xRange, [-10, 10]);

        // Zoom/pan
        const state = getState(canvas);
        if (!isRerender) {
            state.originalXRange = xRange.slice();
            state.zoom = 1; state.offsetX = 0; state.offsetY = 0;
        }
        if (state.originalXRange) {
            xRange = computeRange(state.originalXRange, state.zoom, state.offsetX);
        }

        const func1 = slope1 + ' * x + (' + intercept1 + ')';
        const func2 = slope2 + ' * x + (' + intercept2 + ')';
        const yRange1 = calcYRange(func1, xRange, 0.2);
        const yRange2 = calcYRange(func2, xRange, 0.2);
        let yRange = [Math.min(yRange1[0], yRange2[0]), Math.max(yRange1[1], yRange2[1])];

        if (state.originalYRange && isRerender) {
            yRange = computeRange(state.originalYRange, state.zoom, state.offsetY);
        } else {
            state.originalYRange = yRange.slice();
        }

        const plot = drawAxesAndGrid(ctx, w, h, xRange, yRange);
        drawCurve(ctx, plot, func1, xRange, COLORS.primary);
        drawCurve(ctx, plot, func2, xRange, COLORS.secondary);

        const points = [];

        // Intersection point
        if (slope1 !== slope2) {
            const ix = (intercept2 - intercept1) / (slope1 - slope2);
            const iy = slope1 * ix + intercept1;
            if (isFinite(ix) && isFinite(iy)) {
                drawPoint(ctx, plot, ix, iy, COLORS.tertiary, 7);
                points.push({ label: 'Intersezione', x: ix, y: iy, color: COLORS.tertiary });

                ctx.fillStyle = COLORS.tertiary;
                ctx.font = '600 12px Inter, -apple-system, sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('(' + ix.toFixed(1) + ', ' + iy.toFixed(1) + ')', plot.toCanvasX(ix) + 10, plot.toCanvasY(iy) - 10);
            }
        }

        // Labels
        ctx.font = '600 13px Inter, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = COLORS.primary;
        ctx.fillText('y = ' + slope1 + 'x + ' + intercept1, plot.padding.left + 10, plot.padding.top + 20);
        ctx.fillStyle = COLORS.secondary;
        ctx.fillText('y = ' + slope2 + 'x + ' + intercept2, plot.padding.left + 10, plot.padding.top + 38);

        drawPointLegend(ctx, w, h, points);

        // Reset button
        if (Math.abs(state.zoom - 1) > 0.001 || Math.abs(state.offsetX) > 0.001 || Math.abs(state.offsetY) > 0.001) {
            const btn = drawResetButton(ctx, w);
            state._setResetBtnRegion(btn);
        } else {
            state._setResetBtnRegion(null);
        }
    }

    function renderDerivative(canvas, config, isRerender) {
        config = safeConfig(config);
        const w = 700, h = 450;
        const ctx = setupCanvas(canvas, w, h);

        const func = config.func || 'x * x';
        const derivative = config.derivative || '2 * x';
        let xRange = validRange(config.xRange, [-10, 10]);

        // Zoom/pan
        const state = getState(canvas);
        if (!isRerender) {
            state.originalXRange = xRange.slice();
            state.zoom = 1; state.offsetX = 0; state.offsetY = 0;
        }
        if (state.originalXRange) {
            xRange = computeRange(state.originalXRange, state.zoom, state.offsetX);
        }

        const yr1 = calcYRange(func, xRange, 0.2);
        const yr2 = calcYRange(derivative, xRange, 0.2);
        let yRange = [Math.min(yr1[0], yr2[0]), Math.max(yr1[1], yr2[1])];

        if (state.originalYRange && isRerender) {
            yRange = computeRange(state.originalYRange, state.zoom, state.offsetY);
        } else {
            state.originalYRange = yRange.slice();
        }

        const plot = drawAxesAndGrid(ctx, w, h, xRange, yRange);
        drawCurve(ctx, plot, func, xRange, COLORS.primary);
        drawCurve(ctx, plot, derivative, xRange, COLORS.secondary, 2);

        // Dashed line for derivative
        ctx.setLineDash([6, 4]);
        drawCurve(ctx, plot, derivative, xRange, COLORS.secondary, 2);
        ctx.setLineDash([]);

        ctx.font = '600 13px Inter, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = COLORS.primary;
        ctx.fillText('f(x)', plot.padding.left + 10, plot.padding.top + 20);
        ctx.fillStyle = COLORS.secondary;
        ctx.fillText("f'(x) — derivata", plot.padding.left + 10, plot.padding.top + 38);

        // Reset button
        if (Math.abs(state.zoom - 1) > 0.001 || Math.abs(state.offsetX) > 0.001 || Math.abs(state.offsetY) > 0.001) {
            const btn = drawResetButton(ctx, w);
            state._setResetBtnRegion(btn);
        } else {
            state._setResetBtnRegion(null);
        }
    }

    function renderIntegral(canvas, config, isRerender) {
        config = safeConfig(config);
        const w = 700, h = 450;
        const ctx = setupCanvas(canvas, w, h);

        const func = config.func || 'x';
        const ia = num(config.a, 0);
        const ib = num(config.b, 5);
        let xRange = validRange(config.xRange, [-10, 10]);

        // Zoom/pan
        const state = getState(canvas);
        if (!isRerender) {
            state.originalXRange = xRange.slice();
            state.zoom = 1; state.offsetX = 0; state.offsetY = 0;
        }
        if (state.originalXRange) {
            xRange = computeRange(state.originalXRange, state.zoom, state.offsetX);
        }

        let yRange = calcYRange(func, xRange);

        if (state.originalYRange && isRerender) {
            yRange = computeRange(state.originalYRange, state.zoom, state.offsetY);
        } else {
            state.originalYRange = yRange.slice();
        }

        const plot = drawAxesAndGrid(ctx, w, h, xRange, yRange);

        // Fill area
        drawFilledArea(ctx, plot, func, ia, ib, COLORS.fill);

        // Draw borders of integration
        ctx.strokeStyle = COLORS.primary;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        let ya, yb;
        try { ya = evalFunc(func, ia); } catch { ya = 0; }
        try { yb = evalFunc(func, ib); } catch { yb = 0; }
        if (!isFinite(ya)) ya = 0;
        if (!isFinite(yb)) yb = 0;

        ctx.beginPath();
        ctx.moveTo(plot.toCanvasX(ia), plot.toCanvasY(0));
        ctx.lineTo(plot.toCanvasX(ia), plot.toCanvasY(ya));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(plot.toCanvasX(ib), plot.toCanvasY(0));
        ctx.lineTo(plot.toCanvasX(ib), plot.toCanvasY(yb));
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw curve
        drawCurve(ctx, plot, func, xRange, COLORS.primary);

        // Labels
        ctx.fillStyle = COLORS.tick;
        ctx.font = '600 12px Inter, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('a = ' + ia, plot.toCanvasX(ia), plot.toCanvasY(0) + 32);
        ctx.fillText('b = ' + ib, plot.toCanvasX(ib), plot.toCanvasY(0) + 32);

        ctx.fillStyle = COLORS.primary;
        ctx.font = '600 13px Inter, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('∫ f(x) dx — area evidenziata', plot.padding.left + 10, plot.padding.top + 20);

        // Reset button
        if (Math.abs(state.zoom - 1) > 0.001 || Math.abs(state.offsetX) > 0.001 || Math.abs(state.offsetY) > 0.001) {
            const btn = drawResetButton(ctx, w);
            state._setResetBtnRegion(btn);
        } else {
            state._setResetBtnRegion(null);
        }
    }

    function renderBarChart(canvas, config) {
        config = safeConfig(config);
        const w = 700, h = 450;
        const ctx = setupCanvas(canvas, w, h);

        const labels = Array.isArray(config.labels) ? config.labels : [];
        const values = Array.isArray(config.values) ? config.values.map(function (v) { return num(v, 0); }) : [];

        if (values.length === 0) {
            ctx.fillStyle = COLORS.bg;
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = COLORS.tick;
            ctx.font = '500 14px Inter, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Nessun dato disponibile', w / 2, h / 2);
            return;
        }

        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, w, h);

        const padding = { top: 40, right: 30, bottom: 60, left: 55 };
        const plotW = w - padding.left - padding.right;
        const plotH = h - padding.top - padding.bottom;
        const maxVal = Math.max(...values, 1) * 1.15;
        const barWidth = Math.min(60, (plotW / values.length) * 0.6);
        const gap = (plotW - barWidth * values.length) / (values.length + 1);

        // Y axis
        ctx.strokeStyle = COLORS.axis;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, h - padding.bottom);
        ctx.lineTo(w - padding.right, h - padding.bottom);
        ctx.stroke();

        // Y grid
        const ySteps = 5;
        ctx.font = '400 11px Inter, -apple-system, sans-serif';
        ctx.fillStyle = COLORS.tick;
        ctx.textAlign = 'right';
        for (let i = 0; i <= ySteps; i++) {
            const val = (maxVal / ySteps) * i;
            const cy = h - padding.bottom - (i / ySteps) * plotH;
            ctx.strokeStyle = COLORS.grid;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(padding.left, cy);
            ctx.lineTo(w - padding.right, cy);
            ctx.stroke();
            ctx.fillStyle = COLORS.tick;
            ctx.fillText(Math.round(val).toString(), padding.left - 8, cy + 4);
        }

        // Bars
        values.forEach(function (val, i) {
            const x = padding.left + gap + i * (barWidth + gap);
            const barH = (val / maxVal) * plotH;
            const y = h - padding.bottom - barH;
            const color = COLORS.barColors[i % COLORS.barColors.length];

            // Bar with rounded top
            const radius = Math.min(6, barWidth / 4);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.lineTo(x + barWidth - radius, y);
            ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
            ctx.lineTo(x + barWidth, h - padding.bottom);
            ctx.lineTo(x, h - padding.bottom);
            ctx.closePath();
            ctx.fill();

            // Value on top
            ctx.fillStyle = COLORS.axis;
            ctx.font = '600 12px Inter, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(val.toString(), x + barWidth / 2, y - 8);

            // Label below
            ctx.fillStyle = COLORS.tick;
            ctx.font = '500 11px Inter, -apple-system, sans-serif';
            ctx.fillText(labels[i] || '', x + barWidth / 2, h - padding.bottom + 20);
        });
    }

    function renderFractionPie(canvas, config) {
        config = safeConfig(config);
        const w = 700, h = 450;
        const ctx = setupCanvas(canvas, w, h);

        const numerator = Math.max(0, Math.round(num(config.numerator, 1)));
        const denominator = Math.max(1, Math.round(num(config.denominator, 4)));

        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.3;
        const totalSlices = denominator;
        const filledSlices = Math.min(numerator, totalSlices);
        const sliceAngle = (2 * Math.PI) / totalSlices;

        // Draw slices
        for (let i = 0; i < totalSlices; i++) {
            const startAngle = -Math.PI / 2 + i * sliceAngle;
            const endAngle = startAngle + sliceAngle;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.closePath();

            if (i < filledSlices) {
                const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
                grad.addColorStop(0, '#5AC8FA');
                grad.addColorStop(1, '#007AFF');
                ctx.fillStyle = grad;
            } else {
                ctx.fillStyle = '#e8e8ed';
            }
            ctx.fill();

            // Slice border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2.5;
            ctx.stroke();
        }

        // Center circle (donut)
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.bg;
        ctx.fill();

        // Fraction text in center
        ctx.fillStyle = COLORS.axis;
        ctx.font = '700 28px Inter, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(numerator + '/' + denominator, cx, cy);

        // Label below
        ctx.font = '500 14px Inter, -apple-system, sans-serif';
        ctx.fillStyle = COLORS.tick;
        ctx.fillText(numerator + ' parti su ' + denominator, cx, cy + radius + 40);
    }

    function renderCustom(canvas, config, isRerender) {
        config = safeConfig(config);
        const w = 700, h = 450;
        const ctx = setupCanvas(canvas, w, h);

        const func = config.func || 'x';
        let xRange = validRange(config.xRange, [-10, 10]);

        // Zoom/pan
        const state = getState(canvas);
        if (!isRerender) {
            state.originalXRange = xRange.slice();
            state.zoom = 1; state.offsetX = 0; state.offsetY = 0;
        }
        if (state.originalXRange) {
            xRange = computeRange(state.originalXRange, state.zoom, state.offsetX);
        }

        let yRange = calcYRange(func, xRange);

        if (state.originalYRange && isRerender) {
            yRange = computeRange(state.originalYRange, state.zoom, state.offsetY);
        } else {
            state.originalYRange = yRange.slice();
        }

        const plot = drawAxesAndGrid(ctx, w, h, xRange, yRange);
        drawCurve(ctx, plot, func, xRange, COLORS.primary);

        // Reset button
        if (Math.abs(state.zoom - 1) > 0.001 || Math.abs(state.offsetX) > 0.001 || Math.abs(state.offsetY) > 0.001) {
            const btn = drawResetButton(ctx, w);
            state._setResetBtnRegion(btn);
        } else {
            state._setResetBtnRegion(null);
        }
    }

    // ===== GEOMETRY FIGURES =====

    function normVec(v) {
        const len = Math.sqrt(v.x * v.x + v.y * v.y) || 1;
        return { x: v.x / len, y: v.y / len };
    }

    function drawGeomTriangle(ctx, w, h, config) {
        config = safeConfig(config);
        const vertices = Array.isArray(config.vertices) ? config.vertices : [];
        const sides = Array.isArray(config.sides) ? config.sides : null;
        const angles = Array.isArray(config.angles) ? config.angles : null;
        const rightAngle = config.rightAngle;

        // Guard: need at least 3 vertices
        if (vertices.length < 3) return;

        // Validate each vertex has x, y
        const safeVerts = vertices.map(function (v) {
            if (!v || typeof v !== 'object') return { x: 0, y: 0, label: '' };
            return { x: num(v.x, 0), y: num(v.y, 0), label: v.label || '' };
        });

        const xs = safeVerts.map(function (v) { return v.x; });
        const ys = safeVerts.map(function (v) { return v.y; });
        const minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
        const minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
        const rangeX = maxX - minX || 1;
        const rangeY = maxY - minY || 1;

        const scale = Math.min((w - 200) / rangeX, (h - 160) / rangeY) * 0.72;
        const cxM = (minX + maxX) / 2, cyM = (minY + maxY) / 2;

        function toC(v) {
            return { x: w / 2 + (v.x - cxM) * scale, y: h / 2 - (v.y - cyM) * scale };
        }

        const cv = safeVerts.map(toC);
        const centroid = {
            x: cv.reduce(function (s, v) { return s + v.x; }, 0) / 3,
            y: cv.reduce(function (s, v) { return s + v.y; }, 0) / 3
        };

        // Fill
        ctx.beginPath();
        ctx.moveTo(cv[0].x, cv[0].y);
        cv.forEach(function (v) { ctx.lineTo(v.x, v.y); });
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,122,255,0.08)';
        ctx.fill();

        // Stroke
        ctx.strokeStyle = COLORS.primary;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(cv[0].x, cv[0].y);
        cv.forEach(function (v) { ctx.lineTo(v.x, v.y); });
        ctx.closePath();
        ctx.stroke();

        // Right angle mark
        if (rightAngle !== undefined && rightAngle !== null) {
            const vi = num(rightAngle, 0);
            if (vi >= 0 && vi < 3) {
                const vp = cv[vi], v1 = cv[(vi + 1) % 3], v2 = cv[(vi + 2) % 3];
                const sz = 14;
                const d1 = normVec({ x: v1.x - vp.x, y: v1.y - vp.y });
                const d2 = normVec({ x: v2.x - vp.x, y: v2.y - vp.y });
                ctx.strokeStyle = COLORS.axis;
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(vp.x + d1.x * sz, vp.y + d1.y * sz);
                ctx.lineTo(vp.x + d1.x * sz + d2.x * sz, vp.y + d1.y * sz + d2.y * sz);
                ctx.lineTo(vp.x + d2.x * sz, vp.y + d2.y * sz);
                ctx.stroke();
            }
        }

        // Vertex labels
        ctx.font = 'bold 16px Inter, -apple-system, sans-serif';
        ctx.fillStyle = COLORS.axis;
        cv.forEach(function (p, i) {
            const label = safeVerts[i].label || String.fromCharCode(65 + i);
            const dx = p.x - centroid.x, dy = p.y - centroid.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, p.x + dx / len * 22, p.y + dy / len * 22);
        });

        // Side labels
        if (sides) {
            ctx.font = '600 13px Inter, -apple-system, sans-serif';
            for (let i = 0; i < 3 && i < sides.length; i++) {
                const sideObj = sides[i];
                if (!sideObj || typeof sideObj !== 'object') continue;
                const label = sideObj.label;
                if (!label) continue;
                const v1 = cv[i], v2 = cv[(i + 1) % 3];
                const mx = (v1.x + v2.x) / 2, my = (v1.y + v2.y) / 2;
                const ex = v2.x - v1.x, ey = v2.y - v1.y;
                const plen = Math.sqrt(ex * ex + ey * ey) || 1;
                let nx = -ey / plen, ny = ex / plen;
                const dot = (mx + nx * 20 - centroid.x) * nx + (my + ny * 20 - centroid.y) * ny;
                if (dot < 0) { nx = -nx; ny = -ny; }
                const lx = mx + nx * 24, ly = my + ny * 24;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const m = ctx.measureText(label);
                ctx.fillStyle = 'rgba(255,255,255,0.88)';
                ctx.fillRect(lx - m.width / 2 - 3, ly - 9, m.width + 6, 18);
                ctx.fillStyle = COLORS.secondary;
                ctx.fillText(label, lx, ly);
            }
        }

        // Angle labels
        if (angles) {
            ctx.font = '500 12px Inter, -apple-system, sans-serif';
            ctx.fillStyle = COLORS.tertiary;
            angles.forEach(function (angle, i) {
                if (!angle || typeof angle !== 'object' || !angle.label) return;
                const idx = (typeof angle.at === 'number') ? angle.at : i;
                if (idx >= cv.length) return;
                const vp = cv[idx], v1 = cv[(idx + 1) % 3], v2 = cv[(idx + 2) % 3];
                const d1 = normVec({ x: v1.x - vp.x, y: v1.y - vp.y });
                const d2 = normVec({ x: v2.x - vp.x, y: v2.y - vp.y });
                const bx = d1.x + d2.x, by = d1.y + d2.y;
                const blen = Math.sqrt(bx * bx + by * by) || 1;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(angle.label, vp.x + bx / blen * 28, vp.y + by / blen * 28);
            });
        }
    }

    function drawGeomRectangle(ctx, w, h, config) {
        config = safeConfig(config);
        const rectWidth = num(config.width, 4);
        const rectHeight = num(config.height, 3);
        const labels = config.labels || null;

        const aspect = rectWidth / rectHeight;
        const maxW = w * 0.55, maxH = h * 0.52;
        let rw, rh;
        if (aspect > maxW / maxH) { rw = maxW; rh = rw / aspect; }
        else { rh = maxH; rw = rh * aspect; }
        const rx = (w - rw) / 2, ry = (h - rh) / 2;

        ctx.fillStyle = 'rgba(0,122,255,0.08)';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = COLORS.primary;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(rx, ry, rw, rh);

        // Corner right-angle marks
        const ms = 12;
        [[rx, ry, 1, 1], [rx + rw, ry, -1, 1], [rx + rw, ry + rh, -1, -1], [rx, ry + rh, 1, -1]].forEach(function (arr) {
            var cx = arr[0], cy = arr[1], sx = arr[2], sy = arr[3];
            ctx.strokeStyle = COLORS.axisLabel;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx + sx * ms, cy);
            ctx.lineTo(cx + sx * ms, cy + sy * ms);
            ctx.lineTo(cx, cy + sy * ms);
            ctx.stroke();
        });

        if (!labels) return;
        ctx.font = '600 14px Inter, -apple-system, sans-serif';
        ctx.fillStyle = COLORS.secondary;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (labels.width)  ctx.fillText(labels.width,  rx + rw / 2, ry - 22);
        if (labels.bottom) ctx.fillText(labels.bottom, rx + rw / 2, ry + rh + 22);
        if (labels.height) {
            ctx.save();
            ctx.translate(rx + rw + 34, ry + rh / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(labels.height, 0, 0);
            ctx.restore();
        }
        if (labels.left) {
            ctx.save();
            ctx.translate(rx - 34, ry + rh / 2);
            ctx.rotate(Math.PI / 2);
            ctx.fillText(labels.left, 0, 0);
            ctx.restore();
        }
    }

    function drawGeomCircle(ctx, w, h, config) {
        config = safeConfig(config);
        const labels = config.labels || null;
        const cx = w / 2, cy = h / 2 - 10;
        const r = Math.min(w, h) * 0.27;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,122,255,0.08)';
        ctx.fill();
        ctx.strokeStyle = COLORS.primary;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.axis;
        ctx.fill();

        const angle = -Math.PI / 4;
        ctx.strokeStyle = COLORS.secondary;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        ctx.stroke();
        ctx.setLineDash([]);

        if (!labels) return;
        ctx.font = '600 13px Inter, -apple-system, sans-serif';
        ctx.fillStyle = COLORS.secondary;
        ctx.textAlign = 'center';
        if (labels.radius) {
            ctx.textBaseline = 'bottom';
            ctx.fillText(labels.radius,
                cx + Math.cos(angle) * r / 2 + 12,
                cy + Math.sin(angle) * r / 2 - 6);
        }
        let ey = cy + r + 28;
        ctx.font = '500 13px Inter, -apple-system, sans-serif';
        ctx.fillStyle = COLORS.axisLabel;
        ctx.textBaseline = 'top';
        if (labels.extra)  { ctx.fillText(labels.extra,  cx, ey); ey += 22; }
        if (labels.extra2) { ctx.fillText(labels.extra2, cx, ey); }
    }

    function drawGeomParallelogram(ctx, w, h, config) {
        config = safeConfig(config);
        const base = num(config.base, 6);
        const side = num(config.side, 4);
        const angle = num(config.angle, 60);
        const labels = config.labels || null;

        const angleRad = angle * Math.PI / 180;
        const bScale = w * 0.42;
        const sScale = bScale * (side / base) * 0.75;
        const shiftX = sScale * Math.cos(angleRad);
        const shiftY = sScale * Math.sin(angleRad);

        const x0 = (w - bScale - shiftX) / 2 + shiftX;
        const y0 = (h + shiftY) / 2;

        const pts = [
            { x: x0, y: y0 },
            { x: x0 + bScale, y: y0 },
            { x: x0 + bScale - shiftX, y: y0 - shiftY },
            { x: x0 - shiftX, y: y0 - shiftY }
        ];

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        pts.forEach(function (p) { ctx.lineTo(p.x, p.y); });
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,122,255,0.08)';
        ctx.fill();
        ctx.strokeStyle = COLORS.primary;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Height dashed line
        if (labels && labels.height) {
            const footX = pts[3].x + shiftX;
            ctx.strokeStyle = COLORS.tertiary;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.moveTo(pts[3].x, pts[3].y);
            ctx.lineTo(footX, y0);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.font = '600 13px Inter, -apple-system, sans-serif';
            ctx.fillStyle = COLORS.tertiary;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(labels.height, pts[3].x - 8, (pts[3].y + y0) / 2);
        }

        if (!labels) return;
        ctx.font = '600 13px Inter, -apple-system, sans-serif';
        ctx.fillStyle = COLORS.secondary;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (labels.base) ctx.fillText(labels.base, (pts[0].x + pts[1].x) / 2, pts[0].y + 22);
        if (labels.side) {
            ctx.save();
            var mx = (pts[0].x + pts[3].x) / 2, my = (pts[0].y + pts[3].y) / 2;
            ctx.translate(mx - 18, my);
            ctx.rotate(Math.atan2(pts[3].y - pts[0].y, pts[3].x - pts[0].x));
            ctx.fillText(labels.side, 0, 0);
            ctx.restore();
        }
    }

    function renderGeometry(canvas, config) {
        config = safeConfig(config);
        const w = 700, h = 450;
        const ctx = setupCanvas(canvas, w, h);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);

        const shape = config.shape || '';
        if (shape === 'triangle' || shape === 'right-triangle') drawGeomTriangle(ctx, w, h, config);
        else if (shape === 'rectangle' || shape === 'square') drawGeomRectangle(ctx, w, h, config);
        else if (shape === 'circle') drawGeomCircle(ctx, w, h, config);
        else if (shape === 'parallelogram') drawGeomParallelogram(ctx, w, h, config);
    }

    // ===== INTERNAL RENDER (used for re-renders on zoom/pan) =====

    /**
     * Draw a user-friendly error message on the canvas when rendering fails.
     */
    function drawErrorFallback(canvas, errorMsg) {
        var w = 700, h = 450;
        try {
            var ctx = setupCanvas(canvas, w, h);
            ctx.fillStyle = COLORS.bg;
            ctx.fillRect(0, 0, w, h);

            // Error icon
            ctx.font = '400 48px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FF3B30';
            ctx.fillText('⚠️', w / 2, h / 2 - 30);

            // Error text
            ctx.font = '500 14px Inter, -apple-system, sans-serif';
            ctx.fillStyle = COLORS.axis;
            ctx.fillText('Impossibile visualizzare il grafico', w / 2, h / 2 + 20);

            ctx.font = '400 12px Inter, -apple-system, sans-serif';
            ctx.fillStyle = COLORS.tick;
            ctx.fillText('Riprova a generare l\'esercizio', w / 2, h / 2 + 44);

            if (errorMsg) {
                ctx.font = '400 10px Inter, -apple-system, sans-serif';
                ctx.fillStyle = '#aaa';
                var truncated = String(errorMsg).substring(0, 80);
                ctx.fillText(truncated, w / 2, h / 2 + 66);
            }
        } catch (e2) {
            console.error('MathGraph: even error fallback failed', e2);
        }
    }

    function renderInternal(canvas, graphData, isRerender) {
        if (!graphData || !canvas) return;

        var type = graphData.type || '';
        var config = safeConfig(graphData.config);

        try {
            switch (type) {
                case 'linear':
                    renderLinear(canvas, config, isRerender);
                    break;
                case 'quadratic':
                    renderQuadratic(canvas, config, isRerender);
                    break;
                case 'trigonometric':
                    renderTrigonometric(canvas, config, isRerender);
                    break;
                case 'exponential':
                    renderExponential(canvas, config, isRerender);
                    break;
                case 'system':
                    renderSystem(canvas, config, isRerender);
                    break;
                case 'derivative':
                    renderDerivative(canvas, config, isRerender);
                    break;
                case 'integral':
                    renderIntegral(canvas, config, isRerender);
                    break;
                case 'bar-chart':
                    renderBarChart(canvas, config);
                    break;
                case 'fraction-pie':
                    renderFractionPie(canvas, config);
                    break;
                case 'custom':
                    renderCustom(canvas, config, isRerender);
                    break;
                case 'geometry':
                    renderGeometry(canvas, config);
                    break;
                default:
                    console.warn('Unknown graph type:', type);
            }
        } catch (err) {
            console.error('MathGraph render error for type "' + type + '":', err, '\nConfig:', JSON.stringify(graphData));
            drawErrorFallback(canvas, err.message);
        }
    }

    // ===== PUBLIC API =====

    function render(canvas, graphData) {
        if (!graphData || !canvas) return;

        // Store graphData in state for re-renders
        var state = getState(canvas);
        state.graphData = graphData;

        // Bind interactions once per canvas (only for interactive types)
        if (!state.interactionsBound && INTERACTIVE_TYPES.has(graphData.type)) {
            bindInteractions(canvas, state);
        }

        // First render is never a re-render
        renderInternal(canvas, graphData, false);
    }

    return { render: render };
})();
