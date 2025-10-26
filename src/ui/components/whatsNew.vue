<template>
 <div class="mini-modal-container">
  <div class="mini-modal--backdrop"></div>
  <div class="mini-modal">
   <div class="mini-modal--header">
    <h4>Whats New?</h4>
    <b @click="$parent.whatsNewModalOpen=false"><svg width="30" height="30" viewBox="0 0 30 30" style="width: auto; height: 1.25em;" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 21L21 9M21 21L9 9" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg></b>
   </div>
   <div class="mini-modal--body">
    <div class="brand-group">
     <img src="https://static.basedcdn.com/madebyLTM/src/assets/plugin-icon-v3.png" alt="logo" />
     <h3>SeCo</h3>
     <sup>Copyright &copy; 2025. Ltrademark&trade; All Rights Reserved</sup>
    </div>
    <h4>✨ Changes in v{{currentVer}}</h4>
    <ul>
     <li v-for="change in changelog" :key="change">{{ change }}</li>
    </ul>
    <transition name="fade">
      <div v-if="toastMessage" :style="{'--toast-bg' : importError ? '#c50f0f' : '#119400'}" class="toast-message">{{ toastMessage }}</div>
    </transition>
  </div>
  <div class="mini-modal--advActions">
     <button type="button" class="btn btn--secondary" @click="exportFavouritesAsJson()">
       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16V4M12 4L8 8M12 4L16 8M20 20H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
       Export Favourites
      </button>
      <input hidden type="file" accept="application/json" id="importJson" @change="importFavouritesFromJson" />
      <label class="btn btn--secondary" for="importJson">
       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4V16M12 16L8 12M12 16L16 12M4 20H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
       Import Favourites
    </label>
   </div>
   <div class="mini-modal--footer">
    <a href="https://ltrademark.com" target="_blank">made with ❤ by Ltrademark</a>
    <a class="btn btn-secondary" href="https://github.com/ltrademark/SeCo/issues/new/choose" target="_blank">Report a bug</a>
   </div>
  </div>
 </div>
</template>
<script>
 export default {
  data() {
   return {
    currentVer: this.$parent.version,
    changelog: [
     'Fixed icon loading issues for some users',
     'Updated codebase for better performance',
     'Favourites broke often, so new method implemented to fix that.',
    ],
    toastMessage: '',
    importError: false
   }
  },
  methods: {
    exportFavouritesAsJson() {
      const favourites = this.$parent.favouritedIcons || [];
      const dataStr = JSON.stringify(favourites, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "SeCo--favourites.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    importFavouritesFromJson(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          // Safety check: Only keep icons that exist in the current icon list
          const validIds = new Set(this.$parent.icons.map(icon => icon.icons_id));
          const validFaves = imported.filter(icon => validIds.has(icon.icons_id));
          // Repair: match by title and hex, replace with correct icon from icons array
          const iconsMap = new Map(this.$parent.icons.map(icon => [`${icon.title}|${icon.hex}`, icon]));
          const repairedFaves = imported
            .map(icon => iconsMap.get(`${icon.title}|${icon.hex}`))
            .filter(Boolean);
          this.$parent.favouritedIcons = repairedFaves;
          this.$parent.updateFavourites();
          this.toastMessage = `Favourites Imported Successfully`;
          setTimeout(() => {
            this.toastMessage = '';
            this.$parent.whatsNewModalOpen = false;
          }, 2000);
        } catch (err) {
          this.importError = true;
          this.toastMessage = 'Failed to import favourites: Invalid JSON file';
          setTimeout(() => {
            this.toastMessage = '';
            this.importError = false;
          }, 2500);
        }
      };
      reader.readAsText(file);
    }
  }
 }
</script>
<style lang="scss">
  @use "sass:color";
  @use 'sass:math';
  @use "../sass/parts/config" as *;

 .mini-modal {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 40px 1fr auto 40px;
  width: 100%;
  max-width: 80%;
  margin: auto;
  color: var(--figma-color-text);
  background-color: var(--figma-color-bg);
  border: 1px solid var(--figma-color-border);
  border-radius: calc(var(--border-radius) * 1.3);
  box-shadow: 0px 10px 16px rgba(0, 0, 0, .35), 
              0px 2px 5px rgba(0, 0, 0, .35), 
              inset 0px 1px 0px rgba(255, 255, 255, .08), 
              inset 0px 0px 1px rgba(255, 255, 255, .35), 
              0px 2px 14px rgba(0, 0, 0, .15), 
              0px 0px 0px .5px rgba(0, 0, 0, .2);
  z-index: 6;
  &-container {
   position: fixed;
   display: flex;
   inset: 0;
   z-index: 4;
  }
  &--backdrop {
   position: absolute;
   inset: 0;
   background-color: var(--figma-color-bg);
   opacity: .75;
   z-index: 5;
  }
  
  &--header {
   cursor: default;
   display: flex;
   align-items: center;
   width: 100%;
   padding: 1rem;
   border-bottom: 1px solid var(--figma-color-border);
   user-select: none;
   > h4 {
    margin: 0;
    font-size: 11px;
    font-weight: 700;
    font-family: sans-serif;
   }
   b {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 24px;
    margin-left: auto;
    border-radius: var(--radius-medium);
    &:hover {
     background-color: var(--figma-color-bg-secondary);
    }
   }
  }
  &--body {
   position: relative;
   width: 100%;
   font-size: 10px;
   padding: 1rem;
   overflow-y: auto;
   overflow-x: hidden;
   h4 {
    margin-bottom: 0;
    font-size: 12px;
   }
   ul {
    margin-block-start: 1rem;
    margin-block-end: 1rem;
    padding-inline-start: 2rem;
    li {
     + li {
      margin-top: .5rem;
     }
    }
   }
   .brand-group {
    display: flex;
    flex-flow: column;
    gap: .6rem;
    text-align: center;
    margin-bottom: 1rem;
    background-color: var(--figma-color-bg-secondary);
    border-radius: var(--border-radius, 3px);
    padding: 1rem;
    user-select: none;
    > * {
     margin: 0;
    }
    img {
     display: block;
     width: 70px;
     height: auto;
     margin: auto;
    }
   }
  }
  &--advActions {
    display: flex;
    gap: $gap + 0px;
    justify-content: center;
    flex-wrap: wrap;
    padding: 1rem;
    border-top: 1px solid var(--figma-color-border);
    .btn {
      width: 100%;
      min-width: unset;
      gap: calc($gap/2)+0px;
      white-space: nowrap;
      flex: 1 1 40%;
    }
    [hidden] {
      display: none;
    }
  }
  &--footer {
   display: flex;
   align-items: center;
   width: 100%;
   padding: 1rem;
   border-top: 1px solid var(--figma-color-border);
   user-select: none;
   a {
    font-size: 10px;
    color: var(--figma-color-text);
    font-weight: normal;
    min-width: unset;
    &:hover {
     border: none;
    }
    + a {
     color: var(--accent);
     margin-left: auto;
    }
   }
  }
 }
 .toast-message {
   position: fixed;
   left: 50%;
   top: 50%;
   transform: translate(-50%, -50%);
   @include buttonDefault();
   text-align: center;
   background-color: var(--toast-bg);
   color: #fff;
   box-shadow: 0 2px 8px rgba(0,0,0,0.18);
   font-size: 12px;
   z-index: 9999;
   pointer-events: none;
   transition: opacity 0.3s;
 }
 .fade-enter-active, .fade-leave-active {
   transition: opacity 0.3s;
 }
 .fade-enter, .fade-leave-to {
   opacity: 0;
 }
</style>