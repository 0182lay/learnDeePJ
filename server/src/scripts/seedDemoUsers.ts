import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { Role } from "../../generated/prisma/client";

const demoUsers = [
    {
        email: "student@learnlao.com",
        password: "123456",
        role: "student" as Role,
        first_name: "Student",
        last_name: "Demo",
    },
    {
        email: "teacher@learnlao.com",
        password: "123456",
        role: "instructor" as Role,
        first_name: "Teacher",
        last_name: "Demo",
    },
    {
        email: "admin@gmail.com",
        password: "123456",
        role: "admin" as Role,
        first_name: "Admin",
        last_name: "Demo",
    },
];

const seedDemoUsers = async () => {
    for (const user of demoUsers) {
        const password_hash = await bcrypt.hash(user.password, 10);

        await prisma.user.upsert({
            where: { email: user.email },
            create: {
                email: user.email,
                password_hash,
                role: user.role,
                is_active: true,
                profile: {
                    create: {
                        first_name: user.first_name,
                        last_name: user.last_name,
                    },
                },
            },
            update: {
                password_hash,
                role: user.role,
                is_active: true,
                profile: {
                    upsert: {
                        create: {
                            first_name: user.first_name,
                            last_name: user.last_name,
                        },
                        update: {
                            first_name: user.first_name,
                            last_name: user.last_name,
                        },
                    },
                },
            },
        });
    }

    console.log("Demo users are ready:");
    for (const user of demoUsers) {
        console.log(`- ${user.role}: ${user.email} / ${user.password}`);
    }
};

seedDemoUsers()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
