<script lang="ts">
	import FetchButton from '$lib/component/FetchButton.svelte';
	import { getModalStore, ProgressRadial, type ModalSettings } from '@skeletonlabs/skeleton';
	import axios from 'axios';
	import { parseTime, type Server, type ServerDisplay } from './page';
	import { onMount } from 'svelte';

	const modalStore = getModalStore();

	let servers: ServerDisplay[] = [];

	async function getData() {
		const response = await axios.get<Server[]>('/v1/server');
		servers = response.data;
	}

	function removeServer(server: Server) {
		return new Promise<boolean>((resolve) => {
			const modal: ModalSettings = {
				type: 'confirm',
				title: 'Please Confirm',
				body: `Are you sure you wish to delete "${server.name}" server?`,
				response: async (r: boolean) => {
					if (r) {
						await axios.delete(`/v1/server/${server.id}`);
					}
					resolve(r);
				}
			};
			modalStore.trigger(modal);
		});
	}

	function addServer() {
		return {
			title: 'Add Server',
			body: 'Add a new server to the list.',
			type: 'component',
			component: 'form',
			response(r) {
				if (r) instance = {};
			}
		} satisfies ModalSettings;
	}

	function editServer(server: Server) {
		return new Promise<boolean>((resolve) => {
			const modal: ModalSettings & { server: Server } = {
				title: 'Edit Server',
				body: 'Edit a server from the list.',
				type: 'component',
				component: 'form',
				server,
				response: async (r: boolean) => {
					resolve(r);
				}
			};
			modalStore.trigger(modal);
		});
	}

	let instance = {};

	async function loadStatus() {
		const response = await axios.post('/v1/status', { id: servers.map((s) => s.id) });
	}

	onMount(async () => {});
</script>

<div class="container h-full mx-auto flex flex-col gap-2 px-2">
	<div class="my-3 flex flex-row justify-between">
		<h3 class="h3">Servers</h3>
		<button
			type="button"
			class="btn variant-filled"
			on:click={() => {
				modalStore.trigger(addServer());
			}}
		>
			Add ➕
		</button>
	</div>
	{#key instance}
		{#await getData()}
			<ProgressRadial
				class="mx-auto m-10"
				width="w-10"
				stroke={100}
				meter="stroke-primary-500"
				track="stroke-primary-500/30"
			/>
		{:then _}
			{#each servers as server}
				<div class="card w-full shadow-md">
					<header class="card-header flex justify-between">
						<h4 class="h4">{server.name}</h4>
						<div class="flex gap-1">
							<FetchButton
								type="button"
								class="btn btn-sm variant-filled"
								fetch={async () => {
									const res = await editServer(server);
									if (res) instance = {};
								}}
							>
								Edit <span class="ml-3">🖊️</span>
							</FetchButton>
							<FetchButton
								type="button"
								class="btn btn-sm variant-filled"
								fetch={async () => {
									const res = await removeServer(server);
									if (res) instance = {};
								}}
							>
								Remove <span class="ml-3">🗑️</span>
							</FetchButton>
						</div>
					</header>
					<section class="p-4 flex flex-row">
						<div class="flex flex-col flex-grow">
							<span>
								Status: {#if server.status}{server.status}{:else}<ProgressRadial
										class="inline-block"
										width="w-4"
										stroke={100}
										meter="stroke-primary-500"
										track="stroke-primary-500/30"
									/>
								{/if}
							</span>
							<span>
								Last backup: {#if server.lastBackup}
									{#if new Date(server.lastBackup).getTime() > 0}
										{parseTime(server.lastBackup)}{:else}Never{/if}
								{:else}
									<ProgressRadial
										class="inline-block"
										width="w-4"
										stroke={100}
										meter="stroke-primary-500"
										track="stroke-primary-500/30"
									/>
								{/if}
							</span>
							<span>Interval: {server.interval} minute(s)</span>
						</div>
						<div>
							<FetchButton
								type="button"
								class="btn variant-filled btn-sm"
								fetch={async () => {
									await axios.post('/v1/action/start', { id: server.id });
								}}
							>
								Backup Now
							</FetchButton>
						</div>
					</section>
				</div>
			{/each}
		{/await}
	{/key}
</div>
