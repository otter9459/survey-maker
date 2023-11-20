import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from './entity/response.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ResponseService {
  constructor(
    @InjectRepository(Response)
    private readonly responseRepository: Repository<Response>,
  ) {}

  async create({ userId, surveyId, createResponseInput }) {
    return true;
  }
}
