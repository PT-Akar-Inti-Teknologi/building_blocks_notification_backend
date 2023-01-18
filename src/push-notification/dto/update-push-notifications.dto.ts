import {
  EnumDeliveryOptions,
  EnumDeliveryType,
  EnumDevice,
  EnumMessageType,
} from '../entities/push_notifications.entity';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdatePushNotificationsDto {
  name: string;

  title: string;

  @IsOptional()
  image: string;

  messages: string;

  @IsEnum(EnumMessageType)
  message_type: EnumMessageType;

  segmentation_id: string;

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
