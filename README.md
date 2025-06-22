# Core Practice technical test

## Development choices
The brief looked to indicate a preference for vanilla Javascript. The required functionality aligned well with the [Konva](https://konvajs.org/) canvas library.

While working at Orchard I rebuilt a social media canvas-based editor for the company Metcash with VueJS and Konva's Vue bindings. The editor included the ability to customise text within SVG templates.

## Instructions
Upload a local image on page load to the file input. Once loaded, the canvas and toolbar will display and can be interacted with.

## Local development
To have Vite serve the project locally:
```
$ npm install
$ npm run start
```

### Troubleshooting

While building I came across inconsistent [Konva behaviour with the **Brave** browser](https://github.com/konvajs/konva/issues/1132).

### UI Improvements

- Introductory screen describing tool with call to action (begin or upload)
- Toolbar 
  - Possibly pinned vertically left 
  - Use as little realestate as possible
  - See the toolbar functions as UI shortcuts to complement a standard top-level menu bar (File, Edit etc)
  - Hover descriptions
  - Single cololur picker
  - Uniformity of controls
  - Zoom dropdown like most paint programs
- Text node delete icon when selected
- Undo last edit. Facilitated, in part, by each new canvas action creating a new layer. Positioning is more tricky. Perhaps keeping a clone of the node or action history.
- Responsive styles
- Beyond this technical test but a media library / saving of annotations / versioning
- Apply a medical/x-ray visual theme in line with company branding
- Technical consideration - iframe resizing. As this is an embedded tool communication across domain for resizing can be troublesome. A good solution would be [iframe-resizer](https://iframe-resizer.com/). Good documentation for consuming site's devs to follow.