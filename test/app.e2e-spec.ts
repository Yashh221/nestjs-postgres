import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as pactum from "pactum";
import { PrismaService } from "../src/prisma/prisma.service";
import { AuthDto } from "../src/auth/dto";
import { EditUserDto } from "../src/user/dto/edit-user.dto";
describe("App e2e", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl("http://localhost:3000");
  });

  afterAll(() => {
    app.close();
  });
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

describe("Auth", () => {
  const dto: AuthDto = {
    email: "abcdeg@gmail.com",
    password: "abc123",
  };
  describe("Signup", () => {
    it("should throw if email empty", () => {
      return pactum
        .spec()
        .post("/auth/signup")
        .withBody({
          password: dto.password,
        })
        .expectStatus(400);
    });
    it("should throw if password empty", () => {
      return pactum
        .spec()
        .post("/auth/signup")
        .withBody({
          email: dto.email,
        })
        .expectStatus(400);
    });
    it("should throw if both email and password are empty", () => {
      return pactum.spec().post("/auth/signup").expectStatus(400);
    });
    it("should signup", () => {
      return pactum.spec().post("/auth/signup").withBody(dto).expectStatus(201);
    });
  });
  describe("Signin", () => {
    it("should throw if email empty", () => {
      return pactum
        .spec()
        .post("/auth/signin")
        .withBody({
          password: dto.password,
        })
        .expectStatus(400);
    });
    it("should throw if password empty", () => {
      return pactum
        .spec()
        .post("/auth/signin")
        .withBody({
          email: dto.email,
        })
        .expectStatus(400);
    });
    it("should throw if both email and password are empty", () => {
      return pactum.spec().post("/auth/signin").expectStatus(400);
    });
    it("should signin", () => {
      return pactum
        .spec()
        .post("/auth/signin")
        .withBody(dto)
        .expectStatus(200)
        .stores("userAT", "access_token");
    });
  });
});
describe("User", () => {
  describe("Get me", () => {
    it("should get current user", () => {
      return pactum
        .spec()
        .get("/users/me")
        .withHeaders({
          Authorization: "Bearer $S{userAT}",
        })
        .expectStatus(200);
    });
  });
  describe("Edit user", () => {
    const dto: EditUserDto = {
      email: "abde@gmail.com",
    };
    it("should edit user", () => {
      return pactum
        .spec()
        .patch("/users/edituser")
        .withHeaders({
          Authorization: "Bearer $S{userAT}",
        })
        .withBody(dto)
        .expectStatus(200);
    });
  });
});
describe("Bookmark", () => {
  describe("Create bookmark", () => {});
  describe("Get bookmark", () => {});
  describe("Get bookmark by id", () => {});
  describe("Edit bookmark", () => {});
  describe("Delete bookmark", () => {});
});
