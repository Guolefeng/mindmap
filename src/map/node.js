/**
 * @desc 脑图中的节点
 */
import zrender from "zrender";
export default class Node {
    constructor({
        container,
        rootGroup,
        x = 0,
        y = 0,
        w = 80,
        h = 40,
        data = {},
        readonly = true,
        config = {},
        onNodeClick = () => {},
        onTextChange = () => {},
        onNodeDoubleClick = () => {},
        onNodeMouseDown = () => {},
        onNodeMouseUp = () => {},
        onNodeMouseEnter = () => {},
        onNodeMouseLeave = () => {},
    }) {
        this.container = container;
        this.rootGroup = rootGroup;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.data = data;
        this.readonly = readonly;
        this.config = config;
        this.onNodeClick = onNodeClick;
        this.onTextChange = onTextChange;
        this.onNodeDoubleClick = onNodeDoubleClick;
        this.onNodeMouseDown = onNodeMouseDown;
        this.onNodeMouseUp = onNodeMouseUp;
        this.onNodeMouseEnter = onNodeMouseEnter;
        this.onNodeMouseLeave = onNodeMouseLeave;
        this._init();
        this.isSelected = false;
    }

    _init() {
        const { radius, rootRect, normalRect, fontFamily, fontWeight } =
            this.config;
        this.group = new zrender.Group({
            draggable: false,
        });
        let textOffset = [0, 0];
        this.rect = new zrender.Rect({
            shape: {
                r: radius,
                x: this.x,
                y: this.y,
                width: this.w,
                height: this.h,
            },
            style: {
                stroke: this.level === 0 ? rootRect.bg : normalRect.bg,
                lineWidth:
                    this.level === 0
                        ? rootRect.borderWidth
                        : normalRect.borderWidth,
                fill: this.level === 0 ? rootRect.bg : normalRect.bg,
                text: this.data.name,
                textOffset,
                textFill:
                    this.level === 0
                        ? rootRect.textColor
                        : normalRect.textColor,
                fontSize:
                    this.level === 0 ? rootRect.fontSize : normalRect.fontSize,
                fontFamily,
                fontWeight,
                transformText: true, // 跟随group缩放
            },
            z: 10,
        });
        this.rect.id = this.data.id;
        this.group.add(this.rect);

        // 创建拖拽时的占位矩形
        if (this.data.level !== 0) {
            // 根节点除外
            this.placeholderRect = this._getPlaceholderRect();
            this.data.fatherNode.group.add(this.placeholderRect);
            this.placeholderRect.on("mouseup", (e) => {
                this.onMouseUp();
            });
        }

        this.group.on("dblclick", (e) => {
            this.timer && clearTimeout(this.timer);
            this.onNodeDoubleClick(e, this.data);
            e.event.preventDefault();
            e.event.stopPropagation();
            this.editName(e);
        });
        this.group.on("click", (e) => {
            this.timer && clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                e.event.preventDefault();
                e.event.stopPropagation();
                this.onNodeClick(e, this.data);
            }, 100);
        });
        this.group.on("mouseover", (e) => {
            if (!this.isSelected) {
                this.rect.attr("style", {
                    stroke:
                        this.level === 0
                            ? rootRect.hoverBorderColor
                            : normalRect.hoverBorderColor,
                });
            }
            this.onNodeMouseEnter(e, this.data);
        });
        this.group.on("mouseout", (e) => {
            if (!this.isSelected) {
                this.rect.attr("style", {
                    stroke: this.level === 0 ? rootRect.bg : normalRect.bg,
                });
            }
            this.onNodeMouseLeave(e, this.data);
        });
        this.group.on("mousedown", (e) => {
            if (this.readonly) {
                return;
            }
            if (this.data.level === 0) {
                return;
            }
            this.moveable = true;
            this.group.attr("draggable", true);
            this.onNodeMouseDown(e, this.data);
        });
        this.group.on("mousemove", (e) => {
            if (this.readonly) {
                return;
            }
            if (!this.moveable) {
                return;
            }
            if (this.data.level === 0) {
                return;
            }
            if (this.rect.z === 10) {
                this.rect.attr("z", 8);
            }
            if (this.data.btn && this.data.btn.type === 1) {
                this.data.btn.setType(0);
            }
            if (
                this.data.lineBeforeBtn &&
                this.data.lineBeforeBtn.line.style !== rootRect.bg
            ) {
                this.data.lineBeforeBtn.setColor(rootRect.bg);
            }
            if (
                this.data.lineBeforeNode &&
                this.data.lineBeforeNode.line.z === 1
            ) {
                this.data.lineBeforeNode.line.attr("z", 2);
            }
            if (
                this.data.lineBeforeNode &&
                this.data.lineBeforeNode.line.style !== rootRect.bg
            ) {
                this.data.lineBeforeNode.setColor(rootRect.bg);
            }
            if (this.placeholderRect && this.placeholderRect.invisible) {
                this.placeholderRect.attr("invisible", false);
            }
        });
        this.group.on("mouseup", (e) => {
            if (this.readonly) {
                return;
            }
            if (this.data.level === 0) {
                return;
            }
            this.group.attr("draggable", false);
            this.onMouseUp();
            this.onNodeMouseUp(this.data);
        });
    }

    onMouseUp() {
        const { lineColor } = this.config;
        this.group.attr("position", [0, 0]);
        this.group.attr("scale", [1, 1]);
        this.rect.attr("z", 10);
        if (this.data.btn && this.data.btn.type === 0) {
            this.data.btn.setType(1);
        }
        if (
            this.data.lineBeforeBtn &&
            this.data.lineBeforeBtn.line.style !== lineColor
        ) {
            this.data.lineBeforeBtn.setColor(lineColor);
        }
        if (this.data.lineBeforeNode && this.data.lineBeforeNode.line.z === 2) {
            this.data.lineBeforeNode.line.attr("z", 1);
        }
        if (
            this.data.lineBeforeNode &&
            this.data.lineBeforeNode.line.style !== lineColor
        ) {
            this.data.lineBeforeNode.setColor(lineColor);
        }
        if (this.placeholderRect && this.placeholderRect.invisible) {
            this.placeholderRect.attr("invisible", true);
        }
        this.moveable = false;
    }

    _getPlaceholderRect() {
        const { rootRect, radius } = this.config;
        return new zrender.Rect({
            shape: {
                r: radius,
                x: this.x,
                y: this.y,
                width: this.w,
                height: this.h,
            },
            style: {
                fill: rootRect.bg,
            },
            z: 9,
            silent: false,
            invisible: true,
        });
    }

    // 双击生成文本输入框
    _generateInputDom({ x, y, w, h }) {
        if (!x || !y || !w || !h) {
            return;
        }
        const { fontSize, fontFamily, radius, normalRect } = this.config;
        // 编辑框
        const input = document.createElement("input");
        input.style = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            padding: 0 12px;
            width: ${w - 28}px;
            height: ${h - 3}px;
            border-radius: ${radius}px;
            outline: none;
            border: none;
            font-size: ${fontSize};
            font-family: ${fontFamily};
            border-radius: ${normalRect.radius}px;
            border: 2px solid #5CDBD3;
            z-index: 10;
            background: ${normalRect.bg};
        `;
        input.value = this.data.name;
        input.onkeyup = (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (e.keyCode === 13) {
                input.blur();
                return;
            }
            this.data.name = e.target.value;
        };
        input.onblur = (e) => {
            this.onTextChange(this.data);
            input.autofocus = false;
            document.body.removeChild(input);
        };
        document.body.appendChild(input);
        setTimeout(() => {
            input.focus();
        }, 100); // 动画时间为300ms
    }

    // 选中节点
    selectNode() {
        const { rootRect, normalRect } = this.config;
        this.isSelected = true;
        this.rect.attr("style", {
            stroke:
                this.level === 0
                    ? rootRect.clickBorderColor
                    : normalRect.clickBorderColor,
        });
    }

    // 取消选中节点
    cancelNode() {
        const { rootRect, normalRect } = this.config;
        this.isSelected = false;
        this.rect.attr("style", {
            stroke: this.level === 0 ? rootRect.bg : normalRect.bg,
        });
    }

    // 移动节点位置
    translate(dx = 0, dy = 0) {
        const { animation } = this.config;
        this.x += dx;
        this.y += dy;
        if (animation.switch) {
            this.rect.animateTo(
                {
                    shape: {
                        x: this.x,
                        y: this.y,
                    },
                },
                animation.time,
                animation.easing
            );
            this.placeholderRect &&
                this.placeholderRect.animateTo(
                    {
                        shape: {
                            x: this.x,
                            y: this.y,
                        },
                    },
                    animation.time,
                    animation.easing
                );
        } else {
            this.rect.attr("shape", {
                x: this.x,
                y: this.y,
            });
            this.placeholderRect &&
                this.placeholderRect.attr("shape", {
                    x: this.x,
                    y: this.y,
                });
        }
    }

    editName(e) {
        if (this.readonly) {
            return;
        }
        this.name = this.data.name;
        const clientRect = this.container.getBoundingClientRect();
        const { position, scale } = this.rootGroup;
        const [offsetX, offsetY] = position;
        const [scaleX, scaleY] = scale;
        const rect = {
            x: this.x + (clientRect.left + offsetX) * scaleX,
            y: this.y + (clientRect.top + offsetY) * scaleY,
            w: this.w * scaleX,
            h: this.h * scaleY,
        };
        this._generateInputDom(rect);
    }

    setName(text) {
        this.rect.attr("style", {
            text,
        });
    }

    setWidth(w) {
        if (this.readonly) {
            return;
        }
        const { animation } = this.config;
        this.w = w;
        if (animation.switch) {
            this.rect.animateTo(
                {
                    shape: {
                        width: this.w,
                    },
                },
                animation.time,
                animation.easing
            );
            this.placeholderRect &&
                this.placeholderRect.animateTo(
                    {
                        shape: {
                            width: this.w,
                        },
                    },
                    animation.time,
                    animation.easing
                );
        } else {
            this.rect.attr("shape", { width: this.w });
            this.placeholderRect &&
                this.placeholderRect.attr("shape", { width: this.w });
        }
    }

    getNode() {
        return this.group;
    }
}
