const sortOrder = require('./sortOrderData');
const fs = require('fs');

const newFinalThing = {};

sortOrder.rules['order/properties-order'].forEach((rule, j) => {
    rule.properties.forEach((r, i) => {
        newFinalThing[r] = { value: (j + 1) * 100 + i };
    });
});

fs.writeFile('./test.json', JSON.stringify(newFinalThing), function(err) {
    if (err) {
        return console.log(err);
    }

    console.log('The file was saved!');
});
