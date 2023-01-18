import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ModelBase } from '../../base/model/model.base';
import { PushNotificationsDocument } from './push_notifications.entity';

@Entity({ name: 'notifications_push_notification_click_responses' })
export class PushNotificationClickResponsesDocument extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 300, nullable: false })
  name: string;

  @Column({ length: 1000, nullable: true })
  description: string;

  @OneToMany(() => PushNotificationsDocument, (model) => model.click_response, {
    onUpdate: 'CASCADE',
  })
  push_notifications: PushNotificationsDocument[];
}
