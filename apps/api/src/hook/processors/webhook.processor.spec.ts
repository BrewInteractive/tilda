import { Constants, WebhookHttpMethod, WebhookParams } from '../../models';
import { Test, TestingModule } from '@nestjs/testing';
import axios, { AxiosError, AxiosHeaders } from 'axios';

import { MockFactory } from 'mockingbird';
import { WebHookRequestFixture } from '../../../test/fixtures';
import { WebhookProcessor } from './webhook.processor';
import { faker } from '@faker-js/faker';

jest.mock('axios');
const mockAxios = axios as jest.MockedFunction<typeof axios>;

describe('WebHookProcessor', () => {
  let webHookProcessor: WebhookProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhookProcessor],
    }).compile();

    webHookProcessor = module.get<WebhookProcessor>(WebhookProcessor);
  });

  it('should send webhook successfully', async () => {
    const mockResponse = {
      data: faker.string.alpha(),
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    };
    mockAxios.mockResolvedValueOnce(mockResponse);
    const webHookRequest = MockFactory(WebHookRequestFixture).one();

    const result = await webHookProcessor.execute(webHookRequest);

    expect(result).toEqual({ response: mockResponse, success: true });
  });

  it('should handle error during webhook send', async () => {
    mockAxios.mockRejectedValueOnce(new Error('ERROR'));
    const webHookRequest = MockFactory(WebHookRequestFixture).one();

    await expect(webHookProcessor.execute(webHookRequest)).rejects.toThrow(
      'ERROR',
    );
  });

  it('should handle error during webhook send', async () => {
    const headers = new AxiosHeaders();

    const errorMock: AxiosError = new AxiosError('Axios error') as AxiosError;
    errorMock.name = 'AxiosError';
    errorMock.code = '500';
    errorMock.request = {};
    errorMock.response = {
      status: 500,
      statusText: 'Axios error',
      headers: { 'content-type': 'application/json' },
      config: { headers: headers },
      data: { errors: [{ detail: 'Internal Server Error' }] },
    };
    errorMock.isAxiosError = true;
    errorMock.toJSON = jest.fn();
    mockAxios.mockRejectedValueOnce(errorMock);

    const webHookRequest = MockFactory(WebHookRequestFixture).one();

    try {
      await webHookProcessor.execute(webHookRequest);
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      expect(error.response.status).toBe(500);
      expect(error.response.headers).toEqual({
        'content-type': 'application/json',
      });
      expect(error.response.data).toEqual({
        errors: [{ detail: 'Internal Server Error' }],
      });
      expect(console.error).toHaveBeenCalledWith(
        'Error Message:',
        'Axios error',
      );
    }
  });

  it('should set success based on the navigation of success_path', async () => {
    const nestedSuccessValue = true;
    const mockResponse = {
      data: {
        level1: {
          level2: {
            successIndicator: nestedSuccessValue,
          },
        },
      },
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    };
    mockAxios.mockResolvedValueOnce(mockResponse);

    const webHookRequest = {
      ...MockFactory(WebHookRequestFixture).one(),
      method: WebhookHttpMethod.POST,
      success_path: Constants.prefixPattern + 'level1.level2.successIndicator',
    } as WebhookParams;

    const result = await webHookProcessor.execute(webHookRequest);

    expect(result.success).toEqual(nestedSuccessValue);
  });

  it('should set success based on the success_path for GET method', async () => {
    const successPathValue = true;
    const mockResponse = {
      data: {
        someProperty: {
          anotherProperty: {
            targetProperty: successPathValue,
          },
        },
      },
      status: 200,
      headers: { 'content-type': 'application/json' },
    };
    mockAxios.mockResolvedValueOnce(mockResponse);

    const webHookRequest = {
      url: 'http://example.com/api/data',
      method: WebhookHttpMethod.GET,
      headers: {
        'content-type': 'application/json',
      },
      values: {},
      success_path:
        Constants.prefixPattern + 'someProperty.anotherProperty.targetProperty',
    };

    const result = await webHookProcessor.sendWebhookAsync(webHookRequest);

    expect(result.success).toEqual(successPathValue);
  });
});
