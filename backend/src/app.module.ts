import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GuestbookController } from './guestbook.controller';

@Module({
  controllers: [AppController, GuestbookController],
})
export class AppModule {}