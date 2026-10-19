<script>
    /**
     * Payroll_AddEdit.svelte — FULL IMPLEMENTATION
     * ─────────────────────────────────────────────────────────────────
     * Payslip viewer matching the client's payslip format.
     * HR Admin can view all; Employee sees own only.
     * Print-optimized layout for browser print → PDF.
     *
     * Sections (matching Sample_Payslip_Format.pdf):
     *   1. Personal Information (6×3 grid)
     *   2. Earnings (Description, Actual Salary, Earned Salary)
     *   3. Deductions (Description, Amount) + Net Payable
     */

    import { onMount }           from 'svelte';
    import { post }              from '$lib/utils/api';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { API_PATHS }         from '$lib/API_PATHS';
    import { closeModal }        from '$lib/stores/AKS_HRMS_Modal_Store';

    export let editId      = 'Add';
    export let initialMode = 'View';
    export let onSave      = () => {};

    let Live_Data; $: Live_Data = $Live_Data_Storage; $: user = Live_Data.User_Information ?? {};
    $: isHRAdmin  = user?.HRMS_Access === 'HR Admin';

    let loading = true;

    // Payslip data
    let D = {
        Personal_Info: {},
        Earnings: [],
        Deductions: [],
        Summary: { Total_Earnings: 0, Total_Deductions: 0, Net_Payable: 0 },
        Payroll_Description: ''
    };

    let Employee_Details = {};

    onMount(async () => {
        if (editId !== 'Add') {
            const res = await post(API_PATHS.API_URL_Get_Payroll_Management_Data_by_ID, { Edit_ID: editId });
            if (res.Payroll_Details_Main) {
                D = res.Payroll_Details_Main;
            }
            Employee_Details = res.Employee_Details ?? {};
            D.Payroll_Description = res.Payroll_Description ?? '';
        }
        loading = false;
    });

    function fmt(v) {
        if (v === null || v === undefined || v === '') return '0';
        return Number(v).toLocaleString('en-IN');
    }

    function printPayslip() {
        // Open a print-friendly window with just the payslip content
        const el = document.getElementById('payslip-content');
        if (!el) return;
        const win = window.open('', '_blank');
        win.document.write(`
            <html><head><title>Payslip - ${D.Payroll_Description}</title>
            <style>
                body { font-family: 'Courier New', monospace; font-size: 11px; margin: 20px; color: #000; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 10px; }
                th, td { border: 1px solid #333; padding: 4px 8px; text-align: left; }
                th { background: #f0f0f0; font-weight: bold; }
                .header { text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 5px; }
                .sub-header { text-align: center; font-size: 12px; margin-bottom: 15px; }
                .section-header { text-align: center; font-weight: bold; background: #e0e0e0; }
                .right { text-align: right; }
                .bold { font-weight: bold; }
                .footer { text-align: center; font-style: italic; margin-top: 15px; font-size: 10px; }
                @media print { body { margin: 10px; } }
            </style></head><body>${el.innerHTML}
            <p class="footer">This is a system generated report and does not need a signature and stamp.<br>***** End of Payslip *****</p>
            </body></html>
        `);
        win.document.close();
        win.print();
    }
</script>

{#if loading}
    <div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>
{:else}
    <!-- Action bar -->
    <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-semibold text-slate-700">Payslip — {D.Payroll_Description || '—'}</h2>
        <button on:click={printPayslip}
            class="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-medium rounded-xl hover:bg-[#16304f] flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print / Download PDF
        </button>
    </div>

    <div id="payslip-content">

    <!-- ── Personal Information ──────────────────────────────────── -->
    <div class="border border-slate-200 rounded-xl overflow-hidden mb-4">
        <div class="bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 text-center">Personal Information</div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 text-xs">
            {#each [
                ['Emp ID',          D.Personal_Info?.Emp_ID ?? '—'],
                ['Bank Name',       D.Personal_Info?.Bank_Name ?? '—'],
                ['LOP Days',        D.Personal_Info?.LOP_Days ?? '0'],
                ['Employee Name',   D.Personal_Info?.Employee_Name ?? '—'],
                ['Bank A/c No',     D.Personal_Info?.Bank_Account ?? '—'],
                ['Paid Holiday',    D.Personal_Info?.Paid_Holiday ?? '0'],
                ['Department',      D.Personal_Info?.Department ?? '—'],
                ['IFSC Code',       D.Personal_Info?.IFSC_Code ?? '—'],
                ['PAN Number',      D.Personal_Info?.PAN_Number ?? '—'],
                ['Designation',     D.Personal_Info?.Designation ?? '—'],
                ['Month Days',      D.Personal_Info?.Month_Days ?? '—'],
                ['UAN Number',      D.Personal_Info?.UAN_Number ?? '—'],
                ['Date of Joining', D.Personal_Info?.DOJ ?? '—'],
                ['Payable Days',    D.Personal_Info?.Payable_Days ?? '—'],
                ['ESIC Number',     D.Personal_Info?.ESIC_Number ?? '—'],
                ['Leave Availed',   D.Personal_Info?.Leave_Availed ?? '0'],
                ['PL Balance',      D.Personal_Info?.PL_Balance ?? '—'],
                ['CL Balance',      D.Personal_Info?.CL_Balance ?? '—']
            ] as [label, value]}
                <div class="px-3 py-2 border-b border-r border-slate-100">
                    <span class="text-slate-400">{label}</span>
                    <p class="font-medium text-slate-800 truncate">{value}</p>
                </div>
            {/each}
        </div>
    </div>

    <!-- ── Earnings + Deductions side by side ────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        <!-- Earnings -->
        <div class="border border-slate-200 rounded-xl overflow-hidden">
            <div class="bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 text-center">Earnings</div>
            <table class="w-full text-xs">
                <thead><tr class="bg-slate-50">
                    <th class="text-left px-3 py-2 text-slate-500 font-medium">Description</th>
                    <th class="text-right px-3 py-2 text-slate-500 font-medium">Actual</th>
                    <th class="text-right px-3 py-2 text-slate-500 font-medium">Earned</th>
                </tr></thead>
                <tbody class="divide-y divide-slate-50">
                    {#each D.Earnings ?? [] as item}
                        <tr>
                            <td class="px-3 py-1.5 text-slate-700">{item.Description}</td>
                            <td class="px-3 py-1.5 text-slate-800 text-right font-mono">{fmt(item.Actual_Salary)}</td>
                            <td class="px-3 py-1.5 text-slate-800 text-right font-mono">{fmt(item.Earned_Salary)}</td>
                        </tr>
                    {/each}
                </tbody>
                <tfoot>
                    <tr class="bg-slate-50 font-semibold">
                        <td class="px-3 py-2 text-slate-700">Total Earnings</td>
                        <td class="px-3 py-2 text-right font-mono text-slate-800">{fmt(D.Summary?.Total_Earnings_Actual)}</td>
                        <td class="px-3 py-2 text-right font-mono text-emerald-700">{fmt(D.Summary?.Total_Earnings)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Deductions + Net Payable -->
        <div class="border border-slate-200 rounded-xl overflow-hidden">
            <div class="bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 text-center">Deductions</div>
            <table class="w-full text-xs">
                <thead><tr class="bg-slate-50">
                    <th class="text-left px-3 py-2 text-slate-500 font-medium">Description</th>
                    <th class="text-right px-3 py-2 text-slate-500 font-medium">Amount</th>
                </tr></thead>
                <tbody class="divide-y divide-slate-50">
                    {#each D.Deductions ?? [] as item}
                        <tr>
                            <td class="px-3 py-1.5 text-slate-700">{item.Description}</td>
                            <td class="px-3 py-1.5 text-slate-800 text-right font-mono">{fmt(item.Amount)}</td>
                        </tr>
                    {/each}
                </tbody>
                <tfoot>
                    <tr class="bg-slate-50 font-semibold">
                        <td class="px-3 py-2 text-slate-700">Total Deductions</td>
                        <td class="px-3 py-2 text-right font-mono text-rose-700">{fmt(D.Summary?.Total_Deductions)}</td>
                    </tr>
                </tfoot>
            </table>

            <!-- Net Payable highlight -->
            <div class="bg-[#1E3A5F] text-white px-4 py-3 flex items-center justify-between">
                <span class="text-xs font-semibold">Net Payable</span>
                <span class="text-lg font-bold">₹{fmt(D.Summary?.Net_Payable)}</span>
            </div>
        </div>
    </div>

    </div><!-- end payslip-content -->

    <!-- Close -->
    <div class="flex justify-end pt-4 border-t border-slate-100">
        <button on:click={closeModal}
            class="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Close</button>
    </div>
{/if}