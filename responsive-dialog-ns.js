/* Copyright (c) 2016-2018, Randy Westlund. All rights reserved. */
/* This code is under the BSD-2-Clause license. */
/* This module displays a responsive dialog that is fullscreen on mobile and
   a normal paper-dialog on desktop, in accordance with Google's Material
   Design guidelines.  */
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-media-query/iron-media-query.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';

class ResponsiveDialogNS extends GestureEventListeners(PolymerElement) {
  static get template() {
    return html`
<style>
    :host {
        display: none;
    }
    :host([opened]) {
        display: block;
    }
    :host([mobile]) {
        position:   fixed;
        left:       0;
        right:      0;
        top:        0;
        bottom:     0;
        z-index:    103;
        background-color: var(--primary-background-color);
    }
    div.fullscreen-column {
        padding-left:   1em;
        padding-right:  1em;
        padding-bottom: 2em;
    }
    [hidden] {
        display: none;
    }
    app-toolbar {
        background-color: var(--responsive-dialog-toolbar-background-color);
        color:            var(--responsive-dialog-toolbar-color);
    }
    paper-dialog {
        min-width: 25em;
        width: var(--responsive-dialog-paper-dialog-width, auto);
    }
</style>

<!-- Determine which layout to use. -->
<iron-media-query query="(max-width: [[responsiveWidth]])"
        query-matches="{{mobile}}">
</iron-media-query>

<!-- This normal paper-dialog is used on desktop. -->
<paper-dialog id="dialog" with-backdrop="" no-cancel-on-outside-click=""
        on-iron-overlay-closed="_prevent_bubble_hack">
    <h2>[[title]]</h2>
    <div id="desktop_slot">
        <!-- Light DOM goes here. -->
    </div>
    <div class="buttons">
        <template is="dom-if" if="[[dismissText]]">
            <paper-button dialog-dismiss="">[[dismissText]]</paper-button>
        </template>
        <template is="dom-if" if="[[confirmText]]">
            <paper-button dialog-confirm="">[[confirmText]]</paper-button>
        </template>
    </div>
</paper-dialog>

<!-- This custom fullscreen dialog is used on mobile. -->
<app-header-layout id="header_layout" has-scrolling-region="" fullbleed=""
        hidden\$="[[!mobile]]">
    <app-header slot="header" fixed="" effects="waterfall">
        <app-toolbar>
            <paper-icon-button icon="[[get_icon(dismissText)]]" on-tap="dismiss">
            </paper-icon-button>
            <div main-title="">[[title]]</div>
            <!-- If there's no dismissText, then we're just showing a
                 back arrow. -->
            <template is="dom-if" if="[[dismissText]]">
                <paper-button on-tap="confirm">[[confirmText]]</paper-button>
            </template>
        </app-toolbar>
    </app-header>

    <div id="mobile_slot" class="fullscreen-column"
            on-iron-overlay-closed="_prevent_bubble_hack">
        <!-- Light DOM goes here. -->
        <!-- This light DOM will be moved to the correct place. -->
        <slot id="slot"></slot>
    </div>
</app-header-layout>

<!-- TODO this dialog should capture and close on a mobile device's
     back arrow. -->
`;
  }

  static get is() { return "responsive-dialog-ns"; }
  static get properties() {
      return {
          // Anything smaller than this is mobile.
          responsiveWidth: { type: String, value: "600px" },
          // The h2 title of the dialog.
          title: { type: String },
          // What text to use for the dismiss button. If not defined, no
          // dismiss button will be shown. On mobile, defining this
          // causes an X rather than a back arrow.
          dismissText: { type: String, value: "" },
          // What text to use for the confirm button.
          confirmText: { type: String, value: "Save" },
          // Whether we're on mobile or desktop. Determined with a media
          // query.
          mobile: { type: Boolean, value: true, reflectToAttribute: true },
          opened: { type: Boolean, value: false, reflectToAttribute: true },
          domIsMobile: { type: Boolean, value: true },
      };
  }
  static get observers() {
      return [ "move_dom(mobile, opened)" ];
  }
  // When we change layouts, move the light DOM to the right place
  // and open or close the paper-dialog as necessary.
  move_dom(mobile, opened) {
      if (!opened) return;
      if (this.mobile) {
          this.$.dialog.close();
          if (!this.domIsMobile) {
              dom(this.$.mobile_slot).appendChild(this.$.slot);
              this.domIsMobile = true;
          }
          this.$.header_layout.resetLayout();
      } else {
          if (this.domIsMobile) {
              dom(this.$.desktop_slot).appendChild(this.$.slot);
              this.domIsMobile = false;
          }
          this.$.dialog.open();
      }
  }
  // HACK: The paper-dropdown-menu element implements
  // iron-overlay-behavior, which means that is fires
  // iron-overlay-closed, which bubbles all the way up here. On
  // desktop, it would close this dialog. On mobile, it would keep
  // causing havoc in parent elements. This should be fixed in a
  // future version of Polymer. See:
  // https://github.com/PolymerElements/iron-overlay-behavior/issues/70
  // https://github.com/PolymerElements/paper-dropdown-menu/issues/87
  _prevent_bubble_hack(e, reason) {
      // Shadow DOM's event retargeting means that firing an event and
      // closing the dialog both have e.target === this. The event
      // from a dropdown in the light DOM does not.
      if (e.target === this.$.dialog && !(this.mobile && this.opened))
          this.opened = false;
      // Otherwise it must be from the light DOM or we're just moving
      // to mobile. Stop it here.
      else e.stopImmediatePropagation();
  }
  open() { this.opened = true; }
  close() {
      this.opened = false;
      if (!this.mobile) this.$.dialog.close();
      else this.dismiss();
  }
  notifyResize() { if (!this.mobile) this.$.dialog.notifyResize(); }
  // Only used on mobile.
  dismiss(e) {
      //TODO this tap still highlights the menu icon behind it :/
      e.stopPropagation();
      this.opened = false;
      this.dispatchEvent(new CustomEvent("iron-overlay-closed", {
          bubbles: true,
          composed: true,
          detail: { canceled: true },
      }));
  }
  // Only used on mobile.
  confirm() {
      this.opened = false;
      this.dispatchEvent(new CustomEvent("iron-overlay-closed", {
          bubbles: true,
          detail: { confirmed: true },
      }));
  }
  // If no dismissText, use <- rather than X.
  get_icon(dt) { return dt ? "icons:close" : "icons:arrow-back"; }
}
customElements.define(ResponsiveDialogNS.is, ResponsiveDialogNS);
