import { default as Node } from './node';
import { default as Line } from './line';
import { default as Btn } from './btn';
import { INode, IRect, IConfig, IBtnType, IPoint2 } from './types';
interface IParams {
    container: HTMLElement;
    data: INode;
    config?: IConfig;
    readonly?: boolean;
    onNodeClick?: (data: INode) => void;
    onZoom?: (scale: number) => void;
    onError?: (msg: string) => void;
}
export default class Mindmap {
    container: HTMLElement;
    data: INode;
    readonly: boolean;
    onNodeClick: (data: INode) => void;
    onZoom: (scale: number) => void;
    onError: (msg: string) => void;
    config: IConfig;
    selectedNodes: INode[];
    dragSourceNode: INode | null;
    dragTargetNode: INode | null;
    isEditingText: boolean;
    rootGroup: any;
    zr: any;
    viewport: any;
    nodeAreaHeight?: number;
    constructor({ container, data, config, readonly, onNodeClick, onError, }: IParams);
    setConfig(config: IConfig): void;
    private init;
    _onKeyDown: (e: any) => void;
    _onMouseDown: () => void;
    _resetChildPosition(n: INode, dx: number, dy: number, notTrans: boolean): void;
    _resetSlibingPosition(data: INode, dy: number): void;
    /**
     * 新增节点
     * @param {*} targetData 目标节点信息，要在此节点新增子节点
     * @param {boolean} isSilbing true:新增兄弟节点 false:新增子节点
     * @param {*} newD 将要新增的节点数据
     * @returns 新节点数据
     */
    _addNode(targetData: INode, isSilbing: boolean, newD: INode | null): any;
    addSilbingNode(): void;
    addChildNode(): void;
    /**
     * 删除节点
     * @param {*} nodes 删除节点列表
     * @returns
     */
    removeNode(nodes?: INode[]): void;
    onRectNodeClick(e: any, data: INode): void;
    onTextChange(data: INode): void;
    onMouseOver(e: any, data: INode): void;
    onMouseOut(): void;
    onNodeMouseDown(e: any, data: INode): void;
    onNodeMouseUp(data: INode): void;
    addNode(source: INode, target: INode): void;
    _onNodeDoubleClick(e: any, data: INode): void;
    _getNode({ x, y, w, h, data }: IRect): Node;
    _getBtn(x: number, y: number, data: INode, type?: IBtnType): Btn;
    _getLine({ x1, y1, x2, y2 }: IPoint2): Line;
    _getTextWidth(data: INode, level: number): number;
    render(): void;
    rerender(config: IConfig): void;
    findData: (id: number) => INode;
    cancelSelected(): void;
    editName(): void;
    zoomMap(scale: number): void;
    dispose(): void;
}
export {};
