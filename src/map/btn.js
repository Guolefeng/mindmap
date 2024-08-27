/**
 * @desc 图谱中的按钮
 * @param {number} x
 * @param {number} y
 * @param {object} data 节点数据
 * @param {object} config 配置信息
 */

import zrender from "zrender";

export default class Btn {
    constructor({ x, y, data, type = 0, config }) {
        this.x = x;
        this.y = y;
        this.data = data;
        this.type = type;
        this.config = config;
        this._init();
    }

    _init() {
        const { symbolLineWidth, symbolRadius, lineColor, normalRect } =
            this.config;
        const Button = zrender.Path.extend({
            shape: {
                x: 0,
                y: 0,
                r: 0,
                type: 0,
            },
            buildPath: (path, shape) => {
                const x = shape.x;
                const y = shape.y;
                const r = shape.r;
                const w = 4;
                const type = shape.type;
                path.arc(x, y, r, 0, Math.PI * 2, false);
                if (type === 0) {
                    path.moveTo(x - r + w, y);
                    path.lineTo(x + r - w, y);
                    path.moveTo(x, y - r + w);
                    path.lineTo(x, y + r - w);
                } else if (type === 1) {
                    path.moveTo(x - r + w, y);
                    path.lineTo(x + r - w, y);
                }
            },
        });
        this.btn = new Button({
            shape: {
                x: this.x,
                y: this.y,
                r: symbolRadius,
                type: this.type,
            },
            style: {
                fill: "#fff",
                stroke: lineColor,
                lineWidth: symbolLineWidth,
            },
            z: 5,
        });
        this.btn.on("click", (e) => {
            if (e.target.shape.type === 0) {
                if (this.data.group) {
                    this.setType(1);
                }
            } else if (e.target.shape.type === 1) {
                this.setType(0);
            }
        });
        this.btn.on("mouseover", () => {
            this.btn.attr("style", {
                stroke: normalRect.clickBorderColor,
            });
        });
        this.btn.on("mouseout", () => {
            this.btn.attr("style", {
                stroke: lineColor,
            });
        });
    }

    // 修改按钮类型
    setType(type) {
        const { animation } = this.config;
        this.type = type;
        this.btn.attr("shape", { type });
        if (
            type === 1 &&
            this.data.group &&
            this.data.group.scale &&
            this.data.group.scale.some((s) => s === 0)
        ) {
            if (animation.switch) {
                this.data.group.animateTo(
                    {
                        scale: [1, 1],
                    },
                    animation.time,
                    animation.easing
                );
            } else {
                this.data.group.attr("scale", [1, 1]);
            }
        } else if (
            type === 0 &&
            this.data.group.scale &&
            this.data.group.scale &&
            this.data.group.scale.some((s) => s === 1)
        ) {
            if (animation.switch) {
                this.data.group.animateTo(
                    {
                        scale: [0, 0],
                    },
                    animation.time,
                    animation.easing
                );
            } else {
                this.data.group.attr("scale", [0, 0]);
            }
        }
    }

    translate(dx, dy) {
        const { animation } = this.config;
        this.x += dx;
        this.y += dy;
        if (animation.switch) {
            this.btn.animateTo(
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
            this.btn.attr("shape", {
                x: this.x,
                y: this.y,
            });
        }
    }

    getBtn() {
        return this.btn;
    }
}
