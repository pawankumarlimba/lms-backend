import "reflect-metadata";
import { Database } from "../core/database/Database";
import { AuthService } from "../services/auth.service";
import { CreateUserInternalDto } from "../dto/auth/signup.dto";
import { Role } from "../constants/role.enum";
import { logger } from "../utils/logger";

/**
 * SEED_USERS is the single source of truth for evaluator credentials.
 * Run with: npm run seed
 *
 * NOTE: the same password is used for every account purely for evaluator
 * convenience while testing. Change SEED_PASSWORD before any real deploy.
 */
const SEED_PASSWORD = "Password@123";

const SEED_USERS: CreateUserInternalDto[] = [
  Object.assign(new CreateUserInternalDto(), {
    fullName: "Admin User",
    email: "admin@lms.test",
    password: SEED_PASSWORD,
    role: Role.ADMIN,
  }),
  Object.assign(new CreateUserInternalDto(), {
    fullName: "Sales Executive",
    email: "sales@lms.test",
    password: SEED_PASSWORD,
    role: Role.SALES,
  }),
  Object.assign(new CreateUserInternalDto(), {
    fullName: "Sanction Executive",
    email: "sanction@lms.test",
    password: SEED_PASSWORD,
    role: Role.SANCTION,
  }),
  Object.assign(new CreateUserInternalDto(), {
    fullName: "Disbursement Executive",
    email: "disbursement@lms.test",
    password: SEED_PASSWORD,
    role: Role.DISBURSEMENT,
  }),
  Object.assign(new CreateUserInternalDto(), {
    fullName: "Collection Executive",
    email: "collection@lms.test",
    password: SEED_PASSWORD,
    role: Role.COLLECTION,
  }),
  Object.assign(new CreateUserInternalDto(), {
    fullName: "Demo Borrower",
    email: "borrower@lms.test",
    password: SEED_PASSWORD,
    role: Role.BORROWER,
  }),
];

class Seeder {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  public async run(): Promise<void> {
    logger.info("Seeding role accounts...");

    for (const dto of SEED_USERS) {
      const user = await this.authService.createUserWithRole(dto);
      logger.info(`  -> [${user.role}] ${user.email}`);
    }

    logger.info("Seeding complete. Credentials (same password for all):");
    logger.info(`  Password: ${SEED_PASSWORD}`);
    SEED_USERS.forEach((u) => logger.info(`  ${u.role.padEnd(13)} ${u.email}`));
  }
}

async function main() {
  const database = Database.getInstance();
  await database.connect();
  await new Seeder().run();
  await database.disconnect();
  process.exit(0);
}

main().catch((error) => {
  logger.error(`Seeding failed: ${(error as Error).message}`);
  process.exit(1);
});
