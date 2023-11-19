import { Test, TestingModule } from '@nestjs/testing';
import { ResponseDetailService } from './response_detail.service';

describe('ResponseDetailService', () => {
  let service: ResponseDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseDetailService],
    }).compile();

    service = module.get<ResponseDetailService>(ResponseDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
