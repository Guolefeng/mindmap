import { INode, IConfig, IRect } from "./types";
interface IParams {
    container: HTMLElement;
    rootGroup: any;
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
    rootGroup: any;
    x: number;
    y: number;
    w: number;
    h: number;
    level: number;
    data: INode;
    readonly: boolean;
    config: IConfig;
    group: any;
    rect: any;
    placeholderRect: any;
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
        x,
        y,
        w,
        h,
        data,
        readonly,
        config,
        onNodeClick,
        onTextChange,
        onNodeDoubleClick,
        onNodeMouseDown,
        onNodeMouseUp,
        onNodeMouseEnter,
        onNodeMouseLeave,
    }: IParams);
    _init(): void;
    onMouseUp(): void;
    _getPlaceholderRect(): any;
    _generateInputDom({ x, y, w, h }: IRect): void;
    selectNode(): void;
    cancelNode(): void;
    translate(dx?: number, dy?: number): void;
    editName(): void;
    setName(text: string): void;
    setWidth(w: number): void;
    getNode(): any;
}
export {};
