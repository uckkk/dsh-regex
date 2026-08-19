// dsh-regex — 正则工具（DeepSeek Harness）。
// 测试匹配（含位置/分组）、安全替换、特殊字符转义。纯 Node。
import { defineTool } from "@deepseek-ai/dsh-tools";

const name = "正则工具";
const inject = ["tools"];

function makeRe(pattern, flags) {
  try { return new RegExp(pattern, flags || ""); }
  catch (e) { throw new Error(`正则无效：${e.message}`); }
}

async function apply(ctx, _config) {
  ctx.tools.register(defineTool({
    name: "regex_test",
    description:
      "测试正则匹配，返回所有匹配（含匹配文本、起始位置、命名/编号分组）。`pattern` 传正则；`text` 传文本；`flags` 传修饰符（如 gim）。",
    parameters: {
      pattern: { type: "string", required: true, description: "正则表达式。" },
      text: { type: "string", required: true, description: "待匹配文本。" },
      flags: { type: "string", description: "修饰符，如 gim。" },
    },
    output: {
      schema: {
        type: "object", additionalProperties: false,
        properties: {
          count: { type: "integer", required: true },
          matches: {
            type: "array", required: true,
            items: {
              type: "object", additionalProperties: false,
              properties: {
                match: { type: "string", required: true },
                index: { type: "integer", required: true },
                groups: { type: "json", required: true },
              },
            },
          },
        },
      },
      render: (_args, value) => [{
        type: "text",
        text: `匹配 ${value.count} 处：\n${value.matches.slice(0, 20).map((m) => `  - [${m.index}] "${m.match}"${Object.keys(m.groups || {}).length ? " 分组 " + JSON.stringify(m.groups) : ""}`).join("\n")}`,
      }],
    },
    execute: async (args) => {
      const flags = (args.flags || "") + (args.flags || "").includes("g") ? "" : "g";
      const re = makeRe(args.pattern, [...new Set((args.flags || "g").split(""))].join(""));
      const matches = [];
      let m;
      while ((m = re.exec(args.text))) {
        matches.push({ match: m[0], index: m.index, groups: m.groups || [...m.slice(1)] });
        if (!re.global) break;
        if (m[0] === "") re.lastIndex++;
      }
      return { count: matches.length, matches };
    },
  }));

  ctx.tools.register(defineTool({
    name: "regex_replace",
    description:
      "用正则替换文本。`pattern` 传正则；`text` 传原文；`replacement` 传替换（支持 $1/$2 分组引用）；`flags` 默认 g。",
    parameters: {
      pattern: { type: "string", required: true, description: "正则表达式。" },
      text: { type: "string", required: true, description: "原文。" },
      replacement: { type: "string", required: true, description: "替换文本（支持 $1 等分组引用）。" },
      flags: { type: "string", description: "修饰符，默认 g。" },
    },
    output: {
      schema: { type: "object", additionalProperties: false, properties: { result: { type: "string", required: true } } },
      render: (_args, value) => [{ type: "text", text: value.result.slice(0, 3000) }],
    },
    execute: async (args) => ({ result: args.text.replace(makeRe(args.pattern, args.flags || "g"), args.replacement) }),
  }));

  ctx.tools.register(defineTool({
    name: "regex_escape",
    description: "转义正则特殊字符，使文本可安全用于正则匹配字面量。`text` 传要转义的文本。",
    parameters: {
      text: { type: "string", required: true, description: "要转义的文本。" },
    },
    output: {
      schema: { type: "object", additionalProperties: false, properties: { result: { type: "string", required: true } } },
      render: (_args, value) => [{ type: "text", text: value.result }],
    },
    execute: async (args) => ({ result: String(args.text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") }),
  }));
}

export { apply, inject, name };
