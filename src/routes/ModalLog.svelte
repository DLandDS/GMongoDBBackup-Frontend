<script lang="ts">
	import axios from 'axios';
	import type { Server } from './page';

	export let parent: any;

	// Stores
	import { ProgressRadial, getModalStore } from '@skeletonlabs/skeleton';
	import { onDestroy } from 'svelte';
	const modalStore = getModalStore();
	const cBase = 'card p-4 shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';

	const server = ($modalStore[0] as any).server as Server;

	let log: string = '';

	let preHTMLElement: HTMLPreElement;
	let eventSource: EventSource;

	function startStream(){
		eventSource = new EventSource(`${axios.defaults.baseURL}/v1/server/${server.id}/log/stream`);
		eventSource.onmessage = (event) => {
			console.log({EventSource: event.data});
			log += event.data + '\n';
			scrollToBottom();
		};
		eventSource.onerror = (error) => {
			console.error('EventSource error:', error);
		};
	}

	function scrollToBottom(){
		if(preHTMLElement){
			preHTMLElement.scrollTop = preHTMLElement.scrollHeight;
		}
	}

	async function loadLogHistory() {
		log = '';
		startStream();
		const response = await axios.get<{ log: string }>(`/v1/server/${server.id}/log`);
		log = response.data.log + log;
		setTimeout(scrollToBottom, 100);
	}

	onDestroy(() => {
		if(eventSource){
			eventSource.close();
		}
	});
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	{#await loadLogHistory()}
		<div class="modal-example-form {cBase} flex flex-col items-center !p-10">
			<article>
				<ProgressRadial width="w-10" size="lg" />
			</article>
			<header class={cHeader}>Connecting...</header>
		</div>
	{:then _}
		<div class="modal-example-form {cBase} w-modal max-w-screen-2xl">
			<header class="{cHeader} flex justify-between">
				<span>Logs</span>
				<button class="btn btn-sm {parent.buttonNeutral}" on:click={parent.onClose}>
					{parent.buttonTextCancel}
				</button>
			</header>
			<pre
				bind:this={preHTMLElement}
				class="h-[70vh] variant-filled rounded-container-token px-3 py-2 overflow-auto"
				bind:innerText={log}
				contenteditable="false"
			/>
		</div>
	{/await}
{/if}
