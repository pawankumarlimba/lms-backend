import { cloudinary } from "../config/cloudinary.config";
import { InternalServerError } from "../core/errors/ApiError";
import { ISalarySlip } from "../models/LoanApplication/loan-application.types";

/**
 * UploadService is the single abstraction over file storage. If the project
 * ever swaps Cloudinary for S3, this is the only class that changes -
 * every caller depends on this interface, not the Cloudinary SDK.
 */
export class UploadService {
  public async uploadSalarySlip(file: Express.Multer.File, borrowerId: string): Promise<ISalarySlip> {
    try {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
          folder: `lms/salary-slips/${borrowerId}`,
          resource_type: "auto",
          allowed_formats: ["pdf", "jpg", "jpeg", "png"],
        }
      );

      return {
        url: result.secure_url,
        publicId: result.public_id,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      };
    } catch (error) {
      throw new InternalServerError(`Failed to upload salary slip: ${(error as Error).message}`);
    }
  }
}
