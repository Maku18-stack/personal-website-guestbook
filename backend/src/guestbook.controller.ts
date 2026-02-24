import { Body, Controller, Get, Post } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

@Controller('guestbook')
export class GuestbookController {
  @Get()
  async getAll() {
    const { data, error } = await supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return data ?? [];
  }

  @Post()
  async add(@Body() body: any) {
    const { name, message } = body;

    const { data, error } = await supabase
      .from('guestbook')
      .insert([{ name, message }])
      .select();

    if (error) return { error: error.message };
    return data;
  }
}