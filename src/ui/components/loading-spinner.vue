<template>
	<div class="loader">
		<div class="anim-cont">
			<div class="dot" style="--delay: 50ms"></div>
      <div class="dot" style="--delay: 200ms"></div>
      <div class="dot" style="--delay: 300ms"></div>
      <div class="dot" style="--delay: 400ms"></div>
      <div class="dot" style="--delay: 500ms"></div>
      <div class="dot" style="--delay: 600ms"></div>
		</div>
	</div>
</template>
<script>
export default {
	props: {
		loading: {
			type: Boolean,
			required: false,
			default: false
		}
	}
};
</script>
<style lang="scss" scoped>
.loader {
	--total-size: 100px;
	--dot-size: calc(var(--total-size) / 8);
	--timing: 4500ms;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: var(--dot-size);
	scale: .5;
	.anim-cont {
		display: flex;
		position: relative;
		width: var(--total-size);
		height: var(--total-size);
		color: var(--figma-color-text);

		.dot {
			position: absolute;
			display: block;
			width: var(--dot-size);
			height: var(--dot-size);
			border-radius: var(--dot-size);
			background-color: currentColor;
			offset-path: path("M1 101H51C67.6667 101 101 91 101 51C101 11 67.6667 1 51 1C34.3333 1 1 11 1 51C1 91 34.3333 100.333 51 100C67.3333 100.167 100 90.6 100 51C100 11.4 67.3333 1.5 51 1.5C34.6667 1.66667 2 11.8 2 51C2 90.2 34.6667 99.3333 51 99C67 99.1667 99 89.8 99 51C99 12.2 67 2.5 51 2.5C35 2.66667 3 12.6 3 51C3 99 45 101 101 101");
			animation: move var(--timing) infinite ease-in-out,
								 color var(--timing) infinite ease-in-out;
			animation-delay: var(--delay);
			opacity: 0;
		}
	}
}
	
@keyframes move {
  0% {
    offset-distance: 0%;
    opacity: 0;
				z-index: 0;
  }
  20%,50% {
    opacity:1;
			z-index: 1;
  }
  70%, 100% {
    offset-distance: 100%;
    opacity: 0;
			z-index: 2;
  }
}
	
@keyframes spin {
	from {
		rotate: 0deg;
	}
	to {
		rotate: 360deg;
	}
}
@keyframes color {
	0% {
		color: currentColor;
	}
	100% {
		color: var(--accent, #1155ee);
	}
}
</style>
