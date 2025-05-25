import { Injectable } from '@angular/core';
import { OdooService } from '../odoo/odoo.service';
import { ModelName } from '../../shared/enums/model-name';
import { ILiyYdmsAssessment } from '../../shared/interfaces/models/liy.ydms.assessment';
import { CommonConstants } from "../../shared/classes/common-constants";

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsAssessmentService {
  // Fields for assessment model
  private fields = [
    'name',
    'area_of_expertise',
    'question_ids',
    'execution_date'
  ];

  constructor(
    private odooService: OdooService
  ) { }

  /**
   * Get assessment details by ID
   * @param assessmentId Assessment ID
   * @returns Assessment details or null if not found
   */
  public async getAssessmentById(assessmentId: number): Promise<ILiyYdmsAssessment | null> {
    try {
      let assessmentDetail = await this.odooService.read<ILiyYdmsAssessment>(
        ModelName.ASSESSMENT,
        [assessmentId],
        this.fields
      );
      assessmentDetail = CommonConstants.convertArr2ListItem(assessmentDetail);
      return assessmentDetail?.length ? assessmentDetail[0] : null;
    } catch (error) {
      console.error('ERROR getting assessment details:', error);
      return null;
    }
  }
}
