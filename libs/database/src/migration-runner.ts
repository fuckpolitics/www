import { DataSource } from 'typeorm';
import { createDataSource, DatabaseConfig } from './data-source.factory';

export async function runMigrations(config: DatabaseConfig) {
  const dataSource = createDataSource(config);
  let isInitialized = false;
  
  try {
    console.log('Initializing Data Source...');
    await dataSource.initialize();
    isInitialized = true;
    console.log('Data Source initialized successfully');

    console.log('Running migrations...');
    const migrations = await dataSource.runMigrations();
    
    if (migrations.length === 0) {
      console.log('No migrations to run');
    } else {
      console.log(`Successfully ran ${migrations.length} migration(s):`);
      migrations.forEach((migration) => {
        console.log(`  - ${migration.name}`);
      });
    }

    if (isInitialized && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    if (isInitialized && dataSource.isInitialized) {
      try {
        await dataSource.destroy();
      } catch (destroyError) {
      }
    }
    process.exit(1);
  }
}

export async function revertMigration(config: DatabaseConfig) {
  const dataSource = createDataSource(config);
  let isInitialized = false;
  
  try {
    console.log('Initializing Data Source...');
    await dataSource.initialize();
    isInitialized = true;
    console.log('Data Source initialized successfully');

    console.log('Reverting last migration...');
    await dataSource.undoLastMigration();
    
    console.log('Migration reverted successfully');

    if (isInitialized && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(0);
  } catch (error) {
    console.error('Error reverting migration:', error);
    if (isInitialized && dataSource.isInitialized) {
      try {
        await dataSource.destroy();
      } catch (destroyError) {
      }
    }
    process.exit(1);
  }
}

export async function showMigrations(config: DatabaseConfig) {
  const dataSource = createDataSource(config);
  let isInitialized = false;
  
  try {
    console.log('Initializing Data Source...');
    await dataSource.initialize();
    isInitialized = true;
    console.log('Data Source initialized successfully');

    console.log('\nChecking migration status...');
    
    const hasPendingMigrations = await dataSource.showMigrations();
    
    const allMigrations = dataSource.migrations || [];
    
    let executedMigrations: any[] = [];
    try {
      const result = await dataSource.query(
        "SELECT * FROM migrations ORDER BY timestamp DESC"
      );
      executedMigrations = Array.isArray(result) ? result : [];
    } catch (error: any) {
      if (error.code !== '42P01') {
        throw error;
      }
    }

    console.log('\n📊 Migration Status:');
    
    if (hasPendingMigrations) {
      const executedNames = new Set(executedMigrations.map((m: any) => m.name));
      const pending = allMigrations.filter((m: any) => !executedNames.has(m.name));
      
      if (pending.length > 0) {
        console.log(`⚠️  Pending migrations (${pending.length}):`);
        pending.forEach((migration: any) => {
          console.log(`  - ${migration.name || migration.constructor.name}`);
        });
      } else {
        console.log('✅ No pending migrations');
      }
    } else {
      console.log('✅ No pending migrations');
    }
    
    if (executedMigrations.length > 0) {
      console.log(`\n✅ Executed migrations (${executedMigrations.length}):`);
      executedMigrations.forEach((migration: any) => {
        const timestamp = migration.timestamp 
          ? new Date(parseInt(migration.timestamp.toString())).toISOString()
          : 'unknown';
        console.log(`  - ${migration.name} (${timestamp})`);
      });
    } else {
      console.log('\n⚠️  No migrations have been executed yet');
    }

    if (isInitialized && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(0);
  } catch (error) {
    console.error('Error showing migrations:', error);
    if (isInitialized && dataSource.isInitialized) {
      try {
        await dataSource.destroy();
      } catch (destroyError) {
      }
    }
    process.exit(1);
  }
}
