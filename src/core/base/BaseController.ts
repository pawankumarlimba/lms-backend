import { Response } from "express";
import { HttpStatus } from "@constants/http-status.enum";
import { ApiResponse } from "@core/http/ApiResponse";

/**
 * Every controller in the app extends BaseController. It currently only
 * centralises response helpers, but it is the designated extension point:
 * cross-cutting controller behaviour (e.g. request-scoped logging) is added
 * here once, instead of being copy-pasted into every controller class.
 */
export abstract class BaseController {
  protected ok<T>(res: Response, message: string, data: T | null = null): Response {
    return ApiResponse.send(res, HttpStatus.OK, message, data);
  }

  protected created<T>(res: Response, message: string, data: T | null = null): Response {
    return ApiResponse.send(res, HttpStatus.CREATED, message, data);
  }
}
