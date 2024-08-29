/**
 * 画布视野设置模块
 */
interface IParams {
    container: HTMLElement;
    rootGroup: any;
    zr: any;
    onMouseDown?: Function;
    onZoom?: Function;
    scaleable?: boolean;
    SCALE_STEP?: number;
    SCALE_MIN?: number;
    SCALE_MAX?: number;
}
interface IReturn {
    setIsHoverNode: (isHover: boolean) => void;
    zoom: (scale: number) => void;
    dispose: () => void;
}
export declare const viewport: ({ container, rootGroup, zr, onMouseDown, onZoom, scaleable, SCALE_STEP, SCALE_MIN, SCALE_MAX, }: IParams) => IReturn;
export {};
