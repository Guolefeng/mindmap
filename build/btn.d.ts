import { INode, IConfig, IBtnType } from './types';
interface IParams {
    x: number;
    y: number;
    data: INode;
    type?: IBtnType;
    config: IConfig;
}
export default class Btn {
    x: number;
    y: number;
    data: INode;
    type: IBtnType;
    config: IConfig;
    btn: any;
    constructor({ x, y, data, type, config }: IParams);
    private init;
    setType(type: IBtnType): void;
    translate(dx: number, dy: number): void;
    getBtn(): any;
}
export {};
