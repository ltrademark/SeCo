<template>
  <div id="simple">
    <div class="icon-search">
      <!-- <i class="icon icon--search"></i> -->
      <search-icon class="icon"></search-icon>
      <div class="icon-search--container input">
        <label for="#isearch" style="display: none;"></label>
        <input type="text" 
               id="isearch"
               class="input__field"
               placeholder="What Brand Are You Looking For?"
               v-model="isearch"
               @blur="confirmSearch"/>
        <b @click="clearQuery" v-if="isearch !== ''"><close-icon class="icon"></close-icon></b>
      </div>
      <button class="btn btn-square show-on-mobile"
              type="button"
              @click="showFavourites = !showFavourites"
              :title="showFavourites ? 'Hide Favourites' : 'Show Favourites'">
              <!-- <i class="icon" :class="showFavourites ? 'icon--star-on icon--blue' : 'icon--star-off'"></i> -->
              <star-icon :filled="showFavourites" />
      </button>
    </div>
    <div class="icon-actions">
      <div class="icon-actions__sort">
        Sort
        <div class="icon-actions__select">
          <b @click="sortOpen=!sortOpen">
            {{ filterByColour ? 'By Colour' : 'Alphabetically' }} <caret-icon class="icon"></caret-icon><!-- <span class="select-menu__icon"></span> -->
          </b>
          <ul class="select-options" :class="sortOpen ? 'opened' : ''">
            <li v-if="filterByColour" @click.stop="sortByName">Alphabetically</li>
            <li v-if="!filterByColour" @click.stop="sortByColour">By Colour</li>
          </ul>
        </div>
      </div>
      <div class="icon-actions__view">
        View As
        <div class="icon-actions__select">
          <b @click="viewOpen=!viewOpen">
            {{ viewAsList ? 'List' : 'Grid' }} <caret-icon class="icon"></caret-icon>
          </b>
          <ul class="select-options" :class="viewOpen ? 'opened' : ''">
            <li v-if="viewAsList" @click.stop="toggleViewDropdown(1)">Grid</li>
            <li v-if="!viewAsList" @click.stop="toggleViewDropdown(2)">List</li>
          </ul>
        </div>
      </div>
      <div class="icon-actions__ver" @click="toggleWhatsNew()">
        v{{version}}
        <question-icon class="icon"></question-icon>
      </div>
    </div>
    <div class="loader" v-if="!loaded">
      <img
        src="https://cdn.glitch.com/94a91acb-521d-41e5-be37-e8843474659f%2Floading.9f5a9a60.gif"
        alt="loading icon"
      />
    </div>
    <transition name="fade" mode="out-in">
      <div class="grid-wrap favourites-grid" v-if="showFavourites">
        <p v-if="favouritedIcons.length < 1">Add some icons to your Favourites</p>
        <div class="icon-grid">
          <div class="icon-grid--item"
            :class="{selected: (filterByColour ? idx : icon.icons_index) === selectedIcon}"
            v-for="(icon, idx) in favouritedIcons"
            :style="'background-color: #' + icon.hex"
            :key="icon.icons_index + '-fav'"
            :data-iconindex="icon.icons_index + '-fav'"
            @click="selectIcon(icon.title, icon.icons_index)">
            <span :style="$options.filters.contrast(icon.hex) === 'color: #ffffff' ? 'filter: invert(1)' : ''">
              <img :src="icon.title | svgname" :alt="icon.title" />
            </span>
            <h3 :style="icon.hex | contrast">{{ icon.title }}</h3>
            <p :style="icon.hex | contrast">#{{ icon.hex }}</p>
          </div>
        </div>
      </div>
    </transition>
    <div class="grid-wrap" v-show="loaded">
      <div class="icon-grid" :class="{'list-view' : viewAsList}">
        <div class="icon-grid--item"
          :class="{selected: (filterByColour ? idx : icon.icons_index) === selectedIcon}"
          v-for="(icon, idx) in filteredIcons.slice(0, itemsLoaded)"
          :title="icon.title"
          :style="'background-color: #' + icon.hex"
          :key="icon.icons_index"
          :data-iconindex="icon.icons_index"
          @click="filterByColour ? selectIcon(icon.title, idx) : selectIcon(icon.title, icon.icons_index)">
          <span :style="$options.filters.contrast(icon.hex) === 'color: #ffffff' ? 'filter: invert(1)' : ''">
            <img :src="icon.title | svgname" :alt="icon.title" />
          </span>
          <h3 :style="icon.hex | contrast">{{ icon.title }}</h3>
          <p :style="icon.hex | contrast">#{{ icon.hex }}</p>
          <i class="favourite-badge icon icon--star-on" 
             :class="$options.filters.contrast(icon.hex) === 'color: #ffffff' ? 'icon--white' : ''"
             v-if="favouritedIcons.some((obj) => obj.title === icon.title)"></i>
        </div>
        <transition name="fade">
          <div class="icon-grid--item load-more btn btn--secondary"
              @click="loadMore"
              v-if="itemsLoaded < icons.length && isearch === ''">
            Load {{ specialTrigger ? 'Everything' : `${itemsLoaded} More` }}
          </div>
        </transition>
      </div>
    </div>
    <transition name="popup" mode="in-out">
      <selection-banner
        :llave="handleIcons(selectedIcon).title"
        :selected="selectedIcon"
        v-if="selectedIcon !== null"
        :identity="handleIcons(selectedIcon)"
        :color-target="handleIcons(selectedIcon).hex"
        :rgb-target="handleIcons(selectedIcon).rgb"
        :icon-target="handleIcons(selectedIcon).title | svgname"
        :icon-name="handleIcons(selectedIcon).title | svgname | sanitizeURL"
      >
      </selection-banner>
    </transition>
    <transition name="zoomin">
      <whats-new v-if="whatsNewModalOpen"></whats-new>
    </transition>
  </div>
</template>

<script>
import whatsNew from './whatsNew';

const SimpleIconsSource = 'https://cdn.jsdelivr.net/npm/simple-icons@7.9.0';

export default {
  data() {
    return {
      version: '4.0',
      loaded: false,
      icons: [],
      favouritedIcons: [],
      selectedIcon: null,
      itemsLoaded: 15,
      isearch: '',
      viewAsList: false,
      viewAsGrid: true,
      specialTrigger: false,
      filterByColour: false,
      sortOpen: false,
      viewOpen: false,
      showFavourites: false,
      showMobileSorts: false,
      whatsNewModalOpen: false,
      darkMode: false,
      SimpleIconsSource: 'https://cdn.jsdelivr.net/npm/simple-icons@7.9.0'
    };
  },
  filters: {
    contrast(hex) {
      let threshold = 130;
      let contrastcolor;

      function hexToR(h) {
        return parseInt(cutHex(h).substring(0, 2), 16);
      }
      function hexToG(h) {
        return parseInt(cutHex(h).substring(2, 4), 16);
      }
      function hexToB(h) {
        return parseInt(cutHex(h).substring(4, 6), 16);
      }
      function cutHex(h) {
        return h.charAt(0) == '#' ? h.substring(1, 7) : h;
      }

      let hRed = hexToR(hex);
      let hGreen = hexToG(hex);
      let hBlue = hexToB(hex);

      let cBrightness = (hRed * 299 + hGreen * 587 + hBlue * 114) / 1000;

      if (cBrightness > threshold) {
        contrastcolor = '#000000';
      } else {
        contrastcolor = '#ffffff';
      }

      return 'color: ' + contrastcolor.toString();
    },
    svgname(icon) {
      let url = SimpleIconsSource + '/icons/';
      let label = icon;
      
      switch(true) {
        case icon.indexOf(' ') > -1:
          label = label.toLowerCase().replaceAll(/\s/g, ''); // has space
        case icon.indexOf('’') > -1:
          label = label.toLowerCase().replaceAll(/\’/g, ''); // has Smartquote
        case icon.includes("'"):
          label = label.toLowerCase().replaceAll(/\'/g, ''); // has normal quote
        case icon.includes('&'):
          label = label.toLowerCase().replaceAll('&', 'and'); // has ampersand
        case icon.includes('-'):
          label = label.toLowerCase().replaceAll('-', ''); // has hyphen
        case icon.includes('_'):
          label = label.toLowerCase().replaceAll('_', ''); // has underscore
        case icon.includes(':'):
          label = label.toLowerCase().replaceAll(/\:/g, ''); // has colon
        case icon.includes('+'):
          label = label.toLowerCase().replaceAll(/[+]/g, 'plus'); // has plus
        case icon.includes('!'):
          label = label.toLowerCase().replaceAll(/\!/g, ''); // has exclamation mark
        case icon.includes('/'):
          label = label.toLowerCase().replaceAll(/\//g, ''); // has forward slash
        case icon.includes('°'):
          label = label.toLowerCase().replaceAll('°', ''); // has temperature symbol
        case icon.includes('.1'):
          label = label.toLowerCase().replaceAll('.1', '1'); // VERY specific edgecase that has dot with 1
        case label.includes('.'):
          if((label.match(/[.]/g) !== null ? label.match(/[.]/g) : []).length > 1) {
            label = label.toLowerCase().replace(/\./g, ''); // has multiple periods
          } else if(label.endsWith('.')) {
            label = label.toLowerCase().replace('.', ''); // has period at the end
          } else {
            label = label.toLowerCase().replace(/\./g, 'dot'); // has period anywhere
          }
        default:
          label = label.toLowerCase();
      }
      let cleanLabel = label.normalize('NFD').replace(/\p{Diacritic}/gu, "");
      return url + cleanLabel + '.svg';
    },
    sanitizeURL(url) {
      return url.slice(url.lastIndexOf('/') + 1, url.length);
    },
  },
  computed: {
    filteredIcons() {
      let searchTerm = this.isearch;

      return this.icons.filter((icon) => {
        let parts = searchTerm.trim().split(' ');

        for (let part of parts) {
          let searchRegex = new RegExp(part, 'i');

          if (!(searchRegex.test(icon.title) || searchRegex.test(icon.hex))) {
            return false;
          }
        }

        return true;
      });
    },
    favoriteIcons() {
      return this.icons.filter((icon) => {
        if(this.selectedIcon === null) {
          return false;
        } else {
          if(!icon.fav) {
            return false;
          }
          return true;
        }
      });
    },
    loadButtonStyle() {
      let style = '';
      let loadHeight = 30,
          gap = 10,
          padding = loadHeight + gap;

      return 'padding-bottom: ' + padding + 'px';
    }
  },
  methods: {
    getSimple() {
      this.$http.get(this.SimpleIconsSource + '/_data/simple-icons.json').then((res) => {
        this.icons = res.data.icons;
        // Assigns an initial index and hue to the recieved array for more accurate sorting and searching
        for (let i = 0; i < this.icons.length; i++) {
          this.icons[i].icons_index = i;
          this.icons[i].hsl = this.getHSL(this.icons[i].hex);
          this.icons[i].rgb = this.getRGB(this.icons[i].hex);
        }
        this.loaded = true;
      }, (error) => {
        console.log(error);
      });
    },
    sortByColour() {
      // Trying to sort my icon array by colour, by converting the hex value,
      // apllying the HSL value from the hex and then splitting those values
      // to make a "descending" order of colour. The issue is that the
      // numbers being generated by ".sort()"
      this.icons.sort((a, b) => {
        let aHSL = a.hsl.split(','),
          bHSL = b.hsl.split(',');

        return (
          parseInt(aHSL[0] - bHSL[0]) -
          (aHSL[1] - bHSL[1]) -
          (aHSL[2] - bHSL[2])
        );
      });
      this.filterByColour = true;
      this.selectedIcon = null;
      this.sortOpen = false;
    },
    sortByName() {
      this.icons.sort((a, b) => {
        return a.icons_index - b.icons_index;
      });
      this.filterByColour = false;
      this.selectedIcon = null;
      this.sortOpen = false;
    },
    selectIcon(name, idx) {
      let iconIsSame = this.selectedIcon === idx;
      let noIcon = this.selectedIcon === null;
      let parsedName = encodeURIComponent(name.trim().toLowerCase());

      if (iconIsSame && !noIcon) {
        this.selectedIcon = null;
      } else {
        this.selectedIcon = null;
        setTimeout(() => {
          this.selectedIcon = this.selectedIcon === idx ? null : idx;
        }, 100);
      }
    },
    loadMore() {
      let loadInt = Math.floor(document.getElementsByClassName('icon-grid')[0].clientWidth / document.getElementsByClassName('icon-grid--item')[0].clientWidth) * 2;

      if (this.specialTrigger) {
        this.itemsLoaded = this.icons.length;
      } else {
        if (this.itemsLoaded < this.icons.length)
          this.itemsLoaded = loadInt + this.itemsLoaded;
      }
      return;
    },
    confirmSearch() {
      let url = window.location.href,
        typedSomething = this.isearch !== '',
        searchQueryExists = window.location.search !== '',
        query = window.location.href.substring(
          window.location.href.indexOf('=') + 1
        );
      return;
    },
    getHSL(hex) {
      let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex),
        r = parseInt(result[1], 16),
        g = parseInt(result[2], 16),
        b = parseInt(result[3], 16);

      (r /= 255), (g /= 255), (b /= 255);

      let max = Math.max(r, g, b),
        min = Math.min(r, g, b);
      let h,
        s,
        l = (max + min) / 2;

      if (max == min) {
        h = s = 0; // achromatic
      } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      s = s * 100;
      s = Math.round(s);
      l = l * 100;
      l = Math.round(l);
      h = Math.round(360 * h);

      return h + ',' + s + ',' + l;
    },
    getRGB(hex) {
      let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },
    enableDarkMode() {
      this.darkMode = !this.darkMode;
      this.meta_theme();
    },
    clearQuery() {
      this.isearch = '';
      this.selectedIcon = null;
    },
    favToggle() {
      this.showFavourites = !this.showFavourites;
    },
    toggleViewDropdown(tar) {
      switch(tar) {
        case 1:
          this.viewAsList = false
          break;
        case 2:
          this.viewAsList = true
          break;
        default:
          break;
      }
      this.viewOpen = false
    },
    toggleWhatsNew(){
      this.whatsNewModalOpen=!this.whatsNewModalOpen;
    },
    handleIcons(idx) {
      let arr = this.icons || this.favouritedIcons;
      return arr[idx];
    },
    updateFavourites() {
      let favourites = this.favouritedIcons;
      if ((this.favouritedIcons.length > 0) && this.loaded) {
        parent.postMessage(
          { pluginMessage: { type: "update-faves", favourites } },
          "*"
        );
      } else if((this.favouritedIcons.length === 0) && this.loaded) {
        favourites = [];
        parent.postMessage(
          { pluginMessage: { type: "update-faves", favourites } },
          "*"
        );
      } else {
        parent.postMessage(
          { pluginMessage: { type: "get-faves" } },
          "*"
        );
      }
    },
    extraCharCheck(name) {
      let hasSpace = name.indexOf(' ') > -1,
          hasSmartquote = name.indexOf('’') > -1,
          hasNormalquote = name.includes("'"),
          hasAmp = name.includes('&'),
          hasHyphen = name.includes('-'),
          hasColon = name.includes(':'),
          hasPlus = name.includes('+'),
          hasExcl = name.includes('!'),
          hasFSlash = name.includes('/'),
          hasPeriod = name.includes('.');
          let labelIsDirty = hasSpace || hasSmartquote || hasNormalquote || hasAmp || hasHyphen || hasColon || hasPlus || hasExcl || hasFSlash || hasPeriod;
      return labelIsDirty;
    }
  },
  mounted() {
    // initiated the document
    onmessage = (event) => {
      let data = event.data.pluginMessage;
      if (data) {
        this.favouritedIcons = data;
      } else {
        this.updateFavourites();
      }
    }

    this.getSimple();

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Shift') {
        this.specialTrigger = true;
      }
    });
    window.addEventListener('keyup', (event) => {
      this.specialTrigger = false;
    });
  },
  components: {
    'selection-banner': {
      props: ['llave', 'selected', 'colorTarget', 'rgbTarget', 'iconTarget', 'iconName', 'identity'],
      template: `
          <div class="notification-toast selection">
            <div class="bubble">
              <div class="bubble-actions">
                <button class="btn btn--secondary" type="button" @click="placeColor(rgbTarget)"><copy-icon /> Use Colour</button>
                <button class="btn btn--secondary" type="button" @click="favouriteToggle()"><star-icon :filled="faved" /> {{faved ? 'Favourited':'Favourite'}}</button>
                <button type="button" @click="placeIcon()" class="btn btn--primary"><download-icon /> Place Icon</button>
              </div>
            </div>
          </div>
        `,
      data() {
        return {
          svgData: '',
          faved: false
        };
      },
      mounted() {
        this.faved = this.$parent.favouritedIcons.some((e) => e.icons_index === this.identity.icons_index);
        this.getRawSVG(this.iconTarget);
      },
      computed: {
        rawSVG() {
          this.$http.get(this.iconTarget).then((s) => {
            return s.data;
          });
        },
      },
      methods: {
        placeColor(str) {
          let color = str;
          
          parent.postMessage(
            { pluginMessage: { type: "create-color", color } },
            "*"
          );
        },
        placeIcon() {
          let rawsvg = this.svgData;
          let title = this.llave;
          parent.postMessage(
            { pluginMessage: { type: "create-icon", rawsvg, title } },
            "*"
          );
        },
        getRawSVG: async function(url) {
          this.$http.get(url).then((s) => {
            this.svgData = s.data;
          });
        },
        favouriteToggle() {
          if (this.faved) {
            this.faved = false;
            this.$parent.favouritedIcons.splice(this.$parent.favouritedIcons.findIndex(e => e.icons_index === this.identity.icons_index),1);
            this.$parent.updateFavourites();
          } else {
            this.faved = true;
            this.$parent.favouritedIcons.push(this.identity)
            this.$parent.updateFavourites();
          }
        }
      },
      components: {
        'copy-icon': {
          template: `
              <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            `,
        },
        'download-icon': {
          template: `
              <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"/></svg>
            `,
        },
        'checkmark-icon': {
          template: `
              <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            `,
        },
        'star-icon' : {
          props: ['filled'],
          template: `
              <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 24 24" :fill="filled ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          `
        }
      },
    },
    'star-icon': {
      props: ['filled'],
      template: `
              <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 24 24" :fill="filled ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          `
    },
    'close-icon': {
      template: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 21L21 9M21 21L9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    },
    'caret-icon': {
      template: `<svg fill="none" height="30" viewBox="0 0 30 30" width="30" xmlns="http://www.w3.org/2000/svg"><path d="M6 10L15.5 20L25 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    },
    'search-icon': {
      template: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none" ><path fill-rule="evenodd" clip-rule="evenodd" d="M19.243 20.987C17.3211 22.5284 14.881 23.4502 12.2254 23.4502C6.02587 23.4502 1 18.4247 1 12.2251C1 6.02574 6.02587 1 12.2254 1C18.4252 1 23.4508 6.02574 23.4508 12.2251C23.4508 14.8809 22.5287 17.3211 20.9871 19.2432L29 27.2562L27.2562 29L19.243 20.987ZM20.9846 12.2251C20.9846 17.0627 17.0631 20.9841 12.2254 20.9841C7.38795 20.9841 3.4662 17.0627 3.4662 12.2251C3.4662 7.38778 7.38795 3.46613 12.2254 3.46613C17.0631 3.46613 20.9846 7.38778 20.9846 12.2251Z" fill="currentColor" /></svg>`,
    },
    'question-icon': {
      template: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15 2C7.8203 2 2 7.8203 2 15C2 22.1797 7.8203 28 15 28C22.1797 28 28 22.1797 28 15C28 7.8203 22.1797 2 15 2ZM10.4975 12C9.90643 12 9.40657 11.5233 9.49197 10.9385C9.54874 10.5497 9.64575 10.1858 9.78403 9.76881C10.0537 9.00638 10.433 8.34792 10.9218 7.79343C11.4106 7.22161 12.009 6.77975 12.7169 6.46785C13.4249 6.15595 14.2171 6 15.0936 6C15.8858 6 16.6022 6.12129 17.2427 6.36388C17.9001 6.58915 18.4648 6.92704 18.9367 7.37756C19.4087 7.81076 19.7711 8.34792 20.0239 8.98905C20.2936 9.63019 20.4285 10.3666 20.4285 11.1984C20.4285 11.7355 20.3611 12.2207 20.2262 12.6539C20.1082 13.0698 19.9481 13.451 19.7458 13.7975C19.5436 14.1441 19.3076 14.4647 19.0379 14.7592C18.785 15.0538 18.5238 15.3397 18.2541 15.617C17.9844 15.8769 17.7147 16.1455 17.445 16.4227C17.1922 16.6826 16.9562 16.9685 16.7371 17.2804C16.669 17.3796 16.5908 17.4733 16.512 17.5678C16.3567 17.754 16.1986 17.9435 16.1091 18.1849C15.9948 18.4935 15.9952 18.5409 15.998 18.8228C15.9985 18.8734 15.9991 18.9315 15.9991 19V19.0173C15.9991 19.5676 15.553 20.0137 15.0028 20.0137C14.4525 20.0137 14.0064 19.5676 14.0064 19.0173V18.7921C14.0401 18.0643 14.0654 17.9129 14.2845 17.4104C14.5205 16.8906 14.7986 16.4314 15.1189 16.0328C15.456 15.6343 15.8016 15.2704 16.1555 14.9412C16.5264 14.5946 16.8635 14.2394 17.1669 13.8755C17.4871 13.4943 17.74 13.0784 17.9254 12.6279C18.1108 12.1774 18.1867 11.6316 18.1529 10.9904C18.0855 10.0374 17.7821 9.29229 17.2427 8.75513C16.7202 8.21797 16.0038 7.94938 15.0936 7.94938C14.4868 7.94938 13.9643 8.06202 13.526 8.28728C13.0878 8.51254 12.7169 8.81578 12.4135 9.19699C12.127 9.5782 11.9163 10.0287 11.7814 10.5486C11.7464 10.6838 11.7161 10.8058 11.6904 10.923C11.5624 11.5083 11.0966 12 10.4975 12ZM14.9995 24.0154C15.5518 24.0154 15.9995 23.5676 15.9995 23.0154C15.9995 22.4631 15.5518 22.0154 14.9995 22.0154C14.4472 22.0154 13.9995 22.4631 13.9995 23.0154C13.9995 23.5676 14.4472 24.0154 14.9995 24.0154Z" fill="currentColor"/></svg>`,
    },
    whatsNew
  },
};
</script>

<style lang="scss">
@import '../sass/parts/config.scss';

:root {
  --theme: 'light';
  --accent: var(--figma-color-bg-brand);
  --accent-hover: var(--figma-color-bg-brand-hover);
  --accent-active: var(--figma-color-bg-brand-pressed);
  --br: 3px;
  font-size: 8px;
}

* {
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  font-family: $fontfam;
  background-color: var(--figma-color-bg);
  color: var(--figma-color-text);
	font-size: font(22px, 16px, 786px, 320px);
  margin: 0;
}

a {
  text-decoration: none;
  color: var(--accent);
  font-weight: 700;
  &:hover,
  &:focus {
    border-bottom: $border-width + 0px dashed #ccc;
  }
  &:visited {
    font-style: italic;
    border-bottom: $border-width + 0px dashed  var(--accent);
  }
}

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 3.5em;
  font-weight: 700;
  padding: $gap + 0px;
  width: 100%;
  text-align: center;
}
.button--primary:enabled:active {
  border: none !important;
}
svg.icon {
  color: var(--figma-color-text);
  width: auto;
  height: 1em;
}
.btn {
  --btn-fg: var(--figma-color-text);
  --btn-bg: var(--figma-color-bg);

  position: relative;
  @include buttonDefault();
  color: var(--btn-fg);
  background-color: var(--btn-bg);
  z-index: 1;
  &:focus,
  &:hover {
    --btn-bg: var(--figma-color-bg-secondary);
    outline: none;
  }
  &--primary {
    --btn-fg: #fff;
    --btn-bg: var(--accent);
    &:focus,
    &:hover {
      --btn-bg: var(--accent-hover);
    }
  }
  &--secondary {
    border: 1px solid currentColor !important;
    &:focus,
    &:hover {
      --btn-bg: var(--figma-color-bg-secondary);
      border-color: var(--figma-color-bg-tertiary);
    }
  }
  &--default {
    color: inherit;
    user-select: none;
    border: 1px solid var(--figma-color-border);
    &:focus,
    &:hover {
      --btn-bg: var(--accent-hover);
    }
  }
  &-square {
    padding: 0;
    text-align: center;
    min-width: $searchbar + 0px;
    min-height: $searchbar + 0px;
  }
  svg,
  img {
    display: inline-block;
    vertical-align: middle;
    width: auto;
    height: 1em;
  }
}

.show-on-mobile {
  // display: none;
  position: absolute;
  top: -100px;
  right: -100px;
  visibility: hidden;
  opacity: 0;
  @include respond-to('mobile') {
    position: relative;
    top: 0;
    right: 0;
    display: block;
    visibility: visible;
    opacity: 1;
  }
}
.hide-on-mobile {
  @include respond-to('mobile') {
    // display: none;
    visibility: hidden;
    opacity: 0;
  }
  display: block;
  visibility: visible;
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: $far $curve all;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.popup-enter-active,
.popup-leave-active {
  transition: $near $snap all;
}
.popup-enter,
.popup-leave-to {
  opacity: 0;
  transform: translatey(100%);
}

.zoomin-enter-active,
.zoomin-leave-active {
  transition: $far $curve all;
}
.zoomin-enter,
.zoomin-leave-to {
  opacity: 0;
  transform: scale(1.15);
}

#simple {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  .si-credits {
    width: 100%;
    font-size: 0.8em;
    text-align: center;
  }
}
.icon-search {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 5px 10px;
  color: var(--figma-color-text);
  background-color: var(--figma-color-bg);
  border-bottom: 1px solid var(--figma-color-border);
  z-index: 2;
  > svg {
    height: 18px;
    margin-left: 2px;
  }
  .input {
    padding: 0 4px 0 7px;
    border: none !important;
    margin: 0;
    color: var(--figma-color-text);
    background-color: var(--figma-color-bg);
    &:hover {
      color: inherit;
    }
    &:focus,
    &:active {
      color: var(--figma-color-text);
      padding: 0 4px 0 7px;
      padding-top: 0;
      padding-bottom: 0;
    }
  }

  button {
    background: none;
    color: inherit;
    font-size: 18px;
    z-index: 1;
    border-radius: var(--br, 3px);
    &:hover {
     background-color: var(--figma-color-bg-secondary);
    }
    &.active {
      box-shadow:0 0 0 $border-width + 0px $accent;
      color: setcolor($selectedTheme, fg);
      background-color: darken(setcolor($selectedTheme, bg), 10%);
    }
    // @include respond-to('mobile') {
    //   &.hide-on-mobile {
    //     $newGap: $gap/2;
    //     position: absolute;
    //     right: 0px;
    //     background-color: setcolor($selectedTheme, bg);
    //     transition: $near $snap opacity;

    //     &:nth-of-type(1) {
    //       top: ($searchbar + $newGap)+0px;
    //       transform: translateY(-($searchbar + $newGap)+0px);
    //     }
    //     &:nth-of-type(2) {
    //       top: (($searchbar * 2) + ($newGap * 2))+0px;
    //       transform: translateY(-(($searchbar * 2) + ($newGap * 2))+0px);
    //     }
    //   }
    //   &.open {
    //     display: block;
    //     visibility: visible;
    //     opacity: 1;
    //     transition: $near $snap all;
    //     &:nth-of-type(1),
    //     &:nth-of-type(2) {
    //       transform: translateY(0);
    //       margin-top: ($gap/2)+0px;
    //     }
    //   }
    // }
    i {
      display: block;
      width: $searchbar + 0px;
      height: $searchbar + 0px;
      color: currentColor;
    }
  }
  &--container {
    position: relative;
    width: 100%;
    height: $searchbar + 0px;
    font-family: $fontfam;
    font-weight: 900;

    input {
      position: relative;
      width: 100%;
      height: 100%;
      font-family: inherit;
      font-weight: 400;
      border: 1px solid rgba(#eee, 0);
      color: currentColor;
      background: none;
      border-radius: var(--br, 3px);
      padding: 0;
      z-index: 1;
      &:focus {
        outline: none;
      }
    }
    .icon {
      width: 30px;
      height: 30px;
    }

    i {
      cursor: pointer;

      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      width: $searchbar + 0px;
      height: $searchbar + 0px;
      color: currentColor;
      opacity: 0.54;
      user-select: none;
      z-index: 1;
      &:hover {
        opacity: 1;
      }
    }
  }

  .id-text {
    position: absolute;
    left: 0;
    bottom: 5px;
    padding-left: ($searchbar + ($gap * 2))+0px;
    display: block;
    text-align: right;
    margin: 0;
    z-index: 1;
    opacity: 0.54;
  }
}
.icon-actions {
  position: relative;
  display: flex;
  width: 100%;
  padding: 0px $gap + 0px;
  font-size: 12px;
  color: var(--figma-color-text);
  background-color: var(--figma-color-bg);
  border-bottom: 1px solid var(--figma-color-border);
  min-height: 40px;
  z-index: 2;

  &__view,
  &__sort {
    display: flex;
    align-items: center;
    font-size: inherit;
    padding-right: #{$gap}px;
    margin-right: #{$gap}px;
    border-right: 1px solid var(--figma-color-border);
    .select-menu__button {
      font-size: inherit;
      margin-left: .5rem;
      color: var(--accent);
    }
  }
  &__select {
    cursor: default;
    user-select: none;
    position: relative;
    display: flex;
    align-items: center;
    padding-left: .5rem;

    b {
      display: flex;
      align-items: center;  
      color: var(--accent);
      padding: ($gap/2) + 0px ($gap/3) + 0px;
      font-weight: normal;
      border-radius: var(--br, 3px);
      &:hover {
        background-color: var(--figma-color-bg-secondary);
      }
      svg {
        position: relative;
        opacity: 1;
        display: inline-block;
        color: currentColor;
      }
    }
    .select-options {
      position: absolute;
      top: 100%;
      left: 5px;
      margin: 0;
      padding:0;
      list-style-type: none;
      border: 1px solid var(--figma-color-border);
      background-color: var(--figma-color-bg);
      border-radius: var(--br, 3px);
      margin-top: ($gap/3)+0px;
      overflow: hidden;
      transform: translateY(-100%);
      visibility: hidden;
      opacity: 0;
      transition: $near $curve all;
      &.opened {
        transform: translateY(0%);
        opacity: 1;
        visibility: visible;
      }
      li {
        padding: ($gap/2) + 0px $gap + 0px;
        &:hover {
          background-color: var(--figma-color-bg-secondary);
        }
      }
    }
  }
  &__ver {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left:auto;
    font-size: 10px;
    align-self: center;
    .icon {
      font-size: 14px;
    }
  }
}

.grid-wrap {
  position: relative;
  padding: $gap + 0px;
  scroll-behavior: smooth;
  scrollbar-gutter: stable;
  &:not(.favourites-grid) {
    overflow-x: hidden;
    overflow-y: auto;
    @include custom-scrollbar();
  }
  &.favourites-grid {
    display: flex;
    min-height: 70px;
    background-color: var(--figma-color-bg-tertiary);
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-gutter: revert;
    @include custom-scrollbar($d: 'v', $s: 0);

    &:before{
      content: '';
      position: sticky;
      top: 0;
      bottom: 0;
      display: block;
      width: $gap + 0px;
      flex-shrink: 0;
      z-index: 2;
    }
    &:before {
      left: -#{$gap}px;
      margin-left: -#{$gap}px;
      background-image: linear-gradient(to right, var(--figma-color-bg-tertiary), rgba(#000,0));
    }
    
    .icon-grid {
      --grid-min-width: 50px;
      grid-template-columns: repeat(auto-fill, var(--grid-min-width));
      grid-template-rows: var(--grid-min-width);
      grid-auto-flow: column;
      &--item {
        scroll-snap-align: start;
        border-radius: 1e3px;
        padding: 0;
        h3, p {
          display: none;
        }
      }
      &:after {
        content:'';
        width: 1px;
      }
    }
    > p {
      font-size: 12px;
      text-align: center;
      padding: 0px;
      margin: auto;
      font-weight: 600;
      + .icon-grid {
        display: none;
      }
    }
  }
}

.icon-grid {
  --grid-min-width: 90px;

  position: relative;
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(var(--grid-min-width), 1fr));
  grid-auto-rows: min-content;
  gap: $gap + 0px;
  grid-auto-flow: dense;

  &--item {
    cursor: pointer;
    &:not(.btn) {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: var(--grid-min-width);
      padding: 1rem;
      border-radius: var(--br, 3px);
      text-align: center;
      overflow: hidden;
      outline-offset: ($gap/2 - ($border-width/2))+0px;
      user-select: none;
    }
    > * {
      margin-top: 0;
    }
    &.load-more {
      position: sticky;
      bottom: 0;
      grid-column: 1 / -1;
      margin: 0;
      color: inherit;
      background: inherit;
      border-color: inherit;
      background-color: var(--figma-color-bg);
      border: 1px solid currentColor;
      user-select: none;
      &:focus,
      &:hover {
        background-color: var(--figma-color-bg-secondary);
      }
    }
    &.selected {
      box-shadow: inset 0 0 0 2px var(--accent),
                  inset 0 0 0 4px var(--figma-color-bg);
    }
    span {
      display: inline-block;
      width: 100%;
      img {
        width: 30px;
      }
    }
    h3 {
      font-size: 10px;
      opacity: .5;
      font-weight: 400;
    }
    p {
      font-size: 12px;
      margin-bottom: 0;
    }
    .favourite-badge {
      position: absolute;
      top: 0;
      right: 0;
      border-radius: var(--br, 3px);
    }
  }

  &.list-view {
    --grid-min-width: 62px;
    grid-template-columns: 1fr;
    .icon-grid--item {
      &:not(.btn) {
        display: grid;
        grid-template-columns: var(--grid-min-width) 1fr;
        grid-template-rows: 1fr 1fr;
        text-align: left;
        padding: 0;
      }
      h3, p, span {
        padding: 1rem;
      }
      span {
        display: flex;
        align-items: center;
        grid-column: 1;
        grid-row: 1 / 3;
      }
      h3 {
        margin: 0;
        padding-bottom: 0;
      }
      p {
        padding-top: 0;
      }
    }
  }
}

.notification-toast {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 1;
  // padding: ($gap/2)+0px;
  &.selection {
    .bubble {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      &-icon {
        width: auto;
        height: 55px;
      }
      &-actions {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
      }
    }
  }
  &.copied {
    .bubble {
      border: 5px solid var(--accent-hover);
    }
  }
  .bubble {
    background-color: var(--figma-color-bg);
    color: var(--figma-color-text);
    @supports (backdrop-filter: blur(10px)) {
      backdrop-filter: saturate(180%) blur(10px);
    }
    text-align: center;
    padding: ($gap/2)+0px;
    font-size: 1.5rem;
    font-weight: 900;
    p {
      margin: 0;
    }
    &-actions {
      button {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1 1 40%;
        min-width: unset;
        margin: ($gap/2)+0px;
        &.button--primary {
          width: 100%;
        }
        svg {
          margin-right: .2rem;
        }
      }
    }
  }
}

.lights-out {
  @include theme('dark');
  .btn {
    &-secondary {
      background-color: setcolor('dark', bg);
    }
    &-default {
      background-color: rgba(setcolor('dark', fg), 0.055);
      &:focus,
      &:hover {
        background-color: setcolor('dark', bg);
      }
    }
  }
  .icon-search {
    &:before {
      filter: invert(1);
    }
    &:after {
      background-color: rgba(setcolor('dark', bg), 0.9);
    }
  }
  button {
    &.active {
      color: setcolor('dark', fg);
      background-color: darken(setcolor('dark', bg), 10%);
    }
  }
  input {
    color: inherit;
    background-color: rgba(setcolor('dark', fg), 0.055);
    &:focus {
      color: inherit;
      background-color: setcolor('dark', bg);
    }
  }
  code {
    background-color: rgba(setcolor('dark', fg), 0.3);
  }
  .notification-toast {
    .bubble {
      @include theme('dark');
      background-color: rgba(setcolor('dark', bg), 0.9);
      &-details {
        img {
          filter: invert(1);
        }
      }
    }
  }
  @include respond-to('mobile') {
    .hide-on-mobile {
      color: setcolor('dark', fg) !important;
      background-color: setcolor('dark', bg) !important;
    }
  }
}
</style>
