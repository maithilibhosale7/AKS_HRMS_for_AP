<script lang="ts">
    import { API_PATHS } from '$lib/API_PATHS';
    import { Project_Theme_Settings } from '$lib/Project_Theme_Settings';
  
    // --- PROPS ---
    // Binds directly to your data array (e.g., bind:value={D.Identification_Documents.Documents})
    export let value: string[] = []; 
    
    // Optional customizations
    export let label: string = "Upload Documents";
    export let required: boolean = false;
    export let disabled: boolean = false;
  
    // --- INTERNAL STATE ---
    let isDragging = false;
    let isUploading = false;
    let uploadProgress = 0;
  
    // Generate a unique ID for the input so labels click properly 
    // without needing a hardcoded Field_Key from the parent
    const inputId = `hrms_upload_${Math.random().toString(36).substring(2, 9)}`;
  
    function handleDragOver(e: DragEvent) {
      e.preventDefault();
      if (disabled) return;
      isDragging = true;
    }
  
    function handleDragLeave(e: DragEvent) {
      e.preventDefault();
      isDragging = false;
    }
  
    function handleDrop(e: DragEvent) {
      e.preventDefault();
      isDragging = false;
      if (disabled) return;
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFileUpload({ target: { files } });
      }
    }
  
    async function handleFileUpload(e: any) {
      if (disabled) return;
      const files = e.target.files;
      if (!files.length) return;
  
      isUploading = true;
      uploadProgress = 0;
  
      const progressInterval = setInterval(() => {
        if (uploadProgress < 90) uploadProgress += 10;
      }, 200);
  
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files[]", files[i]);
      }
  
      try {
        const response = await fetch(API_PATHS.API_URL_HRMS_Upload_Attachment, {
          method: "POST",
          body: formData
        });
  
        clearInterval(progressInterval);
        uploadProgress = 100;
        setTimeout(() => {
          isUploading = false;
          uploadProgress = 0;
        }, 300);
  
        const result = await response.json();
  
        if (response.ok && result.data && Array.isArray(result.data)) {
          // Extract new filenames and update the bound `value` array
          let newFiles = [];
          result.data.forEach((file: any) => {
            if (file.name && !value.includes(file.name)) {
              newFiles.push(file.name);
            }
          });
          
          // Svelte Reactivity: Reassign the array to trigger updates in the parent
          value = [...value, ...newFiles];
        } else {
          alert(result.message || "Upload failed: Invalid files");
        }
  
      } catch (err) {
        console.error("Upload failed", err);
        alert("Upload failed. Please check your connection.");
        isUploading = false;
        uploadProgress = 0;
      }
      
      // Reset the input so the same file can be selected again if needed
      e.target.value = "";
    }
  
    function removeFile(filename: string) {
      if (disabled) return;
      // Svelte Reactivity: Filter out the file and reassign
      value = value.filter(f => f !== filename);
    }
  
    async function downloadFile(filename: string) {
      try {
        const response = await fetch(`${API_PATHS.API_URL_HRMS_Download_Attachment}?file=${encodeURIComponent(filename)}`, {
          method: "GET",
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch the file from the server");
        }
  
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        
        a.style.display = "none";
        a.href = url;
        a.download = filename; 
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
      } catch (error) {
        console.error("File download failed:", error);
        alert("Failed to download file. It may no longer exist on the server.");
      }
    }
  </script>
  
  <div
    class={`${Project_Theme_Settings?.component_styles?.field_container?.flex || ''} ${Project_Theme_Settings?.component_styles?.field_container?.padding || 'p-2'} w-full`}
    style={`background-color: ${Project_Theme_Settings?.component_styles?.field_container?.background || 'transparent'};`}
  >
    
    <label
      class="block text-sm font-medium text-gray-700 mb-1.5 capitalize px-2 py-1 rounded"
      for={inputId}
      style={`
        background-color:${Project_Theme_Settings?.Dropdown || 'transparent'};
        color:${Project_Theme_Settings?.component_styles?.label?.text_color || 'inherit'};
        font-size:${Project_Theme_Settings?.component_styles?.label?.font_size || 'inherit'};
        font-weight:${Project_Theme_Settings?.component_styles?.label?.font_weight || 'inherit'};
        border:${Project_Theme_Settings?.component_styles?.label?.border_size || '0'} ${Project_Theme_Settings?.component_styles?.label?.border_style || 'solid'} ${Project_Theme_Settings?.component_styles?.label?.border_color || 'transparent'};
        border-radius:${Project_Theme_Settings?.component_styles?.label?.border_radius || '0'};
        padding:${Project_Theme_Settings?.component_styles?.label?.padding || '0'};
        margin-bottom:${Project_Theme_Settings?.component_styles?.label?.margin_bottom || '0'};
      `}
    >
      {label}
      {#if required}
        <span
          class="ml-0.5"
          style={`
            color:${Project_Theme_Settings?.component_styles?.mandatory_mark?.text_color || 'red'};
            font-size:${Project_Theme_Settings?.component_styles?.mandatory_mark?.font_size || 'inherit'};
            font-weight:${Project_Theme_Settings?.component_styles?.mandatory_mark?.font_weight || 'inherit'};
          `}
        >*</span>
      {/if}
    </label>
  
    <div class="w-full">
      <div
        class="relative border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200"
        class:bg-blue-50={isDragging}
        class:border-blue-400={isDragging}
        class:border-gray-300={!isDragging}
        class:bg-white={!isDragging}
        on:dragover={handleDragOver}
        on:dragleave={handleDragLeave}
        on:drop={handleDrop}
      >
        <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        
        <input
          id={inputId}
          type="file"
          {disabled}
          class:opacity-50={disabled}
          class:cursor-not-allowed={disabled}
          multiple
          on:change={handleFileUpload}
          class="sr-only"
        />
  
        <label for={inputId} class="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-500">
          Click to upload files
        </label>
        <p class="text-xs text-gray-500 mt-1">or drag and drop them here</p>
  
        {#if isUploading}
          <div class="mt-3 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div class="bg-blue-500 h-1.5 rounded-full transition-all duration-200" style={`width: ${uploadProgress}%`} />
          </div>
        {/if}
      </div>
  
      {#if value && value.length > 0}
        <ul class="mt-3 bg-white border border-gray-200 rounded-md divide-y divide-gray-100 shadow-sm">
          {#each value as filename}
            <li class="flex items-center justify-between py-2 px-3 text-sm hover:bg-gray-50 transition-colors">
              <span class="truncate text-gray-700 max-w-[60%] font-mono text-xs" title={filename}>{filename}</span>
              <div class="flex items-center space-x-3">
                <button on:click={() => downloadFile(filename)} class="text-blue-600 hover:text-blue-800 font-semibold" type="button">
                  Download
                </button>
                <button on:click={() => removeFile(filename)} class="text-red-500 hover:text-red-700 font-semibold" type="button">
                  Remove
                </button>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>