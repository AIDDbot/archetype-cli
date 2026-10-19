// A condition reads as a name: `if (hasItems)`, `if (!isApplied)`, never a comparison or a callback.
const functions = new Set(["ArrowFunctionExpression", "FunctionExpression"]);
const names = new Set(["Identifier", "MemberExpression", "CallExpression"]);

function hasFunction(node) {
  const isNode = typeof node?.type === "string";
  if (!isNode) return false;
  const isFunction = functions.has(node.type);
  if (isFunction) return true;
  return Object.entries(node).some(
    ([key, value]) => key !== "parent" && [value].flat().some((child) => hasFunction(child)),
  );
}

function operands(node) {
  const isLogical = node.type === "LogicalExpression";
  if (!isLogical) return [node];
  return [...operands(node.left), ...operands(node.right)];
}

function isName(node) {
  const isNegation = node.type === "UnaryExpression" && node.operator === "!";
  const value = isNegation ? node.argument : node;
  return names.has(value.type);
}

const named = {
  meta: {
    type: "suggestion",
    schema: [{ type: "object", properties: { maxOperators: { type: "integer" } } }],
  },
  create(context) {
    const maxOperators = context.options[0]?.maxOperators ?? 1;
    const report = (node, message) => context.report({ node, message });
    const condition = (head) => {
      const parts = operands(head);
      const operators = parts.length - 1;
      if (hasFunction(head)) {
        report(head, "The condition has a callback. Name its result in a const before it.");
      } else if (operators > maxOperators) {
        report(
          head,
          `The condition has ${operators} logical operators (max ${maxOperators}). Name each part in a const.`,
        );
      } else if (!parts.every(isName)) {
        report(
          head,
          "The condition is not a name. Name it in a const (const hasItems = items.length > 0) and test the name, or its negation (!hasItems).",
        );
      }
    };
    const iterable = (head) => {
      if (hasFunction(head)) {
        report(head, "The loop has a callback. Name its result in a const before the loop.");
      }
    };
    return {
      IfStatement: (node) => condition(node.test),
      WhileStatement: (node) => condition(node.test),
      DoWhileStatement: (node) => condition(node.test),
      ConditionalExpression: (node) => condition(node.test),
      ForOfStatement: (node) => iterable(node.right),
      ForInStatement: (node) => iterable(node.right),
    };
  },
};

export default { meta: { name: "conditions" }, rules: { named } };
