/**
 * 画布视野设置模块
 * @param dom 画布的dom对象
 * @param rootGroup 画布的zrender对象
 */
import zrender from "zrender";

const MIN_SCALE = 0;
const MAX_SCALE = 10;

const Viewport = ({ dom, rootGroup, zrd, onMouseDown, onZoom }) => {
    const container = dom;
    const group = rootGroup;
    const zr = zrd;
    const scaleInterval = 0.1;
    const posInterval = 20;
    let isHoverNode = false;
    let viewBox = {
        x: 0,
        y: 0,
        scale: 1,
    };

    let dragging = false; // 是否鼠标按下拖拽移动脑图
    let lastX = 0;
    let lastY = 0;

    // 设置视野位置
    const _setViewport = (x, y) => {
        group.attr("position", [x, y]);
    };

    // 设置视野缩放
    const _setViewportScale = (s) => {
        if (s > MAX_SCALE) {
            s = MAX_SCALE;
        }
        // 设置视野最小规模
        if (s < MIN_SCALE) {
            s = MIN_SCALE;
        }
        group.attr("scale", [s, s]);
        onZoom((s / (MAX_SCALE - MIN_SCALE)).toFixed(2));
    };

    const mousedown = (e) => {
        if (isHoverNode) {
            return;
        }
        if (e.button !== 0) {
            return;
        }
        onMouseDown(e);
        lastX = e.layerX;
        lastY = e.layerY;
        dragging = true;
    };

    const mousemove = (e) => {
        if (isHoverNode) {
            return;
        }
        if (dragging) {
            // 拖拽移动脑图
            zr.dom.children[0].children[0].style.cursor = "grabbing";
            viewBox.x += e.layerX - lastX;
            viewBox.y += e.layerY - lastY;
            _setViewport(viewBox.x, viewBox.y);
            lastX = e.layerX;
            lastY = e.layerY;
        }
    };

    const mouseup = () => {
        if (isHoverNode) {
            return;
        }
        dragging = false;
        zr.dom.children[0].children[0].style.cursor = "default";
    };

    const mousewheel = (e) => {
        if (isHoverNode) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (e.ctrlKey || e.altKey) {
            if (e.wheelDelta < 0) {
                // 向上
                viewBox.scale -= scaleInterval;
            } else {
                // 向下
                viewBox.scale += scaleInterval;
            }
            _setViewportScale(viewBox.scale);
            return;
        }

        if (e.shiftKey) {
            if (e.wheelDelta % 120 === 0) {
                // 鼠标
                if (e.wheelDeltaX < 0) {
                    // 向左移动
                    viewBox.x -= posInterval;
                } else if (e.wheelDeltaX > 0) {
                    // 向右移动
                    viewBox.x += posInterval;
                }
            } else {
                // 触控板
                viewBox.x += e.wheelDeltaY;
            }
        } else {
            if (e.wheelDelta % 120 === 0) {
                // 鼠标
                if (e.wheelDeltaX < 0) {
                    // 向左移动
                    viewBox.x -= posInterval;
                } else if (e.wheelDeltaX > 0) {
                    // 向右移动
                    viewBox.x += posInterval;
                }
                if (e.wheelDeltaY < 0) {
                    // 向上移动
                    viewBox.y -= posInterval;
                } else if (e.wheelDeltaY > 0) {
                    // 向下移动
                    viewBox.y += posInterval;
                }
            } else {
                // 触控板
                viewBox.x += e.wheelDeltaX;
                viewBox.y += e.wheelDeltaY;
            }
        }
        // 移动
        _setViewport(viewBox.x, viewBox.y);
    };

    const resize = () => {
        zr.resize();
    };

    // 画布视野移动设置
    // 添加画布的鼠标点击事件
    container.addEventListener("mousedown", mousedown);

    // 添加画布的鼠标移动事件
    container.addEventListener("mousemove", mousemove);

    // 添加画布的鼠标释放事件
    container.addEventListener("mouseup", mouseup);

    // 添加鼠标滚轮事件
    container.addEventListener("mousewheel", mousewheel);

    // 添加窗口大小改变的事件
    window.addEventListener("resize", resize);

    // 移除监听事件
    const dispose = () => {
        container.removeEventListener("mousedown", mousedown);
        container.removeEventListener("mousemove", mousemove);
        container.removeEventListener("mouseup", mouseup);
        container.removeEventListener("mousewheel", mousewheel);
        window.removeEventListener("resize", resize);
    };

    return {
        setIsHoverNode: (isHover) => {
            isHoverNode = isHover;
        },
        zoom: (scale) => {
            _setViewportScale(scale * (MAX_SCALE - MIN_SCALE));
        },
        dispose,
    };
};

export default Viewport;
