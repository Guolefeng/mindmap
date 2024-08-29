import { default as Node } from './node';
import { default as Line } from './line';
import { default as Btn } from './btn';
import { ITree, IRect, IConfig, IBtnType, IPoint2 } from './types';
interface IParams {
    container: HTMLElement;
    data: ITree;
    readonly?: boolean;
    onNodeClick?: (data: ITree) => void;
    onZoom?: (scale: number) => void;
    onError?: (msg: string) => void;
}
export default class Mindmap {
    container: HTMLElement;
    data: ITree;
    readonly: boolean;
    onNodeClick: (data: ITree) => void;
    onZoom: (scale: number) => void;
    onError: (msg: string) => void;
    config: IConfig;
    selectedNodes: ITree[];
    dragSourceNode: ITree | null;
    dragTargetNode: ITree | null;
    isEditingText: boolean;
    rootGroup: any;
    zr: any;
    viewport: any;
    constructor({ container, data, readonly, onNodeClick, onZoom, onError, }: IParams);
    _setConfig(): void;
    _init(): void;
    _onKeyDown: (e: any) => void;
    _onMouseDown: () => void;
    _resetChildPosition(n: ITree, dx: number, dy: number, notTrans: boolean): void;
    _resetSlibingPosition(data: ITree, dy: number): void;
    /**
     * 新增节点
     * @param {*} targetData 目标节点信息，要在此节点新增子节点
     * @param {boolean} isSilbing true:新增兄弟节点 false:新增子节点
     * @param {*} newD 将要新增的节点数据
     * @returns 新节点数据
     */
    _addNode(targetData: ITree, isSilbing: boolean, newD: ITree | null): any;
    addSilbingNode(): void;
    addChildNode(): void;
    /**
     * 删除节点
     * @param {*} nodes 删除节点列表
     * @returns
     */
    removeNode(nodes?: ITree[]): void;
    onRectNodeClick(e: any, data: ITree): void;
    onTextChange(data: ITree): void;
    onMouseOver(e: any, data: ITree): void;
    onMouseOut(): void;
    onNodeMouseDown(e: any, data: ITree): void;
    onNodeMouseUp(data: ITree): void;
    addNode(source: ITree, target: ITree): void;
    _onNodeDoubleClick(e: any, data: ITree): void;
    _getNode({ x, y, w, h, data }: IRect): Node;
    _getBtn(x: number, y: number, data: ITree, type?: IBtnType): Btn;
    _getLine({ x1, y1, x2, y2 }: IPoint2): Line;
    _getTextWidth(data: ITree, level: number): number;
    _generateMap(): void;
    render(): void;
    findData: (id: number) => ITree;
    cancelSelected(): void;
    editName(): void;
    zoomMap(scale: number): void;
    dispose(): void;
}
export {};
