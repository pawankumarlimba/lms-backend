import { PaymentRepository } from "../repositories/payment.repository";
import { LoanApplicationRepository } from "../repositories/loan-application.repository";
import { RecordPaymentDto } from "../dto/payment/record-payment.dto";
import { BadRequestError, ConflictError } from "../core/errors/ApiError";
import { LoanStatus, LoanStatusTransitionMap } from "../constants/loan-status.enum";
import { IPayment } from "../models/Payment/payment.types";
import { ILoanApplication } from "../models/LoanApplication/loan-application.types";

export interface IRecordPaymentResult {
  payment: IPayment;
  loan: ILoanApplication;
}

/**
 * PaymentService is the only place that mutates payment/outstanding-balance
 * state, so the "amount can't exceed outstanding" and "UTR must be unique"
 * invariants can never be bypassed by a different code path.
 */
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository = new PaymentRepository(),
    private readonly loanRepository: LoanApplicationRepository = new LoanApplicationRepository()
  ) {}

  public async recordPayment(
    loanId: string,
    dto: RecordPaymentDto,
    recordedByUserId: string
  ): Promise<IRecordPaymentResult> {
    const loan = await this.loanRepository.findByIdOrThrow(loanId);

    if (loan.status !== LoanStatus.DISBURSED) {
      throw new BadRequestError(
        `Payments can only be recorded against a DISBURSED loan (current status: ${loan.status})`
      );
    }

    const duplicateUtr = await this.paymentRepository.findByUtr(dto.utrNumber);
    if (duplicateUtr) {
      throw new ConflictError("This UTR number has already been used for a payment");
    }

    if (dto.amount > loan.outstandingAmount) {
      throw new BadRequestError(
        `Payment amount (₹${dto.amount}) exceeds outstanding balance (₹${loan.outstandingAmount})`
      );
    }

    const payment = await this.paymentRepository.create({
      loanApplicationId: loanId as unknown as IPayment["loanApplicationId"],
      utrNumber: dto.utrNumber.toUpperCase(),
      amount: dto.amount,
      paymentDate: new Date(dto.paymentDate),
      recordedBy: recordedByUserId as unknown as IPayment["recordedBy"],
    });

    const newTotalPaid = Math.round((loan.totalPaid + dto.amount) * 100) / 100;
    const newOutstanding = Math.round((loan.totalRepayment - newTotalPaid) * 100) / 100;
    const isFullyPaid = newOutstanding <= 0;

    const update: Partial<ILoanApplication> = {
      totalPaid: newTotalPaid,
      outstandingAmount: Math.max(newOutstanding, 0),
    };

    if (isFullyPaid && LoanStatusTransitionMap.isValidTransition(loan.status, LoanStatus.CLOSED)) {
      update.status = LoanStatus.CLOSED;
      update.closedAt = new Date();
    }

    const updatedLoan = await this.loanRepository.updateByIdOrThrow(loanId, update);

    return { payment, loan: updatedLoan };
  }

  public async getPaymentsForLoan(loanId: string): Promise<IPayment[]> {
    return this.paymentRepository.findByLoanApplication(loanId);
  }
}
