使用方式：

```js
map = new Mindmap({
    container: document.getElementById("app"),
    data: {
        name: "根节点",
        children: [
            {
                name: "测试节点1",
                children: [
                    {
                        name: "测试节点1-1",
                        children: [],
                    },
                    {
                        name: "测试节点1-2",
                        children: [],
                    },
                    {
                        name: "测试节点1-3",
                        children: [
                            {
                                name: "测试节点1-3-1",
                                children: [],
                            },
                            {
                                name: "测试节点1-3-2",
                                children: [
                                    {
                                        name: "测试节点1-3-2-1",
                                        children: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                name: "测试节点2",
                children: [
                    {
                        name: "测试节点2-1",
                        children: [],
                    },
                    {
                        name: "测试节点2-2",
                        children: [],
                    },
                    {
                        name: "测试节点2-3",
                        children: [],
                    },
                ],
            },
            {
                name: "测试节点3",
                children: [
                    {
                        name: "测试节点3-1",
                        children: [],
                    },
                    {
                        name: "测试节点3-2",
                        children: [
                            {
                                name: "测试节点3-2-1",
                                children: [],
                            },
                            {
                                name: "测试节点3-2-2",
                                children: [],
                            },
                        ],
                    },
                ],
            },
            {
                name: "测试节点4",
                children: [],
            },
        ],
    },
    readonly: false,
});
```

### Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
