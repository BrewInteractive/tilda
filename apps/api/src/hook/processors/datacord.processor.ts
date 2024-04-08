import {
  DataCordParams,
  DataCordResponse,
  DataCordResponseType,
  HookResponse,
} from '../models';
import axios, { AxiosResponse } from 'axios';

import { ConfigService } from '@nestjs/config';
import { HookInterface } from '../models/hook.interface';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DataCordProcessor implements HookInterface {
  constructor(private readonly configService: ConfigService) {}
  async execute(params: DataCordParams): Promise<HookResponse> {
    const tokenResult = await this.getToken();

    if (tokenResult.status !== 200) {
      return {
        response: {
          status: tokenResult.status,
          headers: tokenResult.headers,
          data: tokenResult.data,
        },
        success: false,
      } as DataCordResponse;
    }

    const token = tokenResult.data.Token;

    const postData = new URLSearchParams({
      LanguageCode: 'tr',
      Guid: uuidv4(),
      Name: params.values.name,
      Surname: params.values.surname,
      PhoneNumber: params.values.phoneNumber,
      MailAddress: params.values.mailAddress,
      BirthDate: params.values.birthDate,
      VendorCode: '',
      LocalId: '',
      LocalPageUrl: this.configService.get('DATACORD.PAGE_URL'),
    });

    const result = await axios({
      method: 'POST',
      url: `${this.configService.get(
        'DATACORD.URL',
      )}/api/Tani/GetAuthenticationForms`,
      data: postData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + token,
      },
    });

    return {
      response: {
        status: result.status,
        headers: result.headers,
        data: result.data,
      },
      success: result.data.Type === DataCordResponseType.NO_NEED_TO_REGISTER,
    } as DataCordResponse;
  }

  private async getToken(): Promise<AxiosResponse<any, any>> {
    const postData = new URLSearchParams({
      Username: this.configService.get('DATACORD.USER'),
      Password: this.configService.get('DATACORD.PASSWORD'),
    });

    const result = await axios({
      method: 'POST',
      url: `${this.configService.get(
        'DATACORD.URL',
      )}/api/Tani/AccountConfirmation`,
      data: postData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return result;
  }
}
