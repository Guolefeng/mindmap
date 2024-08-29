## mode：

-   **ES Module**: `build/mindmap.es.js`
-   **UMD**: `build/mindmap.umd.js`

## Install

```
$ npm install --save mindmaple
```

## Usage

```js
import Mindmap from "mindmaple";

const map = new Mindmap({
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

## API

## Related

-   [cat](https://github.com/Guolefeng/cat) - 简单的打字跟随桌面系统

## License

ISC © [guolefeng](https://guolefeng.com)
