import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ResponseDetail,
  ResponseDetailOption,
} from './entity/responseDetail.entity';
import { InsertResult, Repository } from 'typeorm';

@Injectable()
export class ResponseDetailService {
  constructor(
    @InjectRepository(ResponseDetail)
    private readonly responseDetailRepository: Repository<ResponseDetail>,
    @InjectRepository(ResponseDetailOption)
    private readonly responseDetailOptionRepository: Repository<ResponseDetailOption>,
  ) {}

  async responseDetailOptionBulkInsert({
    responseDetailOptions,
  }): Promise<InsertResult> {
    return this.responseDetailOptionRepository.insert(responseDetailOptions);
  }

  async responseDetailBulkInsert({ responseDetails }): Promise<InsertResult> {
    return this.responseDetailRepository.insert(responseDetails);
  }

  async createResponseDetail({ responseDetails }) {
    const data = await this.responseDetailBulkInsert({ responseDetails });

    await Promise.all(
      responseDetails.map(async (detailData, i) => {
        const result = await this.responseDetailOptionBulkInsert({
          responseDetailOptions: detailData.option_content,
        });

        await this.responseDetailRepository.save({
          id: data.identifiers[i].id,
          option_content: result.identifiers,
        });
      }),
    );

    return data.identifiers;
  }

  async updateResponseDetail({ responseDetailUpdateData }) {
    for (const data of responseDetailUpdateData) {
      const { id, ...updateData } = data;
      await this.responseDetailOptionRepository.delete({
        responseDetail: { id },
      });

      const result = await this.responseDetailOptionBulkInsert({
        responseDetailOptions: updateData.option_content,
      });

      await this.responseDetailRepository.save({
        id,
        option_content: result.identifiers,
      });
    }

    return true;
  }
}
