## mode：

-   **ES Module**: `build/mindmap.es.js`
-   **UMD**: `build/mindmap.umd.js`
-   **支持 ts，可直接引入 ts 文件**

## Install

```
$ npm install --save mindmaple
```

## Usage

```js
import Mindmap from "mindmaple";

const testData = {
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
};

const testConfig = {
    // 根节点配置
    rootNode: {
        h: 40, // 节点高度
        bg: "#5CDBD3", // 节点背景颜色
        textColor: "#fff", // 节点文字颜色
        fontSize: 20, // 节点文字大小
        borderWidth: 4, // 节点边框宽度
        hoverBorderColor: "#C1F3F0", // hover时边框颜色
        clickBorderColor: "#13C2C2", // 点击选中时边框颜色
        textPadding: 8, // 节点文字内边距
        fontFamily: "PingFangSC-Semibold PingFang SC", // 字体
        fontWeight: 600, // 字体粗细
        radius: 20, // 节点矩形圆角
    },
    // 普通节点配置(配置说明同上)
    normalNode: {
        h: 30,
        bg: "#F3F7F7",
        textColor: "#00474F",
        fontSize: 14,
        borderWidth: 3,
        hoverBorderColor: "#C1F3F0",
        clickBorderColor: "#5CDBD3",
        textPadding: 8,
        fontFamily: "PingFangSC-Semibold PingFang SC",
        fontWeight: 600,
        radius: 20,
    },
    // 节点间距配置
    space: {
        x: 60, // 节点之间间距 x轴方向
        y: 10, // 节点之间间距 y轴方向
    },
    // 节点连线
    line: {
        w: 2, // 节点间线宽
        color: "#006D75", // 节点间线颜色
        radius: 30, // 节点间线圆角
    },
    // 展开收起按钮配置
    btn: {
        key: "btn", // 配置key值
        lineWidth: 2, // 展开收起按钮线宽
        radius: 8, // 展开收起按钮半径
    },
    // 动画配置
    animation: {
        key: "animation", // 配置key值
        switch: true, // 是否开启动画
        time: 100, // 动画时间
        easing: "linear", // 动画曲线
    },
};

const map = new Mindmap({
    // 挂载点
    container: document.getElementById("app"),
    // 树数据
    data: testData,
    // 是否只读
    readonly: false,
    // 配置项
    config: testConfig,
    // 警告或错误通知回调
    onError: (msg) => {
        console.log(msg);
    },
    // 点击回调
    onNodeClick: (data) => {
        console.log(data);
    },
});
```

## Related

-   [cat](https://github.com/Guolefeng/cat) - 简单的打字跟随桌面系统

## License

ISC © [guolefeng](https://guolefeng.com)
