import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seeder } from './seeder';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([]),
  ],
  providers: [Logger, Seeder],
})
export class SeederModule {}
