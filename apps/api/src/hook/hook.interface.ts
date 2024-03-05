export interface HookInterface {
  execute(params: any, dataWithUi?: any): Promise<any>;
}
