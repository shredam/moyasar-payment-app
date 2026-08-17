import { Injectable, Logger } from '@nestjs/common';
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

  private defaultStudents: Student[] = [
    // مدرسة النيل الدولية NIS-1042
    {
      id: 'std-20451',
      code: '20451',
      fullName: 'محمد أحمد سعيد إبراهيم',
      phone: '01012345678',
      grade: 'الصف الأول الابتدائي',
      schoolCode: 'NIS-1042',
      guardianName: 'أحمد سعيد إبراهيم',
      guardianPhone: '01198765432',
      isUsed: false,
    },
    {
      id: 'std-20452',
      code: '20452',
      fullName: 'سارة محمود علي حسنين',
      phone: '01022334455',
      grade: 'الصف الثاني الابتدائي',
      schoolCode: 'NIS-1042',
      guardianName: 'محمود علي حسنين',
      guardianPhone: '01122334455',
      isUsed: false,
    },
    {
      id: 'std-20453',
      code: '20453',
      fullName: 'عمر خالد يوسف النجار',
      phone: '01033445566',
      grade: 'الصف الثالث الابتدائي',
      schoolCode: 'NIS-1042',
      guardianName: 'خالد يوسف النجار',
      guardianPhone: '01133445566',
      isUsed: false,
    },

    // مدرسة المستقبل الحديثة MFS-2318
    {
      id: 'std-30101',
      code: '30101',
      fullName: 'مريم طارق عبد الرحمن',
      phone: '01044556677',
      grade: 'الصف الأول الابتدائي',
      schoolCode: 'MFS-2318',
      guardianName: 'طارق عبد الرحمن',
      guardianPhone: '01144556677',
      isUsed: false,
    },
    {
      id: 'std-30102',
      code: '30102',
      fullName: 'يوسف أحمد فؤاد سالم',
      phone: '01055667788',
      grade: 'الصف الثاني الابتدائي',
      schoolCode: 'MFS-2318',
      guardianName: 'أحمد فؤاد سالم',
      guardianPhone: '01155667788',
      isUsed: false,
    },

    // مدرسة الأندلس التجريبية AND-7710
    {
      id: 'std-40201',
      code: '40201',
      fullName: 'هنا كريم حسن مصطفى',
      phone: '01066778899',
      grade: 'الصف الأول الابتدائي',
      schoolCode: 'AND-7710',
      guardianName: 'كريم حسن مصطفى',
      guardianPhone: '01166778899',
      isUsed: false,
    },
    {
      id: 'std-40202',
      code: '40202',
      fullName: 'حمزة شريف عبد العزيز',
      phone: '01077889900',
      grade: 'الصف الثالث الابتدائي',
      schoolCode: 'AND-7710',
      guardianName: 'شريف عبد العزيز',
      guardianPhone: '01177889900',
      isUsed: false,
    },

    // مدرسة الحكمة الخاصة HKM-5063
    {
      id: 'std-50301',
      code: '50301',
      fullName: 'نور الدين عمرو سليمان',
      phone: '01088990011',
      grade: 'الصف الأول الابتدائي',
      schoolCode: 'HKM-5063',
      guardianName: 'عمرو سليمان',
      guardianPhone: '01188990011',
      isUsed: false,
    },
    {
      id: 'std-50302',
      code: '50302',
      fullName: 'فريدة هاني إبراهيم كمال',
      phone: '01099001122',
      grade: 'الصف الثاني الابتدائي',
      schoolCode: 'HKM-5063',
      guardianName: 'هاني إبراهيم كمال',
      guardianPhone: '01199001122',
      isUsed: false,
    },
  ];

  private inMemorySubscriptions: Subscription[] = [];
  private usedStudentCodes: Set<string> = new Set<string>();

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
      // Fallback
    }
    return this.defaultSchools;
  }

  async getStudents(): Promise<Student[]> {
    try {
      const dbStudents = await this.studentRepo.find();
      if (dbStudents.length > 0) {
        return dbStudents.map((s) => ({
          ...s,
          isUsed: s.isUsed || this.usedStudentCodes.has(`${s.schoolCode}:${s.code}`),
        }));
      }
    } catch (e) {
      // Fallback
    }

    return this.defaultStudents.map((s) => ({
      ...s,
      isUsed: s.isUsed || this.usedStudentCodes.has(`${s.schoolCode}:${s.code}`),
    }));
  }

  async verifyStudentCode(schoolCode: string, studentCode: string): Promise<Student> {
    const key = `${schoolCode}:${studentCode}`;
    let isUsed = this.usedStudentCodes.has(key) || this.usedStudentCodes.has(studentCode);

    try {
      const existingSub = await this.subRepo.findOne({
        where: { schoolCode, studentCode, status: 'ACTIVE' },
      });
      if (existingSub) {
        isUsed = true;
      }
    } catch (e) {
      // Ignore
    }

    try {
      const dbStudent = await this.studentRepo.findOne({
        where: { schoolCode, code: studentCode },
      });
      if (dbStudent) {
        return {
          ...dbStudent,
          isUsed: dbStudent.isUsed || isUsed,
        };
      }
    } catch (e) {
      // Fallback
    }

    // Lookup in defaultStudents roster
    const match = this.defaultStudents.find((s) => s.code === studentCode);

    if (match) {
      return {
        ...match,
        isUsed: match.isUsed || isUsed,
      };
    }


    const school = this.defaultSchools.find((s) => s.code === schoolCode) || this.defaultSchools[0];
    return {
      id: `std-${studentCode}`,
      code: studentCode,
      fullName: 'طالب غير مسجل بالاسم الحقيقي',
      phone: '01000000000',
      grade: 'الصف الأول الابتدائي',
      schoolCode: school.code,
      guardianName: 'ولي الأمر الافتراضي',
      guardianPhone: '01100000000',
      isUsed,
    };
  }

  async releaseStudentCode(schoolCode: string, studentCode: string): Promise<boolean> {
    const key = `${schoolCode}:${studentCode}`;
    this.usedStudentCodes.delete(key);
    this.usedStudentCodes.delete(studentCode);

    try {
      const dbStudent = await this.studentRepo.findOne({
        where: { schoolCode, code: studentCode },
      });
      if (dbStudent) {
        dbStudent.isUsed = false;
        await this.studentRepo.save(dbStudent);
      }
    } catch (e) {
      // Ignore
    }

    try {
      await this.subRepo.delete({ schoolCode, studentCode });
    } catch (e) {
      // Ignore
    }

    this.inMemorySubscriptions = this.inMemorySubscriptions.filter(
      (s) => !(s.studentCode === studentCode && s.schoolCode === schoolCode),
    );

    this.logger.log(`Released student code ${studentCode} for school ${schoolCode}`);
    return true;
  }

  async create(input: CreateSubscriptionInput): Promise<Subscription> {
    const key = `${input.schoolCode}:${input.studentCode}`;

    // Mark student code as used/expired
    this.usedStudentCodes.add(key);
    this.usedStudentCodes.add(input.studentCode);

    try {
      const dbStudent = await this.studentRepo.findOne({
        where: { schoolCode: input.schoolCode, code: input.studentCode },
      });
      if (dbStudent) {
        dbStudent.isUsed = true;
        await this.studentRepo.save(dbStudent);
      }
    } catch (e) {
      // Ignore
    }

    try {
      const sub = this.subRepo.create({
        ...input,
        status: 'ACTIVE',
      });
      const saved = await this.subRepo.save(sub);
      this.logger.log(`Created subscription ${saved.id} and expired student code ${input.studentCode}`);
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
