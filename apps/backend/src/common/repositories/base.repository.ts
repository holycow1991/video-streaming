import { HydratedDocument, Model, UpdateQuery } from 'mongoose';

// Generic filter type for mongoose queries
type Filter<T> = {
  [P in keyof T]?: T[P] | Record<string, unknown>;
} & Record<string, unknown>;

export abstract class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<HydratedDocument<T>> {
    const document = new this.model(data);
    return document.save() as Promise<HydratedDocument<T>>;
  }

  async findById(id: string): Promise<HydratedDocument<T> | null> {
    return this.model
      .findById(id)
      .exec() as Promise<HydratedDocument<T> | null>;
  }

  async findOne(filter: Filter<T>): Promise<HydratedDocument<T> | null> {
    return this.model
      .findOne(filter)
      .exec() as Promise<HydratedDocument<T> | null>;
  }

  async find(filter: Filter<T>): Promise<HydratedDocument<T>[]> {
    return this.model.find(filter).exec() as Promise<HydratedDocument<T>[]>;
  }

  async update(
    id: string,
    data: UpdateQuery<T>,
  ): Promise<HydratedDocument<T> | null> {
    return this.model
      .findByIdAndUpdate(id, data, { new: true })
      .exec() as Promise<HydratedDocument<T> | null>;
  }

  async delete(id: string): Promise<HydratedDocument<T> | null> {
    return this.model
      .findByIdAndDelete(id)
      .exec() as Promise<HydratedDocument<T> | null>;
  }

  async deleteOne(filter: Filter<T>): Promise<boolean> {
    const result = await this.model.deleteOne(filter).exec();
    return result.deletedCount > 0;
  }

  async deleteMany(filter: Filter<T>): Promise<number> {
    const result = await this.model.deleteMany(filter).exec();
    return result.deletedCount;
  }
}
