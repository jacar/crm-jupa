declare module 'class-transformer';
declare module 'compression';
declare module 'helmet';

declare module '@nestjs/config' {
  import { ModuleMetadata } from '@nestjs/common';
  
  export class ConfigService<K = Record<string, any>> {
    constructor(internalConfig?: Record<string, any>);
    get<T = any>(propertyPath: string, defaultValue?: T): T;
    get<T = any>(propertyPath: string, defaultValue?: T): T | undefined;
  }

  export class ConfigModule {
    static forRoot(options?: any): any;
    static forFeature(options?: any): any;
  }
}
