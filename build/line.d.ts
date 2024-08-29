import { IConfig } from './types';
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
    constructor({ x1, y1, x2, y2, config }: IParams);
    _init(): void;
    setConfig(config: IConfig): void;
    translate(dx1: number, dy1: number, dx2: number, dy2: number): void;
    setColor(color: string): void;
    getLine(): any;
}
export {};
