import { WebhookHttpMethod, WebhookParams } from '../../models';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { HookInterface } from '../models/hook.interface';
import { Injectable } from '@nestjs/common';
import { WebHookResponse } from '../models';
import { navigateToObjectProperty } from '../../utils/object-helpers';

@Injectable()
export class WebhookProcessor implements HookInterface {
  constructor() {}

  async execute(params: WebhookParams): Promise<WebHookResponse> {
    return this.sendWebhookAsync(params);
  }

  async sendWebhookAsync(params: WebhookParams): Promise<WebHookResponse> {
    try {
      const {
        url,
        headers: headerStrings,
        method,
        values,
        success_path,
      } = params;
      const headers = {};

      for (const header of headerStrings) {
        const index = header.indexOf(':');
        const key = header.substring(0, index).trim();
        const value = header.substring(index + 1).trim();
        headers[key] = value;
      }

      const requestData = {};
      for (const key in values) {
        requestData[key] = values[key];
      }

      const axiosConfig = {
        method,
        url,
        headers,
      } as AxiosRequestConfig;

      if (method === WebhookHttpMethod.POST) {
        axiosConfig.data = requestData;
      }

      if (method === WebhookHttpMethod.GET) {
        axiosConfig.params = requestData;
      }

      const result = await axios(axiosConfig);

      console.log('Webhook Request Detail:', axiosConfig);
      console.log('Webhook Response Detail:', result.status, result.data);

      const hookResult = {
        response: {
          status: result.status,
          headers: result.headers,
          data: result.data,
        },
        success: result.status === 200,
      } as WebHookResponse;

      if (success_path) {
        const navigationPath = success_path.substring(2);
        const result = navigateToObjectProperty(
          hookResult.response.data,
          navigationPath,
        );
        if (result !== undefined) {
          hookResult.success = result;
        }
      }

      return hookResult;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('AxiosError:', error.message);
        return {
          response: {
            status: error.response.status,
            headers: error.response.headers,
            data: error.response.data,
          },
          success: false,
        } as WebHookResponse;
      } else {
        console.error('Error Message:', error.message);
        throw error;
      }
    }
  }
}
