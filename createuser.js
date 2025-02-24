const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// const bcrypt = require("bcrypt");

function generateRandomPhoneNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}
async function deleteUsers(n) {
  const emailPattern = [];
  
  for (let i = 1; i <= n; i++) {
    emailPattern.push(`user${i}@example.com`);
  }

  try {
    // Delete users matching the email pattern
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          in: emailPattern, // Delete users where the email is in the list
        },
      },
    });
    console.log(`${deletedUsers.count} users deleted successfully.`);
  } catch (error) {
    console.error("Error deleting users:", error);
  } finally {
    await prisma.$disconnect();
  }
}
async function createUsers(n) {
  const users = [];
//   const password = "123"; // default password
//   const hashedPassword = await bcrypt.hash(password, 10); // hashing the password

  for (let i = 1; i <= n; i++) {
    const user = {
      email: `member_creative${i}@example.com`,
      name: `CREATIVE ${i}`,
      access: "CREATIVE",
      year: "3rd",
      password: '$2a$10$z7cMuHyEvicDsSqS8nr4luPDaNLkA7m0rmkQihLh.4EyeyodkJqe6',
      rollNumber: `220530${i}`,
      school: "CSE",
      college: "KIIT",
      contactNo: generateRandomPhoneNumber(), // random 10 digit number
      whatsappNo: generateRandomPhoneNumber(), // random 10 digit number
      regForm: [], // no regForm initially
    //   editProfileCount: 5, // initialize editProfileCount to 5
    };
    users.push(user);
  }

  try {
    const createdUsers = await prisma.user.createMany({
      data: users
    //   skipDuplicates: true, // Skip if there's already a user with the same email
    });
    console.log(`${createdUsers.count} users created successfully.`);
   
  } catch (error) {
    console.error("Error creating users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Example usage: Create 10 users
createUsers(10);
// deleteUsers(50)
