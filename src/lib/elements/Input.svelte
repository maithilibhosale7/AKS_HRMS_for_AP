<script>
    export let name;
    export let label = '';
    export let type ='text';
    export let value ='';
    export let placeholder ='';
    export let required ='';
     

    function handleInput(e) {
		//value = type.match(/^(number|range)$/) ? +e.target.value : e.target.value;
		value = e.target.value;
	}
	
</script>



<label class="block mb-2 text-sm font-medium text-gray-900 ml-1.5 capitalize" for={name}> {label} </label>
<input class="block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500" 
{type}
{value}
{name}
id={name}
{placeholder}
on:input={handleInput} {required}>
