# Core practice technical test

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

While building I came across inconsistent [Konva behaviour with the **Brave** browser](https://github.com/konvajs/konva/issues/1132#issuecomment-1273565082).