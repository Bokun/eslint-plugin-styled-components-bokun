'use strict';
const postcss = require('postcss');
const sortOrder = require('./sortOrder.json');

function isStyledTagname(node) {
    return (
        (node.tag.type === 'Identifier' && node.tag.name === 'css') ||
        (node.tag.type === 'MemberExpression' && node.tag.object.name === 'styled') ||
        (node.tag.type === 'CallExpression' && node.tag.callee.name === 'styled')
    );
}

/**
 * An atomic rule is a rule without nested rules.
 */
function isValidAtomicRule(rule) {
    const decls = rule.nodes.filter(node => node.type === 'decl');
    if (decls.length < 0) {
        return { isValid: true };
    }
    for (let i = 1; i < decls.length; i++) {
        const current = decls[i].prop;
        const prev = decls[i - 1].prop;
        let currentIndex = 999;
        let prevIndex = 999;

        if (sortOrder.hasOwnProperty(current)) {
            currentIndex = sortOrder[current].value;
        }
        if (sortOrder.hasOwnProperty(prev)) {
            prevIndex = sortOrder[prev].value;
        }

        //TODO: if key does not exists move to the enD

        if (currentIndex < prevIndex) {
            const loc = {
                start: {
                    line: decls[i - 1].source.start.line,
                    column: decls[i - 1].source.start.column - 1,
                },
                end: {
                    line: decls[i].source.end.line,
                    column: decls[i].source.end.column - 1,
                },
            };
            return { isValid: false, loc };
        }
    }

    return { isValid: true };
}

function isValidRule(rule) {
    // check each rule recursively
    const { isValid, loc } = rule.nodes.reduce(
        (map, node) => {
            return node.type === 'rule' ? isValidRule(node) : map;
        },
        { isValid: true }
    );

    // if there is any invalid rule, return result
    if (!isValid) {
        return { isValid, loc };
    }

    // check declarations
    return isValidAtomicRule(rule);
}

function getNodeStyles(node) {
    const [firstQuasi, ...quasis] = node.quasi.quasis;

    // remove line break added to the first quasi
    const lineBreakCount = node.quasi.loc.start.line - 1;
    let styles = `${'\n'.repeat(lineBreakCount)}${' '.repeat(node.quasi.loc.start.column + 1)}${
        firstQuasi.value.raw
    }`;

    // replace expression by spaces and line breaks
    quasis.forEach(({ value, loc }, idx) => {
        const prevLoc = idx === 0 ? firstQuasi.loc : quasis[idx - 1].loc;
        const lineBreaksCount = loc.start.line - prevLoc.end.line;
        const spacesCount =
            loc.start.line === prevLoc.end.line
                ? loc.start.column - prevLoc.end.column + 2
                : loc.start.column + 1;
        styles = `${styles}${' '}${'\n'.repeat(lineBreaksCount)}${' '.repeat(spacesCount)}${
            value.raw
        }`;
    });

    return styles;
}

function create(context) {
    return {
        // All dudes that are inside a tagTemplate
        TaggedTemplateExpression(node) {
            // Check if it's a styled component template
            if (isStyledTagname(node)) {
                try {
                    const root = postcss.parse(getNodeStyles(node));
                    const { isValid, loc } = isValidRule(root);
                    if (!isValid) {
                        return context.report({
                            node,
                            messageId: 'sort-declarations-yandex',
                            loc,
                            fix: fixer =>
                                fix({
                                    rule: root,
                                    fixer,
                                    src: context.getSourceCode(),
                                }),
                        });
                    }
                } catch (e) {
                    return true;
                }
            }
        },
    };
}

function fix({ rule, fixer, src }) {
    let fixings = [];

    // concat fixings recursively
    rule.nodes.forEach(node => {
        if (node.type === 'rule') {
            fixings = [...fixings, ...fix({ rule: node, fixer, src })];
        }
    });

    const declarations = rule.nodes.filter(node => node.type === 'decl');

    const sortedDeclarations = sortDeclarations(declarations);
    // Here we go through all the declarations //TODO: perhaps add some lines in between
    declarations.forEach((decl, idx) => {
        if (!areSameDeclarations(decl, sortedDeclarations[idx])) {
            try {
                const range = getDeclRange({ decl, src });
                const sortedDeclText = getDeclText({
                    decl: sortedDeclarations[idx],
                    src,
                });

                fixings.push(fixer.removeRange([range.startIdx, range.endIdx + 1]));
                fixings.push(
                    fixer.insertTextAfterRange([range.startIdx, range.startIdx], sortedDeclText)
                );
            } catch (e) {
                console.log(e);
            }
        }
    });
    return fixings;
}

function areSameDeclarations(a, b) {
    return (
        a.source.start.line === b.source.start.line &&
        a.source.start.column === b.source.start.column
    );
}

function getDeclRange({ decl, src }) {
    const loc = {
        start: {
            line: decl.source.start.line,
            column: decl.source.start.column - 1,
        },
        end: {
            line: decl.source.end.line,
            column: decl.source.end.column - 1,
        },
    };

    const startIdx = src.getIndexFromLoc(loc.start);
    const endIdx = src.getIndexFromLoc(loc.end);
    return { startIdx, endIdx };
}

function getDeclText({ decl, src }) {
    const { startIdx, endIdx } = getDeclRange({ decl, src });
    return src.getText().substring(startIdx, endIdx + 1);
}

//Do better sorting
function sortDeclarations(declarations) {
    let unknownDec = [];
    let tempSort = [];
    for (let j = 0; j < declarations.length; j++) {
        if (sortOrder.hasOwnProperty(declarations[j].prop)) {
            tempSort.push({
                dec: declarations[j],
                value: sortOrder[declarations[j].prop],
            });
        } else {
            unknownDec.push(declarations[j]);
        }
    }
    const sorted = tempSort.sort((a, b) => a.value.value - b.value.value);
/*
    for (var i = 0; i < sorted.length; i++) {
        if (
            sorted[i] &&
            sorted[i + 1] &&
            Math.floor(sorted[i + 1]) - Math.floor(sorted[i]) >= 100
        ) {
            //TODO: add a new line

        }
    }*/
    return [...sorted.map(s => s.dec), ...unknownDec];

}

module.exports = {
    meta: {
        docs: {
            description: 'Styles are sorted in yandex order.',
            category: 'Fill me in',
            recommended: false,
        },
        messages: {
            'sort-declarations-yandex': 'Declarations should be sorted correctly, use the force.',
        },
        fixable: 'code',
    },
    create,
};
