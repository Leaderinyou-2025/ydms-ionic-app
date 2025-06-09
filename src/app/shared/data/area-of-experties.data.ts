import { IAreaOfExpertiseOption } from '../interfaces/function-data/area-of-expertise-option';
import { AreaOfExpertise } from '../enums/area-of-expertise';
import { TranslateKeys } from '../enums/translate-keys';

/**
 * Shared area of expertise options data
 */
export const areaOfExpertiseData: IAreaOfExpertiseOption[] = [
    {
        area: AreaOfExpertise.EMOTION,
        title: TranslateKeys.AREA_OF_EXPERTISE_EMOTION
    },
    {
        area: AreaOfExpertise.CONFLICT,
        title: TranslateKeys.AREA_OF_EXPERTISE_CONFLICT
    },
    {
        area: AreaOfExpertise.COMMUNICATION,
        title: TranslateKeys.AREA_OF_EXPERTISE_COMMUNICATION
    },
    {
        area: AreaOfExpertise.DISCOVERY,
        title: TranslateKeys.AREA_OF_EXPERTISE_DISCOVERY
    }
];
