<script>
	import { Project_Theme_Settings } from '$lib/Project_Theme_Settings';
</script>

<footer class="w-full border-t border-gray-200 py-3 mt-auto" 
        style="background-color: {Project_Theme_Settings.header_color};">
	<div class="container mx-auto px-4">
		<div class="flex flex-col md:flex-row items-center justify-between gap-2">
			
			<div class="text-center md:text-left">
				<p class="text-[10px] md:text-sm text-gray-500 font-medium leading-relaxed">
					Conceptualised & Designed by 
					<span class="text-cyan-700 font-bold">AIRA Kloud Suite</span> 
					<span class="hidden sm:inline">|</span> 
					<br class="sm:hidden" />
					© 2021-{new Date().getFullYear()} AIRA Consulting Pvt. Ltd. ®, Mumbai.
				</p>
			</div>

			<div class="flex items-center space-x-4">
				<a href="/" class="text-[10px] md:text-sm font-semibold text-gray-500 hover:text-cyan-600 transition-colors">
					Live Tool
				</a>
				<span class="h-3 w-[1px] bg-gray-300"></span>
				<p class="text-[10px] md:text-sm text-gray-400 italic">v3.0.1-stable</p>
			</div>

		</div>
	</div>
</footer>