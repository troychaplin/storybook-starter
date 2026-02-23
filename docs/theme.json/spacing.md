# Theme.json — Spacing

## Defaults

```json
{
	"$schema": "https://schemas.wp.org/wp/6.9/theme.json",
	"version": 3,
	"settings": {
		"spacing": {
            "spacingSizes": [
                {
                    "name": "2X-Small",
                    "slug": "20",
                    "size": "clamp(0.33rem, 0.25rem + 0.25vw, 0.44rem)"
                },
                {
                    "name": "X-Small",
                    "slug": "30",
                    "size": "clamp(0.5rem, 0.4rem + 0.5vw, 0.67rem)"
                },
                {
                    "name": "Small",
                    "slug": "40",
                    "size": "clamp(0.8rem, 0.7rem + 0.5vw, 1rem)"
                },
                {
                    "name": "Medium",
                    "slug": "50",
                    "size": "clamp(1.2rem, 1rem + 1vw, 1.5rem)"
                },
                {
                    "name": "Large",
                    "slug": "60",
                    "size": "clamp(1.6rem, 1rem + 2vw, 2.25rem)"
                },
                {
                    "name": "X-Large",
                    "slug": "70",
                    "size": "clamp(2.2rem, 1.5rem + 3vw, 3.38rem)"
                },
                {
                    "name": "2X-Large",
                    "slug": "80",
                    "size": "clamp(3rem, 2rem + 4vw, 5.06rem)"
                }
            ]
		}
	},
}
```

### Adding Spacing Sizes

```json
{
	"$schema": "https://schemas.wp.org/wp/6.9/theme.json",
	"version": 3,
	"settings": {
		"spacing": {
            "spacingSizes": [
                {
                    "name": "Sub-Heading",
                    "slug": "20",
                    "size": "clamp(0.33rem, 0.25rem + 0.25vw, 0.44rem)"
                },
                {
                    "name": "Footnote",
                    "slug": "30",
                    "size": "clamp(0.5rem, 0.4rem + 0.5vw, 0.67rem)"
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
		"spacing": {
            "defaultSpacingSizes": true,
            "customSpacingSize": true,
            "spacingSizes": []
		}
	},
}
```