# Theme.json — Shadows

## Defaults

```json
{
    "settings": {
        "shadow": {
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

## Configuration Options

Additional shadow options that can be configured are as follows.

```json
{
    "settings": {
        "shadow": {
            "defaultPresets": true,  // optional, defaults to true
		},
    }
}
```