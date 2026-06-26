import { Response } from "express";
import { HttpStatus } from "../../constants/http-status.enum";

interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * ApiResponse standardises every successful response body:
 * { success, message, data, meta? }
 * Controllers call ApiResponse.send(...) instead of res.json(...) directly,
 * so the response shape can never drift between endpoints.
 */
export class ApiResponse {
  public static send<T>(
    res: Response,
    statusCode: HttpStatus = HttpStatus.OK,
    message = "Success",
    data: T | null = null,
    meta?: IPaginationMeta
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    });
  }

  public static created<T>(res: Response, message = "Created", data: T | null = null): Response {
    return this.send(res, HttpStatus.CREATED, message, data);
  }

  public static ok<T>(res: Response, message = "Success", data: T | null = null): Response {
    return this.send(res, HttpStatus.OK, message, data);
  }
}
