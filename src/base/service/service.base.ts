import { DeleteResult, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ErrorMessageInterface } from '../../response/response.interface';

export abstract class ServiceBase<Entity> {
  protected relations: string[] = [];

  protected constructor(public repository: Repository<Entity>) {}

  public async save(entityBase: Partial<any>): Promise<Entity> {
    return await this.repository.save(entityBase);
  }

  public async update(updateData: Partial<any>, id: string): Promise<Entity> {
    const record = await this.findOne(id);

    Object.assign(record, {
      ...updateData,
    });

    return await this.repository.save(record);
  }

  public async delete(id: string): Promise<DeleteResult> {
    return await this.repository.softDelete(id);
  }

  public async findOne(entityBaseId: string): Promise<Entity> {
    return await this.repository.findOne(entityBaseId, {
      relations: this.relations,
    });
  }

  public async findByCode(code: string): Promise<Entity> {
    return await this.repository.findOne({
      where: { code },
      relations: this.relations,
    });
  }
}
