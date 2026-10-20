// A condition reads as a name: `if (hasItems)`, `if (!isApplied)`, never a comparison or a callback.
// A name of the function reads as the code tests it: `if (isUnknown)`, never `if (!isKnown)`.
const functions = new Set(["ArrowFunctionExpression", "FunctionExpression"]);
const names = new Set(["Identifier", "MemberExpression", "CallExpression"]);
const comparisons = new Set(["===", "!==", "==", "!=", "<", "<=", ">", ">=", "in", "instanceof"]);
const blocks = new Set(["BlockStatement", "Program", "StaticBlock"]);

function children(node) {
  return Object.entries(node)
    .filter(([key]) => key !== "parent")
    .flatMap(([, value]) => [value].flat())
    .filter((child) => typeof child?.type === "string");
}

function hasFunction(node) {
  const isNode = typeof node?.type === "string";
  if (!isNode) return false;
  const isFunction = functions.has(node.type);
  if (isFunction) return true;
  return children(node).some((child) => hasFunction(child));
}

function operands(node) {
  const isLogical = node.type === "LogicalExpression";
  if (!isLogical) return [node];
  return [...operands(node.left), ...operands(node.right)];
}

function isNegation(node) {
  return node.type === "UnaryExpression" && node.operator === "!";
}

function isName(node) {
  const value = isNegation(node) ? node.argument : node;
  return names.has(value.type);
}

// The `const` that declares `name` from a comparison, in a block around the node, with that block.
function comparisonConst(node, name) {
  for (let block = node.parent; block; block = block.parent) {
    const isBlock = blocks.has(block.type);
    if (!isBlock) continue;
    const declarators = block.body
      .filter((statement) => statement.type === "VariableDeclaration" && statement.kind === "const")
      .flatMap((statement) => statement.declarations);
    const declarator = declarators.find(
      (item) => item.id.type === "Identifier" && item.id.name === name,
    );
    const isComparison =
      declarator?.init?.type === "BinaryExpression" && comparisons.has(declarator.init.operator);
    if (isComparison) return { declarator, block };
  }
  return undefined;
}

function references(node, name) {
  const own = node.type === "Identifier" && node.name === name ? [node] : [];
  return [...own, ...children(node).flatMap((child) => references(child, name))];
}

// True when each use of the `const` is its negation: a name for the opposite reads better.
function isOnlyNegated(found) {
  const uses = references(found.block, found.declarator.id.name).filter(
    (use) => use !== found.declarator.id,
  );
  return uses.every((use) => isNegation(use.parent));
}

const named = {
  meta: {
    type: "suggestion",
    schema: [{ type: "object", properties: { maxOperators: { type: "integer" } } }],
  },
  create(context) {
    const maxOperators = context.options[0]?.maxOperators ?? 1;
    const report = (node, message) => context.report({ node, message });
    const negatedConst = (part) => {
      const isNegatedName = isNegation(part) && part.argument.type === "Identifier";
      if (!isNegatedName) return;
      const found = comparisonConst(part, part.argument.name);
      const isOpposite = found !== undefined && isOnlyNegated(found);
      if (isOpposite) {
        report(
          part,
          `The condition negates \`${part.argument.name}\`, a name of this function. Name it as the code tests it (const isUnknown = setting === undefined, not !isKnown).`,
        );
      }
    };
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
          "The condition is not a name. Name it in a const as the code tests it (const isUnknown = setting === undefined) and test the name.",
        );
      } else {
        parts.forEach(negatedConst);
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
