import { TargetUserTypeEnum } from '../entities/segmentations.entity';
import { IsEnum } from 'class-validator';

export class UpdateSegmentationDTO {
  name: string;

  is_active: boolean;

  @IsEnum(TargetUserTypeEnum)
  target_user_type: TargetUserTypeEnum;
}
