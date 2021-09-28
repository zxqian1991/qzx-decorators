import 'reflect-metadata';
export default class QzxDecorator {
    static getConstructorParamTypes<T extends new (...args: any[]) => any>(
        target: T
    ) {
        return Reflect.getMetadata('design:paramtypes', target) as any[];
    }
    static getPropertyParamType(target: Record<string, any>, property: string) {
        return Reflect.getMetadata('design:paramtypes', target, property);
    }
    static getPropertyType(target: Record<string, any>, property: string) {
        return Reflect.getMetadata('design:type', target, property) as any;
    }
    static getReturnType(target: Record<string, any>, property: string) {
        return Reflect.getMetadata(
            'design:returntype',
            target,
            property
        ) as any;
    }
    constructor() {}
    createClassDecoretor<P extends Array<any>>(
        h: (...args: P) => (t: new (...args: any[]) => any) => any = () =>
            () => {}
    ) {
        return h;
    }
    /**
     * 获取构造函数参数的构造器信息
     * @param index
     * @param target
     * @returns
     */

    getConstructorParamDecorateInfo(
        index: number,
        target: new (...args: any[]) => any
    ) {
        const data: IConstructorParamInfo[][] =
            Reflect.getMetadata('qzx:constructor:params', target.prototype) ||
            [];
        return {
            decorators: data[index],
            argType: QzxDecorator.getConstructorParamTypes(target)?.[index],
        };
    }
    /**
     * 获取成员函数的注解函数信息
     * @param property
     * @param index
     * @param target
     * @returns
     */

    getParamDecoratorInfo(
        target: Record<string, any>,
        property: string,
        index: number
    ) {
        const data: { [prop: string]: IConstructorParamInfo[][] } =
            Reflect.getMetadata('qzx:params', target) || {};
        return {
            decorators: data[property]?.[index],
            argType: QzxDecorator.getPropertyParamType(target, property)[index],
        };
    }

    getPropertyDecoratorInfo(target: Record<string, any>) {
        const data = Reflect.getMetadata('qzx:property', target) || {};
        return data;
    }

    createConstructorParamDecorator<P = any>(
        name: string,
        h: IParamHandler<P>
    ) {
        return (...args: any[]) =>
            (
                target: new (...args: any[]) => any,
                p: undefined,
                index: number
            ) => {
                if (
                    !Reflect.hasMetadata(
                        'qzx:constructor:params',
                        target.prototype
                    )
                ) {
                    Reflect.defineMetadata(
                        'qzx:constructor:params',
                        [],
                        target.prototype
                    );
                }
                const data = Reflect.getMetadata(
                    'qzx:constructor:params',
                    target.prototype
                ) as IConstructorParamInfo[][];
                if (!data[index]) {
                    data[index] = [];
                }
                data[index].push({ args, index, h, name });
            };
    }

    createParamTypeDecorator<P = any>(name: string, h: IParamHandler<P>) {
        return (...args: any[]) =>
            (target: Record<string, any>, p: string, index: number) => {
                if (!Reflect.hasMetadata('qzx:params', target)) {
                    Reflect.defineMetadata('qzx:params', {}, target);
                }
                const data = Reflect.getMetadata(
                    'qzx:params',
                    target.prototype
                ) as { [prop: string]: IConstructorParamInfo[][] };
                if (!data[p]) {
                    data[p] = [];
                }
                if (!data[p][index]) {
                    data[p][index] = [];
                }
                data[p][index].push({ args, index, h, name });
            };
    }
    createPropertyDecorator<P = any>(name: string, h: IPropertyHandler<P>) {
        return (...args: any[]) =>
            (
                target: Record<string, any>,
                p: string,
                descriptor: PropertyDescriptor
            ) => {
                if (!Reflect.hasMetadata('qzx:property', target)) {
                    Reflect.defineMetadata('qzx:property', {}, target);
                }
                const data = Reflect.getMetadata('qzx:property', target);
                if (!data[p]) {
                    data[p] = [];
                }
                data[p].push({
                    property: p,
                    h,
                    name,
                    descriptor,
                    args,
                });
            };
    }
}

export type IParamHandler<P> = (
    preValue: any,
    args: P,
    index: number,
    name: any,
    type: any
) => any;

export type IPropertyHandler<P> = (
    args: P,
    property: string,
    descriptor: PropertyDescriptor
) => any;

export interface IConstructorParamInfo<P = any> {
    name: string;
    args: P;
    index: number;
    h: IParamHandler<P>;
}

export interface IPropertyInfo<P = any> {
    h: IPropertyHandler<P>;
    property: string;
    descriptor: PropertyDescriptor;
    args: P;
    name: string;
}
