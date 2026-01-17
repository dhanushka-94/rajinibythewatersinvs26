const bcrypt = require('bcryptjs');

async function createAdminHash() {
  const password = 'admin123'; // Default admin password
  const hash = await bcrypt.hash(password, 10);
  console.log('\n=== Admin User Setup ===');
  console.log('Username: admin');
  console.log('Password: admin123');
  console.log('Password Hash:', hash);
  console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
  console.log('\nUse this hash in MIGRATION_ADD_USERS_TABLE.sql:\n');
  console.log(`INSERT INTO users (username, password_hash, full_name, email, role, is_active)`);
  console.log(`VALUES (`);
  console.log(`  'admin',`);
  console.log(`  '${hash}',`);
  console.log(`  'System Administrator',`);
  console.log(`  'admin@rajinihotels.com',`);
  console.log(`  'admin',`);
  console.log(`  true`);
  console.log(`)`);
  console.log(`ON CONFLICT (username) DO NOTHING;\n`);
}

createAdminHash().catch(console.error);
