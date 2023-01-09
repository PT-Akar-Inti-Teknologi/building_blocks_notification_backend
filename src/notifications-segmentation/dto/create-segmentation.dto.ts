import { TargetUserTypeEnum } from '../../database/entities/segmentations.entity';
import { IsEnum } from 'class-validator';

export class CreateSegmentationDTO {
  name: string;

  is_active: boolean;

  @IsEnum(TargetUserTypeEnum)
  target_user_type: TargetUserTypeEnum;
}
