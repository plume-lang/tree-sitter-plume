function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function parens(rule) {
  return seq("(", rule, ")");
}

module.exports = grammar({
  name: "plume",

  extras: ($) => [/[\s\n\t]/, $.comment],

  rules: {
    program: ($) => repeat1($.expr),

    block: ($) => seq($.open_brace, repeat($.expr), $.close_brace),

    expr: ($) =>
      choice(
        $.comment,
        $.function_definition,
        $.keyword,
        $.annotation,
        $.function_call,
        $.generics,
        $.list_expr,
        $.arguments,
        $.literal,
        $.variable,
        $.reserved_operator,
        $.custom_operator,
        $.block,
      ),

    variable: ($) => $.identifier,

    annotation: ($) => seq($.colon, $.type), // Types are annotations

    arguments: ($) => seq($.open_paren, commaSep($.expr), $.close_paren),
    generics: ($) => seq($.open_angle, commaSep($.type), $.close_angle),
    list_expr: ($) => seq($.open_bracket, commaSep($.expr), $.close_bracket),

    whitespace: ($) => choice(/\s/, $.comment),
    comment: ($) => choice($.inlineComment, $.blockComment),
    inlineComment: ($) => token(seq("//", /.*/)),
    blockComment: ($) => token(seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),

    function_definition: ($) =>
      prec(
        1,
        seq(
          "fn",
          field("fn_name", $.identifier),
          optional($.generics),
          parens(commaSep($.function_argument)),
          optional($.annotation),
          $.body,
        ),
      ),
    function_argument: ($) =>
      seq(field("arg_name", $.identifier), optional($.annotation)),
    body: ($) => choice(seq("=>", $.expr), $.block),

    operator: () =>
      prec(
        2,
        choice(
          "!",
          "#",
          "$",
          "%",
          "&",
          "*",
          "+",
          ".",
          "/",
          "<",
          "=",
          ">",
          "?",
          "@",
          "^",
          "|",
          "-",
          "~",
        ),
      ),

    reserved_operator: () => prec(1, choice("->", ":", ".", "..", "=>")),
    custom_operator: ($) => prec(2, repeat1($.operator)),

    open_paren: () => "(",
    close_paren: () => ")",

    open_brace: () => "{",
    close_brace: () => "}",

    open_bracket: () => "[",
    close_bracket: () => "]",

    open_angle: () => "<",
    close_angle: () => ">",

    comma: () => ",",
    colon: () => ":",
    dot: () => ".",

    str_fragment: (_) => /[^"\\]+/,

    literal: ($) => choice($.int, $.float, $.bool, $.str, $.char, $.unit),
    escape: ($) =>
      token(
        /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
      ),
    int: ($) => token(/[0-9]+/),
    float: ($) => token(/[0-9]+\.[0-9]+/),
    bool: ($) => choice("true", "false"),
    str: ($) => seq('"', repeat(choice($.str_fragment, $.escape)), '"'),
    char: (_) => token(seq("'", choice(/[^\\'\n]/, /\\./, /\\\n/), "'")),
    unit: ($) => prec(1, "unit"),

    function_call: ($) =>
      prec(
        1,
        seq(
          field("function", $.identifier),
          $.open_paren,
          commaSep($.expr),
          $.close_paren,
        ),
      ),

    identifier: ($) => /[a-zA-Z_$][a-zA-Z_$0-9]*/,

    type: ($) =>
      choice(
        $.type_primitive,
        $.type_list,
        $.type_tuple,
        $.type_function,
        $.type_compound,
        $.type_id,
      ),

    type_id: ($) => prec(2, $.identifier),
    type_primitive: ($) =>
      choice("int", "bool", "str", "float", "unit", "char"),
    type_list: ($) => prec(1, seq("[", $.type, "]")),
    type_tuple: ($) => prec(1, seq("(", commaSep($.type), ")")),
    type_function: ($) =>
      prec(1, seq("fn", seq("(", commaSep($.type), ")"), ":", $.type)),
    type_compound: ($) =>
      prec(
        1,
        seq(field("type_name", $.identifier), "<", commaSep($.type), ">"),
      ),

    keyword: () =>
      choice(
        "in",
        "if",
        "else",
        "require",
        "switch",
        "fn",
        "case",
        "return",
        "extend",
        "native",
        "type",
        "declare",
        "extends",
        "interface",
        "infix",
        "prefix",
        "postfix",
        "infixl",
        "infixr",
        "mut",
      ),
  },
});
