<script lang="ts">
	import type { Server } from './page';
	// Props
	/** Exposes parent props to this component. */
	export let parent: any;

	import FetchButton from '$lib/component/FetchButton.svelte';
	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import axios from 'axios';
	const modalStore = getModalStore();

	// Form Data

	// We've created a custom submit function to pass the response and close the modal.
	function onFormSubmit(): void {
		if ($modalStore[0].response) $modalStore[0].response(true);
		modalStore.close();
	}

	const server = ($modalStore[0] as any).server as Server | undefined;

	const formData = server
		? { ...server, id: undefined }
		: {
				name: 'MongoDB',
				uri: 'mongodb://localhost:27017',
				interval: 30,
		  };

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>
		<article>{$modalStore[0].body ?? '(body missing)'}</article>
		<!-- Enable for debugging: -->
		<form class="modal-form {cForm}">
			<label class="label">
				<span>Name</span>
				<input class="input" type="text" bind:value={formData.name} placeholder="Enter name..." />
			</label>
			<label class="label">
				<span>Uri</span>
				<input class="input" type="url" bind:value={formData.uri} placeholder="Enter URI..." />
			</label>
			<label class="label">
				<span>Interval (minute)</span>
				<input class="input" type="number" bind:value={formData.interval} placeholder="Enter URI..." />
			</label>
		</form>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
		<FetchButton class="btn {parent.buttonPositive}" fetch={async () => {
			// delay for 2 
			if(server) {
				await axios.put("/v1/server/" + server.id, formData);

			} else {
				await axios.post("/v1/server", formData);
			}
			onFormSubmit();
		}}>
			Submit
		</FetchButton>
	</footer>
	</div>
{/if}
