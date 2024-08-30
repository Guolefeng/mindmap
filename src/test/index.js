// import Mindmap from "../../build/mindmap.es.js";
import Mindmap from "../map/index";
import test from "./test.js";
import GUI from "./lil-gui.js";

let map = null;
const container = document.getElementById("app");
const initMap = () => {
    if (map) {
        map.dispose();
    }
    map = new Mindmap({
        container: container,
        data: test,
        readonly: false,
        config: {
            rootNode: {},
        },
        onError: (msg) => {
            console.log(msg);
        },
        onNodeClick: (data) => {
            console.log(data);
        },
    });
};

initMap();

const gui = new GUI({
    // container,
    title: "Mindmaple配置",
    width: 240,
});
const nameMap = {
    w: "宽度",
    h: "高度",
    bg: "背景颜色",
    textColor: "字体颜色",
    fontSize: "字体大小",
    borderWidth: "边框宽度",
    hoverBorderColor: "鼠标hover边框颜色",
    clickBorderColor: "点击选中边框颜色",
    textPadding: "文字内边距",
    fontFamily: "字体",
    fontWeight: "字体粗细",
    radius: "圆角",
    x: "x轴间距",
    y: "y轴间距",
    color: "颜色",
    lineWidth: "宽度",
    switch: "开启动画",
    time: "动画时间",
    easing: "动画曲线",
};

const cloneDeep = (obj) => {
    if (typeof obj !== "object") return obj;
    let newObj = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        newObj[key] =
            typeof obj[key] === "object" ? cloneDeep(obj[key]) : obj[key];
    }
    return newObj;
};

const defaultParams = {
    // 根节点配置
    rootNode: {
        key: "rootNode", // 配置key值
        h: 40,
        bg: "#5CDBD3",
        textColor: "#fff",
        fontSize: 20,
        borderWidth: 4,
        hoverBorderColor: "#C1F3F0", // hover时边框颜色
        clickBorderColor: "#13C2C2", // 点击选中时边框颜色
        textPadding: 8,
        fontFamily: "PingFangSC-Semibold PingFang SC",
        fontWeight: 600,
        radius: 20, // 节点矩形圆角
    },
    // 普通节点配置
    normalNode: {
        key: "normalNode", // 配置key值
        h: 30,
        bg: "#F3F7F7",
        textColor: "#00474F",
        fontSize: 14,
        borderWidth: 3,
        hoverBorderColor: "#C1F3F0", // hover时边框颜色
        clickBorderColor: "#5CDBD3", // 点击选中时边框颜色
        textPadding: 8,
        fontFamily: "PingFangSC-Semibold PingFang SC",
        fontWeight: 600,
        radius: 20, // 节点矩形圆角
    },
    space: {
        key: "space", // 配置key值
        x: 60, // 节点之间间距 x轴方向
        y: 10, // 节点之间间距 y轴方向
    },
    line: {
        key: "line", // 配置key值
        w: 2, // 节点间线宽
        color: "#006D75", // 节点间线颜色
        radius: 30, // 节点间线圆角
    },
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

const params = cloneDeep(defaultParams);

const addItem = (key, entity, folder) => {
    if (key === "key") {
        return;
    }
    if (typeof entity[key] === "number") {
        folder.add(entity, key).min(0).max(1000).step(0.1).name(nameMap[key]);
    } else if (key.toLowerCase().includes("color") || key === "bg") {
        folder.addColor(entity, key).name(nameMap[key]);
    } else if (key === "easing") {
        folder
            .add(entity, key)
            .options([
                "linear",
                "quadraticIn",
                "quadraticOut",
                "quadraticInOut",
                "cubicIn",
                "cubicOut",
                "cubicInOut",
                "quarticIn",
                "quarticOut",
                "quarticInOut",
                "quinticIn",
                "quinticOut",
                "quinticInOut",
                "sinusoidalIn",
                "sinusoidalOut",
                "sinusoidalInOut",
                "exponentialIn",
                "exponentialOut",
                "exponentialInOut",
                "circularIn",
                "circularOut",
                "circularInOut",
                "elasticIn",
                "elasticOut",
                "elasticInOut",
                "backIn",
                "backOut",
                "backInOut",
                "bounceIn",
                "bounceOut",
                "bounceInOut",
            ])
            .name(nameMap[key]);
    } else {
        folder.add(entity, key).name(nameMap[key]);
    }
};

const rootFolder = gui.addFolder("根节点");
for (let key in params.rootNode) {
    addItem(key, params.rootNode, rootFolder);
}

const normalFolder = gui.addFolder("普通节点");
for (let key in params.normalNode) {
    addItem(key, params.normalNode, normalFolder);
}

const spaceFolder = gui.addFolder("节点间距");
for (let key in params.space) {
    addItem(key, params.space, spaceFolder);
}

const lineFolder = gui.addFolder("节点连线");
for (let key in params.line) {
    addItem(key, params.line, lineFolder);
}

const animationFolder = gui.addFolder("动画");
for (let key in params.animation) {
    addItem(key, params.animation, animationFolder);
}
gui.onFinishChange((e) => {
    if (e.property === "console") {
        return;
    }
    if (map) {
        map.rerender({
            [e.object.key]: {
                [e.property]: e.value,
            },
        });
    }
});

const footer = {
    reset: function () {
        map.rerender(defaultParams);
        gui.reset();
    },
    console: function () {
        if (map) {
            delete map.config.w;
            delete map.config.h;
            delete map.config.cx;
            delete map.config.cy;
            console.log("配置参数: ", map.config);
        }
    },
};
gui.add(footer, "reset").name("重置");
gui.add(footer, "console").name("控制台打印配置参数");
