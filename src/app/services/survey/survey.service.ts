import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

import { LiyYdmsAssessmentResultService } from '../models/liy.ydms.assessment.result.service';
import { LiyYdmsAssessmentQuestionService } from '../models/liy.ydms.assessment.question.service';
import { LiyYdmsAssessmentAnswerOptionService } from '../models/liy.ydms.assessment.answer.option.service';
import { LiyYdmsAssessmentAnswerResultService } from '../models/liy.ydms.assessment.answer.result.service';
import { ILiyYdmsAssessmentResult } from '../../shared/interfaces/models/liy.ydms.assessment.result';
import { AreaOfExpertise } from '../../shared/enums/area-of-expertise';
import { ISurvey, ISurveyOption, ISurveyQuestion } from '../../shared/interfaces/function-data/survey';
import { ILiyYdmsAssessmentAnswerOption } from '../../shared/interfaces/models/liy.ydms.assessment.answer.option';
import { AnswerType } from '../../shared/enums/answer-type';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  constructor(
    private authService: AuthService,
    private liyYdmsAssessmentResultService: LiyYdmsAssessmentResultService,
    private liyYdmsAssessmentQuestionService: LiyYdmsAssessmentQuestionService,
    private liyYdmsAssessmentAnswerOptionService: LiyYdmsAssessmentAnswerOptionService,
    private liyYdmsAssessmentAnswerResultService: LiyYdmsAssessmentAnswerResultService,
  ) {
  }

  /**
   * getConflictSurveyHistory
   * @param areaOfExpertise
   * @param offset
   * @param limit
   */
  public async getSurveyHistoryByAreaOfExpertise(
    areaOfExpertise: AreaOfExpertise,
    offset: number = 0,
    limit: number = 20
  ): Promise<ILiyYdmsAssessmentResult[]> {
    const authData = await this.authService.getAuthData();
    if (!authData) return [];
    return this.liyYdmsAssessmentResultService.getAssessmentResultByAreaOfExpertise(
      areaOfExpertise,
      authData.id,
      offset,
      limit,
    );
  }

  /**
   * Get survey detail by assessment result id
   * @param assessmentResultId
   */
  public async getSurveyDetail(
    assessmentResultId: number
  ): Promise<ISurvey | undefined> {
    // Dữ liệu khảo sát và Câu trả lời khảo sát
    const [assessmentResult, assessmentResultAnswer] = await Promise.all([
      this.liyYdmsAssessmentResultService.getAssessmentResultById(assessmentResultId),
      this.liyYdmsAssessmentAnswerResultService.getAnswersByAssessmentResultId(assessmentResultId)
    ]);

    if (!assessmentResult) return;

    // Lấy danh sách câu hỏi theo bảng hỏi
    const questions = await this.liyYdmsAssessmentQuestionService.getAssessmentQuestionsByAssessmentId(assessmentResult.assessment_id.id);
    if (!questions || questions.length === 0) return;

    // Lấy danh sách lựa chọn trả lời câu hỏi
    const uniqueQuestionIds = [...new Set(questions.flatMap(q => q.id))];
    let answerOptions: Array<ILiyYdmsAssessmentAnswerOption> = [];
    if (uniqueQuestionIds.length) {
      answerOptions = await this.liyYdmsAssessmentAnswerOptionService.getAnswerOptionsByQuestionIds(uniqueQuestionIds);
    }

    const surveyDetail: ISurvey = {
      assessment_result: assessmentResult,
      questions: new Array<ISurveyQuestion>(),
    };
    for (const question of questions) {
      const answerResult = assessmentResultAnswer?.find(u => u.question_id.id === question.id);
      if (!answerResult) continue;

      if (question.answer_type === AnswerType.INPUT_TEXT) {
        surveyDetail.questions.push({
          ...question,
          answer_text: answerResult.answer_text,
          answer_result_id: answerResult.id,
        });
        continue;
      }

      const options = answerOptions.filter(u => question.answer_ids.includes(u.id));
      const optionList: Array<ISurveyOption> = new Array<ISurveyOption>();
      for (const option of options) {
        optionList.push({
          ...option,
          selected: answerResult.answer_id?.id === option.id
        });
      }
      surveyDetail.questions.push({
        ...question,
        options: optionList,
        answer_id: answerResult.answer_id?.id,
        answer_result_id: answerResult.id,
      });
    }

    return surveyDetail;
  }

  /**
   * Get count survey pending
   * @param assigneeId
   * @param areaOfExpertise
   * @param month
   * @param year
   */
  public async getCountSurveyPendingInMonth(
    assigneeId: number,
    areaOfExpertise?: AreaOfExpertise,
    month?: number,
    year?: number,
  ): Promise<number> {
    return this.liyYdmsAssessmentResultService.getCountAssessmentResultPendingInMonth(
      assigneeId, areaOfExpertise, month, year
    );
  }

  /**
   * Get count survey pending
   * @param assigneeId
   * @param areaOfExpertise
   * @param month
   * @param year
   */
  public async getCountSurveyCompleteInMonth(
    assigneeId: number,
    areaOfExpertise?: AreaOfExpertise,
    month?: number,
    year?: number,
  ): Promise<number> {
    return this.liyYdmsAssessmentResultService.getCountAssessmentResultCompleteInMonth(
      assigneeId, areaOfExpertise, month, year
    );
  }

  /**
   * Get count survey pending
   * @param assigneeId
   * @param areaOfExpertise
   * @param month
   * @param year
   */
  public async getCountSurveyInMonth(
    assigneeId: number,
    month?: number,
    year?: number,
    areaOfExpertise?: AreaOfExpertise,
  ): Promise<number> {
    return this.liyYdmsAssessmentResultService.getCountAssessmentResultInMonth(
      assigneeId, month, year, areaOfExpertise
    );
  }

  /**
   * Get Survey Pending List
   * @param assigneeId
   * @param areaOfExpertise
   * @param month
   * @param year
   */
  public async getSurveyPendingListInMonth(
    assigneeId: number,
    areaOfExpertise?: AreaOfExpertise,
    month?: number,
    year?: number
  ): Promise<ILiyYdmsAssessmentResult[]> {
    return this.liyYdmsAssessmentResultService.getAssessmentResultPendingInMonth(
      assigneeId, areaOfExpertise, month, year
    );
  }

  /**
   *
   * @param assigneeId
   * @param month
   * @param year
   * @param areaOfExpertise
   */
  public async getSurveyListInMonth(
    assigneeId: number,
    month?: number,
    year?: number,
    areaOfExpertise?: string,
  ): Promise<ILiyYdmsAssessmentResult[]> {
    return this.liyYdmsAssessmentResultService.getAssessmentResultInMonth(
      assigneeId, month, year, areaOfExpertise
    );
  }

  /**
   * Updates the answers for a list of survey questions.
   * @param assessmentResultId
   * @param questions - Array of survey questions to update.
   * @returns A promise resolving to `true` if all updates succeed, `false` otherwise.
   */
  public async updateAnswer(
    assessmentResultId: number,
    questions: ISurveyQuestion[]
  ): Promise<boolean> {
    if (!questions || questions.length === 0) {
      throw new Error('No questions provided for update.');
    }

    try {
      // Update answer
      const updatePromises = questions.map((question) => {
        const body: any = {answer_id: question.answer_id, answer_text: question.answer_text};
        return this.liyYdmsAssessmentAnswerResultService.updateAnswersResult(
          question.answer_result_id,
          body
        );
      });

      // Update assessment result is_posted status
      updatePromises.push(this.liyYdmsAssessmentResultService.updateAssessmentResult(assessmentResultId, {is_posted: true}));

      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error('Failed to update answers:', error);
      return false;
    }
  }
}
