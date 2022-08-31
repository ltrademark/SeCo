<template>
  <primary></primary>
</template>

<script>
import "../figma/figma-ds/js/selectMenu";
import "../figma/figma-ds/js/iconInput";
import "../figma/figma-ds/js/disclosure";

import primary from "./components/primary";

export default {
  data() {
    return {};
  },

  components: {
    primary
  },

  mounted() {
    window.selectMenu.init();
    window.iconInput.init();
    window.disclosure.init();
  }
};
</script>

<style lang="scss">
@import "../figma/figma-ds/figma-plugin-ds";
</style>
