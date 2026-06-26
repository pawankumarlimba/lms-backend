import { UserRepository } from "@repositories/user.repository";
import { JwtService } from "@services/jwt.service";
import { SignupDto, CreateUserInternalDto } from "@dto/auth/signup.dto";
import { LoginDto } from "@dto/auth/login.dto";
import { ConflictError, UnauthorizedError } from "@core/errors/ApiError";
import { Role } from "@constants/role.enum";
import { IUser } from "@models/User/user.types";

export interface IAuthResult {
  token: string;
  user: Pick<IUser, "id" | "fullName" | "email" | "role"> & { id: string };
}

/**
 * AuthService owns signup/login. It depends on UserRepository (data access)
 * and JwtService (token issuance) - composition over inheritance, each
 * collaborator can be swapped/mocked independently (SOLID: DIP).
 */
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly jwtService: JwtService = new JwtService()
  ) {}

  public async signup(dto: SignupDto): Promise<IAuthResult> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const user = await this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
      role: Role.BORROWER,
    });

    return this.buildAuthResult(user);
  }

  /** Used only by the seed script to provision executive/admin accounts. */
  public async createUserWithRole(dto: CreateUserInternalDto): Promise<IUser> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) return existing;

    return this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
      role: dto.role,
    });
  }

  public async login(dto: LoginDto): Promise<IAuthResult> {
    const user = await this.userRepository.findByEmailWithPassword(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await user.comparePassword(dto.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return this.buildAuthResult(user);
  }

  public async getProfile(userId: string): Promise<IUser> {
    return this.userRepository.findByIdOrThrow(userId);
  }

  private buildAuthResult(user: IUser): IAuthResult {
    const token = this.jwtService.sign({ userId: user.id.toString(), role: user.role });
    return {
      token,
      user: { id: user.id.toString(), fullName: user.fullName, email: user.email, role: user.role },
    };
  }
}
