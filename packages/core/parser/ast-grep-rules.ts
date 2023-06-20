export const astGrepRules = {
  IDENT_NAME: {
    has: {
      kind: 'identifier',
      field: 'name',
    },
  },
  FN_CALL: {
    has: {
      kind: 'variable_declarator',
      has: {
        kind: 'call_expression',
      },
    },
  },
  ARROW_FN: {
    has: {
      kind: 'variable_declarator',
      has: {
        kind: 'arrow_function',
      },
    },
  },
  NOR_FN_VAR: {
    has: {
      kind: 'variable_declarator',
      has: {
        kind: 'function',
      },
    },
  },
  OBJ_VAR: {
    has: {
      kind: 'variable_declarator',
      has: {
        kind: 'object',
        field: 'value',
      },
    },
  },
  ARR_VAR: {
    has: {
      kind: 'variable_declarator',
      has: {
        kind: 'array',
        field: 'value',
      },
    },
  },
  NOR_FN: {
    has: {
      kind: 'function_declaration',
      has: {
        kind: 'identifier',
        field: 'name',
      },
    },
  },
  PROPS_DEFAULT_CALL: {
    has: {
      kind: 'call_expression',
      has: {
        kind: 'identifier',
        field: 'function',
      },
    },
  },
  PROPS_DEFAULT_ARG: {
    kind: 'property_identifier',
    inside: {
      kind: 'pair',
      inside: {
        kind: 'object',
        inside: {
          kind: 'arguments',
        },
      },
    },
  },
  PROPS_DEFAULT_VAL: {
    kind: 'object',
    inside: {
      kind: 'arguments',
    },
  },
  CONST_VAR: {
    any: [
      {
        pattern: 'const $VAR',
      },
    ],
  },
  LET_VAR: {
    any: [
      {
        pattern: 'let $VAR',
      },
    ],
  },
  CONST_REF_VAR: {
    any: [
      {
        pattern: 'const $VAR = ref($VAL)',
      },
    ],
  },
  CONST_REACTIVE_VAR: {
    any: [
      {
        pattern: 'const $VAR = reactive($VAL)',
      },
    ],
  },
  CONST_PROPS_VAR: {
    any: [
      {
        pattern: 'const $VAR = defineProps($VAL)',
      },
    ],
  },
  CONST_NOR_FN: {
    has:
      {
        kind: 'function_declaration',
      },
  },
  OBJ_PATTERN: {
    has:
      {
        kind: 'object_pattern',
      },
  },
  NEW_EXP: {
    has:
      {
        kind: 'new_expression',
        field: 'value'
      },
  },
  OBJ_PATTERN_VAL: {
    any:
      [
        {
          kind: 'identifier',
        },
        {
          kind: 'shorthand_property_identifier_pattern',
        },
      ],
  },
}

export const getRules = (name: string) => {
  return {
    rule: {
      matches: name,
    },
    utils: astGrepRules,
  }
}
