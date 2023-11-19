import { Test, TestingModule } from '@nestjs/testing';
import { ResponseDetailResolver } from './responseDetail.resolver';

describe('ResponseDetailResolver', () => {
  let resolver: ResponseDetailResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseDetailResolver],
    }).compile();

    resolver = module.get<ResponseDetailResolver>(ResponseDetailResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
