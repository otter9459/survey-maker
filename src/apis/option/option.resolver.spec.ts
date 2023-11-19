import { Test, TestingModule } from '@nestjs/testing';
import { OptionResolver } from './option.resolver';

describe('OptionResolver', () => {
  let resolver: OptionResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OptionResolver],
    }).compile();

    resolver = module.get<OptionResolver>(OptionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
