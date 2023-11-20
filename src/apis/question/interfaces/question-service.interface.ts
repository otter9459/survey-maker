import { CreateQuestionInput } from '../dto/create-question.input';

export interface IQuestionServiceCreate {
  surveyId: string;
  createQuestionInput: CreateQuestionInput;
}
