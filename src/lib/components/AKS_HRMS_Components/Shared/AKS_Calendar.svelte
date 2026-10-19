<script>
    /**
     * AKS_Calendar.svelte
     * ─────────────────────────────────────────────────────────────────
     * Shared calendar used in both HR_Admin_Dashboard and User_Dashboard.
     *
     * Props:
     *   events   - Array of CalendarEvent objects (see typedef below)
     *   mode     - 'admin' | 'user'  (controls what's shown in cells)
     *   compact  - boolean (smaller cells, used in sidebar/widget context)
     *
     * CalendarEvent {
     *   date:    'YYYY-MM-DD'
     *   type:    'holiday' | 'present' | 'absent' | 'leave' | 'leave_pending'
     *            | 'od' | 'compoff' | 'weekend_worked'
     *   label:   string          (tooltip / popover text)
     *   count:   number | null   (admin mode: how many employees)
     *   color:   string | null   (override dot color)
     * }
     *
     * Events:
     *   on:monthChange({ year, month })  - fired when user navigates months
     *   on:dateClick({ date, events })   - fired when a day cell is clicked
     */

    import { createEventDispatcher } from 'svelte';

    export let events  = [];
    export let mode    = 'user';   // 'user' | 'admin'
    export let compact = false;

    const dispatch = createEventDispatcher();

    // ── State ──────────────────────────────────────────────────────────
    let today       = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth();  // 0-indexed

    // Selected date for popover
    let selectedDate    = null;
    let selectedEvents  = [];
    let popoverVisible  = false;

    // ── Constants ──────────────────────────────────────────────────────
    const MONTH_NAMES = [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December'
    ];
    const DAY_HEADERS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

    /**
     * Type → dot color class
     */
    const TYPE_DOT = {
        holiday:        'bg-red-400',
        present:        'bg-emerald-400',
        absent:         'bg-rose-400',
        leave:          'bg-amber-400',
        leave_pending:  'bg-yellow-300 border border-yellow-400',
        od:             'bg-sky-400',
        compoff:        'bg-violet-400',
        weekend_worked: 'bg-orange-400'
    };

    /**
     * Type → background tint for the whole cell (user mode only)
     */
    const TYPE_BG = {
        holiday:  'bg-red-50',
        present:  'bg-emerald-50',
        absent:   'bg-rose-50',
        leave:    'bg-amber-50',
        od:       'bg-sky-50',
        compoff:  'bg-violet-50'
    };

    // ── Derived: calendar grid ─────────────────────────────────────────
    $: calendarGrid  = buildGrid(currentYear, currentMonth);
    $: eventsByDate  = indexEvents(events);
    $: monthLabel    = `${MONTH_NAMES[currentMonth]} ${currentYear}`;

    function buildGrid(year, month) {
        const firstWeekday  = new Date(year, month, 1).getDay();     // 0=Sun
        const daysInMonth   = new Date(year, month + 1, 0).getDate();
        const daysInPrev    = new Date(year, month, 0).getDate();
        const days          = [];

        // Padding from previous month
        for (let i = firstWeekday - 1; i >= 0; i--) {
            days.push({ date: new Date(year, month - 1, daysInPrev - i), current: false });
        }
        // Current month
        for (let d = 1; d <= daysInMonth; d++) {
            days.push({ date: new Date(year, month, d), current: true });
        }
        // Padding to fill 6 rows × 7 cols = 42
        const remaining = 42 - days.length;
        for (let d = 1; d <= remaining; d++) {
            days.push({ date: new Date(year, month + 1, d), current: false });
        }
        return days;
    }

    function indexEvents(evts) {
        const map = {};
        for (const evt of evts) {
            if (!map[evt.date]) map[evt.date] = [];
            map[evt.date].push(evt);
        }
        return map;
    }

    function toKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    }

    function isToday(date) {
        return toKey(date) === toKey(today);
    }

    function isWeekend(date) {
        const d = date.getDay();
        return d === 0 || d === 6;
    }

    function prevMonth() {
        if (currentMonth === 0) { currentYear--; currentMonth = 11; }
        else { currentMonth--; }
        dispatch('monthChange', { year: currentYear, month: currentMonth });
    }

    function nextMonth() {
        if (currentMonth === 11) { currentYear++; currentMonth = 0; }
        else { currentMonth++; }
        dispatch('monthChange', { year: currentYear, month: currentMonth });
    }

    function goToToday() {
        currentYear  = today.getFullYear();
        currentMonth = today.getMonth();
        dispatch('monthChange', { year: currentYear, month: currentMonth });
    }

    function handleCellClick(day) {
        const key     = toKey(day.date);
        const dayEvts = eventsByDate[key] ?? [];
        selectedDate   = day.date;
        selectedEvents = dayEvts;
        popoverVisible = true;
        dispatch('dateClick', { date: day.date, events: dayEvts });
    }

    /**
     * Get the primary type for a cell (for background tinting in user mode).
     * Priority: absent > leave > od > compoff > present > holiday
     */
    function getPrimaryType(evts) {
        if (!evts?.length) return null;
        const priority = ['absent','leave','od','compoff','present','holiday'];
        for (const p of priority) {
            if (evts.find(e => e.type === p)) return p;
        }
        return evts[0].type;
    }
</script>

<!-- ── Calendar Card ────────────────────────────────────────────────── -->
<div class="bg-white rounded-2xl border border-slate-100 shadow-sm select-none">

    <!-- Header: navigation -->
    <div class="flex items-center justify-between px-4 pt-4 pb-3">
        <button
            on:click={prevMonth}
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Previous month"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
            </svg>
        </button>

        <div class="text-center">
            <p class="text-sm font-semibold text-slate-800">{monthLabel}</p>
            {#if !compact}
                <button
                    on:click={goToToday}
                    class="text-xs text-indigo-500 hover:text-indigo-700 mt-0.5 transition-colors"
                >
                    Today
                </button>
            {/if}
        </div>

        <button
            on:click={nextMonth}
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Next month"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
        </button>
    </div>

    <!-- Day-of-week headers -->
    <div class="grid grid-cols-7 px-3 pb-1">
        {#each DAY_HEADERS as d, i}
            <div class="text-center text-[10px] font-semibold tracking-wide
                        {i === 0 || i === 6 ? 'text-rose-400' : 'text-slate-400'}">
                {d}
            </div>
        {/each}
    </div>

    <!-- Day grid -->
    <div class="grid grid-cols-7 gap-0.5 px-3 pb-3">
        {#each calendarGrid as day}
            {@const key      = toKey(day.date)}
            {@const dayEvts  = eventsByDate[key] ?? []}
            {@const todayDay = isToday(day.date)}
            {@const weekend  = isWeekend(day.date)}
            {@const primType = getPrimaryType(dayEvts)}
            {@const cellBg   = mode === 'user' && primType && TYPE_BG[primType] ? TYPE_BG[primType] : ''}

            <button
                on:click={() => handleCellClick(day)}
                class="
                    relative flex flex-col items-center
                    {compact ? 'py-1' : 'py-1.5'}
                    rounded-xl transition-all group
                    {day.current ? 'cursor-pointer hover:bg-slate-50' : 'opacity-30 cursor-default'}
                    {todayDay ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}
                    {!todayDay && cellBg ? cellBg : ''}
                    {!todayDay && !cellBg && weekend && day.current ? 'bg-slate-50/60' : ''}
                "
            >
                <!-- Date number -->
                <span class="
                    w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium
                    {todayDay ? 'bg-indigo-500 text-white font-bold' : ''}
                    {!todayDay && weekend && day.current ? 'text-rose-400' : ''}
                    {!todayDay && !weekend ? 'text-slate-700' : ''}
                ">
                    {day.date.getDate()}
                </span>

                <!-- Event dots (max 3) -->
                {#if !compact && dayEvts.length > 0}
                    <div class="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                        {#each dayEvts.slice(0, 3) as evt}
                            <span
                                class="w-1.5 h-1.5 rounded-full {TYPE_DOT[evt.type] ?? 'bg-slate-400'}"
                                title={evt.label}
                            ></span>
                        {/each}
                        {#if dayEvts.length > 3}
                            <span class="text-[9px] text-slate-400 leading-none">+{dayEvts.length - 3}</span>
                        {/if}
                    </div>
                {/if}

                <!-- Admin mode: employee count badge -->
                {#if mode === 'admin' && dayEvts.length > 0}
                    <span class="text-[9px] text-slate-500 leading-none mt-0.5">
                        {dayEvts.reduce((acc, e) => acc + (e.count ?? 1), 0)}
                    </span>
                {/if}
            </button>
        {/each}
    </div>

    <!-- ── Legend ────────────────────────────────────────────────────── -->
    {#if !compact}
        <div class="px-4 pb-4 border-t border-slate-50 pt-3">
            <div class="flex flex-wrap gap-x-3 gap-y-1.5">
                {#if mode === 'user'}
                    {#each [
                        ['present',       'Present'],
                        ['absent',        'Absent'],
                        ['leave',         'Leave'],
                        ['leave_pending', 'Pending'],
                        ['od',            'OD'],
                        ['compoff',       'CompOff'],
                        ['holiday',       'Holiday'],
                    ] as [type, label]}
                        <span class="flex items-center gap-1 text-[10px] text-slate-500">
                            <span class="w-2 h-2 rounded-full {TYPE_DOT[type]}"></span>
                            {label}
                        </span>
                    {/each}
                {:else}
                    {#each [
                        ['leave',   'On Leave'],
                        ['od',      'On Duty'],
                        ['holiday', 'Holiday'],
                    ] as [type, label]}
                        <span class="flex items-center gap-1 text-[10px] text-slate-500">
                            <span class="w-2 h-2 rounded-full {TYPE_DOT[type]}"></span>
                            {label}
                        </span>
                    {/each}
                {/if}
            </div>
        </div>
    {/if}
</div>

<!-- ── Popover: events for selected date ─────────────────────────── -->
{#if popoverVisible && selectedEvents.length > 0}
    <div
        class="fixed inset-0 z-10 flex items-end justify-center sm:items-center pointer-events-none"
        on:click={() => popoverVisible = false}
    >
        <div
            class="
                pointer-events-auto bg-white rounded-2xl shadow-xl border border-slate-100
                p-4 mx-4 mb-4 sm:mb-0 w-full max-w-xs
            "
        >
            <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-semibold text-slate-800">
                    {selectedDate?.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
                </p>
                <button
                    on:click={() => popoverVisible = false}
                    class="text-slate-400 hover:text-slate-600"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <ul class="space-y-2">
                {#each selectedEvents as evt}
                    <li class="flex items-center gap-2 text-sm">
                        <span class="w-2.5 h-2.5 rounded-full shrink-0 {TYPE_DOT[evt.type] ?? 'bg-slate-300'}"></span>
                        <span class="text-slate-700">{evt.label}</span>
                        {#if evt.count}
                            <span class="ml-auto text-xs text-slate-400">{evt.count} emp</span>
                        {/if}
                    </li>
                {/each}
            </ul>
        </div>
    </div>
{/if}