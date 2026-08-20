import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding companies and MDs...');

  const companies = [
    { code: '01', name: 'adi Electrical', mdEmail: 'tjennings@adiltd.co.uk' },
    { code: '02', name: 'adi Mechanical', mdEmail: 'rbrown@adiltd.co.uk' },
    { code: '03', name: 'adi Facilities Engineering', mdEmail: 'psmith@adiltd.co.uk' },
    { code: '07', name: 'adi Environmental', mdEmail: 'mjsmith@adiltd.co.uk' },
    { code: '10', name: 'adi Building & Refurbishment', mdEmail: 'psmith@adiltd.co.uk' },
    { code: '14', name: 'adi F&B', mdEmail: 'mparkins@adiltd.co.uk' },
    { code: '15', name: 'adi Group Services', mdEmail: 'rcumberworth@adiltd.co.uk' },
    { code: '16', name: 'Healy Compressors', mdEmail: 'ssmith@adiltd.co.uk' },
    { code: '17', name: 'adi Climate Systems', mdEmail: 'msweet@adiltd.co.uk' },
    { code: '18', name: 'adi Automotive', mdEmail: 'rwebb@adiltd.co.uk' },
    { code: '20', name: 'adi Intelligent Buildings', mdEmail: 'dbarnes@adiltd.co.uk' },
    { code: '21', name: 'adi Process Pipework', mdEmail: 'rbrown@adiltd.co.uk' },
    { code: '25', name: 'adi Automation', mdEmail: 'tjennings@adiltd.co.uk' },
    { code: '27', name: 'adi Projects', mdEmail: 'jsopwith@adiltd.co.uk' },
    { code: '30', name: 'adi Fire & Security', mdEmail: 'milic@adiltd.co.uk' },
    { code: '31', name: 'adi Life Sciences', mdEmail: 'darrenlewis@adiltd.co.uk' },
  ];

  for (const c of companies) {
    const company = await prisma.company.upsert({
      where: { code: c.code },
      update: {},
      create: { code: c.code, name: c.name }
    });

    // create MD user if not exists
    await prisma.user.upsert({
      where: { email: c.mdEmail },
      update: { name: c.name + ' MD', role: 'md', companyId: company.id },
      create: { name: c.name + ' MD', email: c.mdEmail, role: 'md', companyId: company.id }
    });
  }

  // Import price list
  console.log('Importing price list...');
  const priceCsv = fs.readFileSync(path.join(process.cwd(),'data','Ace Price List.csv'), 'utf8');
  const priceRows = parse(priceCsv, { columns: true, skip_empty_lines: true, trim: true });
  for (const r of priceRows) {
    const costRaw = r['Cost Per Item'] || r['Cost Per Item'];
    if (!r['Item'] || !costRaw) continue;
    const cost = parseFloat((costRaw || '').replace('£','').trim()) || 0;
    let date = null;
    if (r['Date Cost Entered']) date = new Date(r['Date Cost Entered']);
    await prisma.priceList.create({ data: {
      category: r['Item'] || null,
      item: r['Type'] || r['Item'] || 'Unknown',
      size: r['Size'] || null,
      lookupKey: r['Look up'] || null,
      costPerItem: cost,
      dateCostEntered: date
    }});
  }

  // Import sample orders (lightweight import that creates Order rows referencing company by code)
  console.log('Importing sample orders...');
  const ordersCsv = fs.readFileSync(path.join(process.cwd(),'data','1.1 New Workwear Request.csv'), 'utf8');
  const orderRows = parse(ordersCsv, { columns: true, skip_empty_lines: true, trim: true });
  let createdCount = 0;
  for (const r of orderRows.slice(0,50)) {
    // find company by code or name
    const compCode = (r['adi Group Company'] || '').split('-')[0].trim();
    const company = await prisma.company.findFirst({ where: { code: compCode } });
    const mdEmail = r['MD'] || undefined;
    const mdUser = mdEmail ? await prisma.user.findUnique({ where: { email: mdEmail } }) : null;
    const createdBy = await prisma.user.upsert({
      where: { email: (r['adi Email address'] || `seed.user.${createdCount}@example.com`) },
      update: {},
      create: { name: `${r['First Name'] || 'Seed'} ${r['Surname'] || 'User'}`, email: (r['adi Email address'] || `seed.user.${createdCount}@example.com`), role: 'employee', companyId: company ? company.id : undefined }
    });

    // create order stub
    await prisma.order.create({ data: {
      createdById: createdBy.id,
      companyId: company ? company.id : (await prisma.company.findFirst()).id,
      mdId: mdUser ? mdUser.id : undefined,
      requiredByDate: r['Start Date'] ? new Date(r['Start Date']) : undefined,
      deliveryCost: parseFloat((r['Delivery Cost'] || '0').replace('£','')) || 0,
      invoicedValue: parseFloat((r['Total Cost of Uniform'] || '0').replace('£','')) || 0,
      status: (r['Status'] || 'requires_approval').toLowerCase().replace(/ /g,'_')
    }});

    createdCount++;
  }

  console.log('Seeding complete');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
