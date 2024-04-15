import { faker } from '@faker-js/faker';
import { navigateToObjectProperty } from './object-helpers';

describe('WebHookProcessor', () => {
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
    const result = navigateToObjectProperty(object, propertyPath);
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
    const result = navigateToObjectProperty(object, propertyPath);
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
    const result = navigateToObjectProperty(object, propertyPath);
    expect(result).toBe(undefined);
  });
});
