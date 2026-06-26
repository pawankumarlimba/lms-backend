import { Request, Response } from "express";
import { BaseController } from "@core/base/BaseController";
import { LoanService } from "@services/loan.service";
import { PaymentService } from "@services/payment.service";
import { RecordPaymentDto } from "@dto/payment/record-payment.dto";
import { parsePagination } from "@utils/pagination.util";

export class CollectionController extends BaseController {
  constructor(
    private readonly loanService: LoanService = new LoanService(),
    private readonly paymentService: PaymentService = new PaymentService()
  ) {
    super();
  }

  public getDisbursedLoans = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.loanService.getDisbursedLoans(parsePagination(req));
    return this.ok(res, "Disbursed loans fetched", result);
  };

  public getLoanById = async (req: Request, res: Response): Promise<Response> => {
    const loan = await this.loanService.getLoanByIdOrThrow(req.params.loanId);
    return this.ok(res, "Loan fetched", loan);
  };

  public recordPayment = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.paymentService.recordPayment(
      req.params.loanId,
      req.body as RecordPaymentDto,
      req.user!.userId
    );
    return this.created(res, "Payment recorded", result);
  };

  public getPaymentsForLoan = async (req: Request, res: Response): Promise<Response> => {
    const payments = await this.paymentService.getPaymentsForLoan(req.params.loanId);
    return this.ok(res, "Payments fetched", payments);
  };
}
