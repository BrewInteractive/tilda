import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import config from '../../../config/configuration';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  public constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isDisableApiKey = this.reflector.get<boolean>(
      'isDisableApiKey',
      context.getHandler(),
    );
    if (
      config().API_KEY === undefined ||
      config().API_KEY === null ||
      isDisableApiKey
    )
      return true;

    const request = context.switchToHttp().getRequest();
    if (request?.headers['x-api-key'] === config().API_KEY) return true;
    return false;
  }
}
