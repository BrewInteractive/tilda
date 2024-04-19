import { DataCordParams, DataCordResponseType } from '../models';
import { Test, TestingModule } from '@nestjs/testing';

import { DataCordProcessor } from './datacord.processor';
import axios from 'axios';
import { faker } from '@faker-js/faker';

jest.mock('axios');
const mockAxios = axios as jest.MockedFunction<typeof axios>;

describe('DataCordProcessor', () => {
  let dataCordProcessor: DataCordProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataCordProcessor],
    }).compile();

    dataCordProcessor = module.get<DataCordProcessor>(DataCordProcessor);
  });

  it('should return success response type', async () => {
    const tokenResponse = {
      status: 200,
      data: { Token: faker.lorem.paragraph() },
    };
    const dataCordResponse = {
      status: 200,
      headers: {},
      data: { Type: DataCordResponseType.NO_NEED_TO_REGISTER },
    };
    mockAxios
      .mockResolvedValueOnce(tokenResponse)
      .mockResolvedValueOnce(dataCordResponse);
    const params: DataCordParams = {
      url: faker.internet.url(),
      values: {
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        phoneNumber: faker.phone.number(),
        mailAddress: faker.internet.email(),
        birthDate: faker.date.past().toDateString(),
        datacordGuid: faker.lorem.word(),
        datacordUsername: faker.internet.userName(),
        datacordPassword: faker.internet.password(),
      },
    };

    const result = await dataCordProcessor.execute(params);

    expect(result).toEqual({
      response: {
        status: 200,
        headers: {},
        data: { Type: DataCordResponseType.NO_NEED_TO_REGISTER },
      },
      success: true,
    });
  });

  it('should return failure when token request fails', async () => {
    const params: DataCordParams = {
      url: faker.internet.url(),
      values: {
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        phoneNumber: faker.phone.number(),
        mailAddress: faker.internet.email(),
        birthDate: faker.date.past().toDateString(),
        datacordGuid: faker.lorem.word(),
        datacordUsername: faker.internet.userName(),
        datacordPassword: faker.internet.password(),
      },
    };
    const tokenResponse = {
      status: 400,
      headers: {},
      data: { Token: faker.lorem.paragraph() },
    };
    mockAxios.mockResolvedValueOnce(tokenResponse);

    const actual = await dataCordProcessor.execute(params);

    const expected = {
      response: {
        status: tokenResponse.status,
        headers: tokenResponse.headers,
        data: tokenResponse.data,
      },
      success: false,
    };

    expect(actual).toEqual(expected);
  });
});
