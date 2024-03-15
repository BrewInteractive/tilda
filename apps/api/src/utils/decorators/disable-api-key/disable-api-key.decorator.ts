import { SetMetadata } from '@nestjs/common';

export const DisableApiKey = () => SetMetadata('isDisableApiKey', true);
