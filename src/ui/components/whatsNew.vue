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
     <sup>Copyright &copy; 2024. Ltrademark&trade; All Rights Reserved</sup>
    </div>
    <h4>✨ Changes in v{{currentVer}}</h4>
    <ul>
     <li v-for="change in changelog" :key="change">{{ change }}</li>
    </ul>
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
     'Updated CDN version to master branch (instead of staggered versions)',
     'Updating any older references to my website. (non-functional update)',
    ]
   }
  }
 }
</script>
<style lang="scss">
 @import '../sass/parts/config.scss';
 
 .mini-modal {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 40px 1fr 40px;
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
</style>