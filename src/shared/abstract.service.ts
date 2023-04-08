import { Repository } from "typeorm";


export abstract class AbstractService {
  protected constructor(
    private readonly repository: Repository<any>
  ) {}

  async save(options) {
    return this.repository.save(options);
  }

  async find(options) {
    return this.repository.findBy(options);
  }

  async findOne(options) {
    return this.repository.findOneBy(options);
  }

  async update(id: number, options) {
    return this.repository.update(id, options);
  }

  async delete(id: number) {
    return this.repository.delete(id);
  }
}