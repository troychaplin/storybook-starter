# Theme.json Notes

----

## Colors

### Defaults

Custom colors should be supported in the Story to Block generator. Default can be disabled in the theme's primary `theme.json` file as per the example below.

The following color settings can be be disabled by setting them to `false` in the themes primary `theme.json` file.

- `custom` - Enables the free-form color picker so users can enter any custom color for text, backgrounds, and links.
- `defaultPalette` - Shows the core WordPress color palette in addition to your theme’s colors.

```json
{
    "settings": {
        "color": {
            "custom": true,          // optional, defaults to true
            "defaultPalette": true,  // optional, defaults to true
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
			]
		},
    }
}
```

### Gradients

Custom gradients should be supported in the Story to Block generator. Default can be disabled in the theme's primary `theme.json` file as per the example below.

The following color settings can be be disabled by setting them to `false` in the themes primary `theme.json` file.

- `customGradient` - Enables the gradient builder so users can create their own gradients (colors, angle, and linear/radial type).
- `defaultGradients` - Shows the core WordPress gradient presets alongside your theme’s gradients.

```json
{
    "settings": {
        "color": {
            "customGradient": true,    // optional, defaults to true
            "defaultGradients": true,  // optional, defaults to true
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
			]
		},
    }
}
```

### Duotones

Can be added manually in theme.json but no native support for adding custom duotones in the site editor. Custom duotones should be supported in the `stb.config` file and be handled in the generation script. Adding custom duotones would look like the example below.

The following color settings can be be disabled by setting them to `false` in the themes primary `theme.json` file.

- `customDuotone` - Lets users tweak duotone presets by editing the shadow and highlight colors.
- `defaultDuotone` - Shows the core WordPress duotone presets alongside your custom duotones.

```json
{
  "settings": {
    "color": {
        "customDuotone": true,   // optional, defaults to true
        "defaultDuotone": true,  // optional, defaults to true
        "duotone": [
            {
            "name": "Midnight Purple",
            "slug": "midnight-purple",
            "colors": [ "#1a0b2e", "#ff00ff" ]
            },
            {
            "name": "Golden Hour",
            "slug": "golden-hour",
            "colors": [ "#42210b", "#fff8e1" ]
            }
            // add more duotones here
        ]
    }
  }
}
```

----

## Background

This option falls under the styles entry and is not an ideal candidate for the component library. I feel this is better done in CSS against an element like the body tag and gain greater control over the implementation. Examples of implementation via the `Site Editor` are as follows.

**Tile size option**

```json
{
    "styles": {
        "background": {
            "backgroundImage": {
                "id": 51,
                "source": "file",
                "title": "waves-3840x2160-blue-orange-25502",
                "url": "http://localhost:8883/wp-content/uploads/2026/02/waves-3840x2160-blue-orange-25502-scaled.jpg"
            },
            "backgroundPosition": "50% 0",
            "backgroundSize": "auto"
        }
    },
}
```

**Contain size option with repeat enabled**

```json
{
    "styles": {
        "background": {
            "backgroundImage": {
                "id": 51,
                "source": "file",
                "title": "waves-3840x2160-blue-orange-25502",
                "url": "http://localhost:8883/wp-content/uploads/2026/02/waves-3840x2160-blue-orange-25502-scaled.jpg"
            },
            "backgroundPosition": "50% 0",
            "backgroundRepeat": "repeat",
            "backgroundSize": "contain"
        }
    },
}
```

**Cover size option**

```json
{
    "styles": {
		"background": {
			"backgroundAttachment": "scroll",
			"backgroundImage": {
				"id": 51,
				"source": "file",
				"title": "waves-3840x2160-blue-orange-25502",
				"url": "http://localhost:8883/wp-content/uploads/2026/02/waves-3840x2160-blue-orange-25502-scaled.jpg"
			},
			"backgroundPosition": "50% 0",
			"backgroundRepeat": "repeat",
			"backgroundSize": "cover"
		}
	},
}
```

----

## Shadows

Custom shadows should be supported in the Story to Block generator. Default can be disabled in the theme's primary `theme.json` file as per the example below. The styles map to `box-shadow`.

The following color settings can be be disabled by setting them to `false` in the themes primary `theme.json` file.

- `defaultPresets` - Shows the core WordPress shadows presets alongside your custom shadows.

```json
{
    "settings": {
        "shadow": {
            "defaultPresets": true,  // optional, defaults to true
            "presets": [
                {
                    "name": "Shadow 1",
                    "shadow": "15px 7px 17px 11px rgba(0, 0, 0, 0.2)",
                    "slug": "shadow-1"
                },
                {
                    "name": "Shadow 2",
                    "shadow": "inset -5px -4px 5px 8px rgba(0, 0, 0, 0.2)",
                    "slug": "shadow-2"
                }
            ]
        }
    }
}
```

## Layout

The primary layout settings relate to the custom content widths. These are already handled in our `stb.config` and are being output as both entries in the generated `theme.json` file, but also as tokens for usage in CSS.

```json
{
    "settings": {
        "layout": {
			"contentSize": "645px",
			"wideSize": "1340px"
		},
    }
}
```

The `Site Editor` also provides controls for padding that are being applied to the `body` tag, while the gap is set as a token `--wp--style--block-gap: 79px;`. By default the padding is `0` while the block gap is `24px`.

These style should be factored into the `stb.config` and exported as tokens and generated as part of the custom `theme.json` file.

```json
{
    "styles": {
		"spacing": {
			"blockGap": "79px",
			"padding": {
				"bottom": "119px",
				"left": "49px",
				"right": "49px",
				"top": "119px"
			}
		}
	},
}
```