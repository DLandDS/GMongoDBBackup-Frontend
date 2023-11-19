<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar, type ModalComponent, Modal } from '@skeletonlabs/skeleton';
	import { Toast } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import initializeAxiosConfig from '$lib/axios-interceptor';
	import ModalForm from './ModalForm.svelte';
	import ModalLog from './ModalLog.svelte';

	initializeStores();
	initializeAxiosConfig()
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	const modalComponentRegistry: Record<string, ModalComponent> = {
		form: {
			ref: ModalForm,
		},
		logs: {
			ref: ModalLog,
		}
	};
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase">MongoDB GD AutoBackup</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a class="btn btn-sm variant-ghost-surface" href="/" rel="noreferrer"> Home </a>
				<a class="btn btn-sm variant-ghost-surface" href="/log" rel="noreferrer"> Log </a>
				<a class="btn btn-sm variant-ghost-surface" href="/setting" rel="noreferrer"> Setting </a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
<Toast position="br" zIndex="z-50" />
<Modal components={modalComponentRegistry} zIndex="z-40" />
