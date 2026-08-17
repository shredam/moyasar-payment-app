import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolLead } from './entities/school-lead.entity';
import { LeadsService } from './leads.service';
import { LeadsResolver } from './leads.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolLead])],
  providers: [LeadsService, LeadsResolver],
  exports: [LeadsService],
})
export class LeadsModule {}
