import { Hook } from '.';

export interface Hooks {
  pre?: Hook[];
  post?: Hook[];
}
