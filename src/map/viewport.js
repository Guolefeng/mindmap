/**
 * 画布视野设置模块
 * @param dom 画布的dom对象
 * @param rootGroup 画布的zrender对象
 */
import zrender from "zrender";

const MIN_SCALE = 0;
const MAX_SCALE = 10;

const Viewport = (
    dom,
    rootGroup,
    zrd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onZoom,
    origin
) => {
    const containerDom = dom;
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

    let dragging = false; // 是否鼠标按下拖拽移动图谱
    let lastX = 0;
    let lastY = 0;

    let selecting = false; // 是否框选多选
    let x = 0; // 拖拽区域x坐标
    let y = 0; // 拖拽区域y坐标
    let w = 0; // 拖拽区域宽
    let h = 0; // 拖拽区域高
    const marquee = new zrender.Rect({
        shape: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        },
        style: {
            fill: "#5CDBD31A",
            stroke: "#5CDBD3",
            lineWidth: 1,
        },
        z: 100,
        silent: true,
    });
    zr.add(marquee);

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
        if (!dragging) {
            x = e.layerX;
            y = e.layerY;
            selecting = true;
            marquee.attr("shape", {
                x,
                y,
            });
        }
    };

    const mousemove = (e) => {
        if (isHoverNode) {
            return;
        }
        if (dragging) {
            // 拖拽移动图谱
            zr.dom.children[0].children[0].style.cursor = "grabbing";
            viewBox.x += e.layerX - lastX;
            viewBox.y += e.layerY - lastY;
            _setViewport(viewBox.x, viewBox.y);
            lastX = e.layerX;
            lastY = e.layerY;
            if (w !== 0 || h !== 0) {
                w = 0;
                h = 0;
                marquee.attr("shape", {
                    width: w,
                    height: h,
                });
            }
            return;
        }
        if (selecting) {
            // 圈选图谱中节点
            w = e.layerX - x;
            h = e.layerY - y;
            marquee.attr("shape", {
                width: w,
                height: h,
            });
            onMouseMove();
        }
    };

    const mouseup = () => {
        if (isHoverNode) {
            return;
        }
        if (dragging) {
            dragging = false;
            zr.dom.children[0].children[0].style.cursor = "grab";
        }
        if (selecting) {
            if (
                marquee.shape.width !== 0 &&
                marquee.shape.height !== 0 &&
                marquee._rect
            ) {
                marquee._rect.x = marquee._rect.x - viewBox.x;
                marquee._rect.y = marquee._rect.y - viewBox.y;
                // marquee._rect.width = marquee._rect.width * viewBox.scale;
                // marquee._rect.height = marquee._rect.height * viewBox.scale;
                const sx = w < 0 ? x + w : x;
                const sy = h < 0 ? y + h : y;
                const nx =
                    sx - viewBox.x + (sx - origin[0]) * (viewBox.scale - 1);
                const ny =
                    sy - viewBox.y + (sy - origin[1]) * (viewBox.scale - 1);
                const rect = {
                    x: nx,
                    y: ny,
                    w: w,
                    h: h,
                };
                onMouseUp(marquee);
            }
            selecting = false;
            marquee.attr("shape", {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            });
        }
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
    containerDom.addEventListener("mousedown", mousedown);

    // 添加画布的鼠标移动事件
    containerDom.addEventListener("mousemove", mousemove);

    // 添加画布的鼠标释放事件
    containerDom.addEventListener("mouseup", mouseup);

    // 添加鼠标滚轮事件
    containerDom.addEventListener("mousewheel", mousewheel);

    // 添加窗口大小改变的事件
    window.addEventListener("resize", resize);

    // 移除监听事件
    const dispose = () => {
        containerDom.removeEventListener("mousedown", mousedown);
        containerDom.removeEventListener("mousemove", mousemove);
        containerDom.removeEventListener("mouseup", mouseup);
        containerDom.removeEventListener("mousewheel", mousewheel);
        window.removeEventListener("resize", resize);
    };

    return {
        setIsDragging: (drag) => {
            if (drag) {
                zr.dom.children[0].children[0].style.cursor = "grab";
            } else {
                zr.dom.children[0].children[0].style.cursor = "default";
            }
            dragging = drag;
        },
        getIsSelecting: () => {
            return selecting;
        },
        getViewbox: () => {
            return viewBox;
        },
        setIsHoverNode: (isHover) => {
            isHoverNode = isHover;
        },
        zoom: (scale) => {
            _setViewportScale(scale * (MAX_SCALE - MIN_SCALE));
        },
        mousedown,
        mousemove,
        mouseup,
        dispose,
    };
};

export default Viewport;
