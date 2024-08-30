export interface INode {
    name?: string;
    children?: INode[];
    level?: number;
    [key: string]: any;
}
export interface IRect {
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    [key: string]: any;
}
export interface IRectConfig {
    w?: number;
    h?: number;
    bg?: string;
    textColor?: string;
    fontSize?: number;
    borderWidth?: number;
    hoverBorderColor?: string;
    clickBorderColor?: string;
    radius?: number;
    textPadding?: number;
    fontFamily?: string;
    fontWeight?: number;
}
export interface ILineConfig {
    w?: number;
    color?: string;
    radius?: number;
}
export interface IBtnConfig {
    lineWidth?: number;
    radius?: number;
}
export interface IConfig {
    w?: number;
    h?: number;
    cx?: number;
    cy?: number;
    rootNode?: IRectConfig;
    normalNode?: IRectConfig;
    space?: {
        x?: number;
        y?: number;
    };
    line?: ILineConfig;
    btn?: IBtnConfig;
    animation?: {
        switch?: boolean;
        time?: number;
        easing?: string;
    };
}
export type IBtnType = 1 | 0;
export interface IPoint2 {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
