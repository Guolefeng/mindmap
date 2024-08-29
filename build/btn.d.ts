import { ITree, IConfig, IBtnType } from './types';
interface IParams {
    x: number;
    y: number;
    data: ITree;
    type?: IBtnType;
    config: IConfig;
}
export default class Btn {
    x: number;
    y: number;
    data: ITree;
    type: number;
    config: IConfig;
    btn: any;
    constructor({ x, y, data, type, config }: IParams);
    _init(): void;
    setType(type: IBtnType): void;
    translate(dx: number, dy: number): void;
    getBtn(): any;
}
export {};
