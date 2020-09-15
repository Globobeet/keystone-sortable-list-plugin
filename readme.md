# Keystone Sortable List Plugin

Add a custom sort field to your Keystone lists!

## How it works

- Resolves conflicts by incrementing existing records
- Sets sort value to 1 + maximum existing sort value by default (for new, or existing records with previous values)

## Usage

```js
const sortable = require('@globobeet/keystone-sortable-list-plugin');

keystone.createList('ListWithPlugin', {
  fields: {...},
  plugins: [
    sortable({...}),
  ],
});
```

## Config

| Option      | Type     | Default     | Description                          |
| ----------- | -------- | ----------- | ------------------------------------ |
| `fieldName` | `String` | `sortOrder` | Name of the field to use for sorting |
| `access`    | `Object` | See: access | Change default access controls       |

### `access`

By default access control on at tracking fields is read/write:

```javascript allowCopy=false showLanguage=false
{
  read: true,
  create: true,
  update: true
}
```
