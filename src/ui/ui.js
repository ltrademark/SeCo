import Vue from "vue";
import App from "./App.vue";
import store from "./store";

window.onload = () => {
  new Vue({
    el: "#plugin",
    store,
    render: h => h(App)
  });
};
