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
      headers: ['content-type: application/json'],
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

  it('should navigate to the specified property and return its value', () => {
    const object = {
      user: {
        id: 1,
        name: faker.person.fullName(),
        contact: {
          email: faker.internet.email(),
          phone: faker.phone.number(),
        },
      },
    };

    const propertyPath = 'user.contact.email';
    const result = webHookProcessor.navigateToObjectProperty(
      object,
      propertyPath,
    );
    expect(result).toBe(object.user.contact.email);
  });

  it('should return undefined for non-existent property path', () => {
    const object = {
      user: {
        id: 1,
        name: faker.person.fullName(),
      },
    };

    const propertyPath = 'user.contact.email';
    const result = webHookProcessor.navigateToObjectProperty(
      object,
      propertyPath,
    );
    expect(result).toBeUndefined();
  });

  it('should handle empty property path', () => {
    const object = {
      user: {
        id: 1,
        name: faker.person.fullName(),
      },
    };

    const propertyPath = '';
    const result = webHookProcessor.navigateToObjectProperty(
      object,
      propertyPath,
    );
    expect(result).toBe(undefined);
  });
});
