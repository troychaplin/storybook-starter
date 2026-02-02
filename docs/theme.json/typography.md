# Theme.json — Typography

## Font Face

This is an example of how a font face is referenced in a `theme.json` file:

```json
{
	"$schema": "https://schemas.wp.org/wp/6.9/theme.json",
	"version": 3,
	"settings": {
		"typography": {
			"fontFamilies": [
				{
					"fontFace": [
						{
							"fontFamily": "Inter",
							"fontStyle": "normal",
							"fontWeight": "300",
							"src": [
								"file:./assets/fonts/inter/inter-300-normal.woff2"
							]
						}
						{
							"fontFamily": "Inter",
							"fontStyle": "italic",
							"fontWeight": "300",
							"src": [
								"file:./assets/fonts/inter/inter-300-italic.woff2"
							]
						}
					],
					"fontFamily": "Inter, sans-serif",
					"name": "Inter",
					"slug": "inter"
				}
			]
		}
	},
}
```

## Default Font Sizes

We can override default font size, and apply fuid typography. There are 4 default sizes, as shown in the example below. In order to replace the defaults and use fluid typography we must use `"defaultFontSizes": false,` and `"fluid": true,`.

```json
{
	"$schema": "https://schemas.wp.org/wp/6.9/theme.json",
	"version": 3,
	"settings": {
		"typography": {
            "defaultFontSizes": false,
            "fluid": true,
			"fontSizes": [
				{
					"fluid": {
						"max": "1rem",
						"min": "0.875rem"
					},
					"name": "Small",
					"size": "1rem",
					"slug": "small"
				},
				{
					"fluid": {
						"max": "1.125rem",
						"min": "1rem"
					},
					"name": "Medium",
					"size": "1.125rem",
					"slug": "medium"
				},
				{
					"fluid": {
						"max": "1.25rem",
						"min": "1.125rem"
					},
					"name": "Large",
					"size": "1.25rem",
					"slug": "large"
				},
				{
					"fluid": {
						"max": "1.5rem",
						"min": "1.25rem"
					},
					"name": "X-Large",
					"size": "1.5rem",
					"slug": "x-large"
				}
			]
		}
	},
}
```

### Adding Font Sizes

We do not have to replace defaults, we can add new ones, as shown below. There are 4 default sizes. In order to use fluid typography we must set `"fluid": true,`.

Note: by adding `"defaultFontSizes": false,` in this configuration only our custom sizes would be available.


```json
{
	"$schema": "https://schemas.wp.org/wp/6.9/theme.json",
	"version": 3,
	"settings": {
		"typography": {
            "fluid": true,
			"fontSizes": [
				{
					"fluid": {
						"max": "14px",
						"min": "10px"
					},
					"name": "New Font Size 1",
					"size": "10px",
					"slug": "custom-1"
				}
			]
		}
	},
}
```

## Configuration Options

Additional spacing options that can be configured are as follows.

```json
{
	"$schema": "https://schemas.wp.org/wp/6.9/theme.json",
	"version": 3,
	"settings": {
		// add settings
	},
}
```