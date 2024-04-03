import {
  DataCordParams,
  DataCordResponse,
  DataCordResponseType,
  HookResponse,
} from './models';
import axios, { AxiosRequestConfig } from 'axios';

import { HookInterface } from './models/hook.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DataCordProcessor implements HookInterface {
  constructor() {}
  async execute(params: DataCordParams): Promise<HookResponse> {
    const axiosConfig = {
      method: 'post',
      url: `${process.env.DATACORD_URL}/api/Tani/AccountConfirmation`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: `Username=${process.env.DATACORD_USER}&Password=${process.env.DATACORD_PASSWORD}`,
    };

    const tokenResult = await axios(axiosConfig);

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

    const dataCordConfig = {
      method: 'post',
      url: `${process.env.DATACORD_URL}/api/Tani/GetAuthenticationForms`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
      },
      data: `LanguageCode=tr&Guid=${process.env.DATACORD_GUID}&Name=${params.values.name}&Surname=${params.values.surname}&PhoneNumber=${params.values.phoneNumber}&MailAddress=${params.values.mailAddress}&BirthDate=${params.values.birthDate}&VendorCode=&LocalId=&LocalPageUrl=${process.env.DATACORD_PAGE_URL}`,
    } as AxiosRequestConfig;

    const result = await axios(dataCordConfig);

    return {
      response: {
        status: result.status,
        headers: result.headers,
        data: result.data,
      },
      success: result.data.Type === DataCordResponseType.NO_NEED_TO_REGISTER,
    } as DataCordResponse;
  }
}
