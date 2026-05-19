// backend/src/customers/customers.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto'; // Adegua l'import se diverso
import { UpdateCustomerDto } from './dto/update-customer.dto'; // Adegua l'import se diverso

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) { }

  // Definiamo l'albero di inclusione base per ripristinare la struttura attesa dal Frontend
  private readonly defaultInclude = {
    contacts: true,
    plants: {
      include: {
        contacts: true,
        stations: {
          include: {
            cameras: true, // Ci serve per il conteggio camerasCount nel frontend
          },
        },
      },
    },
  };

  async create(createCustomerDto: CreateCustomerDto) {
    const { contacts, ...data } = createCustomerDto;
    // Usa 'slug' generato dal frontend o crealo qui
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    return this.prisma.customer.create({
      data: {
        ...data,
        slug,
        contacts: contacts ? { create: contacts } : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.customer.findMany({
      include: this.defaultInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
    if (!customer) throw new NotFoundException(`Customer ${id} non trovato`);
    return customer;
  }

  // NUOVO METODO: Ricerca per Slug (usato dal Frontend CustomerDetailComponent)
  async findBySlug(slug: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { slug },
      include: this.defaultInclude,
    });
    if (!customer) throw new NotFoundException(`Customer con slug ${slug} non trovato`);
    return customer;
  }
  
  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const { contacts, ...data } = updateCustomerDto;

    return this.prisma.customer.update({
      where: { id },
      data: {
        ...data,
        // Wipe & Replace: elimina tutti i contatti attuali di questo customer e ricrea quelli ricevuti
        contacts: contacts ? {
          deleteMany: {},
          create: contacts
        } : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}