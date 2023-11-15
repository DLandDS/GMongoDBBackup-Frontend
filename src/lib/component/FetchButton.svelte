<script lang="ts">
	import { ProgressRadial } from '@skeletonlabs/skeleton';

	export let fetch: () => Promise<void>;

	let isLoading = false;
	export let disabled: boolean = false;

	async function handleClick() {
		try {
			isLoading = true;
			await fetch();
		} catch (e) {
			throw e;
		} finally {
			isLoading = false;
		}
	}
</script>

<button {...$$restProps} on:click={handleClick} disabled={isLoading || disabled}>
    <div class="flex items-center">
	<slot />
	{#if isLoading}
		<div class="h-full ml-2">
			<ProgressRadial width="w-4 my-auto" stroke={100} meter="stroke-primary-500" track="stroke-primary-500/30" />
		</div>
	{/if}
</div>
</button>
