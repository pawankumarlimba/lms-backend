import { Request } from "express";
import { IPaginationParams } from "../core/base/BaseRepository";

export function parsePagination(req: Request): IPaginationParams {
  const page = Number(req.query.page) || undefined;
  const limit = Number(req.query.limit) || undefined;
  return { page, limit };
}
