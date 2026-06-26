import {
  AnyBulkWriteOperation,
  FilterQuery,
  Model,
  PopulateOptions,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import { IBaseDocument } from "../../core/base/BaseSchema";
import { NotFoundError } from "../../core/errors/ApiError";

export interface IPaginationParams {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  populate?: PopulateOptions | PopulateOptions[];
}

export interface IPaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Generic repository implementing the Repository pattern on top of Mongoose.
 *
 * Every concrete repository (UserRepository, LoanRepository, ...) EXTENDS
 * this class instead of re-implementing CRUD/bulk logic - satisfies the
 * "one base class with common DB operations, extended per schema" rule.
 *
 * Soft-delete aware: every read excludes isDeleted=true documents unless
 * explicitly asked for via `withDeleted`.
 */
export abstract class BaseRepository<T extends IBaseDocument> {
  protected constructor(protected readonly model: Model<T>) {}

  public async create(payload: Partial<T>): Promise<T> {
    const doc = await this.model.create(payload);
    return doc;
  }

  public async createMany(payloads: Partial<T>[]): Promise<T[]> {
    const docs = await this.model.insertMany(payloads as T[]);
    return docs as unknown as T[];
  }

  public async findById(id: string, options: QueryOptions = {}): Promise<T | null> {
    return this.model.findOne({ _id: id, isDeleted: false } as FilterQuery<T>, null, options);
  }

  public async findByIdOrThrow(id: string, options: QueryOptions = {}): Promise<T> {
    const doc = await this.findById(id, options);
    if (!doc) throw new NotFoundError(`${this.model.modelName} not found`);
    return doc;
  }

  public async findOne(filter: FilterQuery<T>, options: QueryOptions = {}): Promise<T | null> {
    return this.model.findOne({ ...filter, isDeleted: false }, null, options);
  }

  public async find(
    filter: FilterQuery<T> = {},
    pagination: IPaginationParams = {}
  ): Promise<IPaginatedResult<T>> {
    const page = pagination.page && pagination.page > 0 ? pagination.page : 1;
    const limit = pagination.limit && pagination.limit > 0 ? pagination.limit : 20;
    const skip = (page - 1) * limit;

    const queryFilter = { ...filter, isDeleted: false } as FilterQuery<T>;

    let query = this.model
      .find(queryFilter)
      .sort(pagination.sort ?? { createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (pagination.populate) {
      query = query.populate(pagination.populate);
    }

    const [items, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments(queryFilter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  public async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find({ ...filter, isDeleted: false } as FilterQuery<T>);
  }

  public async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findOneAndUpdate(
      { _id: id, isDeleted: false } as FilterQuery<T>,
      update,
      { new: true, runValidators: true }
    );
  }

  public async updateByIdOrThrow(id: string, update: UpdateQuery<T>): Promise<T> {
    const doc = await this.updateById(id, update);
    if (!doc) throw new NotFoundError(`${this.model.modelName} not found`);
    return doc;
  }

  public async updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<number> {
    const result = await this.model.updateMany(
      { ...filter, isDeleted: false } as FilterQuery<T>,
      update
    );
    return result.modifiedCount;
  }

  public async bulkWrite(operations: AnyBulkWriteOperation<T>[]): Promise<unknown> {
    if (operations.length === 0) return null;
    return this.model.bulkWrite(operations as AnyBulkWriteOperation<any>[]);
  }

  /** Soft delete - sets isDeleted=true, never destroys data. */
  public async deleteById(id: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: id } as FilterQuery<T>, {
      isDeleted: true,
    } as UpdateQuery<T>);
    return result.modifiedCount > 0;
  }

  /** Hard delete - irreversible, used only for cleanup scripts (e.g. seeding). */
  public async hardDeleteById(id: string): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: id } as FilterQuery<T>);
    return result.deletedCount > 0;
  }

  public async hardDeleteMany(filter: FilterQuery<T>): Promise<number> {
    const result = await this.model.deleteMany(filter);
    return result.deletedCount;
  }

  public async exists(filter: FilterQuery<T>): Promise<boolean> {
    const doc = await this.model.exists({ ...filter, isDeleted: false } as FilterQuery<T>);
    return Boolean(doc);
  }

  public async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments({ ...filter, isDeleted: false } as FilterQuery<T>);
  }
}
