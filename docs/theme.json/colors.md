# Theme.json — Colors

There are three types of colors that can e configured in a `theme.json` file. The custom and gradient options are editable in the `Site Editor` while the duotones apply only to images and new options can only be added manually.

## Custom (Solids)

Configure a default color palette for the theme. More info about the boolean options can be found at the end of this doc.

```json
{
    "settings": {
        "color": {
			"palette": [
				{
					"color": "#df4b4b",
					"name": "Color 1",
					"slug": "custom-color-1"
				},
				{
					"color": "#1f9741",
					"name": "Color 2",
					"slug": "custom-color-2"
				}
			],
            "custom": true,         // optional, defaults to true
            "defaultPalette": true, // optional, defaults to true
		},
    }
}
```

## Gradients

Configure a gradient color palette for the theme. More info about the boolean options can be found at the end of this doc.

```json
{
    "settings": {
        "color": {
			"gradients": [
				{
					"gradient": "linear-gradient(135deg,rgb(134,255,223) 0%,rgb(143,51,228) 100%)",
					"name": "Color 1",
					"slug": "custom-color-1"
				},
				{
					"gradient": "linear-gradient(0deg,rgb(227,7,97) 0%,rgb(0,195,255) 100%)",
					"name": "Color 2",
					"slug": "custom-color-2"
				}
			],
            "customGradient": true,   // optional, defaults to true
            "defaultGradients": true, // optional, defaults to true
		},
    }
}
```

## Duotones

Configure a duotne color palette for the theme. More info about the boolean options can be found at the end of this doc.

```json
{
  "settings": {
    "color": {
        "duotone": [
            {
                "name": "Midnight Purple",
                "slug": "midnight-purple",
                "colors": [ "#1a0b2e", "#ff00ff" ]
            },
            {
                "name": "Sunburst",
                "slug": "sunburst",
                "colors": [ "#42210b", "#fff8e1" ]
            }
        ],
        "customDuotone": true,  // optional, defaults to true
        "defaultDuotone": true, // optional, defaults to true
    }
  }
}
```

## Configuration Options

Additional color options that can be configured are as follows. By default, these are set to true.

- `custom` - Enables the free-form color picker so users can enter any custom color for text, backgrounds, and links.
- `defaultPalette` - Shows the core WordPress color palette in addition to your theme’s colors.
- `customGradient` - Enables the gradient builder so users can create their own gradients (colors, angle, and linear/radial type).
- `defaultGradients` - Shows the core WordPress gradient presets alongside your theme’s gradients.
- `customDuotone` - Lets users tweak duotone presets by editing the shadow and highlight colors.
- `defaultDuotone` - Shows the core WordPress duotone presets alongside your custom duotones.
