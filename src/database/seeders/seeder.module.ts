import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seeder } from './seeder';
import { SectionTypesSeederModule } from './section-type/section-types.module';
import { ClickResponsesSeederModule } from './click-response/click-responses.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
    ]),
    ClickResponsesSeederModule,
  ],
  providers: [Logger, Seeder],
})
export class SeederModule {}
