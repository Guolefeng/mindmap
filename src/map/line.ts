/**
 * @desc 节点之间连线
 */
import * as zrender from "zrender";
import type { IConfig } from "./types";

interface IParams {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    config: IConfig;
}

export default class Line {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    config: IConfig;
    line: any;

    constructor({ x1 = 0, y1 = 0, x2 = 0, y2 = 0, config = {} }: IParams) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.config = config;
        this._init();
    }

    _init() {
        const { lineWidth, lineColor, radius } = this.config;
        // @ts-ignore
        const Line = zrender.Path.extend({
            shape: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0,
                interval: 0,
                radius: 0,
            },
            buildPath: (path: any, shape: any) => {
                const x1 = shape.x1;
                const y1 = shape.y1;
                const x2 = shape.x2;
                const y2 = shape.y2;
                const r = shape.radius;
                path.moveTo(x1, y1);
                if (y1 > y2) {
                    path.lineTo(x1, y2 + r);
                    path.arc(
                        x1 + r,
                        y2 + r,
                        r,
                        Math.PI,
                        (3 * Math.PI) / 2,
                        false
                    );
                } else if (y1 < y2) {
                    path.lineTo(x1, y2 - r);
                    path.arc(x1 + r, y2 - r, r, Math.PI, Math.PI / 2, true);
                }
                path.lineTo(x2, y2);
            },
        });
        this.line = new Line({
            shape: {
                x1: this.x1,
                y1: this.y1,
                x2: this.x2,
                y2: this.y2,
                radius,
            },
            style: {
                lineWidth,
                fill: "transparent",
                stroke: lineColor,
            },
            z: 1,
        });
    }

    setConfig(config: IConfig) {
        this.config = config;
    }

    translate(dx1: number, dy1: number, dx2: number, dy2: number) {
        const { animation } = this.config;
        this.x1 += dx1;
        this.y1 += dy1;
        this.x2 += dx2;
        this.y2 += dy2;
        if (animation.switch) {
            this.line.animateTo(
                {
                    shape: {
                        x1: this.x1,
                        y1: this.y1,
                        x2: this.x2,
                        y2: this.y2,
                    },
                },
                animation.time,
                animation.easing
            );
        } else {
            this.line.attr("shape", {
                x1: this.x1,
                y1: this.y1,
                x2: this.x2,
                y2: this.y2,
            });
        }
    }

    setColor(color: string) {
        this.line.attr("style", {
            stroke: color,
        });
    }

    getLine() {
        return this.line;
    }
}
