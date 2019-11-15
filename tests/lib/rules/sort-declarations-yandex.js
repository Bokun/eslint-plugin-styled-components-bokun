'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/sort-declarations-yandex');
const RuleTester = require('eslint').RuleTester;

const parserOptions = { ecmaVersion: 8, sourceType: 'module' };

// ------------------------------------------------------------------------------
// Tests
// -------------------------------------------------------------------------------8"
var ruleTester = new RuleTester();


ruleTester.run("sort-declarations-yandex", rule, {
    valid: [
        {
            code: "const button = styled.button`width: 300px; height: 200px;`",
            parserOptions
        },
        {
            code: "const button = styled(Button)`width: 300px; height: 200px;`",
            parserOptions
        },
        {
            code: "const button = css`width: 300px; height: 200px;`",
            parserOptions
        },
        {
            code: `const button = styled.button\`
        width: 300px;
        height: 200px; 
        \``,
            parserOptions
        },
        {
            code: `const button = styled.button\`
        width: 300px;
        height: 200px; 
        color: \${({ isBlue }) => (isBlue ? "blue" : "red")};
        \``,
            parserOptions
        },
        {
            code: `const button = styled.button\`
        width: 300px;
        height: 200px;
        border: 1px solid
          \${({ isBlue }) => (isBlue ? "blue" : "red")};
        \``,
            parserOptions
        },
        {
            code: `
      import styled from 'styled-components';


      const button = styled.button\`
        width: 300px;
        height: 200px;
        border: 1px solid
          \${({ isBlue }) => (isBlue ? "blue" : "red")};
        \``,
            parserOptions
        }
    ],

    invalid: [
        {
            code: "const button = styled.button`height: 200px; width: 300px;`",
            parserOptions,
            errors: [
                {
                    messageId: "sort-declarations-yandex"
                }
            ],
            output: "const button = styled.button`width: 300px; height: 200px;`"
        },
        {
            code: "const button = styled(Button)`height: 200px; width: 300px;`",
            parserOptions,
            errors: [
                {
                    messageId: "sort-declarations-yandex"
                }
            ],
            output: "const button = styled(Button)`width: 300px; height: 200px;`"
        },
        {
            code: "const button = css`height: 200px; width: 300px;`",
            parserOptions,
            errors: [
                {
                    messageId: "sort-declarations-yandex"
                }
            ],
            output: "const button = css`width: 300px; height: 200px;`"
        },
        {
            code: `const button = styled.button\`
        height: 200px;
        width: 300px;\``,
            parserOptions,
            errors: [
                {
                    messageId: "sort-declarations-yandex"
                }
            ],
            output: `const button = styled.button\`
        width: 300px;
        height: 200px;\``
        },
        {
            code: `const button = styled.button\`
        height: 200px;
        color: \${({ isBlue }) => (isBlue ? "blue" : "red")};
        width: 300px;\``,
            parserOptions,
            errors: [
                {
                    messageId: "sort-declarations-yandex"
                }
            ],
            output: `const button = styled.button\`
        width: 300px;
        height: 200px;
        color: \${({ isBlue }) => (isBlue ? "blue" : "red")};\``
        },
        {
            code: `const button = styled.button\`
        height: 200px;
        border: 1px solid
          \${({ isBlue }) => (isBlue ? "blue" : "red")};
        width: 300px;
        \``,
            parserOptions,
            errors: [
                {
                    messageId: "sort-declarations-yandex"
                }
            ],
            output: `const button = styled.button\`
        width: 300px;
        height: 200px;
        border: 1px solid
          \${({ isBlue }) => (isBlue ? "blue" : "red")};
        \``
        },
        {
            code: `
        export const foo = styled.div\`
          height: 100%;
          top: 0;
          position: absolute;
          width: 100%;
        
          .op-selectable:hover {
            cursor: pointer;
          }
        \`;`,
            parserOptions,
            errors: [
                {
                    messageId: "sort-declarations-yandex"
                }
            ],
            output: `
        export const foo = styled.div\`
          position: absolute;
          top: 0;
          width: 100%;
          height: 100%;
        
          .op-selectable:hover {
            cursor: pointer;
          }
        \`;`
        },
    ]
});
