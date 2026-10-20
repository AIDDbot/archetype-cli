// A parameter has a named type: `options: ServerOptions`, never an object type written in the signature.
const functions = ["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"];

function annotation(parameter) {
  const isDefault = parameter.type === "AssignmentPattern";
  const target = isDefault ? parameter.left : parameter;
  return target.typeAnnotation?.typeAnnotation;
}

const named = {
  meta: { type: "suggestion", schema: [] },
  create(context) {
    const check = (node) => {
      const types = node.params.map(annotation);
      const literals = types.filter((type) => type?.type === "TSTypeLiteral");
      const derived = types.filter((type) => type?.typeName?.name === "ReturnType");
      for (const literal of literals) {
        context.report({
          node: literal,
          message:
            "The parameter has an object type in the signature. Give it a name with `type`: in the contract of `shared`, or above the function.",
        });
      }
      for (const type of derived) {
        context.report({
          node: type,
          message: "The parameter takes its type from an implementation. Use the named type of the contract.",
        });
      }
    };
    return Object.fromEntries(functions.map((type) => [type, check]));
  },
};

export default { meta: { name: "types" }, rules: { named } };
