<template>
  <div>
    <primary />
  </div>
</template>

<script>
import "../figma/figma-ds/js/selectMenu";
import "../figma/figma-ds/js/iconInput";
import "../figma/figma-ds/js/disclosure";

import Welcome from "./components/Welcome";
import primary from "./components/primary";

export default {
  data() {
    return {};
  },

  components: {
    Welcome,
    primary
  },

  mounted() {
    // Initialize the figma-ds components
    window.selectMenu.init();
    window.iconInput.init();
    window.disclosure.init();
  }
};
</script>

<style lang="scss">
@import "../figma/figma-ds/figma-plugin-ds";
</style>
