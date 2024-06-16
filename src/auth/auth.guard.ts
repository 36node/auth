import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

@Injectable()
export class PhoneAuthGuard extends AuthGuard('phone') {}

@Injectable()
export class EmailAuthGuard extends AuthGuard('email') {}
