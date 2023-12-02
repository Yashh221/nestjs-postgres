import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as pactum from "pactum";
import { PrismaService } from "../src/prisma/prisma.service";
import { AuthDto } from "../src/auth/dto";
import { EditUserDto } from "../src/user/dto/edit-user.dto";
import { CreateBookmarkDto, EditBookmarkDto } from "../src/bookmark/bookmark-dto";
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
        .expectBodyContains(dto.email)
        .expectStatus(200)
        .inspect();
    });
  });
});
describe("Bookmark", () => {
  describe("get empty bookmarks", () => {
    it("should get bookmarks", () => {
      return pactum
        .spec()
        .get("/bookmark/getBookmark")
        .withHeaders({
          Authorization: "Bearer $S{userAT}",
        })
        .expectBody([])
        .expectStatus(200)
        .inspect();
    });
  });
  describe("Create bookmark", () => {
    const dto: CreateBookmarkDto = {
      title: "Bookmark1",
      description: "I am a bookmark",
      link: "https://docs.nestjs.com/microservices/basics",
    };
    it("shoudl create Bookmark", () => {
      return pactum
        .spec()
        .post("/bookmark/create")
        .withBody(dto)
        .withHeaders({ Authorization: "Bearer $S{userAT}" })
        .expectStatus(201)
        .stores("bookmarkId", "id")
        .inspect();
    });
  });
  describe("Get bookmark", () => {
    it("should get bookmarks", () => {
      return pactum
        .spec()
        .get("/bookmark/getBookmark")
        .withHeaders({
          Authorization: "Bearer $S{userAT}",
        })
        .expectStatus(200)
        .expectJsonLength(1);
      // .inspect();
    });
  });
  describe("Get bookmark by id", () => {
    it("should get bookmark by id", () => {
      return pactum
        .spec()
        .get("/bookmark/{id}")
        .withPathParams("id", "$S{bookmarkId}")
        .withHeaders({
          Authorization: "Bearer $S{userAT}",
        })
        .expectStatus(200);
      // .inspect();
    });
  });
  describe("Edit bookmark", () => {
    const dto: EditBookmarkDto = {
      title: "Edited Bookmark",
      description: "New Description",
    };
    it("should edit bookmark", () => {
      return pactum
        .spec()
        .patch("/bookmark/{id}")
        .withBody(dto)
        .withPathParams("id", "$S{bookmarkId}")
        .withHeaders({
          Authorization: "Bearer $S{userAT}",
        })
        .expectStatus(200)
        .expectBodyContains(dto.title)
        .expectBodyContains(dto.description);
      // .inspect();
    });
  });
  describe("Delete bookmark", () => {
    it("should delete bookmark by id", () => {
      return pactum
        .spec()
        .delete("/bookmark/{id}")
        .withPathParams("id", "$S{bookmarkId}")
        .withHeaders({
          Authorization: "Bearer $S{userAT}",
        })
        .expectStatus(204);
      // .inspect();
    });
  });
  it("should get empty bookmarks", () => {
    return pactum
      .spec()
      .get("/bookmark/getBookmark")
      .withHeaders({
        Authorization: "Bearer $S{userAT}",
      })
      .expectStatus(200)
      .expectJsonLength(0);
  });
});
