import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseDetail } from './entity/responseDetail.entity';
import { InsertResult, Repository } from 'typeorm';

@Injectable()
export class ResponseDetailService {
  constructor(
    @InjectRepository(ResponseDetail)
    private readonly responseDetailRepository: Repository<ResponseDetail>,
  ) {}

  bulkInsert({ responseDetails }): Promise<InsertResult> {
    return this.responseDetailRepository.insert(responseDetails);
  }

  async createResponseDetail({ responseDetails }) {
    const data = await this.bulkInsert({ responseDetails });

    return data.identifiers;
  }
}
