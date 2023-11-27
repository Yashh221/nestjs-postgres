import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
// import { Request } from "express";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {
    // this.authService = authService;
  }

  @Post("signup")
  signup(@Body() dto: AuthDto) {
    console.log(dto);
    return this.authService.signup(dto);
  }
  @Post("signin")
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }
}
