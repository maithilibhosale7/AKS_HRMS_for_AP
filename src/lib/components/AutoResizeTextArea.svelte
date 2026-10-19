<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  export let disabled = false;
  export let id = '';
  export let name = '';
  export let value = '';
  export let required = false;
  export let mandatory = false;
  export let label = '';
  export let placeholder = 'Enter value here';
  export let className = '';
  export let readonly = false;

  const dispatch = createEventDispatcher();
  let textareaRef: HTMLTextAreaElement;

  function autoResize() {
    if (textareaRef) {
      textareaRef.style.height = 'auto';
      textareaRef.style.height = `${textareaRef.scrollHeight}px`;
    }
  }

  function handleBlur() {
    dispatch('blur', { name, value });
  }

  onMount(autoResize);
  afterUpdate(autoResize);
</script>

<div class="flex flex-col">
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {#if mandatory}
        <span class="text-red-500 text-xl">*</span>
      {/if}
    </label>
  {/if}
  <textarea
    bind:this={textareaRef}
    id={id}
    name={name}
    bind:value
    required={required || mandatory}
    placeholder={placeholder}
    on:blur={handleBlur}
    readonly={readonly}
    disabled={disabled}
    class={`block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm px-2 bg-white overflow-hidden ${className}`}
    style="resize: none"
  />
</div>
