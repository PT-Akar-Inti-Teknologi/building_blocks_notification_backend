import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class Seeder implements OnApplicationBootstrap {
  constructor(
    private readonly logger: Logger,
  ) {}
  onApplicationBootstrap() {
    this.seed();
  }

  async seed() {
    //
  }
}
