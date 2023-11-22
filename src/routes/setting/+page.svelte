<script lang="ts">
	import FetchButton from '$lib/component/FetchButton.svelte';
	import { ProgressRadial, getToastStore } from '@skeletonlabs/skeleton';
	import axios from 'axios';

	let settings: any;

	async function loadSetting() {
		const response = await axios.get('/v1/setting');
		settings = response.data;
	}

    async function saveSetting() {
        const response = await axios.patch('/v1/setting', settings);
        settings = response.data;
    }

	const toastStore = getToastStore();
</script>

<div class="container h-full mx-auto flex flex-col gap-2 px-2">
	{#await loadSetting()}
		<ProgressRadial
			class="mx-auto m-10"
			width="w-10"
			stroke={100}
			meter="stroke-primary-500"
			track="stroke-primary-500/30"
		/>
	{:then _}
		<div class="my-3 flex flex-row justify-between">
			<h3 class="h3">Setting</h3>
			<FetchButton class="btn variant-filled" fetch={async () => {
                await saveSetting();
                toastStore.trigger({
					message: "Setting saved",
					background: 'variant-filled-primary'
				});
            }}>
                Save
            </FetchButton>
		</div>
		<div class="card w-full shadow-md">
			<form class="modal-form p-4 space-y-4">
				{#each Object.keys(settings) as setting}
					{@const type = typeof settings[setting]}
					{#if type == 'string'}
						<label class="label">
							<span>{setting}</span>
							<input
								class="input"
								type="text"
								bind:value={settings[setting]}
								placeholder="Enter name..."
							/>
						</label>
                    {:else if type == 'number'}
                        <label class="label">
                            <span>{setting}</span>
                            <input
                                class="input"
                                type="number"
                                bind:value={settings[setting]}
                                placeholder="Enter name..."
                            />
                        </label>
					{:else}
						<label class="label">
							<span>{setting}</span>
							<input
								class="input"
								type="number"
                                disabled
								placeholder="Not implemented yet"
							/>
						</label>
					{/if}
				{/each}
			</form>
		</div>
	{/await}
</div>
