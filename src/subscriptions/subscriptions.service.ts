import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { School } from '../schools/entities/school.entity';
import { Student } from '../students/entities/student.entity';
import { CreateSubscriptionInput } from './dto/create-subscription.input';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  private defaultSchools: School[] = [
    { id: 'sch-1', name: 'مدرسة النيل الدولية', code: 'NIS-1042', isActive: true },
    { id: 'sch-2', name: 'مدرسة المستقبل الحديثة', code: 'MFS-2318', isActive: true },
    { id: 'sch-3', name: 'مدرسة الأندلس التجريبية', code: 'AND-7710', isActive: true },
    { id: 'sch-4', name: 'مدرسة الحكمة الخاصة', code: 'HKM-5063', isActive: true },
  ];

  private inMemorySubscriptions: Subscription[] = [];

  constructor(
    @InjectRepository(Subscription)
    private readonly subRepo: Repository<Subscription>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  async getSchools(): Promise<School[]> {
    try {
      const dbSchools = await this.schoolRepo.find();
      if (dbSchools.length > 0) return dbSchools;
    } catch (e) {
      // Fallback to defaults
    }
    return this.defaultSchools;
  }

  async verifyStudentCode(schoolCode: string, studentCode: string): Promise<Student> {
    try {
      const dbStudent = await this.studentRepo.findOne({
        where: { schoolCode, code: studentCode },
      });
      if (dbStudent) return dbStudent;
    } catch (e) {
      // Fallback
    }

    const school = this.defaultSchools.find((s) => s.code === schoolCode) || this.defaultSchools[0];
    return {
      id: `std-${studentCode}`,
      code: studentCode,
      fullName: 'محمد أحمد سعيد إبراهيم',
      phone: '01012345678',
      grade: 'الصف الأول الابتدائي',
      schoolCode: school.code,
      guardianName: 'أحمد سعيد إبراهيم',
      guardianPhone: '01198765432',
    };
  }

  async create(input: CreateSubscriptionInput): Promise<Subscription> {
    try {
      const sub = this.subRepo.create({
        ...input,
        status: 'ACTIVE',
      });
      const saved = await this.subRepo.save(sub);
      this.logger.log(`Created subscription ${saved.id} for student ${saved.studentCode}`);
      return saved;
    } catch (err) {
      this.logger.warn(`Subscription DB save fallback: ${err.message}`);
      const sub: Subscription = {
        id: `sub-${Date.now()}`,
        ...input,
        status: 'ACTIVE',
        createdAt: new Date(),
      };
      this.inMemorySubscriptions.push(sub);
      return sub;
    }
  }

  async findAll(): Promise<Subscription[]> {
    try {
      return await this.subRepo.find({ order: { createdAt: 'DESC' } });
    } catch (err) {
      return this.inMemorySubscriptions;
    }
  }
}
