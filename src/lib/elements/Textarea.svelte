<script>
    export let name;
    export let label = '';
    export let value ='';
    //export let placeholder ='';
	
</script>

<label class="block mb-2 text-sm font-medium text-gray-900 ml-3" for={name}> {label} </label>
<textarea class="resize block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500" name="{name}">{value}</textarea>