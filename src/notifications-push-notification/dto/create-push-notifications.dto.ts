import {
  EnumDeliveryOptions,
  EnumDeliveryType,
  EnumDevice,
  EnumMessageType,
} from '../../database/entities/push_notifications.entity';
import { IsEnum } from 'class-validator';

export class CreatePushNotificationsDto {
  name: string;

  title: string;

  image: string;

  messages: string;

  segmentation_id: string;

  @IsEnum(EnumMessageType)
  message_type: EnumMessageType;

  @IsEnum(EnumDeliveryOptions)
  delivery_options: EnumDeliveryOptions;

  @IsEnum(EnumDeliveryType)
  delivery_type: EnumDeliveryType;

  @IsEnum(EnumDevice)
  device: EnumDevice;

  content_reference: string;

  start_date: Date;

  end_date: Date;

  time: Date;

  is_active: boolean;

  push_notification_click_response_id: string;

  push_notification_user_ids: string[];
}
