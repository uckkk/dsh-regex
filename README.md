# dsh-regex · 正则工具

测试正则匹配（位置/分组）、安全替换、特殊字符转义。纯 Node 实现。

## 提供的工具

| 工具 | 作用 |
|---|---|
| `regex_test` | 测试匹配 |
| `regex_replace` | 正则替换 |
| `regex_escape` | 特殊字符转义 |

## 安装

```bash
dsh plugin add dsh-regex
```
安装后在 profile 的 `package.json` 的 `dsh.profile.bundles` 中加入 `"dsh-regex"`。

## 用法示例

```
测试这个正则能匹配到什么
→ 调用 regex_test(pattern="\\d+", text="a1b22c333")
```

## 安装

```bash
dsh plugin add github:uckkk/dsh-regex
```

> 安装即在本机运行第三方代码，请自行审阅源码。
