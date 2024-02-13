import { Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { PostHookRequest } from './models';

@Injectable()
export class HookService {
  async sendWebhookAsync(params: PostHookRequest): Promise<any> {
    try {
      const { url, headers, method, values } = params;

      const requestData = {};
      for (const key in values) {
        requestData[key] = values[key];
      }

      await axios({
        method,
        url,
        headers,
        data: requestData,
      });

      return { success: true };
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error Message:', error.message);
      } else {
        console.error('Eror Message:', error.message);
        throw error;
      }
    }
  }
}
