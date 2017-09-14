# responsive-dialog

A responsive dialog that is fullscreen on mobile and a normal paper-dialog on
desktop, in accordance with Google's [Material Design guidelines](
https://material.google.com).

## Properties

- **responsiveWidth**
    - Anything smaller than this is considered mobile, and will use the
      fullscreen layout.
    - Default: `"600px"`
- **dismissText**
    - What text tpo use for the dismiss button. If not defined, no dismiss
      button will be shown. On mobile, defining this causes an X rather than a
      back arrow.
    - Default: `""`
- **confirmText**
    - What text to use for the confirm button.
    - Default: `"Save"`

## Mixins

- `--responsive-dialog-paper-dialog`
    - Applied to the `paper-dialog` used on screens larger than
      `responsiveWidth`.  You may want to set a certain width here, to prevent
      the dialog from dynamically growing.
- `--responsive-dialog-toolbar`
    - Applied to the top toolbar shown on mobile layouts.

## API

Call `.open()`, `.close()`, and `.notifyResize()`, just like with the standard
`paper-dialog`. When the dialog is resolved, it will emit the
`iron-overlay-closed` event, to which it passes either `{ resolved: true }` or
`{ canceled: true}`.

## Example

In the HTML:

```html
<responsive-dialog id="dialog"
       title="I'm a Dialog"
       dismiss-text="Cancel"
       confirm-text="Save"
       on-iron-overlay-closed="resolve_dialog">

    <!-- Your form or other content goes here, in the light DOM. -->
    <paper-input
            type="text"
            label="Name"
            value="{{name}}"
            autocapitalize="words"
            char-counter maxlength="50">
    </paper-input>
</responsive-dialog>
```

In the JavaScript:

```javascript
resolve_dialog: function(e, reason) {
    // Save the result.
    if (reason.confirmed) {
        console.log("You are", this.name);
    }
    else if (result.canceled) {
        console.log("You didn't submit anything");
    }
}
```

## Installation

`bower install polymer-responsive-dialog`

## License

This code is under the BSD-2-Clause license.  See the LICENSE file for the full
text.
