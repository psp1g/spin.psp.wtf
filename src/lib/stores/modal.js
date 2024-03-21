import { ModalCfg } from "$lib/config/modal";
import { derived, writable } from "svelte/store";

export const currentModal = writable();
export const modalData = derived([ currentModal ], ([ $modal ]) => ModalCfg[$modal]);