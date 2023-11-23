import { Injectable } from "@nestjs/common";

@Injectable({})
export class AuthService {
  signin() {
    return "this is signin";
  }
  signup() {}
}
