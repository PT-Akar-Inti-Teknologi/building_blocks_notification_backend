import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ModelBase } from '../../base/model/model.base';
import { PushNotificationClickResponsesDocument } from './push_notification_click_responses.entity';
import { PushNotificationUsersDocument } from './push_notification_users.entity';

export enum EnumDevice {
  ALL = 'ALL',
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

export enum EnumPushNotificationsStatus {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  READY = 'READY',
  PENDING = 'PENDING',
}

export enum EnumMessageType {
  STANDARD = 'STANDARD',
  OTHER_SEGMENT = 'OTHER_SEGMENT',
}

export enum EnumSegments {
  ALL_USERS = 'ALL_USERS',
  SELECT_USERS = 'SELECT_USERS',
}

export enum EnumDeliveryOptions {
  SEND_WITH_SCHEDULE = 'SEND_WITH_SCHEDULE',
  SEND_AS_SOON = 'SEND_AS_SOON',
}

export enum EnumDeliveryType {
  ONCE = 'ONCE',
  RECURRING = 'RECURRING',
}

@Entity({ name: 'notifications_push_notifications' })
export class PushNotificationsDocument extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 350 })
  name: string;

  @Column({ length: 350 })
  title: string;

  @Column({ length: 1000 })
  messages: string;

  @Column({
    type: 'enum',
    enum: EnumMessageType,
    default: EnumMessageType.STANDARD,
  })
  message_type: EnumMessageType;

  @Column({
    type: 'enum',
    enum: EnumPushNotificationsStatus,
    default: EnumPushNotificationsStatus.ACTIVE,
  })
  status: EnumPushNotificationsStatus;

  segments_id: string;

  @Column({
    type: 'enum',
    enum: EnumDeliveryOptions,
    default: EnumDeliveryOptions.SEND_WITH_SCHEDULE,
  })
  delivery_options: EnumDeliveryOptions;

  @Column({
    type: 'enum',
    enum: EnumDeliveryType,
    default: EnumDeliveryType.ONCE,
  })
  delivery_type: EnumDeliveryType;

  @Column({
    default: 'https://dummyimage.com/600x400/968a96/ffffff&text=Photo+Image',
  })
  image: string;

  @Column({
    type: 'enum',
    enum: EnumDevice,
    default: EnumDevice.ALL,
  })
  device: EnumDevice;

  @Column({ type: 'varchar', nullable: true })
  content_reference: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'time' })
  time: Date;

  @Column({ type: 'boolean' })
  is_active: boolean;

  @Column({ name: 'push_notification_click_response_id', nullable: true })
  push_notification_click_response_id: string;

  @ManyToOne(
    () => PushNotificationClickResponsesDocument,
    (model) => model.push_notifications,
  )
  @JoinColumn({ name: 'push_notification_click_response_id' })
  click_response: PushNotificationClickResponsesDocument;

  @OneToMany(
    () => PushNotificationUsersDocument,
    (model) => model.push_notification,
    {
      cascade: ['insert', 'update', 'soft-remove'],
    },
  )
  push_notification_users: PushNotificationUsersDocument[];
}
