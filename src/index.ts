import 'reflect-metadata';

type TConstructor = new (...args: any[]) => any;
// 创建类注解
const CLASS_DECORATOR_INFO = Symbol();
export type IClassDecoratorHandler<P extends Array<any>> = (
    info: IClassDecoratorInfo<P>
) => any;
export interface IClassDecoratorInfo<P extends Array<any>> {
    name: string;
    args: P;
    constructor: new (...args: any[]) => any;
    handler?: IClassDecoratorHandler<P>;
}
export function getClassDecoratorInfos(constructor: TConstructor) {
    return (Reflect.getMetadata(CLASS_DECORATOR_INFO, constructor) ||
        []) as IClassDecoratorInfo<any>[];
}
export function createClassDecorator<P extends Array<any>>(
    name: string,
    handler?: IClassDecoratorHandler<P>,
    append = true
) {
    return (...args: P) =>
        (constructor: TConstructor) => {
            const info: IClassDecoratorInfo<P> = {
                name,
                args,
                constructor,
                handler,
            };
            if (append) {
                if (!Reflect.hasMetadata(CLASS_DECORATOR_INFO, constructor)) {
                    Reflect.defineMetadata(
                        CLASS_DECORATOR_INFO,
                        [],
                        constructor
                    );
                }
                const decorators = Reflect.getMetadata(
                    CLASS_DECORATOR_INFO,
                    constructor
                ) as IClassDecoratorInfo<any>[];
                decorators.push(info);
            }

            if (handler && typeof handler === 'function') {
                handler(info);
            }
        };
}

/**
 * 处理成员注解
 */
const PROPERTY_DECORATOR = Symbol();
export type IPropertyDecoratorHandler<P extends Array<any>> = (
    info: IPropertyDecoratorInfo<P>
) => any;

export interface IPropertyDecoratorInfo<P extends Array<any>> {
    name: string;
    args: P;
    handler?: IPropertyDecoratorHandler<P>;
    target: Record<string, any>;
    property: string;
    descriptor: PropertyDescriptor;
}
export function getPropertyDecoratorInfos(target: Record<string, any>) {
    return (Reflect.getMetadata(PROPERTY_DECORATOR, target) || {}) as Record<
        string,
        IPropertyDecoratorInfo<any>[]
    >;
}
export function getPropertyDecoratorInfo(
    target: Record<string, any>,
    property: string
) {
    return getPropertyDecoratorInfos(target)[property] || [];
}
export function createPropertyDecorator<P extends Array<any>>(
    name: string,
    handler?: IPropertyDecoratorHandler<P>,
    append = true
) {
    return (...args: P) =>
        (
            target: Record<string, any>,
            property: string,
            descriptor: PropertyDescriptor
        ) => {
            const info: IPropertyDecoratorInfo<P> = {
                name,
                args,
                handler,
                target,
                property,
                descriptor,
            };
            if (append) {
                if (!Reflect.hasMetadata(PROPERTY_DECORATOR, target)) {
                    Reflect.defineMetadata(PROPERTY_DECORATOR, {}, target);
                }
                const obj = Reflect.getMetadata(
                    PROPERTY_DECORATOR,
                    target
                ) as Record<string, IPropertyDecoratorInfo<any>[]>;
                if (!obj[property]) {
                    obj[property] = [];
                }
                const decorators = obj[property];
                decorators.push(info);
            }

            if (handler && typeof handler === 'function') {
                handler(info);
            }
        };
}

/**
 * 处理参数注解
 */
const PARAM_DECORATOR = Symbol();
export type IParamDecoratorHandler<P extends Array<any> = any> = (
    info: IParamDecoratorInfo<P>
) => any;
export interface IParamDecoratorInfo<P extends Array<any> = any> {
    name: string;
    target: Record<string, any>;
    property: string;
    index: number;
    args: P;
    handler?: IParamDecoratorHandler<P>;
}

export function getParamDecoratorInfos(target: Record<string, any>) {
    return (Reflect.getMetadata(PARAM_DECORATOR, target) || {}) as Record<
        string,
        IParamDecoratorInfo[][]
    >;
}
export function getParamDecoratorInfo(
    target: Record<string, any>,
    property: string
) {
    return getParamDecoratorInfos(target)[property] || [];
}

export function createParamDecorator<P extends Array<any>>(
    name: string,
    handler?: (info: IParamDecoratorInfo<P>) => any
) {
    return (...args: P) =>
        (target: Record<string, any>, property: string, index: number) => {
            const info = {
                name,
                target,
                property,
                index,
                args,
                handler,
            };
            if (!Reflect.hasMetadata(PARAM_DECORATOR, target)) {
                Reflect.defineMetadata(PARAM_DECORATOR, {}, target);
            }
            const obj = (Reflect.getMetadata(PARAM_DECORATOR, target) ||
                {}) as Record<string, IParamDecoratorInfo[][]>;
            if (!obj[property]) {
                obj[property] = [];
            }
            if (!obj[property][index]) {
                obj[property][index] = [];
            }
            const decorators: IParamDecoratorInfo[] = obj[property][index];
            decorators.push(info);
        };
}
