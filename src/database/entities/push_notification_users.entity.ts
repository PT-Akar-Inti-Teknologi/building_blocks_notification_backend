import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ModelBase } from '../../base/model/model.base';
import { PushNotificationsDocument } from './push_notifications.entity';

@Entity({ name: 'notifications_push_notification_users' })
export class PushNotificationUsersDocument extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  user_id: string;

  push_notification_id: string;

  @ManyToOne(
    () => PushNotificationsDocument,
    (model) => model.push_notification_users,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'push_notification_id' })
  push_notification: PushNotificationsDocument;
}
