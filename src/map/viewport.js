/**
 * 画布视野设置模块
 */

const Viewport = ({
    container,
    rootGroup,
    zr,
    onMouseDown,
    onZoom,
    scaleable = false,
    SCALE_STEP = 0.1, // 缩放步长
    SCALE_MIN = 0.2, // 视野最小缩放
    SCALE_MAX = 3, // 视野最大缩放
}) => {
    let isHoveringNode = false;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let viewBox = {
        x: 0,
        y: 0,
        scale: 1,
    };

    // 设置视野位置
    const setViewport = (x, y) => {
        rootGroup.attr("position", [x, y]);
    };

    // 设置视野缩放
    const setViewportScale = (s) => {
        if (s > SCALE_MAX) {
            s = SCALE_MAX;
        }
        // 设置视野最小规模
        if (s < SCALE_MIN) {
            s = SCALE_MIN;
        }
        rootGroup.attr("scale", [s, s]);
        onZoom((s / (SCALE_MAX - SCALE_MIN)).toFixed(2));
    };

    const mousedown = (e) => {
        if (isHoveringNode) {
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
        if (isHoveringNode) {
            return;
        }
        if (dragging) {
            // 拖拽移动脑图
            zr.dom.children[0].children[0].style.cursor = "grabbing";
            viewBox.x += e.layerX - lastX;
            viewBox.y += e.layerY - lastY;
            setViewport(viewBox.x, viewBox.y);
            lastX = e.layerX;
            lastY = e.layerY;
        }
    };

    const mouseup = () => {
        if (isHoveringNode) {
            return;
        }
        dragging = false;
        zr.dom.children[0].children[0].style.cursor = "default";
    };

    const mousewheel = (e) => {
        if (!scaleable) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (isHoveringNode) {
            return;
        }
        if (e.ctrlKey || e.altKey) {
            if (e.wheelDelta < 0) {
                // 向上
                viewBox.scale -= SCALE_STEP;
            } else {
                // 向下
                viewBox.scale += SCALE_STEP;
            }
            setViewportScale(viewBox.scale);
        }
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
            isHoveringNode = isHover;
        },
        zoom: (scale) => {
            setViewportScale(scale * (SCALE_MAX - SCALE_MIN));
        },
        dispose,
    };
};

export default Viewport;
