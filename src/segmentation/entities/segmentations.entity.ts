import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ModelBase } from '../../base/model/model.base';
import { PushNotificationsDocument } from '../../push-notification/entities/push_notifications.entity';

export enum TargetUserTypeEnum {
  ALL_USER = 'ALL_USER',
  FILTER_USER = 'FILTER_USER',
  UPLOAD_USER = 'UPLOAD_USER',
}

@Entity({ name: 'notifications_segmentations' })
export class SegmentationsDocument extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 350 })
  name: string;

  @Column({ type: 'boolean' })
  is_active: boolean;

  @Column({
    type: 'enum',
    enum: TargetUserTypeEnum,
    default: TargetUserTypeEnum.ALL_USER,
  })
  target_user_type: TargetUserTypeEnum;

  @OneToMany(() => PushNotificationsDocument, (model) => model.segmentation)
  push_notifications: PushNotificationsDocument[];
}
