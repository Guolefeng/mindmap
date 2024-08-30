/**
 * @desc 脑图中的节点
 */
import * as zrender from "zrender";
import type { INode, IConfig, IRect } from "./types";

interface IParams {
    container: HTMLElement;
    rootGroup: zrender.Group;
    x: number;
    y: number;
    w: number;
    h: number;
    data: INode;
    readonly: boolean;
    config: IConfig;
    onNodeClick: (e: any, data: INode) => void;
    onTextChange: (data: INode) => void;
    onNodeDoubleClick: (e: any, data: INode) => void;
    onNodeMouseUp: (e: any, data: INode) => void;
    onNodeMouseDown: (e: any, data: INode) => void;
    onNodeMouseEnter: (e: any, data: INode) => void;
    onNodeMouseLeave: () => void;
}

export default class Node {
    container: HTMLElement;
    rootGroup: zrender.Group;
    x: number;
    y: number;
    w: number;
    h: number;
    data: INode;
    readonly: boolean;
    config: IConfig;
    group: any;
    rect: any;
    placeholderRect: zrender.Rect;
    moveable: boolean;
    isSelected: boolean;
    timer: any;
    inputDom: HTMLInputElement;
    onNodeClick: (e: any, data: INode) => void;
    onTextChange: (data: INode) => void;
    onNodeDoubleClick: (e: any, data: INode) => void;
    onNodeMouseDown: (e: any, data: INode) => void;
    onNodeMouseUp: (e: any, data: INode) => void;
    onNodeMouseEnter: (e: any, data: INode) => void;
    onNodeMouseLeave: (e: any, data: INode) => void;

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
    }: IParams) {
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
        this.isSelected = false;
        this.init();
    }

    private init() {
        const { rootNode, normalNode } = this.config;

        this.group = new zrender.Group({
            draggable: false,
        });
        const r = this.data.level === 0 ? rootNode : normalNode;
        this.rect = new zrender.Rect({
            shape: {
                r: r.radius,
                x: this.x,
                y: this.y,
                width: this.w,
                height: this.h,
            },
            style: {
                stroke: r.bg,
                lineWidth: r.borderWidth,
                fill: r.bg,
                text: this.data.name,
                textFill: r.textColor,
                fontSize: r.fontSize,
                fontFamily: r.fontFamily,
                fontWeight: r.fontWeight,
                transformText: true, // 跟随group缩放
            },
            z: 10,
        });
        this.rect.id = this.data.id;
        this.group.add(this.rect);

        // 创建拖拽时的占位矩形
        if (this.data.level !== 0) {
            // 根节点除外
            this.placeholderRect = this.getPlaceholderRect();
            this.data.fatherNode.group.add(this.placeholderRect);
            this.placeholderRect.on("mouseup", (e: any) => {
                this.onMouseUp();
            });
        }

        this.group.on("dblclick", (e: any) => {
            this.timer && clearTimeout(this.timer);
            this.onNodeDoubleClick(e, this.data);
            e.event.preventDefault();
            e.event.stopPropagation();
            this.editName();
        });
        this.group.on("click", (e: any) => {
            this.timer && clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                e.event.preventDefault();
                e.event.stopPropagation();
                this.onNodeClick(e, this.data);
            }, 100);
        });
        this.group.on("mouseover", (e: any) => {
            if (!this.isSelected) {
                this.rect.attr("style", {
                    stroke: r.hoverBorderColor,
                });
            }
            this.onNodeMouseEnter(e, this.data);
        });
        this.group.on("mouseout", (e: any) => {
            if (!this.isSelected) {
                this.rect.attr("style", {
                    stroke: r.bg,
                });
            }
            this.onNodeMouseLeave(e, this.data);
        });
        this.group.on("mousedown", (e: any) => {
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
        this.group.on("mousemove", (e: any) => {
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
            if (this.data.btn?.type === 1) {
                this.data.btn.setType(0);
            }
            if (this.data.lineBeforeBtn?.line?.style !== rootNode.bg) {
                this.data.lineBeforeBtn?.setColor?.(rootNode.bg);
            }
            if (this.data.lineBeforeNode?.line?.z === 1) {
                this.data.lineBeforeNode?.line?.attr("z", 2);
            }
            if (this.data.lineBeforeNode?.line?.style !== rootNode.bg) {
                this.data.lineBeforeNode?.setColor?.(rootNode.bg);
            }
            if (this.placeholderRect?.invisible) {
                this.placeholderRect.attr("invisible", false);
            }
        });
        this.group.on("mouseup", (e: any) => {
            if (this.readonly) {
                return;
            }

            this.group.attr("draggable", false);
            this.onMouseUp();
            this.onNodeMouseUp(e, this.data);
        });
    }

    onMouseUp() {
        const { line } = this.config;
        const lineColor = line.color;
        this.group.attr("position", [0, 0]);
        this.group.attr("scale", [1, 1]);
        this.rect.attr("z", 10);
        if (this.data.btn?.type === 0) {
            this.data.btn?.setType(1);
        }
        if (this.data.lineBeforeBtn?.line?.style !== lineColor) {
            this.data.lineBeforeBtn?.setColor?.(lineColor);
        }
        if (this.data.lineBeforeNode?.line?.z === 2) {
            this.data.lineBeforeNode?.line?.attr("z", 1);
        }
        if (this.data.lineBeforeNode?.line?.style !== lineColor) {
            this.data.lineBeforeNode?.setColor?.(lineColor);
        }
        if (this.placeholderRect?.invisible) {
            this.placeholderRect.attr("invisible", true);
        }
        this.moveable = false;
    }

    getPlaceholderRect() {
        const { rootNode, normalNode } = this.config;

        return new zrender.Rect({
            shape: {
                r: normalNode.radius,
                x: this.x,
                y: this.y,
                width: this.w,
                height: this.h,
            },
            style: {
                fill: rootNode.bg,
            },
            z: 9,
            silent: false,
            invisible: true,
        });
    }

    // 双击生成文本输入框
    generateInputDom({ x, y, w, h }: IRect) {
        if (!x || !y || !w || !h) {
            return;
        }
        const { rootNode, normalNode, animation } = this.config;
        const r = this.data.level === 0 ? rootNode : normalNode;
        // 编辑框
        let input: any = document.createElement("input");
        input.style = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            padding: 0 ${r.textPadding};
            width: ${w}px;
            height: ${h}px;
            border-radius: ${r.radius}px;
            outline: none;
            border: none;
            font-size: ${r.fontSize};
            font-family: ${r.fontFamily};
            font-weight: ${r.fontWeight};
            border-radius: ${r.radius}px;
            border: 2px solid ${r.bg};
            z-index: 10;
            background: ${r.bg};
            box-sizing: border-box;
            text-align: center;
        `;
        input.value = this.data.name;
        input.onkeyup = (e: any) => {
            e.stopPropagation();
            e.preventDefault();
            if (e.keyCode === 13) {
                input.blur();
                return;
            }
            this.data.name = e.target.value;
        };
        input.onblur = (e: any) => {
            this.onTextChange(this.data);
            input.autofocus = false;
            document.body.removeChild(input);
        };
        document.body.appendChild(input);
        setTimeout(() => {
            input.focus();
        }, animation.time);
    }

    // 选中节点
    selectNode() {
        const { rootNode, normalNode } = this.config;
        this.isSelected = true;
        this.rect.attr("style", {
            stroke:
                this.data.level === 0
                    ? rootNode.clickBorderColor
                    : normalNode.clickBorderColor,
        });
    }

    // 取消选中节点
    cancelNode() {
        const { rootNode, normalNode } = this.config;
        this.isSelected = false;
        this.rect.attr("style", {
            stroke: this.data.level === 0 ? rootNode.bg : normalNode.bg,
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

    editName() {
        if (this.readonly) {
            return;
        }
        // this.name = this.data.name;
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
        this.generateInputDom(rect);
    }

    setName(text: string) {
        this.rect.attr("style", {
            text,
        });
    }

    setWidth(w: number) {
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
            this.placeholderRect?.animateTo(
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
            this.placeholderRect?.attr("shape", { width: this.w });
        }
    }

    getNode() {
        return this.group;
    }
}
