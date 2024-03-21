import WinModal from "$lib/components/modal/WinModal.svelte";

export const MODAL = {
	Win: "win",
};

export const ModalCfg = {
	[MODAL.Win]: {
		component: WinModal,
		data: {},
		config: {},
	},
};