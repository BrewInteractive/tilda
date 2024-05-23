import {
  DataCordParams,
  DataCordResponse,
  DataCordResponseType,
  HookResponse,
} from '../models';
import axios, { AxiosResponse } from 'axios';

import { HookInterface } from '../models/hook.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DataCordProcessor implements HookInterface {
  async execute(params: DataCordParams): Promise<HookResponse> {
    const tokenResult = await this.getToken(params);

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
      Guid: params.values.datacordGuid,
      Name: params.values.name,
      Surname: params.values.surname,
      PhoneNumber: params.values.phoneNumber,
      MailAddress: params.values.mailAddress,
      BirthDate: params.values.birthDate,
    });

    const result = await axios({
      method: 'POST',
      url: `${params.url}/api/Tani/GetAuthenticationForms`,
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

  private async getToken(
    params: DataCordParams,
  ): Promise<AxiosResponse<any, any>> {
    const postData = new URLSearchParams({
      Username: params.values.datacordUsername,
      Password: params.values.datacordPassword,
    });

    const result = await axios({
      method: 'POST',
      url: `${params.url}/api/Tani/AccountConfirmation`,
      data: postData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return result;
  }
}
