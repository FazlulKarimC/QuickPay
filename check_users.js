
const { PrismaClient } = require('@repo/db');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);
    if (users.length > 0) {
        console.log('Sample user IDs:', users.map(u => u.id));
    } else {
        console.log('No users found in database.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
