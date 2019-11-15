# eslint-plugin-styled-components-bokun 

Auto fixable ESlint's rules for styled components.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-styled-components-bokun`:

```
$ npm install eslint-plugin-styled-components-bokun --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-styled-components-bokun` globally.

## Usage

Add `styled-components-bokun` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "styled-components-bokun"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "plugins": [
        "styled-components-bokun"
    ],
    "rules": {
        "styled-components-bokun/sort-declarations-yandex": 2
    }
}
```

## Supported Rules

* 🔤`sort-declarations-yandex`: auto fixable rule that enforces yandex sorted declarations.

## Regenirate rules
Go to utils folder and add the rule to the sortOrderData, and run
```
node createSortOrderJson.js
```

Then move that json to the yandex rule folder


## License
Unless otherwise specified this project is licensed under [Apache License Version 2.0](./LICENSE).



