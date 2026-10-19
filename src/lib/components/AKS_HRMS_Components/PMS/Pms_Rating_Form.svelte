<script>
  import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage';

  export let kraList = [];
  export let selectedEmployee = '';
  export let employeeDetails = {};
  export let processingYear = '';
  export let h1Rating = 'N/A';
  export let h2Rating = 'N/A';
  export let finalRating = 'N/A';
  export let finalRemarks = '';
  export let onSave = () => {};
  export let onCancel = () => {};
  export let onChange = () => {};

  let activePeriod = 'h1';

  const periods = [
    { id: 'h1', label: 'Apr–Sep' },
    { id: 'h2', label: 'Oct–Mar' },
    { id: 'year', label: 'Full year' }
  ];

  $: details = employeeDetails[selectedEmployee] || {};
  $: viewerId = String($Live_Data_Storage?.User_Information?.Employee_Self_ID ?? '');
  $: ratedId = String(details.Employee_Self_ID ?? '');
  $: isSelf = ratedId !== '' && viewerId === ratedId;

  function hasValue(value) {
    return value !== '' && value !== null && value !== undefined;
  }

  function weightOf(kpi) {
    if (activePeriod === 'h1') return Number(kpi.h1_weightage || 0);
    if (activePeriod === 'h2') return Number(kpi.h2_weightage || 0);
    return Number(kpi.h1_weightage || 0) + Number(kpi.h2_weightage || 0);
  }

  function selfValue(kpi) {
    return activePeriod === 'h2' ? kpi.H2_employee_actual : kpi.H1_employee_actual;
  }

  function managerValue(kpi) {
    return activePeriod === 'h2' ? kpi.H2_manager_actual : kpi.H1_manager_actual;
  }

  function scoreForProgress(kpi) {
    if (activePeriod === 'year') return isSelf ? 'skip' : kpi.HR_actual;
    return isSelf ? selfValue(kpi) : managerValue(kpi);
  }

  $: applicable = kraList.filter((kra) => kra.kpis?.some((kpi) => weightOf(kpi) > 0));
  $: filledCount = applicable.filter((kra) =>
    kra.kpis.filter((kpi) => weightOf(kpi) > 0).every((kpi) => {
      const score = scoreForProgress(kpi);
      return score === 'skip' || hasValue(score);
    })
  ).length;

  function changed() {
    onChange();
  }

  function isScale(ratingType) {
    return ratingType === 'Rating' || ratingType === '1-5 Scale';
  }

  function scaleProblem(value, ratingType) {
    if (!hasValue(value)) return '';
    if (ratingType !== 'Rating' && ratingType !== '1-5 Scale') return '';
    const number = Number(value);
    if (Number.isNaN(number) || number < 1 || number > 5) return 'Use a score from 1 to 5.';
    return '';
  }

  function average(left, right) {
    const values = [left, right]
      .map((value) => (hasValue(value) ? Number(value) : null))
      .filter((value) => value !== null && !Number.isNaN(value));
    if (!values.length) return '—';
    return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2);
  }
</script>

<div class="bg-white rounded-xl border border-slate-200">
  <div class="sticky top-0 z-20 bg-white border-b border-slate-200 rounded-t-xl px-5 py-4">
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-800">{selectedEmployee || 'Performance form'}</h1>
        <p class="text-sm text-slate-500 mt-1">
          {details.Employee_Code || '—'}
          · {details.Designation || '—'}
          · {details.Department || '—'}
          · {processingYear || '—'}
        </p>
        {#if details.Manager_Employee_Name}
          <p class="text-xs text-slate-400 mt-1">Manager: {details.Manager_Employee_Name}</p>
        {/if}
      </div>
      <div class="flex gap-3 text-sm">
        <div class="rounded-lg bg-slate-50 px-3 py-2">
          <p class="text-[11px] uppercase tracking-wide text-slate-400">Apr–Sep</p>
          <p class="font-semibold text-slate-800">{h1Rating}</p>
        </div>
        <div class="rounded-lg bg-slate-50 px-3 py-2">
          <p class="text-[11px] uppercase tracking-wide text-slate-400">Oct–Mar</p>
          <p class="font-semibold text-slate-800">{h2Rating}</p>
        </div>
        <div class="rounded-lg bg-slate-50 px-3 py-2">
          <p class="text-[11px] uppercase tracking-wide text-slate-400">Full year</p>
          <p class="font-semibold text-slate-800">{finalRating}</p>
        </div>
      </div>
    </div>
    <p class="text-xs text-slate-500 mt-3">
      {#if activePeriod === 'year' && isSelf}
        The full-year rating is entered by the manager.
      {:else}
        {filledCount} of {applicable.length} KRAs filled
      {/if}
    </p>
  </div>

  <div class="px-5 pt-4 flex gap-2">
    {#each periods as period}
      <button
        type="button"
        class="px-3 py-1.5 rounded-lg text-sm {activePeriod === period.id ? 'bg-[#1E3A5F] text-white' : 'bg-slate-100 text-slate-600'}"
        on:click={() => activePeriod = period.id}
      >{period.label}</button>
    {/each}
  </div>

  <div class="p-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
    {#each kraList as kra, index}
      <section class="rounded-xl border border-slate-200 min-w-0 h-full">
        <h2 class="px-4 py-3 text-sm font-semibold text-slate-800 border-b border-slate-100">
          KRA {index + 1}: {kra.name}
        </h2>
        <div class="divide-y divide-slate-100">
          {#each kra.kpis as kpi}
            <div class="px-4 py-3 {weightOf(kpi) === 0 ? 'opacity-50' : ''}">
              <div class="flex items-start justify-between gap-3 mb-3">
                <p class="text-sm text-slate-800">{kpi.name}</p>
                <p class="text-xs text-slate-400 whitespace-nowrap">Weight {weightOf(kpi)}%</p>
              </div>

              {#if activePeriod === 'h1' || activePeriod === 'h2'}
                {@const scoreKey = activePeriod === 'h1' ? 'H1_employee_actual' : 'H2_employee_actual'}
                {@const selfRemarkKey = activePeriod === 'h1' ? 'H1_employee_remarks' : 'H2_employee_remarks'}
                {@const managerScoreKey = activePeriod === 'h1' ? 'H1_manager_actual' : 'H2_manager_actual'}
                {@const managerRemarkKey = activePeriod === 'h1' ? 'H1_manager_remarks' : 'H2_manager_remarks'}
                <div class="grid grid-cols-1 gap-3">
                  <div class="block text-xs text-slate-500">
                    Employee score
                    {#if isScale(kpi.ratingType)}
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.25"
                        bind:value={kpi[scoreKey]}
                        on:input={changed}
                        disabled={!isSelf || weightOf(kpi) === 0}
                        class="mt-2 w-full accent-[#1E3A5F]"
                      />
                      <div class="flex justify-between text-[11px] text-slate-400 px-0.5"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div>
                    {/if}
                    <div class="relative mt-1 w-28">
                      <input
                        type="number"
                        min={isScale(kpi.ratingType) ? 1 : 0}
                        max={isScale(kpi.ratingType) ? 5 : undefined}
                        step="0.25"
                        bind:value={kpi[scoreKey]}
                        on:input={changed}
                        disabled={!isSelf || weightOf(kpi) === 0}
                        placeholder={kpi.ratingType === 'Percentage' ? '%' : kpi.ratingType === 'Value' ? 'value' : ''}
                        class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50"
                      />
                      {#if isScale(kpi.ratingType)}
                        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">/5</span>
                      {:else if kpi.target}
                        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">/ {kpi.target}</span>
                      {/if}
                    </div>
                    {#if scaleProblem(kpi[scoreKey], kpi.ratingType)}
                      <span class="text-red-600">{scaleProblem(kpi[scoreKey], kpi.ratingType)}</span>
                    {/if}
                  </div>
                  <label class="block text-xs text-slate-500">
                    Employee remarks
                    <textarea
                      bind:value={kpi[selfRemarkKey]}
                      on:input={changed}
                      disabled={!isSelf || weightOf(kpi) === 0}
                      rows="2"
                      class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50"
                    ></textarea>
                  </label>
                  <div class="block text-xs text-slate-500">
                    Manager score
                    {#if isScale(kpi.ratingType)}
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.25"
                        bind:value={kpi[managerScoreKey]}
                        on:input={changed}
                        disabled={isSelf || weightOf(kpi) === 0}
                        class="mt-2 w-full accent-[#1E3A5F]"
                      />
                      <div class="flex justify-between text-[11px] text-slate-400 px-0.5"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div>
                    {/if}
                    <div class="relative mt-1 w-28">
                      <input
                        type="number"
                        min={isScale(kpi.ratingType) ? 1 : 0}
                        max={isScale(kpi.ratingType) ? 5 : undefined}
                        step="0.25"
                        bind:value={kpi[managerScoreKey]}
                        on:input={changed}
                        disabled={isSelf || weightOf(kpi) === 0}
                        placeholder={kpi.ratingType === 'Percentage' ? '%' : kpi.ratingType === 'Value' ? 'value' : ''}
                        class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50"
                      />
                      {#if isScale(kpi.ratingType)}
                        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">/5</span>
                      {:else if kpi.target}
                        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">/ {kpi.target}</span>
                      {/if}
                    </div>
                    {#if scaleProblem(kpi[managerScoreKey], kpi.ratingType)}
                      <span class="text-red-600">{scaleProblem(kpi[managerScoreKey], kpi.ratingType)}</span>
                    {/if}
                  </div>
                  <label class="block text-xs text-slate-500">
                    Manager remarks
                    <textarea
                      bind:value={kpi[managerRemarkKey]}
                      on:input={changed}
                      disabled={isSelf || weightOf(kpi) === 0}
                      rows="2"
                      class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50"
                    ></textarea>
                  </label>
                </div>
              {:else}
                <div class="grid grid-cols-1 gap-3 text-sm">
                  <p class="text-slate-500">Average self score <span class="font-semibold text-slate-800">{average(kpi.H1_employee_actual, kpi.H2_employee_actual)}</span></p>
                  <p class="text-slate-500">Average manager score <span class="font-semibold text-slate-800">{average(kpi.H1_manager_actual, kpi.H2_manager_actual)}</span></p>
                  <div class="block text-xs text-slate-500">
                    Final manager score
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.25"
                      bind:value={kpi.HR_actual}
                      on:input={changed}
                      disabled={isSelf}
                      class="mt-2 w-full accent-[#1E3A5F]"
                    />
                    <div class="flex justify-between text-[11px] text-slate-400 px-0.5"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div>
                    <div class="relative mt-1 w-28">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.25"
                        bind:value={kpi.HR_actual}
                        on:input={changed}
                        disabled={isSelf}
                        class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50"
                      />
                      <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">/5</span>
                    </div>
                    {#if scaleProblem(kpi.HR_actual, '1-5 Scale')}
                      <span class="text-red-600">{scaleProblem(kpi.HR_actual, '1-5 Scale')}</span>
                    {/if}
                  </div>
                  <label class="block text-xs text-slate-500">
                    Final manager remarks
                    <textarea
                      bind:value={kpi.HR_remarks}
                      on:input={changed}
                      disabled={isSelf}
                      rows="2"
                      class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50"
                    ></textarea>
                  </label>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </section>
    {/each}
    </div>

    <label class="block text-sm text-slate-600 mt-4">
      Final remarks
      <textarea
        bind:value={finalRemarks}
        on:input={onChange}
        rows="3"
        placeholder="Enter any concluding remarks here..."
        class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
      ></textarea>
    </label>

    <div class="flex justify-end gap-2 pt-2">
      <button type="button" class="px-4 py-2 text-sm border border-slate-300 rounded-lg" on:click={onCancel}>Cancel</button>
      <button type="button" class="px-4 py-2 text-sm bg-[#1E3A5F] text-white rounded-lg" on:click={onSave}>Save</button>
    </div>
  </div>
</div>
