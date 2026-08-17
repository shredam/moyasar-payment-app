import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolLead } from './entities/school-lead.entity';
import { CreateSchoolLeadInput } from './dto/create-school-lead.input';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);
  private inMemoryLeads: SchoolLead[] = [];

  constructor(
    @InjectRepository(SchoolLead)
    private readonly leadsRepository: Repository<SchoolLead>,
  ) {}

  async create(input: CreateSchoolLeadInput): Promise<SchoolLead> {
    try {
      const lead = this.leadsRepository.create({
        ...input,
        stagesToCover: input.stagesToCover || [],
      });
      const saved = await this.leadsRepository.save(lead);
      this.logger.log(`Created school lead for ${saved.schoolName}`);
      return saved;
    } catch (err) {
      this.logger.warn(`DB save fallback for school lead: ${err.message}`);
      const lead: SchoolLead = {
        id: `lead-${Date.now()}`,
        ...input,
        stagesToCover: input.stagesToCover || [],
        createdAt: new Date(),
      };
      this.inMemoryLeads.push(lead);
      return lead;
    }
  }

  async findAll(): Promise<SchoolLead[]> {
    try {
      return await this.leadsRepository.find({ order: { createdAt: 'DESC' } });
    } catch (err) {
      return this.inMemoryLeads;
    }
  }
}
