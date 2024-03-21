<script>
	import { onMount } from "svelte";
	import { writable } from "svelte/store"

	import click from "$lib/action/click";
	import { url } from "$lib/util";
	import { currentItems, editorOpen, totalWeight } from "$lib/stores/game";

	import diceSVG from "$lib/images/dice.svg";
	import downSVG from "$lib/images/down.svg";
	import infoSVG from "$lib/images/info.svg";

	import ColorPicker from "$lib/components/ColorPicker.svelte";
	import EmergingTextInput from "$lib/components/EmergingTextInput.svelte";

	export let i;

	const { name, color, weight } = currentItems.item(i, 200);

	const advancedOpen = writable(false);

	let nameElement;
	let weightFocused = false;

	onMount(() => {
		// This (usually) means the user just created the item
		// todo; this is triggered on shuffle
		if ($editorOpen) nameElement.focus();
	});

	$: pct = $weight / $totalWeight;
	$: rndPct = Math.round(pct * 10000) / 100;
	$: pctText = $weight && rndPct <= 0 ? '<0.01' : rndPct;
	$: !weightFocused && !$weight && currentItems.delete(i);
</script>

<div class="item">
	<div class="basic" style:--color={$color}>
		<div class="colored-wrapper">
			<ColorPicker value={$color} bindTo={color} />
			<EmergingTextInput
				class="name"
				value={$name}
				bindTo={name}
				bind:element={nameElement}
			/>
		</div>

		<EmergingTextInput
			numerical
			class="weight"
			value={$weight}
			bindTo={weight}
			bind:isFocused={weightFocused}
		/>

		<div class="weight-info">
			<div class="weight-icon">
				<div class="dice" style:--mask={url(diceSVG)} />
				<div class="info" style:--mask={url(infoSVG)} />
			</div>
			<div class="chance">➛ {pctText}%</div>
		</div>
		<div
			class="show-advanced"
			class:open={$advancedOpen}
			style:--mask={url(downSVG)}
			use:click={() => advancedOpen.set(!$advancedOpen)}
		/>
	</div>
	<div class="advanced" class:open={$advancedOpen}>
		<div class="content">

		</div>
	</div>
</div>

<style lang="scss">
	.item {
		display: flex;
		flex-direction: column;
		padding: 12px;
		border-radius: 6px;
		background: #2c2a2a;

		.advanced {
			height: 0;
			position: relative;
			box-sizing: border-box;
			transition: height 400ms ease;

			&.open {
				height: 5em;
			}
		}

		.basic {
			gap: 6px;
			display: flex;
			align-items: center;

			.colored-wrapper {
				gap: 0;
				display: flex;
				flex-grow: 1;
				flex-shrink: 1;
				height: 100%;

				:global(.name) {
					flex-grow: 1;
					flex-shrink: 1;
					width: 0;
					padding: 6px 6px 6px 16px;
					font-size: 18px;
					margin-left: -4px;
					box-sizing: border-box;
					border: 1px solid transparent;
					border-top-left-radius: 0;
					border-bottom-left-radius: 0;
					transition: background-color 300ms ease;

					&:focus {
						border: 1px solid #000;
						border-left: 1px solid transparent;
						background: var(--color) !important;
					}
				}

				:global(.color-picker:has(+ .name:focus) .color) {
					border-right: 1px solid transparent;
					border-top-right-radius: 0;
					border-bottom-right-radius: 0;
				}
			}

			:global(.weight) {
				width: 2em;
				text-align: right;
			}

			.weight-info {
				gap: 6px;
				width: 108px;
				display: flex;
				align-items: center;
				flex-shrink: 0;

				.weight-icon {
					gap: 4px;
					display: flex;
					position: relative;
					flex-direction: column;

					div {
						width: 28px;
						height: 28px;
						background: #fff;
						mask: var(--mask) center/contain no-repeat;
					}

					.info {
						right: -6px;
						bottom: -6px;
						height: 12px;
						position: absolute;
					}
				}
			}

			.show-advanced {
				opacity: 1;
				cursor: pointer;
				width: 25px;
				height: 20px;
				background: #fff;
				transition: opacity 500ms, transform 300ms;
				transform: rotateX(0deg);
				mask: var(--mask) center/contain no-repeat;
				mask-origin: content-box;

				&.open {
					transform: rotateX(180deg);
				}
			}
		}
	}
</style>