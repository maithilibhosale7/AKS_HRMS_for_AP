/**
 * Theme_Path.js
 *
 * Path utilities for navigating Project_Theme_Settings using dot + bracket notation.
 *
 * Notation rules:
 *   - Identifier-safe keys are separated by dots:  a.b.c
 *   - Keys with non-identifier characters use brackets (bare text, no quotes):
 *       input_method_identity[User Input].accent_color
 *   - Bracket and dot notation can be mixed freely in the same path.
 *
 * No external dependencies.
 */

// ---------------------------------------------------------------------------
// tokenize
// ---------------------------------------------------------------------------

/**
 * Split a path string into an ordered array of key strings.
 *
 * @param {string} path  e.g. 'a.b[c d].e' or 'input_method_identity[User Input].icon'
 * @returns {string[]}   e.g. ['a', 'b', 'c d', 'e']
 */
export function tokenize(path) {
    const tokens = [];
    let i = 0;
    while (i < path.length) {
        if (path[i] === '[') {
            // Bracket segment: read everything up to the closing ']'
            const end = path.indexOf(']', i + 1);
            if (end === -1) break; // malformed — stop
            tokens.push(path.slice(i + 1, end));
            i = end + 1;
            if (path[i] === '.') i++; // consume the dot that may follow ']'
        } else {
            // Dot segment: read until the next '.' or '['
            const dotIdx   = path.indexOf('.', i);
            const brackIdx = path.indexOf('[', i);

            let end;
            if (dotIdx === -1 && brackIdx === -1) {
                end = path.length;
            } else if (dotIdx === -1) {
                end = brackIdx;
            } else if (brackIdx === -1) {
                end = dotIdx;
            } else {
                end = Math.min(dotIdx, brackIdx);
            }

            if (end > i) tokens.push(path.slice(i, end));
            i = end;
            if (path[i] === '.') i++; // consume the dot
        }
    }
    return tokens;
}

// ---------------------------------------------------------------------------
// getPath
// ---------------------------------------------------------------------------

/**
 * Resolve a dot/bracket path against an object.
 * Returns `undefined` (never throws) if any intermediate key is missing.
 *
 * @param {object} obj
 * @param {string} path
 * @returns {*}
 */
export function getPath(obj, path) {
    const keys = tokenize(path);
    let cur = obj;
    for (let i = 0; i < keys.length; i++) {
        if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
        cur = cur[keys[i]];
    }
    return cur;
}

// ---------------------------------------------------------------------------
// setPath
// ---------------------------------------------------------------------------

/**
 * Set a value at a dot/bracket path inside an object.
 * Does NOT create missing intermediate objects — returns `false` if any
 * intermediate key is absent.  Returns `true` on success.
 *
 * @param {object} obj
 * @param {string} path
 * @param {*}      value
 * @returns {boolean}
 */
export function setPath(obj, path, value) {
    const keys = tokenize(path);
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (cur === null || cur === undefined || typeof cur !== 'object') return false;
        cur = cur[keys[i]];
    }
    if (cur === null || cur === undefined || typeof cur !== 'object') return false;
    cur[keys[keys.length - 1]] = value;
    return true;
}

// ---------------------------------------------------------------------------
// walkLeaves
// ---------------------------------------------------------------------------

/** Keys whose names contain characters outside [A-Za-z0-9_$] need bracket notation. */
function _needsBracket(key) {
    return /[^A-Za-z0-9_$]/.test(key);
}

/**
 * Walk an object recursively and collect every leaf node.
 * Plain objects are descended into; everything else (string, number, boolean,
 * null, undefined, Array) is treated as a leaf.
 *
 * Paths use bracket notation automatically for keys with non-identifier chars:
 *   { 'User Input': { accent_color: '#3B82F6' } }
 *   → { path: '[User Input].accent_color', value: '#3B82F6' }
 *   (when called from a parent whose prefix is 'input_method_identity' the
 *   full path becomes 'input_method_identity[User Input].accent_color')
 *
 * @param {object} obj
 * @param {string} [prefix='']  accumulator — callers pass '' or omit
 * @returns {{ path: string, value: * }[]}
 */
export function walkLeaves(obj, prefix = '') {
    if (obj === null || obj === undefined || typeof obj !== 'object' || Array.isArray(obj)) {
        return prefix ? [{ path: prefix, value: obj }] : [];
    }

    const results = [];

    for (const key of Object.keys(obj)) {
        const bracket = _needsBracket(key);
        let fullPath;

        if (!prefix) {
            // Root level
            fullPath = bracket ? '[' + key + ']' : key;
        } else {
            fullPath = bracket ? prefix + '[' + key + ']' : prefix + '.' + key;
        }

        const children = walkLeaves(obj[key], fullPath);
        for (let i = 0; i < children.length; i++) results.push(children[i]);
    }

    return results;
}
