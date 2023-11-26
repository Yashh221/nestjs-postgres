import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

// @Global()
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: "postgresql://postgres:123@localhost:7000/nest?schema=public",
        },
      },
    });
  }
}
