import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { LeadsService } from './leads.service';
import { SchoolLead } from './entities/school-lead.entity';
import { CreateSchoolLeadInput } from './dto/create-school-lead.input';

@Resolver(() => SchoolLead)
export class LeadsResolver {
  constructor(private readonly leadsService: LeadsService) {}

  @Mutation(() => SchoolLead, { description: 'Submit a new school contracting lead request' })
  createSchoolLead(
    @Args('input') input: CreateSchoolLeadInput,
  ): Promise<SchoolLead> {
    return this.leadsService.create(input);
  }

  @Query(() => [SchoolLead], { name: 'schoolLeads', description: 'Get all school lead requests' })
  findAll(): Promise<SchoolLead[]> {
    return this.leadsService.findAll();
  }
}
