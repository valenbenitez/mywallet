import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Bearer JWT guard — export for other modules. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
