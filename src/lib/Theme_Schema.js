/**
 * Theme_Schema.js
 *
 * Canonical schema registry for every leaf property in Project_Theme_Settings.js.
 * The Phase 2 editor renders entirely from this file — adding a new theme
 * property means adding one entry here; the editor gains the control automatically.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ENTRY SHAPE
 * ─────────────────────────────────────────────────────────────────────────────
 * {
 *   path        : string   — dot/bracket path into the theme object
 *                            (see Theme_Path.js for notation rules)
 *   label       : string   — human-readable field label shown in the editor
 *   parent_tab  : string   — one of Top_Level_Tabs[].id   (R1)
 *   group       : string   — sub-nav grouping within parent_tab
 *   subgroup    : string|null — section heading within group; null = no sub-heading
 *   type        : string   — 'color'|'dimension'|'font_size'|'font_weight'|
 *                            'select'|'image'|'text'|'number'
 *   units       : string[]|null  — allowed unit suffixes for dimension/font_size
 *                                  null means use the type default
 *   options     : string[]|null  — allowed values for select type
 *   min         : number|null    — numeric minimum for number/dimension  (R6.2)
 *   max         : number|null    — numeric maximum for number/dimension  (R6.2)
 *   step        : number|null    — numeric step for number/dimension     (R6.2)
 *   internal    : boolean        — true = exists in theme but hidden from editor
 *   deferred    : boolean        — true = path not yet in theme file     (R6.3)
 *   note        : string|null    — human-readable explanation
 * }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TYPE-INFERENCE RULES (applied when design doc §6 does not specify a type)
 * ─────────────────────────────────────────────────────────────────────────────
 *   1. Value matches /^#[0-9a-fA-F]{3,8}$/ or starts with 'rgb'  → 'color'
 *   2. Value matches /^[\d.]+\s*(px|rem|em|%|vh|vw)$/
 *        AND key contains 'font_size' or 'size' (and is dimensional)  → 'font_size'
 *        otherwise                                                     → 'dimension'
 *   3. Value is one of '100'–'900' (CSS font-weight keyword)          → 'font_weight'
 *   4. Bare JavaScript number (typeof === 'number')                   → 'number'
 *   5. Value starts with '/' or ends with image extension             → 'image'
 *   6. Anything else                                                  → 'text'
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LUCIDE ICON OPTIONS — for input_method_identity[*].icon  (R5)
 * ─────────────────────────────────────────────────────────────────────────────
 * Collected by:
 *   grep -rh "from 'lucide-svelte'" src/lib/components/DataEntry src/lib/components/TableView \
 *     | grep -oE '\{[^}]*\}' | tr ',' '\n' | tr -d '{}' | awk '{$1=$1};1' | sort -u
 * Result: ChevronDown, Link, ListPlus, Paperclip, Pencil, Sparkles
 */

import { walkLeaves, getPath } from './Theme_Path.js';

// ─────────────────────────────────────────────────────────────────────────────
// Shared option arrays
// ─────────────────────────────────────────────────────────────────────────────

const FONT_WEIGHTS   = ['300', '400', '500', '600', '700'];
const BORDER_STYLES  = ['solid', 'dashed', 'dotted', 'double'];
const TEXT_XFORMS    = ['uppercase', 'lowercase', 'capitalize', 'none'];
const BLUR_LEVELS    = ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
const LUCIDE_ICONS   = ['Pencil', 'Sparkles', 'ChevronDown', 'Link', 'ListPlus', 'Paperclip'];

// ─────────────────────────────────────────────────────────────────────────────
// Top-level tabs  (R1)
// ─────────────────────────────────────────────────────────────────────────────

export const Top_Level_Tabs = [
    { id: 'branding',  label: 'Branding'  },
    { id: 'layout',    label: 'Layout'    },
    { id: 'forms',     label: 'Forms'     },
    { id: 'table',     label: 'Table'     },
    { id: 'overlays',  label: 'Overlays'  },
    { id: 'identity',  label: 'Identity'  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Entry factory — keeps the array readable
// ─────────────────────────────────────────────────────────────────────────────

/** @param {string} path @param {string} label @param {string} pt parent_tab
 *  @param {string} g group @param {string|null} sg subgroup @param {string} type
 *  @param {object} [x] extra overrides */
function e(path, label, pt, g, sg, type, x = {}) {
    return {
        path, label,
        parent_tab: pt,
        group: g,
        subgroup: sg,
        type,
        units:    x.units    ?? null,
        options:  x.options  ?? null,
        min:      x.min      ?? null,
        max:      x.max      ?? null,
        step:     x.step     ?? null,
        internal: x.internal ?? false,
        deferred: x.deferred ?? false,
        note:     x.note     ?? null,
    };
}

// Shorthand aliases for the most common extra combos
const FW  = { options: FONT_WEIGHTS };                          // font_weight select
const PX  = { units: ['px'] };                                  // dimension, px only
const PR  = { units: ['px', 'rem'] };                           // dimension, px or rem
const RP  = { units: ['rem', 'px'] };                           // font_size default order
const RPE = { units: ['rem', 'px', 'em'] };                     // font_size with em
const EM  = { units: ['em', 'rem', 'px'] };                     // letter-spacing default
const ERm = { units: ['em', 'px', 'rem'] };                     // em-first dimensions
const OPC = { min: 0, max: 1, step: 0.05 };                     // opacity 0–1

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

export const Theme_Schema = [

    // ═══════════════════════════════════════════════════════════════════════
    // BRANDING
    // ═══════════════════════════════════════════════════════════════════════

    // group: global
    e('header_color',    'Header Color',     'branding', 'global', null, 'color'),
    e('sidebar_color',   'Sidebar Color',    'branding', 'global', null, 'color'),
    e('component_color', 'Component Color',  'branding', 'global', null, 'color'),

    // group: assets
    e('client_logo',            'Client Logo',             'branding', 'assets', null, 'image'),
    e('client_loader_icon',     'Loader Icon',             'branding', 'assets', null, 'image'),
    e('AKS_Logo',               'AKS Logo',                'branding', 'assets', null, 'image'),
    e('login_background_image', 'Login Background Image',  'branding', 'assets', null, 'image'),

    // ═══════════════════════════════════════════════════════════════════════
    // LAYOUT
    // ═══════════════════════════════════════════════════════════════════════

    // group: nav_menu
    e('nav_menu.main_bg',        'Menu Background',       'layout', 'nav_menu', null, 'color'),
    e('nav_menu.main_text',      'Main Item Text',        'layout', 'nav_menu', null, 'color'),
    e('nav_menu.heading_text',   'Heading Text',          'layout', 'nav_menu', null, 'color'),
    e('nav_menu.heading_icon',   'Heading Icon',          'layout', 'nav_menu', null, 'color'),
    e('nav_menu.sub_text',       'Sub-item Text',         'layout', 'nav_menu', null, 'color'),
    e('nav_menu.sub_active_bg',  'Active Item Background','layout', 'nav_menu', null, 'color'),
    e('nav_menu.sub_active_text','Active Item Text',      'layout', 'nav_menu', null, 'color'),

    // group: toasts — subgroup: Layout
    e('toasts.bottom',        'Bottom Offset',  'layout', 'toasts', 'Layout', 'dimension', { units: ['em', 'px', 'rem'] }),
    e('toasts.border_radius', 'Border Radius',  'layout', 'toasts', 'Layout', 'dimension', { units: ['em', 'px', 'rem'] }),
    e('toasts.font_size',     'Font Size',      'layout', 'toasts', 'Layout', 'font_size',  RPE),
    e('toasts.min_width',     'Min Width',      'layout', 'toasts', 'Layout', 'dimension',  PR),

    // group: toasts — subgroup: Success
    e('toasts.success_bg',     'Background', 'layout', 'toasts', 'Success', 'color'),
    e('toasts.success_border', 'Border',     'layout', 'toasts', 'Success', 'color'),
    e('toasts.success_color',  'Text',       'layout', 'toasts', 'Success', 'color'),

    // group: toasts — subgroup: Error
    e('toasts.error_bg',     'Background', 'layout', 'toasts', 'Error', 'color'),
    e('toasts.error_border', 'Border',     'layout', 'toasts', 'Error', 'color'),
    e('toasts.error_color',  'Text',       'layout', 'toasts', 'Error', 'color'),

    // group: toasts — subgroup: Warning
    e('toasts.warn_bg',     'Background', 'layout', 'toasts', 'Warning', 'color'),
    e('toasts.warn_border', 'Border',     'layout', 'toasts', 'Warning', 'color'),
    e('toasts.warn_color',  'Text',       'layout', 'toasts', 'Warning', 'color'),

    // group: toasts — subgroup: Info
    e('toasts.info_bg',     'Background', 'layout', 'toasts', 'Info', 'color'),
    e('toasts.info_border', 'Border',     'layout', 'toasts', 'Info', 'color'),
    e('toasts.info_color',  'Text',       'layout', 'toasts', 'Info', 'color'),

    // group: legacy_roots  (live root-level properties kept for backward compat)
    e('linked_display_color', 'Linked Display Card Background', 'layout', 'legacy_roots', null, 'color',
        { note: 'Applied to card headers in AKS_Linked_Display, AKS_Linked_Selection, AKS_Linked_Addition.' }),
    e('Card_Bg', 'Scenario Card Background', 'layout', 'legacy_roots', null, 'color',
        { note: 'Used by ScenarioConfig/+page.svelte.' }),

    // group: legacy_internal  (R2, R4 — hidden from editor; present for coverage)
    e('User_Input', 'User Input Label Background', 'layout', 'legacy_internal', null, 'color',
        { internal: true, note: 'R4: shadowed by input_method_identity[User Input].label_background at download time. Read by AutoResizeTextArea.svelte.' }),
    e('Auto_populated', 'Auto-Populated Label Background', 'layout', 'legacy_internal', null, 'color',
        { internal: true, note: 'R4: shadowed by input_method_identity[Auto-populated].label_background at download time. Read by AutoResizeTextArea.svelte.' }),

    // component_styles.label.* — R2: consumed only by AutoResizeTextArea; awaiting migration
    e('component_styles.label.text_color',    'Label Text Color',   'layout', 'legacy_internal', 'label', 'color',
        { internal: true, note: 'R2: read by AutoResizeTextArea.svelte:48. Migrate to component_styles.label_row.' }),
    e('component_styles.label.font_size',     'Label Font Size',    'layout', 'legacy_internal', 'label', 'font_size', { internal: true, units: ['px', 'rem'], note: 'R2: AutoResizeTextArea.svelte:49.' }),
    e('component_styles.label.font_weight',   'Label Font Weight',  'layout', 'legacy_internal', 'label', 'font_weight', { internal: true, options: FONT_WEIGHTS, note: 'R2: AutoResizeTextArea.svelte:50.' }),
    e('component_styles.label.border_size',   'Label Border Size',  'layout', 'legacy_internal', 'label', 'dimension', { internal: true, units: ['px'], note: 'R2: AutoResizeTextArea.svelte:51.' }),
    e('component_styles.label.border_style',  'Label Border Style', 'layout', 'legacy_internal', 'label', 'select', { internal: true, options: BORDER_STYLES, note: 'R2: AutoResizeTextArea.svelte:51.' }),
    e('component_styles.label.border_color',  'Label Border Color', 'layout', 'legacy_internal', 'label', 'color',
        { internal: true, note: 'R2: AutoResizeTextArea.svelte:51.' }),
    e('component_styles.label.border_radius', 'Label Border Radius','layout', 'legacy_internal', 'label', 'dimension', { internal: true, units: ['px', 'rem'], note: 'R2: AutoResizeTextArea.svelte:52.' }),
    e('component_styles.label.padding',       'Label Padding',      'layout', 'legacy_internal', 'label', 'text',
        { internal: true, note: 'R2: AutoResizeTextArea.svelte:53.' }),
    e('component_styles.label.margin_bottom', 'Label Margin Bottom','layout', 'legacy_internal', 'label', 'dimension', { internal: true, units: ['px', 'rem'], note: 'R2: AutoResizeTextArea.svelte:54.' }),

    // component_styles.mandatory_mark.* — R2
    e('component_styles.mandatory_mark.text_color',  'Mandatory Mark Color',  'layout', 'legacy_internal', 'mandatory_mark', 'color',
        { internal: true, note: 'R2: read by AutoResizeTextArea.svelte:60. Migrate to component_styles.label_row.mandatory_mark_color.' }),
    e('component_styles.mandatory_mark.font_size',   'Mandatory Mark Size',   'layout', 'legacy_internal', 'mandatory_mark', 'font_size', { internal: true, units: ['px', 'rem'], note: 'R2: AutoResizeTextArea.svelte:61.' }),
    e('component_styles.mandatory_mark.font_weight', 'Mandatory Mark Weight', 'layout', 'legacy_internal', 'mandatory_mark', 'font_weight', { internal: true, options: FONT_WEIGHTS, note: 'R2: AutoResizeTextArea.svelte:62.' }),

    // component_styles.input.* — consumed by AutoResizeTextArea; internal per R2
    e('component_styles.input.text_color',   'Input Text Color',   'layout', 'legacy_internal', 'input', 'color',      { internal: true, note: 'R2: AutoResizeTextArea.svelte:80. Migrate to component_styles.input_area.' }),
    e('component_styles.input.font_size',    'Input Font Size',    'layout', 'legacy_internal', 'input', 'font_size',  { internal: true, units: ['px', 'rem'], note: 'R2: AutoResizeTextArea.svelte:81.' }),
    e('component_styles.input.font_weight',  'Input Font Weight',  'layout', 'legacy_internal', 'input', 'font_weight',{ internal: true, options: FONT_WEIGHTS, note: 'R2: AutoResizeTextArea.svelte:82.' }),
    e('component_styles.input.border_size',  'Input Border Size',  'layout', 'legacy_internal', 'input', 'dimension',  { internal: true, units: ['px'], note: 'R2: AutoResizeTextArea.svelte:83.' }),
    e('component_styles.input.border_style', 'Input Border Style', 'layout', 'legacy_internal', 'input', 'select',     { internal: true, options: BORDER_STYLES, note: 'R2: AutoResizeTextArea.svelte:83.' }),
    e('component_styles.input.border_color', 'Input Border Color', 'layout', 'legacy_internal', 'input', 'color',      { internal: true, note: 'R2: AutoResizeTextArea.svelte:83.' }),
    e('component_styles.input.border_radius','Input Border Radius','layout', 'legacy_internal', 'input', 'dimension',  { internal: true, units: ['px', 'rem'], note: 'R2: AutoResizeTextArea.svelte:84.' }),
    e('component_styles.input.padding',      'Input Padding',      'layout', 'legacy_internal', 'input', 'text',       { internal: true, note: 'R2: AutoResizeTextArea.svelte:85.' }),
    e('component_styles.input.min_height',   'Input Min Height',   'layout', 'legacy_internal', 'input', 'dimension',  { internal: true, units: ['px', 'rem'], note: 'R2: AutoResizeTextArea.svelte:86.' }),
    e('component_styles.input.background',   'Input Background',   'layout', 'legacy_internal', 'input', 'color',      { internal: true, note: 'R2: AutoResizeTextArea.svelte:87.' }),

    // component_styles.input_readonly.* — consumed by AutoResizeTextArea; internal per R2
    e('component_styles.input_readonly.text_color',  'Readonly Text Color',  'layout', 'legacy_internal', 'input_readonly', 'color',
        { internal: true, note: 'R2: AutoResizeTextArea.svelte:80. Migrate to component_styles.input_area.readonly_text_color.' }),
    e('component_styles.input_readonly.background',  'Readonly Background',  'layout', 'legacy_internal', 'input_readonly', 'color',
        { internal: true, note: 'R2: AutoResizeTextArea.svelte:87.' }),
    e('component_styles.input_readonly.border_color','Readonly Border Color','layout', 'legacy_internal', 'input_readonly', 'color',
        { internal: true, note: 'R2: AutoResizeTextArea.svelte:83.' }),

    // ═══════════════════════════════════════════════════════════════════════
    // FORMS
    // ═══════════════════════════════════════════════════════════════════════

    // group: form_container
    e('component_styles.form_container.background',   'Background',  'forms', 'form_container', null, 'color'),
    e('component_styles.form_container.border_radius','Border Radius','forms', 'form_container', null, 'dimension', PR),
    e('component_styles.form_container.padding',      'Padding',     'forms', 'form_container', null, 'text'),
    e('component_styles.form_container.max_height',   'Max Height',  'forms', 'form_container', null, 'text'),

    // group: field_container  (flex/padding are Tailwind classes — internal)
    e('component_styles.field_container.flex',       'Flex Class',       'forms', 'field_container', null, 'text',
        { internal: true, note: 'Tailwind utility class (e.g. "flex-none"), not a CSS value. Used in class= by AKS_Dropdown, AKS_Attachment, AKS_Linked_*.' }),
    e('component_styles.field_container.padding',    'Padding Class',    'forms', 'field_container', null, 'text',
        { internal: true, note: 'Tailwind utility class (e.g. "p-2"), not a CSS value.' }),
    e('component_styles.field_container.background', 'Background Color', 'forms', 'field_container', null, 'color',
        { note: 'Applied as background-color inline style. "transparent" is a valid value.' }),

    // group: label_row — subgroup: Layout
    e('component_styles.label_row.height',          'Row Height',       'forms', 'label_row', 'Layout', 'dimension', PR),
    e('component_styles.label_row.icon_size',       'Icon Size',        'forms', 'label_row', 'Layout', 'dimension', PR),
    e('component_styles.label_row.icon_margin_right','Icon Right Margin','forms', 'label_row', 'Layout', 'dimension', PR),
    e('component_styles.label_row.font_size',       'Font Size',        'forms', 'label_row', 'Layout', 'font_size', RPE),
    e('component_styles.label_row.font_weight',     'Font Weight',      'forms', 'label_row', 'Layout', 'font_weight', FW),
    e('component_styles.label_row.letter_spacing',  'Letter Spacing',   'forms', 'label_row', 'Layout', 'dimension', EM),
    e('component_styles.label_row.text_transform',  'Text Transform',   'forms', 'label_row', 'Layout', 'select', { options: TEXT_XFORMS }),

    // group: label_row — subgroup: Mandatory Mark
    e('component_styles.label_row.mandatory_mark_color', 'Color', 'forms', 'label_row', 'Mandatory Mark', 'color'),
    e('component_styles.label_row.mandatory_mark_size',  'Size',  'forms', 'label_row', 'Mandatory Mark', 'font_size', RPE),

    // group: input_area — subgroup: Default State
    e('component_styles.input_area.min_height',       'Min Height',      'forms', 'input_area', 'Default State', 'dimension', PR),
    e('component_styles.input_area.border_width',     'Border Width',    'forms', 'input_area', 'Default State', 'dimension', PX),
    e('component_styles.input_area.border_color',     'Border Color',    'forms', 'input_area', 'Default State', 'color'),
    e('component_styles.input_area.border_radius',    'Border Radius',   'forms', 'input_area', 'Default State', 'dimension', PR),
    e('component_styles.input_area.padding',          'Padding',         'forms', 'input_area', 'Default State', 'text'),
    e('component_styles.input_area.font_size',        'Font Size',       'forms', 'input_area', 'Default State', 'font_size', RPE),
    e('component_styles.input_area.font_weight',      'Font Weight',     'forms', 'input_area', 'Default State', 'font_weight', FW),
    e('component_styles.input_area.text_color',       'Text Color',      'forms', 'input_area', 'Default State', 'color'),
    e('component_styles.input_area.background',       'Background',      'forms', 'input_area', 'Default State', 'color'),
    e('component_styles.input_area.placeholder_color','Placeholder',     'forms', 'input_area', 'Default State', 'color'),

    // group: input_area — subgroup: Focus State
    e('component_styles.input_area.focus_border_color','Border Color', 'forms', 'input_area', 'Focus State', 'color'),
    e('component_styles.input_area.focus_ring_color',  'Ring Color',  'forms', 'input_area', 'Focus State', 'color',
        { note: 'Accepts rgba() values, e.g. rgba(59,130,246,0.2).' }),
    e('component_styles.input_area.focus_ring_width',  'Ring Width',  'forms', 'input_area', 'Focus State', 'dimension', PX),

    // group: input_area — subgroup: Read-Only State
    e('component_styles.input_area.readonly_background',   'Background',   'forms', 'input_area', 'Read-Only State', 'color'),
    e('component_styles.input_area.readonly_border_color', 'Border Color', 'forms', 'input_area', 'Read-Only State', 'color'),
    e('component_styles.input_area.readonly_text_color',   'Text Color',   'forms', 'input_area', 'Read-Only State', 'color'),

    // group: input_area — subgroup: Disabled State
    e('component_styles.input_area.disabled_background',   'Background',   'forms', 'input_area', 'Disabled State', 'color'),
    e('component_styles.input_area.disabled_text_color',   'Text Color',   'forms', 'input_area', 'Disabled State', 'color'),
    e('component_styles.input_area.disabled_border_color', 'Border Color', 'forms', 'input_area', 'Disabled State', 'color'),

    // group: field_wrapper
    e('component_styles.field_wrapper.border_left_width', 'Left Border Width',  'forms', 'field_wrapper', null, 'dimension', PX),
    e('component_styles.field_wrapper.border_radius',     'Border Radius',      'forms', 'field_wrapper', null, 'dimension', PR),
    e('component_styles.field_wrapper.background',        'Background',         'forms', 'field_wrapper', null, 'color'),
    e('component_styles.field_wrapper.padding',           'Padding',            'forms', 'field_wrapper', null, 'text'),
    e('component_styles.field_wrapper.gap',               'Gap',                'forms', 'field_wrapper', null, 'dimension', PR),
    e('component_styles.field_wrapper.transition',        'Transition',         'forms', 'field_wrapper', null, 'text',
        { internal: true, note: 'CSS transition shorthand. No consumers found in grep — kept for potential future use.' }),
    e('component_styles.field_wrapper.hover_shadow',      'Hover Shadow',       'forms', 'field_wrapper', null, 'text'),
    e('component_styles.field_wrapper.focus_within_shadow','Focus Shadow',      'forms', 'field_wrapper', null, 'text',
        { note: 'Accepts rgba() values, e.g. 0 0 0 2px rgba(59,130,246,0.15).' }),

    // group: form_header — subgroup: Container
    e('component_styles.form_header.background',    'Background',    'forms', 'form_header', 'Container', 'color'),
    e('component_styles.form_header.border_color',  'Border Color',  'forms', 'form_header', 'Container', 'color'),
    e('component_styles.form_header.title_color',   'Title Color',   'forms', 'form_header', 'Container', 'color'),
    e('component_styles.form_header.subtitle_color','Subtitle Color','forms', 'form_header', 'Container', 'color'),

    // group: form_header — subgroup: Save Button
    e('component_styles.form_header.save_button.background',      'Background',   'forms', 'form_header', 'Save Button', 'color'),
    e('component_styles.form_header.save_button.hover_background','Hover',        'forms', 'form_header', 'Save Button', 'color'),
    e('component_styles.form_header.save_button.text_color',      'Text',         'forms', 'form_header', 'Save Button', 'color'),
    e('component_styles.form_header.save_button.border_radius',   'Border Radius','forms', 'form_header', 'Save Button', 'dimension', PR),
    e('component_styles.form_header.save_button.font_weight',     'Font Weight',  'forms', 'form_header', 'Save Button', 'font_weight', FW),

    // group: form_header — subgroup: Cancel Button
    e('component_styles.form_header.cancel_button.background',      'Background',   'forms', 'form_header', 'Cancel Button', 'color'),
    e('component_styles.form_header.cancel_button.hover_background','Hover',        'forms', 'form_header', 'Cancel Button', 'color'),
    e('component_styles.form_header.cancel_button.text_color',      'Text',         'forms', 'form_header', 'Cancel Button', 'color'),
    e('component_styles.form_header.cancel_button.border_color',    'Border Color', 'forms', 'form_header', 'Cancel Button', 'color'),
    e('component_styles.form_header.cancel_button.border_radius',   'Border Radius','forms', 'form_header', 'Cancel Button', 'dimension', PR),
    e('component_styles.form_header.cancel_button.font_weight',     'Font Weight',  'forms', 'form_header', 'Cancel Button', 'font_weight', FW),

    // group: scrollbar
    e('component_styles.scrollbar.width',            'Width',         'forms', 'scrollbar', null, 'dimension', PX),
    e('component_styles.scrollbar.thumb_color',      'Thumb Color',   'forms', 'scrollbar', null, 'color'),
    e('component_styles.scrollbar.thumb_hover_color','Thumb Hover',   'forms', 'scrollbar', null, 'color'),
    e('component_styles.scrollbar.track_color',      'Track Color',   'forms', 'scrollbar', null, 'color',
        { note: '"transparent" is valid.' }),
    e('component_styles.scrollbar.border_radius',    'Border Radius', 'forms', 'scrollbar', null, 'dimension', PR),

    // group: legend
    e('component_styles.legend.dot_size',  'Dot Size',  'forms', 'legend', null, 'dimension', PR),
    e('component_styles.legend.gap',       'Gap',       'forms', 'legend', null, 'dimension', PR),
    e('component_styles.legend.font_size', 'Font Size', 'forms', 'legend', null, 'font_size', RPE),
    e('component_styles.legend.text_color','Text Color','forms', 'legend', null, 'color'),

    // group: percentage_suffix
    e('component_styles.percentage_suffix.font_size',   'Font Size',   'forms', 'percentage_suffix', null, 'font_size', RPE),
    e('component_styles.percentage_suffix.font_weight', 'Font Weight', 'forms', 'percentage_suffix', null, 'font_weight', FW),
    e('component_styles.percentage_suffix.color',       'Color',       'forms', 'percentage_suffix', null, 'color'),
    e('component_styles.percentage_suffix.margin_left', 'Left Margin', 'forms', 'percentage_suffix', null, 'dimension', PR),

    // group: dropdown_option
    e('component_styles.dropdown_option.text_color',           'Text Color',           'forms', 'dropdown_option', null, 'color'),
    e('component_styles.dropdown_option.font_size',            'Font Size',            'forms', 'dropdown_option', null, 'font_size', { units: ['px', 'rem'] }),
    e('component_styles.dropdown_option.font_weight',          'Font Weight',          'forms', 'dropdown_option', null, 'font_weight', FW),
    e('component_styles.dropdown_option.selected_font_weight', 'Selected Font Weight', 'forms', 'dropdown_option', null, 'font_weight', FW),
    e('component_styles.dropdown_option.active_bg',            'Active Background',    'forms', 'dropdown_option', null, 'color'),
    e('component_styles.dropdown_option.active_text',          'Active Text',          'forms', 'dropdown_option', null, 'color'),
    e('component_styles.dropdown_option.check_icon_color',     'Check Icon (idle)',    'forms', 'dropdown_option', null, 'color'),
    e('component_styles.dropdown_option.check_icon_active_color','Check Icon (active)','forms', 'dropdown_option', null, 'color'),
    e('component_styles.dropdown_option.others_text_color',    '"Others" Text',        'forms', 'dropdown_option', null, 'color'),
    e('component_styles.dropdown_option.others_active_bg',     '"Others" Active Bg',   'forms', 'dropdown_option', null, 'color'),
    e('component_styles.dropdown_option.others_active_text',   '"Others" Active Text', 'forms', 'dropdown_option', null, 'color'),
    e('component_styles.dropdown_option.no_match_text',        'No Match Text',        'forms', 'dropdown_option', null, 'color'),

    // group: dropdown_extras
    e('component_styles.dropdown_extras.trigger_min_height',      'Trigger Min Height',     'forms', 'dropdown_extras', null, 'dimension', PR),
    e('component_styles.dropdown_extras.panel_shadow',            'Panel Shadow',           'forms', 'dropdown_extras', null, 'text'),
    e('component_styles.dropdown_extras.panel_border_radius',     'Panel Border Radius',    'forms', 'dropdown_extras', null, 'dimension', PR),
    e('component_styles.dropdown_extras.panel_border_color',      'Panel Border',           'forms', 'dropdown_extras', null, 'color'),
    e('component_styles.dropdown_extras.panel_background',        'Panel Background',       'forms', 'dropdown_extras', null, 'color'),
    e('component_styles.dropdown_extras.search_border_color',     'Search Border',          'forms', 'dropdown_extras', null, 'color'),
    e('component_styles.dropdown_extras.search_background',       'Search Background',      'forms', 'dropdown_extras', null, 'color'),
    e('component_styles.dropdown_extras.others_panel_background', '"Others" Panel Bg',      'forms', 'dropdown_extras', null, 'color'),
    e('component_styles.dropdown_extras.others_panel_border',     '"Others" Panel Border',  'forms', 'dropdown_extras', null, 'color'),
    e('component_styles.dropdown_extras.others_input_border',     '"Others" Input Border',  'forms', 'dropdown_extras', null, 'color'),
    e('component_styles.dropdown_extras.others_input_text',       '"Others" Input Text',    'forms', 'dropdown_extras', null, 'color'),
    e('component_styles.dropdown_extras.others_input_placeholder','"Others" Placeholder',   'forms', 'dropdown_extras', null, 'color'),
    e('component_styles.dropdown_extras.no_match_color',          'No Match Color',         'forms', 'dropdown_extras', null, 'color'),

    // group: attachment — subgroup: Drop Zone
    e('component_styles.attachment.drag_zone.border_width',      'Border Width',   'forms', 'attachment', 'Drop Zone', 'dimension', PX),
    e('component_styles.attachment.drag_zone.border_style',      'Border Style',   'forms', 'attachment', 'Drop Zone', 'select', { options: BORDER_STYLES }),
    e('component_styles.attachment.drag_zone.border_radius',     'Border Radius',  'forms', 'attachment', 'Drop Zone', 'dimension', PR),
    e('component_styles.attachment.drag_zone.padding',           'Padding',        'forms', 'attachment', 'Drop Zone', 'text'),
    e('component_styles.attachment.drag_zone.idle_border_color', 'Idle Border',    'forms', 'attachment', 'Drop Zone', 'color'),
    e('component_styles.attachment.drag_zone.idle_background',   'Idle Background','forms', 'attachment', 'Drop Zone', 'color'),
    e('component_styles.attachment.drag_zone.active_border_color','Active Border', 'forms', 'attachment', 'Drop Zone', 'color'),
    e('component_styles.attachment.drag_zone.active_background', 'Active Background','forms','attachment','Drop Zone', 'color'),
    e('component_styles.attachment.drag_zone.icon_color',        'Icon Color',     'forms', 'attachment', 'Drop Zone', 'color'),

    // group: attachment — subgroup: Progress Bar
    e('component_styles.attachment.progress_bar.height',       'Height',        'forms', 'attachment', 'Progress Bar', 'dimension', PX),
    e('component_styles.attachment.progress_bar.background',   'Track Color',   'forms', 'attachment', 'Progress Bar', 'color'),
    e('component_styles.attachment.progress_bar.fill_color',   'Fill Color',    'forms', 'attachment', 'Progress Bar', 'color'),
    e('component_styles.attachment.progress_bar.border_radius','Border Radius', 'forms', 'attachment', 'Progress Bar', 'dimension', PR),

    // group: attachment — subgroup: File List
    e('component_styles.attachment.file_list.background',    'Background',    'forms', 'attachment', 'File List', 'color'),
    e('component_styles.attachment.file_list.border_color',  'Border',        'forms', 'attachment', 'File List', 'color'),
    e('component_styles.attachment.file_list.border_radius', 'Border Radius', 'forms', 'attachment', 'File List', 'dimension', PR),
    e('component_styles.attachment.file_list.divider_color', 'Divider',       'forms', 'attachment', 'File List', 'color'),
    e('component_styles.attachment.file_list.filename_font', 'Filename Font', 'forms', 'attachment', 'File List', 'text'),
    e('component_styles.attachment.file_list.filename_size', 'Filename Size', 'forms', 'attachment', 'File List', 'font_size', RP),
    e('component_styles.attachment.file_list.download_color','Download Link', 'forms', 'attachment', 'File List', 'color'),
    e('component_styles.attachment.file_list.download_hover','Download Hover','forms', 'attachment', 'File List', 'color'),
    e('component_styles.attachment.file_list.remove_color',  'Remove Icon',   'forms', 'attachment', 'File List', 'color'),
    e('component_styles.attachment.file_list.remove_hover',  'Remove Hover',  'forms', 'attachment', 'File List', 'color'),

    // group: linked_card_extras — subgroup: Card
    e('component_styles.linked_card_extras.card_border_color',    'Border Color',       'forms', 'linked_card_extras', 'Card', 'color'),
    e('component_styles.linked_card_extras.card_border_style',    'Border Style',       'forms', 'linked_card_extras', 'Card', 'select', { options: BORDER_STYLES }),
    e('component_styles.linked_card_extras.card_border_radius',   'Border Radius',      'forms', 'linked_card_extras', 'Card', 'dimension', PR),
    e('component_styles.linked_card_extras.card_background',      'Background',         'forms', 'linked_card_extras', 'Card', 'color'),
    e('component_styles.linked_card_extras.card_hover_background','Hover Background',   'forms', 'linked_card_extras', 'Card', 'color'),
    e('component_styles.linked_card_extras.card_shadow',          'Shadow',             'forms', 'linked_card_extras', 'Card', 'text'),
    e('component_styles.linked_card_extras.card_hover_shadow',    'Hover Shadow',       'forms', 'linked_card_extras', 'Card', 'text'),

    // group: linked_card_extras — subgroup: Card Header
    e('component_styles.linked_card_extras.header_text_color',    'Text Color',    'forms', 'linked_card_extras', 'Card Header', 'color'),
    e('component_styles.linked_card_extras.header_font_size',     'Font Size',     'forms', 'linked_card_extras', 'Card Header', 'font_size', RP),
    e('component_styles.linked_card_extras.header_font_weight',   'Font Weight',   'forms', 'linked_card_extras', 'Card Header', 'font_weight', FW),
    e('component_styles.linked_card_extras.header_text_transform','Text Transform','forms', 'linked_card_extras', 'Card Header', 'select', { options: TEXT_XFORMS }),
    e('component_styles.linked_card_extras.header_letter_spacing','Letter Spacing','forms', 'linked_card_extras', 'Card Header', 'dimension', EM),

    // group: linked_card_extras — subgroup: Card Value
    e('component_styles.linked_card_extras.value_text_color', 'Text Color', 'forms', 'linked_card_extras', 'Card Value', 'color'),
    e('component_styles.linked_card_extras.value_font_size',  'Font Size',  'forms', 'linked_card_extras', 'Card Value', 'font_size', RP),
    e('component_styles.linked_card_extras.value_font_weight','Font Weight','forms', 'linked_card_extras', 'Card Value', 'font_weight', FW),

    // group: linked_card_extras — subgroup: Empty State
    e('component_styles.linked_card_extras.empty_border_color', 'Border',      'forms', 'linked_card_extras', 'Empty State', 'color'),
    e('component_styles.linked_card_extras.empty_border_style', 'Border Style','forms', 'linked_card_extras', 'Empty State', 'select', { options: BORDER_STYLES }),
    e('component_styles.linked_card_extras.empty_background',   'Background',  'forms', 'linked_card_extras', 'Empty State', 'color'),
    e('component_styles.linked_card_extras.empty_text_color',   'Text',        'forms', 'linked_card_extras', 'Empty State', 'color'),
    e('component_styles.linked_card_extras.empty_icon_color',   'Icon',        'forms', 'linked_card_extras', 'Empty State', 'color'),

    // group: linked_card_extras — subgroup: Remove Button
    e('component_styles.linked_card_extras.remove_border_color',    'Border',           'forms', 'linked_card_extras', 'Remove Button', 'color'),
    e('component_styles.linked_card_extras.remove_background',      'Background',       'forms', 'linked_card_extras', 'Remove Button', 'color'),
    e('component_styles.linked_card_extras.remove_text_color',      'Text',             'forms', 'linked_card_extras', 'Remove Button', 'color'),
    e('component_styles.linked_card_extras.remove_hover_background','Hover Background', 'forms', 'linked_card_extras', 'Remove Button', 'color'),

    // group: linked_card_extras — subgroup: Action Buttons
    e('component_styles.linked_card_extras.action_add.bg',       'Add — Background',   'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_add.text',     'Add — Text',         'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_add.border',   'Add — Border',       'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_add.hover_bg', 'Add — Hover',        'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_edit.bg',      'Edit — Background',  'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_edit.text',    'Edit — Text',        'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_edit.border',  'Edit — Border',      'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_edit.hover_bg','Edit — Hover',       'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_delete.bg',       'Delete — Background','forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_delete.text',     'Delete — Text',      'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_delete.border',   'Delete — Border',    'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_delete.hover_bg', 'Delete — Hover',     'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_select.bg',       'Select — Background','forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_select.text',     'Select — Text',      'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_select.border',   'Select — Border',    'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_select.hover_bg', 'Select — Hover',     'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_close.bg',        'Close — Background', 'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_close.text',      'Close — Text',       'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_close.border',    'Close — Border',     'forms', 'linked_card_extras', 'Action Buttons', 'color'),
    e('component_styles.linked_card_extras.action_close.hover_bg',  'Close — Hover',      'forms', 'linked_card_extras', 'Action Buttons', 'color'),

    // group: linked_card
    e('linked_card.max_columns_for_full_width', 'Max Columns (Full Width)', 'forms', 'linked_card', null, 'number',
        { min: 1, max: 6, step: 1, note: 'Maximum number of linked cards per row before switching to fixed-width layout.' }),
    e('linked_card.fixed_width',           'Card Fixed Width',     'forms', 'linked_card', null, 'dimension', PR),
    e('linked_card.selection_fixed_width', 'Selection Card Width', 'forms', 'linked_card', null, 'dimension', PR),

    // ═══════════════════════════════════════════════════════════════════════
    // TABLE
    // ═══════════════════════════════════════════════════════════════════════

    // group: tableview — subgroup: Container
    e('component_styles.tableview.container.background',   'Background',   'table', 'tableview', 'Container', 'color'),
    e('component_styles.tableview.container.border_color', 'Border',       'table', 'tableview', 'Container', 'color'),
    e('component_styles.tableview.container.border_radius','Border Radius','table', 'tableview', 'Container', 'dimension', { units: ['rem', 'px'] }),

    // group: tableview — subgroup: Toolbar
    e('component_styles.tableview.toolbar.background',       'Background',       'table', 'tableview', 'Toolbar', 'color'),
    e('component_styles.tableview.toolbar.border_color',     'Border',           'table', 'tableview', 'Toolbar', 'color'),
    e('component_styles.tableview.toolbar.border_radius',    'Border Radius',    'table', 'tableview', 'Toolbar', 'dimension', { units: ['rem', 'px'] }),
    e('component_styles.tableview.toolbar.chip_border_color','Chip Row Border',  'table', 'tableview', 'Toolbar', 'color'),
    e('component_styles.tableview.toolbar.divider_color',    'Group Divider',    'table', 'tableview', 'Toolbar', 'color'),
    e('component_styles.tableview.toolbar.label_color',      'Group Label',      'table', 'tableview', 'Toolbar', 'color'),

    // group: tableview — subgroup: Search
    e('component_styles.tableview.search.icon_color',         'Icon',            'table', 'tableview', 'Search', 'color'),
    e('component_styles.tableview.search.text_color',         'Text',            'table', 'tableview', 'Search', 'color'),
    e('component_styles.tableview.search.placeholder_color',  'Placeholder',     'table', 'tableview', 'Search', 'color'),
    e('component_styles.tableview.search.clear_button_color', 'Clear Button',    'table', 'tableview', 'Search', 'color'),
    e('component_styles.tableview.search.clear_button_hover', 'Clear Hover',     'table', 'tableview', 'Search', 'color'),

    // group: tableview — subgroup: Badges
    e('component_styles.tableview.filter_badge.background',    'Filter Badge Bg',   'table', 'tableview', 'Badges', 'color'),
    e('component_styles.tableview.filter_badge.text_color',    'Filter Badge Text', 'table', 'tableview', 'Badges', 'color'),
    e('component_styles.tableview.selection_badge.background', 'Selection Badge Bg','table', 'tableview', 'Badges', 'color'),
    e('component_styles.tableview.selection_badge.text_color', 'Selection Badge Text','table','tableview','Badges', 'color'),
    e('component_styles.tableview.selection_badge.border_color','Selection Badge Border','table','tableview','Badges','color'),

    // group: tableview — subgroup: Filter Chips
    e('component_styles.tableview.filter_chip.background',      'Background',   'table', 'tableview', 'Filter Chips', 'color'),
    e('component_styles.tableview.filter_chip.text_color',      'Text',         'table', 'tableview', 'Filter Chips', 'color'),
    e('component_styles.tableview.filter_chip.border_color',    'Border',       'table', 'tableview', 'Filter Chips', 'color'),
    e('component_styles.tableview.filter_chip.border_radius',   'Border Radius','table', 'tableview', 'Filter Chips', 'dimension', PX),
    e('component_styles.tableview.filter_chip.remove_icon_color','Remove Icon', 'table', 'tableview', 'Filter Chips', 'color'),
    e('component_styles.tableview.filter_chip.remove_hover',    'Remove Hover', 'table', 'tableview', 'Filter Chips', 'color'),

    // group: tableview — subgroup: Selection Chips
    e('component_styles.tableview.selection_chip.background',      'Background',   'table', 'tableview', 'Selection Chips', 'color'),
    e('component_styles.tableview.selection_chip.text_color',      'Text',         'table', 'tableview', 'Selection Chips', 'color'),
    e('component_styles.tableview.selection_chip.border_color',    'Border',       'table', 'tableview', 'Selection Chips', 'color'),
    e('component_styles.tableview.selection_chip.border_radius',   'Border Radius','table', 'tableview', 'Selection Chips', 'dimension', PX),
    e('component_styles.tableview.selection_chip.remove_icon_color','Remove Icon', 'table', 'tableview', 'Selection Chips', 'color'),
    e('component_styles.tableview.selection_chip.remove_hover',    'Remove Hover', 'table', 'tableview', 'Selection Chips', 'color'),

    // group: tableview — subgroup: Clear All
    e('component_styles.tableview.clear_all.color',      'Color',      'table', 'tableview', 'Clear All', 'color'),
    e('component_styles.tableview.clear_all.hover_color','Hover Color','table', 'tableview', 'Clear All', 'color'),

    // group: tableview — subgroup: Column Headers
    e('component_styles.tableview.header.background',           'Background',    'table', 'tableview', 'Column Headers', 'color'),
    e('component_styles.tableview.header.text_color',           'Text',          'table', 'tableview', 'Column Headers', 'color'),
    e('component_styles.tableview.header.font_size',            'Font Size',     'table', 'tableview', 'Column Headers', 'font_size', RP),
    e('component_styles.tableview.header.font_weight',          'Font Weight',   'table', 'tableview', 'Column Headers', 'font_weight', FW),
    e('component_styles.tableview.header.letter_spacing',       'Letter Spacing','table', 'tableview', 'Column Headers', 'dimension', EM),
    e('component_styles.tableview.header.text_transform',       'Text Transform','table', 'tableview', 'Column Headers', 'select', { options: TEXT_XFORMS }),
    e('component_styles.tableview.header.border_color',         'Border',        'table', 'tableview', 'Column Headers', 'color'),
    e('component_styles.tableview.header.padding',              'Padding',       'table', 'tableview', 'Column Headers', 'text'),
    e('component_styles.tableview.header.sort_icon_color',      'Sort Icon',     'table', 'tableview', 'Column Headers', 'color'),
    e('component_styles.tableview.header.sort_icon_active_color','Sort Icon Active','table','tableview','Column Headers','color'),
    e('component_styles.tableview.header.resize_handle_color',  'Resize Handle', 'table', 'tableview', 'Column Headers', 'color'),

    // group: tableview — subgroup: Data Rows
    e('component_styles.tableview.row.background',              'Background',          'table', 'tableview', 'Data Rows', 'color'),
    e('component_styles.tableview.row.alt_background',          'Alt Background',      'table', 'tableview', 'Data Rows', 'color'),
    e('component_styles.tableview.row.hover_background',        'Hover Background',    'table', 'tableview', 'Data Rows', 'color'),
    e('component_styles.tableview.row.selected_background',     'Selected Background', 'table', 'tableview', 'Data Rows', 'color'),
    e('component_styles.tableview.row.selected_hover_background','Selected Hover',     'table', 'tableview', 'Data Rows', 'color'),
    e('component_styles.tableview.row.selected_border_color',   'Selected Border',     'table', 'tableview', 'Data Rows', 'color'),
    e('component_styles.tableview.row.text_color',              'Text',                'table', 'tableview', 'Data Rows', 'color'),
    e('component_styles.tableview.row.font_size',               'Font Size',           'table', 'tableview', 'Data Rows', 'font_size', RP),
    e('component_styles.tableview.row.border_color',            'Row Divider',         'table', 'tableview', 'Data Rows', 'color'),
    e('component_styles.tableview.row.filled_text_color',       'Carry-Down Cell Text','table', 'tableview', 'Data Rows', 'color'),

    // group: tableview — subgroup: Cells
    e('component_styles.tableview.cell.padding',     'Padding',     'table', 'tableview', 'Cells', 'text'),
    e('component_styles.tableview.cell.text_color',  'Text Color',  'table', 'tableview', 'Cells', 'color'),
    e('component_styles.tableview.cell.border_color','Border Color','table', 'tableview', 'Cells', 'color'),

    // group: tableview — subgroup: File Button
    e('component_styles.tableview.file_button.background',      'Background',    'table', 'tableview', 'File Button', 'color'),
    e('component_styles.tableview.file_button.text_color',      'Text',          'table', 'tableview', 'File Button', 'color'),
    e('component_styles.tableview.file_button.hover_background','Hover',         'table', 'tableview', 'File Button', 'color'),
    e('component_styles.tableview.file_button.border_color',    'Border',        'table', 'tableview', 'File Button', 'color'),

    // group: tableview — subgroup: Tooltip
    e('component_styles.tableview.tooltip.background','Background','table', 'tableview', 'Tooltip', 'color'),
    e('component_styles.tableview.tooltip.text_color','Text',      'table', 'tableview', 'Tooltip', 'color'),

    // group: tableview — subgroup: Selection
    e('component_styles.tableview.selection.accent_color','Accent Color','table', 'tableview', 'Selection', 'color'),

    // group: tableview — subgroup: Pagination
    e('component_styles.tableview.pagination.load_more_color',      'Load More',        'table', 'tableview', 'Pagination', 'color'),
    e('component_styles.tableview.pagination.load_more_hover_color','Load More Hover',  'table', 'tableview', 'Pagination', 'color'),
    e('component_styles.tableview.pagination.status_text_color',    'Status Text',      'table', 'tableview', 'Pagination', 'color'),
    e('component_styles.tableview.pagination.more_hint_color',      'More Hint',        'table', 'tableview', 'Pagination', 'color'),

    // group: tableview — subgroup: Empty State
    e('component_styles.tableview.empty_state.border_color',           'Border',          'table', 'tableview', 'Empty State', 'color'),
    e('component_styles.tableview.empty_state.icon_color',             'Icon',            'table', 'tableview', 'Empty State', 'color'),
    e('component_styles.tableview.empty_state.title_color',            'Title',           'table', 'tableview', 'Empty State', 'color'),
    e('component_styles.tableview.empty_state.subtext_color',          'Subtext',         'table', 'tableview', 'Empty State', 'color'),
    e('component_styles.tableview.empty_state.button_background',      'Button Bg',       'table', 'tableview', 'Empty State', 'color'),
    e('component_styles.tableview.empty_state.button_text',            'Button Text',     'table', 'tableview', 'Empty State', 'color'),
    e('component_styles.tableview.empty_state.button_hover_background','Button Hover',    'table', 'tableview', 'Empty State', 'color'),

    // group: tableview — subgroup: Error State
    e('component_styles.tableview.error_state.icon_color',   'Icon',   'table', 'tableview', 'Error State', 'color'),
    e('component_styles.tableview.error_state.title_color',  'Title',  'table', 'tableview', 'Error State', 'color'),
    e('component_styles.tableview.error_state.subtext_color','Subtext','table', 'tableview', 'Error State', 'color'),

    // group: tableview — subgroup: Skeleton Loader
    e('component_styles.tableview.skeleton.border_color','Border',     'table', 'tableview', 'Skeleton Loader', 'color'),
    e('component_styles.tableview.skeleton.header_bg',   'Header Bg',  'table', 'tableview', 'Skeleton Loader', 'color'),
    e('component_styles.tableview.skeleton.cell_bg',     'Cell Bg',    'table', 'tableview', 'Skeleton Loader', 'color'),
    e('component_styles.tableview.skeleton.row_border',  'Row Border', 'table', 'tableview', 'Skeleton Loader', 'color'),

    // group: tableview — subgroup: Scrollbar
    e('component_styles.tableview.scrollbar.width',           'Width',       'table', 'tableview', 'Scrollbar', 'dimension', PX),
    e('component_styles.tableview.scrollbar.thumb_color',     'Thumb',       'table', 'tableview', 'Scrollbar', 'color'),
    e('component_styles.tableview.scrollbar.thumb_hover_color','Thumb Hover','table', 'tableview', 'Scrollbar', 'color'),
    e('component_styles.tableview.scrollbar.track_color',     'Track',       'table', 'tableview', 'Scrollbar', 'color',
        { note: '"transparent" is valid.' }),

    // group: filter_modal — subgroup: Container
    e('component_styles.filter_modal.backdrop_background', 'Backdrop',     'table', 'filter_modal', 'Container', 'color',
        { note: 'Accepts rgba(), e.g. rgba(0,0,0,0.2).' }),
    e('component_styles.filter_modal.background',          'Background',   'table', 'filter_modal', 'Container', 'color'),
    e('component_styles.filter_modal.border_radius',       'Border Radius','table', 'filter_modal', 'Container', 'dimension', { units: ['rem', 'px'] }),
    e('component_styles.filter_modal.shadow',              'Shadow',       'table', 'filter_modal', 'Container', 'text'),

    // group: filter_modal — subgroup: Header
    e('component_styles.filter_modal.header_background',   'Background',  'table', 'filter_modal', 'Header', 'color'),
    e('component_styles.filter_modal.header_text_color',   'Text',        'table', 'filter_modal', 'Header', 'color'),
    e('component_styles.filter_modal.header_border_color', 'Border',      'table', 'filter_modal', 'Header', 'color'),

    // group: filter_modal — subgroup: Condition Panel
    e('component_styles.filter_modal.condition_heading_color',    'Heading',           'table', 'filter_modal', 'Condition Panel', 'color'),
    e('component_styles.filter_modal.condition_heading_hover',    'Heading Hover',     'table', 'filter_modal', 'Condition Panel', 'color'),
    e('component_styles.filter_modal.condition_panel_background', 'Panel Background',  'table', 'filter_modal', 'Condition Panel', 'color'),

    // group: filter_modal — subgroup: Value List
    e('component_styles.filter_modal.list_background', 'Background',  'table', 'filter_modal', 'Value List', 'color'),
    e('component_styles.filter_modal.list_border_color','Border',     'table', 'filter_modal', 'Value List', 'color'),

    // group: filter_modal — subgroup: Rows
    e('component_styles.filter_modal.row_hover_background','Hover Background','table', 'filter_modal', 'Rows', 'color'),
    e('component_styles.filter_modal.row_text_color',      'Text',           'table', 'filter_modal', 'Rows', 'color'),
    e('component_styles.filter_modal.row_day_text_color',  'Date Tree Text', 'table', 'filter_modal', 'Rows', 'color'),

    // group: filter_modal — subgroup: Select All
    e('component_styles.filter_modal.select_all_border_color','Border','table', 'filter_modal', 'Select All', 'color'),
    e('component_styles.filter_modal.select_all_text_color',  'Text',  'table', 'filter_modal', 'Select All', 'color'),

    // group: filter_modal — subgroup: Options
    e('component_styles.filter_modal.option_hover_background','Hover Background','table', 'filter_modal', 'Options', 'color'),
    e('component_styles.filter_modal.option_text_color',      'Text',           'table', 'filter_modal', 'Options', 'color'),

    // group: filter_modal — subgroup: Sort
    e('component_styles.filter_modal.sort_text_color',      'Text',           'table', 'filter_modal', 'Sort', 'color'),
    e('component_styles.filter_modal.sort_hover_background','Hover Background','table', 'filter_modal', 'Sort', 'color'),

    // group: filter_modal — subgroup: Inputs
    e('component_styles.filter_modal.input_background',   'Background',   'table', 'filter_modal', 'Inputs', 'color'),
    e('component_styles.filter_modal.input_border_color', 'Border',       'table', 'filter_modal', 'Inputs', 'color'),
    e('component_styles.filter_modal.input_border_radius','Border Radius','table', 'filter_modal', 'Inputs', 'dimension', { units: ['rem', 'px'] }),
    e('component_styles.filter_modal.input_text_color',   'Text',         'table', 'filter_modal', 'Inputs', 'color'),
    e('component_styles.filter_modal.input_focus_border', 'Focus Border', 'table', 'filter_modal', 'Inputs', 'color'),
    e('component_styles.filter_modal.input_icon_color',   'Icon',         'table', 'filter_modal', 'Inputs', 'color'),

    // group: filter_modal — subgroup: Checkboxes
    e('component_styles.filter_modal.checkbox_accent',    'Accent',     'table', 'filter_modal', 'Checkboxes', 'color'),
    e('component_styles.filter_modal.checkbox_border',    'Border',     'table', 'filter_modal', 'Checkboxes', 'color'),
    e('component_styles.filter_modal.checkbox_focus_ring','Focus Ring', 'table', 'filter_modal', 'Checkboxes', 'color'),

    // group: filter_modal — subgroup: Labels
    e('component_styles.filter_modal.label_color',      'Color',       'table', 'filter_modal', 'Labels', 'color'),
    e('component_styles.filter_modal.label_font_size',  'Font Size',   'table', 'filter_modal', 'Labels', 'font_size', RP),
    e('component_styles.filter_modal.label_font_weight','Font Weight', 'table', 'filter_modal', 'Labels', 'font_weight', FW),

    // group: filter_modal — subgroup: Footer
    e('component_styles.filter_modal.footer_background',  'Background','table', 'filter_modal', 'Footer', 'color'),
    e('component_styles.filter_modal.footer_border_color','Border',    'table', 'filter_modal', 'Footer', 'color'),

    // group: filter_modal — subgroup: Apply Button
    e('component_styles.filter_modal.apply_button.background',      'Background',   'table', 'filter_modal', 'Apply Button', 'color'),
    e('component_styles.filter_modal.apply_button.text',            'Text',         'table', 'filter_modal', 'Apply Button', 'color'),
    e('component_styles.filter_modal.apply_button.hover_background','Hover',        'table', 'filter_modal', 'Apply Button', 'color'),
    e('component_styles.filter_modal.apply_button.border_radius',   'Border Radius','table', 'filter_modal', 'Apply Button', 'dimension', { units: ['rem', 'px'] }),

    // group: filter_modal — subgroup: Clear Button
    e('component_styles.filter_modal.clear_button.background',      'Background',   'table', 'filter_modal', 'Clear Button', 'color',
        { note: '"transparent" is valid.' }),
    e('component_styles.filter_modal.clear_button.text',            'Text',         'table', 'filter_modal', 'Clear Button', 'color'),
    e('component_styles.filter_modal.clear_button.hover_background','Hover',        'table', 'filter_modal', 'Clear Button', 'color'),
    e('component_styles.filter_modal.clear_button.border_radius',   'Border Radius','table', 'filter_modal', 'Clear Button', 'dimension', { units: ['rem', 'px'] }),

    // group: filter_modal — subgroup: Close Button
    e('component_styles.filter_modal.close_button.color',      'Color',      'table', 'filter_modal', 'Close Button', 'color'),
    e('component_styles.filter_modal.close_button.hover_color','Hover Color','table', 'filter_modal', 'Close Button', 'color'),

    // ═══════════════════════════════════════════════════════════════════════
    // OVERLAYS
    // ═══════════════════════════════════════════════════════════════════════

    // group: modal — subgroup: Backdrop
    e('modal.backdrop_color',   'Backdrop Color',  'overlays', 'modal', 'Backdrop', 'color'),
    e('modal.backdrop_opacity', 'Backdrop Opacity','overlays', 'modal', 'Backdrop', 'number', OPC),
    e('modal.backdrop_blur',    'Backdrop Blur',   'overlays', 'modal', 'Backdrop', 'select', { options: BLUR_LEVELS }),

    // group: modal — subgroup: Header
    e('modal.header.background_color','Background', 'overlays', 'modal', 'Header', 'color'),
    e('modal.header.border_color',    'Border',     'overlays', 'modal', 'Header', 'color'),
    e('modal.header.text_color',      'Text',       'overlays', 'modal', 'Header', 'color'),

    // group: modal — subgroup: Body
    e('modal.body.background_color','Background',  'overlays', 'modal', 'Body', 'color'),
    e('modal.body.text_color',      'Text',        'overlays', 'modal', 'Body', 'color'),
    e('modal.body.loader_color',    'Loader Color','overlays', 'modal', 'Body', 'color'),

    // group: modal — subgroup: Footer
    e('modal.footer.background_color','Background','overlays', 'modal', 'Footer', 'color'),
    e('modal.footer.border_color',    'Border',    'overlays', 'modal', 'Footer', 'color'),

    // group: modal — subgroup: Add Button
    e('modal.buttons.add.border_color',    'Border',     'overlays', 'modal', 'Add Button', 'color'),
    e('modal.buttons.add.background_color','Background', 'overlays', 'modal', 'Add Button', 'color'),
    e('modal.buttons.add.text_color',      'Text',       'overlays', 'modal', 'Add Button', 'color'),
    e('modal.buttons.add.hover_opacity',   'Hover Opacity','overlays','modal','Add Button', 'number', OPC),

    // group: modal — subgroup: Edit Button
    e('modal.buttons.edit.border_color',    'Border',      'overlays', 'modal', 'Edit Button', 'color'),
    e('modal.buttons.edit.background_color','Background',  'overlays', 'modal', 'Edit Button', 'color'),
    e('modal.buttons.edit.text_color',      'Text',        'overlays', 'modal', 'Edit Button', 'color'),
    e('modal.buttons.edit.hover_opacity',   'Hover Opacity','overlays','modal', 'Edit Button', 'number', OPC),

    // group: modal — subgroup: Select Button
    e('modal.buttons.select.border_color',    'Border',      'overlays', 'modal', 'Select Button', 'color'),
    e('modal.buttons.select.background_color','Background',  'overlays', 'modal', 'Select Button', 'color'),
    e('modal.buttons.select.text_color',      'Text',        'overlays', 'modal', 'Select Button', 'color'),
    e('modal.buttons.select.hover_opacity',   'Hover Opacity','overlays','modal', 'Select Button', 'number', OPC),

    // group: modal — subgroup: Close Button
    e('modal.buttons.close.border_color',    'Border',      'overlays', 'modal', 'Close Button', 'color',
        { note: '"transparent" is a valid value.' }),
    e('modal.buttons.close.background_color','Background',  'overlays', 'modal', 'Close Button', 'color'),
    e('modal.buttons.close.text_color',      'Text',        'overlays', 'modal', 'Close Button', 'color'),
    e('modal.buttons.close.hover_opacity',   'Hover Opacity','overlays','modal', 'Close Button', 'number', OPC),

    // ═══════════════════════════════════════════════════════════════════════
    // IDENTITY
    // ═══════════════════════════════════════════════════════════════════════
    // group: input_method_identity
    //
    // Paths use bracket notation for method names with spaces/hyphens, and
    // dot notation for 'Dropdown' and 'File' (identifier-safe).
    //
    // Icon options (R5) — sourced by:
    //   grep -rh "from 'lucide-svelte'" src/lib/components/DataEntry \
    //        src/lib/components/TableView \
    //     | grep -oE '\{[^}]*\}' | tr ',' '\n' | tr -d '{}' \
    //     | awk '{$1=$1};1' | sort -u
    // Result: ChevronDown, Link, ListPlus, Paperclip, Pencil, Sparkles
    //
    // User Input
    e('input_method_identity[User Input].accent_color',    'Accent Color',    'identity', 'input_method_identity', 'User Input',      'color'),
    e('input_method_identity[User Input].icon',            'Icon',            'identity', 'input_method_identity', 'User Input',      'select', { options: LUCIDE_ICONS }),
    e('input_method_identity[User Input].label_background','Label Background','identity', 'input_method_identity', 'User Input',      'color',
        { note: 'R4: also written to root User_Input at download time for AutoResizeTextArea compatibility.' }),
    e('input_method_identity[User Input].label_text_color','Label Text',      'identity', 'input_method_identity', 'User Input',      'color'),
    e('input_method_identity[User Input].label_border_color','Label Border',  'identity', 'input_method_identity', 'User Input',      'color'),

    // Auto-populated
    e('input_method_identity[Auto-populated].accent_color',    'Accent Color',    'identity', 'input_method_identity', 'Auto-populated', 'color'),
    e('input_method_identity[Auto-populated].icon',            'Icon',            'identity', 'input_method_identity', 'Auto-populated', 'select', { options: LUCIDE_ICONS }),
    e('input_method_identity[Auto-populated].label_background','Label Background','identity', 'input_method_identity', 'Auto-populated', 'color',
        { note: 'R4: also written to root Auto_populated at download time for AutoResizeTextArea compatibility.' }),
    e('input_method_identity[Auto-populated].label_text_color','Label Text',      'identity', 'input_method_identity', 'Auto-populated', 'color'),
    e('input_method_identity[Auto-populated].label_border_color','Label Border',  'identity', 'input_method_identity', 'Auto-populated', 'color'),

    // Dropdown (dot notation — no special chars in key)
    e('input_method_identity.Dropdown.accent_color',    'Accent Color',    'identity', 'input_method_identity', 'Dropdown', 'color'),
    e('input_method_identity.Dropdown.icon',            'Icon',            'identity', 'input_method_identity', 'Dropdown', 'select', { options: LUCIDE_ICONS }),
    e('input_method_identity.Dropdown.label_background','Label Background','identity', 'input_method_identity', 'Dropdown', 'color'),
    e('input_method_identity.Dropdown.label_text_color','Label Text',      'identity', 'input_method_identity', 'Dropdown', 'color'),
    e('input_method_identity.Dropdown.label_border_color','Label Border',  'identity', 'input_method_identity', 'Dropdown', 'color'),

    // Linked Selection
    e('input_method_identity[Linked Selection].accent_color',    'Accent Color',    'identity', 'input_method_identity', 'Linked Selection', 'color'),
    e('input_method_identity[Linked Selection].icon',            'Icon',            'identity', 'input_method_identity', 'Linked Selection', 'select', { options: LUCIDE_ICONS }),
    e('input_method_identity[Linked Selection].label_background','Label Background','identity', 'input_method_identity', 'Linked Selection', 'color'),
    e('input_method_identity[Linked Selection].label_text_color','Label Text',      'identity', 'input_method_identity', 'Linked Selection', 'color'),
    e('input_method_identity[Linked Selection].label_border_color','Label Border',  'identity', 'input_method_identity', 'Linked Selection', 'color'),

    // Linked Addition
    e('input_method_identity[Linked Addition].accent_color',    'Accent Color',    'identity', 'input_method_identity', 'Linked Addition', 'color'),
    e('input_method_identity[Linked Addition].icon',            'Icon',            'identity', 'input_method_identity', 'Linked Addition', 'select', { options: LUCIDE_ICONS }),
    e('input_method_identity[Linked Addition].label_background','Label Background','identity', 'input_method_identity', 'Linked Addition', 'color'),
    e('input_method_identity[Linked Addition].label_text_color','Label Text',      'identity', 'input_method_identity', 'Linked Addition', 'color'),
    e('input_method_identity[Linked Addition].label_border_color','Label Border',  'identity', 'input_method_identity', 'Linked Addition', 'color'),

    // File (dot notation — no special chars in key)
    e('input_method_identity.File.accent_color',    'Accent Color',    'identity', 'input_method_identity', 'File', 'color'),
    e('input_method_identity.File.icon',            'Icon',            'identity', 'input_method_identity', 'File', 'select', { options: LUCIDE_ICONS }),
    e('input_method_identity.File.label_background','Label Background','identity', 'input_method_identity', 'File', 'color'),
    e('input_method_identity.File.label_text_color','Label Text',      'identity', 'input_method_identity', 'File', 'color'),
    e('input_method_identity.File.label_border_color','Label Border',  'identity', 'input_method_identity', 'File', 'color'),

    // ═══════════════════════════════════════════════════════════════════════
    // DEFERRED  (R6.3)
    // ═══════════════════════════════════════════════════════════════════════

    // This path does not yet exist in Project_Theme_Settings.js.
    // It will be added when AutoResizeTextArea is migrated off mandatory_mark.font_weight.
    e('component_styles.label_row.mandatory_mark_weight', 'Mandatory Mark Weight', 'forms', 'label_row', 'Mandatory Mark', 'font_weight',
        { deferred: true, options: FONT_WEIGHTS, note: 'R6.3: Will be added to Project_Theme_Settings.js when AutoResizeTextArea is migrated off component_styles.mandatory_mark.font_weight.' }),

];

// ─────────────────────────────────────────────────────────────────────────────
// Lookup map — path → entry
// ─────────────────────────────────────────────────────────────────────────────

export const Theme_Schema_By_Path = new Map(Theme_Schema.map(entry => [entry.path, entry]));

// ─────────────────────────────────────────────────────────────────────────────
// Coverage check
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compare the live theme object against the schema registry.
 *
 * @param {object} theme_object  The live Project_Theme_Settings object.
 * @returns {{ uncovered: string[], orphaned: string[] }}
 *   uncovered — theme leaf paths with no schema entry (schema is missing coverage)
 *   orphaned  — schema entries (non-deferred) whose path resolves to `undefined`
 *               in the theme (schema references a nonexistent property)
 */
export function check_Schema_Coverage(theme_object) {
    const leaves = walkLeaves(theme_object);

    const uncovered = leaves
        .map(l => l.path)
        .filter(p => !Theme_Schema_By_Path.has(p))
        .sort();

    const orphaned = Theme_Schema
        .filter(entry => !entry.deferred && getPath(theme_object, entry.path) === undefined)
        .map(entry => entry.path)
        .sort();

    return { uncovered, orphaned };
}

// Dev coverage check (paste in browser console):
//   import { Project_Theme_Settings } from '$lib/Project_Theme_Settings.js';
//   import { check_Schema_Coverage } from '$lib/Theme_Schema.js';
//   console.log(check_Schema_Coverage(Project_Theme_Settings));
// Both arrays must be empty for the schema to be considered complete.
