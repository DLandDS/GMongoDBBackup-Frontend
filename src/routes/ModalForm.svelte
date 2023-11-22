<script lang="ts">
	import type { Server } from './page';
	// Props
	/** Exposes parent props to this component. */
	export let parent: any;

	import FetchButton from '$lib/component/FetchButton.svelte';
	// Stores
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import axios from 'axios';
	import mergeObjects from '$lib/mergeObject';
	const modalStore = getModalStore();
	const toastStore = getToastStore();

	// Form Data

	// We've created a custom submit function to pass the response and close the modal.
	function onFormSubmit(): void {
		if ($modalStore[0].response) $modalStore[0].response(true);
		modalStore.close();
	}

	const server = ($modalStore[0] as any).server as Server | undefined;

	const formData = mergeObjects(
		{
			name: 'MongoDB',
			uri: 'mongodb://localhost:27017',
			interval: 30,
			gdriveDirId: ''
		},
		server || {}
	);

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';

	async function testDBConnection() {
		const response = await axios.post('/v1/util/db-connection-test', { uri: formData.uri });
		dbConnectionStatus = response.data;
	}

	async function gdriveDirCheck() {
		const response = await axios.post('/v1/util/grdiveDir-check', { id: formData.gdriveDirId });
		grdiveDirCheckStatus = response.data;
	}

	let dbConnectionStatus: {
		success: boolean;
		message: string;
	} = {
		success: server? true : false,
		message: ''
	};

	let grdiveDirCheckStatus: {
		success: boolean;
		message: string;
	} = {
		success: server? true : false,
		message: ''
	};
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
				<div class="flex flex-col gap-1">
					<span>Uri</span>
					<div class="flex flex-row gap-2">
						<input class="input" type="url" bind:value={formData.uri} placeholder="Enter URI..." />
						<FetchButton class="btn variant-filled" fetch={testDBConnection}>Test</FetchButton>
					</div>
					{#if dbConnectionStatus.message}
						<span class={dbConnectionStatus.success?"text-green-600":"text-red-600"}>Status: {dbConnectionStatus.message}</span>
					{/if}
				</div>
			</label>
			<label class="label">
				<span>Interval (minute)</span>
				<input
					class="input"
					type="number"
					bind:value={formData.interval}
					placeholder="Enter URI..."
				/>
			</label>
			<label class="label">
				<div class="flex flex-col gap-1">
					<span>Custom Directory ID (Optional)</span>
					<div class="flex flex-row gap-2">
						<input class="input" type="url" bind:value={formData.gdriveDirId} placeholder="Enter GDrive Directory ID..." />
						<FetchButton class="btn variant-filled" fetch={gdriveDirCheck}>Check</FetchButton>
					</div>
					{#if grdiveDirCheckStatus.message}
						<span class={grdiveDirCheckStatus.success?"text-green-600":"text-red-600"}>Status: {grdiveDirCheckStatus.message}</span>
					{/if}
				</div>
			</label>
		</form>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
		<FetchButton class="btn {parent.buttonPositive}" disabled={!dbConnectionStatus.success && (formData.gdriveDirId? grdiveDirCheckStatus.success: true)}  fetch={async () => {
			// delay for 2 
			if(server) {
				await axios.put("/v1/server/" + server.id, formData);
				toastStore.trigger({
					message: "Server updated",
					background: 'variant-filled-primary'
				});
			} else {
				await axios.post("/v1/server", formData);
				toastStore.trigger({
					message: "Server added",
					background: 'variant-filled-primary'
				});
			}
			onFormSubmit();
		}}>
			Submit
		</FetchButton>
	</footer>
	</div>
{/if}
