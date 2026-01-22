# Note: Adding audit:colors script

The package.json requires adding the following script:

```json
"audit:colors": "npx tsx scripts/color-audit.ts"
```

This script can be run with `npm run audit:colors` to generate a UI color compliance report.

Since package.json cannot be edited directly, please add this manually or via the package manager.
