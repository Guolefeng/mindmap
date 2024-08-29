export interface ITree {
    name?: string;
    children?: ITree[];
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
}

export interface IConfig {
    w?: number;
    h?: number;
    cx?: number;
    cy?: number;
    textFill?: string;
    textPadding?: number;
    fontFamily?: string;
    fontWeight?: number;
    fontSize?: number;
    rootRect?: IRectConfig;
    normalRect?: IRectConfig;
    radius?: number;
    space?: { x?: number; y?: number };
    lineWidth?: number;
    lineColor?: string;
    symbolLineWidth?: number;
    symbolRadius?: number;
    nodeAreaHeight?: number;
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
