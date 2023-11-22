<script lang="ts">
	import FetchButton from '$lib/component/FetchButton.svelte';
	import { getModalStore, ProgressRadial, type ModalSettings, getToastStore } from '@skeletonlabs/skeleton';
	import axios from 'axios';
	import { parseTime, StatusType, type Server, type ServerDisplay } from './page';
	import { onMount } from 'svelte';

	const modalStore = getModalStore();
	const toastStore = getToastStore();

	let servers: ServerDisplay[] = [];

	async function getData() {
		const response = await axios.get<Server[]>('/v1/server');
		servers = response.data;
		await loadStatus();
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
						toastStore.trigger({
						message: "Server removed",
						background: 'variant-filled-primary'
					});
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

	function logServer(server: Server) {
		return new Promise<boolean>((resolve) => {
			const modal: ModalSettings & { server: Server } = {
				body: 'Edit a server from the list.',
				type: 'component',
				component: 'logs',
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
		const response = await axios.post<{
			[x: string]: {
				lastBackup: string;
				status: {
					type: StatusType;
					message: string;
				};
				enabled: boolean;
			};
		}>('/v1/status', { id: servers?.map((s) => s.id) || [] });
		servers = servers.map((s) => {
			const status = response.data[s.id];
			if (status) {
				s.lastBackup = status.lastBackup ? status.lastBackup : s.lastBackup;
				s.status = status.status ? status.status : s.status;
				s.enabled = status.enabled !== undefined ? status.enabled : s.enabled;
			}
			return s;
		});
	}

	const lostConnectionModal: ModalSettings = {
		type: 'alert',
		title: 'Connection Lost',
		body: 'Please refresh the page to reconnect.',
		buttonTextCancel: 'Refresh',
		response: () => {
			window.location.reload();
		}
	};

	onMount(() => {
		const interval = setInterval(async () => {
			try {
				await loadStatus();
			} catch(e){
				modalStore.trigger(lostConnectionModal);
				clearInterval(interval);
			}
		}, 3000);
		return () => {
			clearInterval(interval);
		};
	});
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
							<table class="mr-auto border-separate border-spacing-x-2">
								<tr>
									<td>Status</td>
									<td>:</td>
									<td>
										<span>
											{#if server.status}
												{#if server.status.type == StatusType.Inactive}
													⭕
												{:else if server.status.type == StatusType.Ready}
													🟢
												{:else if server.status.type == StatusType.Running}
													🟡
												{:else if server.status.type == StatusType.Error}
													🔴
												{:else}
													🔵
												{/if}
												{server.status.message}
											{:else}<ProgressRadial
													class="inline-block"
													width="w-4"
													stroke={100}
													meter="stroke-primary-500"
													track="stroke-primary-500/30"
												/>
											{/if}
										</span>
									</td>
								</tr>
								<tr>
									<td>Last backup</td>
									<td>:</td>
									<td>
										<span>
											{#if server.lastBackup}
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
									</td>
								</tr>
								<tr>
									<td>Interval</td>
									<td>:</td>
									<td>{server.interval} minute(s)</td>
								</tr>
							</table>
						</div>
						<div>
							<button
								type="button"
								class="btn variant-filled btn-sm"
								on:click={() => {
									logServer(server);
								}}
							>
								Logs 📜
							</button>

							<FetchButton
								type="button"
								class="btn variant-filled btn-sm"
								fetch={async () => {
									console.log(server.enabled);
									if (server.enabled) {
										await axios.post('/v1/action/disable', { id: server.id });
									} else {
										await axios.post('/v1/action/enable', { id: server.id });
									}
									loadStatus();
								}}
							>
								{#key server}
									{#if server.enabled}
										Disable ⛔
									{:else}
										Enable ✅
									{/if}
								{/key}
							</FetchButton>

							<FetchButton
								type="button"
								class="btn variant-filled btn-sm"
								fetch={async () => {
									await axios.post('/v1/action/stop', { id: server.id });
									loadStatus();
								}}
							>
								Stop 🛑
							</FetchButton>
							<FetchButton
								type="button"
								class="btn variant-filled btn-sm"
								fetch={async () => {
									await axios.post('/v1/action/start', { id: server.id });
									loadStatus();
								}}
							>
								Run ▶️
							</FetchButton>
						</div>
					</section>
				</div>
			{/each}
		{/await}
	{/key}
</div>
